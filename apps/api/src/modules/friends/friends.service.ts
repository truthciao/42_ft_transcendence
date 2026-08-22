import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { FriendshipStatus, NotificationType } from '../../generated/prisma/enums.js';
import { ChatService } from '../chat/chat.service.js';
import { REALTIME_EVENTS } from '../realtime/realtime.constants.js';
import { RealtimeRoomService } from '../realtime/services/realtime-room.service.js';

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly realtimeRoomService: RealtimeRoomService,
  ) {}

  async sendRequest(requesterId: number, addresseeId: number) {
    if (requesterId === addresseeId)
      throw new BadRequestException(
        'You cannot send a friend request to yourself',
      );

    const addressee = await this.prisma.user.findUnique({
      where: { id: addresseeId },
    });
    if (!addressee) throw new NotFoundException('User to add not found');

    const existing = await this.findFriendshipBetween(requesterId, addresseeId);
    if (existing) {
      switch (existing.status) {
        case FriendshipStatus.ACCEPTED:
          throw new BadRequestException(
            'You are already friends with this user',
          );
        case FriendshipStatus.PENDING:
          throw new BadRequestException(
            'A friend request is already pending between you and this user',
          );
        case FriendshipStatus.BLOCKED:
          throw new ForbiddenException(
            'You cannot send a friend request to this user',
          );
      }
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: FriendshipStatus.PENDING,
      },
    });

    await this.prisma.notification.create({
      data: {
        recipientId: addresseeId,
        actorId: requesterId,
        type: NotificationType.FRIEND_REQUEST_RECEIVED,
        friendshipId: friendship.id,
      },
    });

    this.realtimeRoomService.emitTouser(
      addresseeId,
      REALTIME_EVENTS.FRIEND_REQUEST_RECEIVED,
      {
        friendshipId: friendship.id,
        requesterId,
      },
    );

    return friendship;
  }

  async getPendingRequests(userId: number) {
    return this.prisma.friendship.findMany({
      where: { addresseeId: userId, status: FriendshipStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: { id: true, username: true, email: true },
        },
      },
    });
  }

  async getSentPendingRequests(userId: number) {
    return this.prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: FriendshipStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        addressee: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async acceptRequest(requestId: number, userId: number) {
  const friendship = await this.getRequestOrThrow(requestId);
    if (friendship.addresseeId !== userId) {
      throw new ForbiddenException(
        'Only the recipient can accept this request',
      );
    }
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('This request is no longer pending');
    }
 
    const updatedFriendship = await this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: FriendshipStatus.ACCEPTED },
    });

    await this.prisma.notification.create({
      data: {
        recipientId: friendship.requesterId,
        actorId: userId,
        type: NotificationType.FRIEND_REQUEST_ACCEPTED,
        friendshipId: friendship.id,
      },
    });

    await this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        friendshipId: friendship.id,
        type: NotificationType.FRIEND_REQUEST_RECEIVED,
        read: false,
      },
      data: {
        read: true,
      },
    });

    this.realtimeRoomService.emitTouser(
      friendship.requesterId,
      REALTIME_EVENTS.FRIEND_REQUEST_ACCEPTED,
      {
        friendshipId: friendship.id,
        userId,
      },
    );

    this.realtimeRoomService.emitTouser(
      userId,
      REALTIME_EVENTS.FRIEND_REQUEST_ACCEPTED,
      {
        friendshipId: friendship.id,
        userId,
      },
    );

    const otherUserId =
      friendship.requesterId === userId
        ? friendship.addresseeId
        : friendship.requesterId;

    try {
      await this.chatService.createDirectConversation(
        userId,
        otherUserId,
      );
    } catch (error) {
      console.error(
        '[FriendsService Error] Failed to create conversation after accepting friend:',
        error,
      );
    }
 
    return updatedFriendship;
  }

  async rejectRequest(requestId: number, userId: number) {
    const friendship = await this.getRequestOrThrow(requestId);
    if (friendship.addresseeId !== userId) {
      throw new ForbiddenException(
        'Only the recipient can reject this request',
      );
    }
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('This request is no longer pending');
    }

    this.realtimeRoomService.emitTouser(
      friendship.requesterId,
      REALTIME_EVENTS.FRIEND_REQUEST_REJECTED,
      {
        friendshipId: friendship.id,
        userId,
      },
    );

    await this.prisma.friendship.delete({ where: { id: requestId } });
    return { message: 'Friend request rejected' };
  }

  async getFriends(userId: number) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: { select: { id: true, username: true, email: true } },
        addressee: { select: { id: true, username: true, email: true } },
      },
    });

    return friendships.map((friendship) => {
      const friend =
        friendship.requesterId === userId
          ? friendship.addressee
          : friendship.requester;

      return {
        ...friend,
      };
    });
  }

  async removeFriend(userId: number, otherUserId: number) {
    const friendship = await this.findFriendshipBetween(userId, otherUserId);
    if (!friendship || friendship.status !== FriendshipStatus.ACCEPTED)
      throw new NotFoundException('You are not friend with this user');

    this.realtimeRoomService.emitTouser(
      otherUserId,
      REALTIME_EVENTS.FRIEND_REMOVED,
      {
        userId,
      },
    );
    
    await this.prisma.friendship.delete({ where: { id: friendship.id } });
    return { message: 'Friend removed' };
  }

  private async getRequestOrThrow(requestId: number) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });
    if (!friendship) throw new NotFoundException('Friend request not found');

    return friendship;
  }

  private async findFriendshipBetween(userAId: number, userBId: number) {
    return this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userAId, addresseeId: userBId },
          { requesterId: userBId, addresseeId: userAId },
        ],
      },
    });
  }
}
