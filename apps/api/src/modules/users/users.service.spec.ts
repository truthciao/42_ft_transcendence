import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    profile: {
      upsert: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      profile: {
        upsert: jest.fn(),
      },
    };

    service = new UsersService(prisma as unknown as PrismaService);
  });

  it('finds all users', async () => {
    const users = [
      {
        id: 1,
        email: 'test@example.com',
        username: 'test',
        profile: null,
      },
    ];

    prisma.user.findMany.mockResolvedValueOnce(users);

    await expect(service.findAll()).resolves.toEqual(users);
  });

  it('finds user by id', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      username: 'test',
      profile: null,
    };

    prisma.user.findUnique.mockResolvedValueOnce(user);

    await expect(service.findById(1)).resolves.toEqual(user);
  });

  it('finds user by email', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      username: 'test',
      passwordHash: 'hash',
    };

    prisma.user.findUnique.mockResolvedValueOnce(user);

    await expect(service.findByEmail('test@example.com')).resolves.toEqual(
      user,
    );
  });

  it('finds user by username', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      username: 'test',
      passwordHash: 'hash',
    };

    prisma.user.findUnique.mockResolvedValueOnce(user);

    await expect(service.findByUsername('test')).resolves.toEqual(user);
  });

  it('creates user with profile', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      username: 'test',
      profile: {},
    };

    prisma.user.create.mockResolvedValueOnce(user);

    await expect(
      service.createUser({
        email: 'test@example.com',
        username: 'test',
        passwordHash: 'hash',
      }),
    ).resolves.toEqual(user);
  });

  it('updates an existing profile', async () => {
    const updatedProfile = {
      userId: 1,
      displayName: 'Alice',
      bio: 'Hello',
      avatarUrl: 'https://example.com/avatar.png',
    };

    prisma.profile.upsert.mockResolvedValueOnce(updatedProfile);

    await expect(
      service.updateProfile(1, {
        displayName: 'Alice',
        bio: 'Hello',
        avatarUrl: 'https://example.com/avatar.png',
      }),
    ).resolves.toEqual(updatedProfile);
  });
});
