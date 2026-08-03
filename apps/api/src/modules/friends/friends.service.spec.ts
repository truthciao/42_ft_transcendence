// apps/api/src/modules/friends/friends.service.spec.ts
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FriendshipStatus } from '../../generated/prisma/client';
import { FriendsService } from './friends.service';

describe('FriendsService', () => {
  let service: FriendsService;
  let prisma: {
    user: { findUnique: jest.Mock };
    friendship: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn() },
      friendship: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new FriendsService(prisma as unknown as PrismaService);
  });

  describe('sendRequest', () => {
    it('rejects sending a request to yourself', async () => {
      await expect(service.sendRequest(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects when the target user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.sendRequest(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects a duplicate pending request in either direction', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 2 });
      prisma.friendship.findFirst.mockResolvedValue({
        id: 10,
        requesterId: 2,
        addresseeId: 1,
        status: FriendshipStatus.PENDING,
      });

      await expect(service.sendRequest(1, 2)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects when already friends', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 2 });
      prisma.friendship.findFirst.mockResolvedValue({
        id: 10,
        requesterId: 1,
        addresseeId: 2,
        status: FriendshipStatus.ACCEPTED,
      });

      await expect(service.sendRequest(1, 2)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects when blocked', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 2 });
      prisma.friendship.findFirst.mockResolvedValue({
        id: 10,
        requesterId: 2,
        addresseeId: 1,
        status: FriendshipStatus.BLOCKED,
      });

      await expect(service.sendRequest(1, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('creates a pending request when none exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 2 });
      prisma.friendship.findFirst.mockResolvedValue(null);
      prisma.friendship.create.mockResolvedValue({
        id: 1,
        requesterId: 1,
        addresseeId: 2,
        status: FriendshipStatus.PENDING,
      });

      await expect(service.sendRequest(1, 2)).resolves.toMatchObject({
        status: FriendshipStatus.PENDING,
      });
      expect(prisma.friendship.create).toHaveBeenCalledWith({
        data: {
          requesterId: 1,
          addresseeId: 2,
          status: FriendshipStatus.PENDING,
        },
      });
    });
  });

  describe('acceptRequest', () => {
    it('throws when the request does not exist', async () => {
      prisma.friendship.findUnique.mockResolvedValue(null);

      await expect(service.acceptRequest(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws when the current user is not the addressee', async () => {
      prisma.friendship.findUnique.mockResolvedValue({
        id: 1,
        requesterId: 2,
        addresseeId: 3,
        status: FriendshipStatus.PENDING,
      });

      await expect(service.acceptRequest(1, 99)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws when the request is no longer pending', async () => {
      prisma.friendship.findUnique.mockResolvedValue({
        id: 1,
        requesterId: 2,
        addresseeId: 3,
        status: FriendshipStatus.ACCEPTED,
      });

      await expect(service.acceptRequest(1, 3)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('accepts a pending request', async () => {
      prisma.friendship.findUnique.mockResolvedValue({
        id: 1,
        requesterId: 2,
        addresseeId: 3,
        status: FriendshipStatus.PENDING,
      });
      prisma.friendship.update.mockResolvedValue({
        id: 1,
        status: FriendshipStatus.ACCEPTED,
      });

      await expect(service.acceptRequest(1, 3)).resolves.toMatchObject({
        status: FriendshipStatus.ACCEPTED,
      });
    });
  });

  describe('getFriends', () => {
    it('maps each friendship to the other participant', async () => {
      prisma.friendship.findMany.mockResolvedValue([
        {
          requesterId: 1,
          addresseeId: 2,
          requester: { id: 1, username: 'a' },
          addressee: { id: 2, username: 'b' },
        },
        {
          requesterId: 3,
          addresseeId: 1,
          requester: { id: 3, username: 'c' },
          addressee: { id: 1, username: 'a' },
        },
      ]);

      await expect(service.getFriends(1)).resolves.toEqual([
        { id: 2, username: 'b' },
        { id: 3, username: 'c' },
      ]);
    });
  });

  describe('removeFriend', () => {
    it('throws when there is no accepted friendship', async () => {
      prisma.friendship.findFirst.mockResolvedValue(null);

      await expect(service.removeFriend(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes an accepted friendship', async () => {
      prisma.friendship.findFirst.mockResolvedValue({
        id: 5,
        status: FriendshipStatus.ACCEPTED,
      });
      prisma.friendship.delete.mockResolvedValue({});

      await expect(service.removeFriend(1, 2)).resolves.toBeDefined();
      expect(prisma.friendship.delete).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });
  });
});
