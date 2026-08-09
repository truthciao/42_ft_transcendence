// apps/api/src/modules/friends/friends.service.spec.ts
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { FriendshipStatus } from '../../generated/prisma/client.js';
import { FriendsService } from './friends.service.js';
import { jest } from '@jest/globals';

type MockUser = {
  id: number;
};

type MockFriendship = {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: FriendshipStatus;
};

type MockFriendshipWithUsers = {
  requesterId: number;
  addresseeId: number;
  requester: {
    id: number;
    username: string;
  };
  addressee: {
    id: number;
    username: string;
  };
};

type UpdatedFriendship = {
  id: number;
  status: FriendshipStatus;
};

const findUniqueUser = jest.fn<() => Promise<MockUser | null>>();

const findFirstFriendship = jest.fn<() => Promise<MockFriendship | null>>();

const findUniqueFriendship = jest.fn<() => Promise<MockFriendship | null>>();

const findManyFriendships = jest.fn<() => Promise<MockFriendshipWithUsers[]>>();

const createFriendship = jest.fn<() => Promise<MockFriendship>>();

const updateFriendship = jest.fn<() => Promise<UpdatedFriendship>>();

const deleteFriendship = jest.fn<() => Promise<unknown>>();

describe('FriendsService', () => {
  let service: FriendsService;

  const prisma = {
    user: {
      findUnique: findUniqueUser,
    },
    friendship: {
      findFirst: findFirstFriendship,
      findUnique: findUniqueFriendship,
      findMany: findManyFriendships,
      create: createFriendship,
      update: updateFriendship,
      delete: deleteFriendship,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

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
        requesterId: 1,
        addresseeId: 2,
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

describe('FriendsService', () => {
  let service: FriendsService;

  const prisma = {
    user: {
      findUnique: findUniqueUser,
    },
    friendship: {
      findFirst: findFirstFriendship,
      findUnique: findUniqueFriendship,
      findMany: findManyFriendships,
      create: createFriendship,
      update: updateFriendship,
      delete: deleteFriendship,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

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
        requesterId: 1,
        addresseeId: 2,
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
