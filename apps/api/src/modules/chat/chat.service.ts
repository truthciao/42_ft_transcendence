import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationType } from '../../generated/prisma/enums';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.conversation.create({
      data: {
        type: ConversationType.DIRECT,
        members: {
          create: [{ userId }, { userId: targetUserId }],
        },
      },
      include: { members: true },
    });
  }

  async findAllForUser(userId: number) {
    return this.prisma.conversation.findMany({
      where: { members: { some: { userId } } },
      orderBy: { updatedAt: 'desc' },
      include: { members: true },
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

  private async assertMember(conversationId: number, userId: number) {
    const membership = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!membership)
      throw new ForbiddenException('You are not a member of this conversation');

    return membership;
  }
}
