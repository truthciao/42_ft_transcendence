import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ConversationType } from '../../generated/prisma/enums.js';
import { RealtimeGateway } from '../realtime/gateways/realtime.gateway.js';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}
  async createDirectConversation(userId: number, targetUserId: number) {
    if (userId === targetUserId)
      throw new BadRequestException(
        'Cannot start a conversation with yourself',
      );

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException('User to chat with not found');
    }

    const existing = await this.prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT,
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: targetUserId } } },
        ],
      },
      include: { members: true },
    });

    if (existing) return existing;

    const conversation = await this.prisma.conversation.create({
      data: {
        type: ConversationType.DIRECT,
        members: {
          create: [{ userId }, { userId: targetUserId }],
        },
      },
      include: { members: true },
    });

    this.realtimeGateway.notifyConversationCreated(
      [userId, targetUserId],
      conversation.id,
    );

    return conversation;
  }

  async createByUsername(userId: number, username: string) {
    const targetUser = await this.prisma.user.findUnique({ where: { username } }); 
    if (!targetUser) throw new NotFoundException('User not found');
    return this.createDirectConversation(userId, targetUser.id);
  }

async findAllForUser(userId: number) { 
  const conversations = await this.prisma.conversation.findMany({

    where: { members: { some: { userId } } },
    orderBy: { updatedAt: 'desc' },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  displayName: true,
                },
              },
            },
          },
        },
      },
    },
  });

    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
    });

    const friendIdSet = new Set(
      friendships.map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId)),
    );

    return conversations.map((conv) => {
    let conversationName = conv.name;
    let isFriend = false;

      if (conv.type === ConversationType.DIRECT || !conv.name) {
        const otherMember = conv.members.find((m) => m.userId !== userId);
        const otherUser = otherMember?.user;

      if (otherUser) {
        isFriend = friendIdSet.has(otherUser.id);
        conversationName =
          otherUser?.profile?.displayName ||
          otherUser?.username ||
          `Chat Room #${conv.id}`;
      }
    }

    return {
      id: conv.id,
      type: conv.type,
      name: conversationName, 
      isFriend,      
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      members: conv.members,
    };
  });
}

  async getMessages(conversationId: number, userId: number) {
    await this.assertMember(conversationId, userId);

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, username: true } },
      },
    });
  }

  async createMessage(
    conversationId: number,
    senderId: number,
    content: string,
  ) {
    await this.assertMember(conversationId, senderId);

    const message = await this.prisma.message.create({
      data: { conversationId, senderId, content },
      include: {
        sender: { select: { id: true, username: true } },
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async verifyMembership(conversationId: number, userId: number) {
    return this.assertMember(conversationId, userId);
  }

  private async assertMember(conversationId: number, userId: number) {
    const membership = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (!membership)
      throw new ForbiddenException('You are not a member of this conversation');

    return membership;
  }
}
