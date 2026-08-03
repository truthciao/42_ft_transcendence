import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FriendshipStatus } from '../../generated/prisma/enums';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: FriendshipStatus.PENDING,
      },
    });
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

    return this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: FriendshipStatus.ACCEPTED },
    });
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

    return friendships.map((friendship) =>
      friendship.requesterId === userId
        ? friendship.addressee
        : friendship.requester,
    );
  }

  async removeFriend(userId: number, otherUserId: number) {
    const friendship = await this.findFriendshipBetween(userId, otherUserId);
    if (!friendship || friendship.status !== FriendshipStatus.ACCEPTED)
      throw new NotFoundException('You are not friend with this user');

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
