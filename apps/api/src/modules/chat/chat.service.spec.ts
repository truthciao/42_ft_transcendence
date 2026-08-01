// apps/api/src/modules/chat/chat.service.spec.ts
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationType } from '../../generated/prisma/client';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: {
    user: { findUnique: jest.Mock };
    conversation: {
      findFirst: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    conversationMember: { findUnique: jest.Mock };
    message: { findMany: jest.Mock; create: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn() },
      conversation: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      conversationMember: { findUnique: jest.fn() },
      message: { findMany: jest.fn(), create: jest.fn() },
    };

    service = new ChatService(prisma as unknown as PrismaService);
  });

  describe('createDirectConversation', () => {
    it('rejects starting a conversation with yourself', async () => {
      await expect(service.createDirectConversation(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when the target user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.createDirectConversation(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the existing direct conversation if one already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 2 });
      prisma.conversation.findFirst.mockResolvedValue({ id: 10, members: [] });

      await expect(
        service.createDirectConversation(1, 2),
      ).resolves.toMatchObject({ id: 10 });
      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    it('creates a new direct conversation with both members when none exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 2 });
      prisma.conversation.findFirst.mockResolvedValue(null);
      prisma.conversation.create.mockResolvedValue({ id: 11, members: [] });

      await service.createDirectConversation(1, 2);

      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          type: ConversationType.DIRECT,
          members: { create: [{ userId: 1 }, { userId: 2 }] },
        },
        include: { members: true },
      });
    });
  });

  describe('createMessage', () => {
    it('rejects senders who are not a member of the conversation', async () => {
      prisma.conversationMember.findUnique.mockResolvedValue(null);

      await expect(service.createMessage(1, 5, 'hi')).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.message.create).not.toHaveBeenCalled();
    });

    it('persists the message and bumps the conversation updatedAt', async () => {
      prisma.conversationMember.findUnique.mockResolvedValue({
        conversationId: 1,
        userId: 5,
      });
      prisma.message.create.mockResolvedValue({
        id: 100,
        conversationId: 1,
        senderId: 5,
        content: 'hi',
      });

      const message = await service.createMessage(1, 5, 'hi');

      expect(message).toMatchObject({ id: 100, content: 'hi' });
      expect(prisma.conversation.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });
  });
});
