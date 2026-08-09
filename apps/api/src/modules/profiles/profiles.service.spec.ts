import { NotFoundException } from '@nestjs/common';
import { ProfilesService } from './profiles.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { jest } from '@jest/globals';

type MockProfile = {
  id: number;
  userId: number;
  displayName: string;
  bio: string | null;
};

describe('ProfilesService', () => {
  let service: ProfilesService;

  const prisma = {
    profile: {
      findUnique: jest.fn<() => Promise<MockProfile | null>>(),
      update: jest.fn<() => Promise<MockProfile>>(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ProfilesService(
      prisma as unknown as PrismaService,
    );
  });

  it('returns the current user profile when it exists', async () => {
    prisma.profile.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      displayName: 'Alice',
      bio: null,
    });

    await expect(service.getProfile(1)).resolves.toMatchObject({
      userId: 1,
      displayName: 'Alice',
    });

    expect(prisma.profile.findUnique).toHaveBeenCalledWith({
      where: { userId: 1 },
      include: {
        user: {
          select: {
            email: true,
            username: true,
          },
        },
      },
    });
  });

  it('throws NotFoundException when no profile exists', async () => {
    prisma.profile.findUnique.mockResolvedValue(null);

    await expect(service.getProfile(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prisma.profile.findUnique).toHaveBeenCalledWith({
      where: { userId: 1 },
      include: {
        user: {
          select: {
            email: true,
            username: true,
          },
        },
      },
    });
  });

  it('updates profile fields for the current user', async () => {
    prisma.profile.update.mockResolvedValue({
      id: 1,
      userId: 1,
      displayName: 'Alice Updated',
      bio: 'Updated bio',
    });

    await expect(
      service.updateProfile(1, {
        displayName: 'Alice Updated',
        bio: 'Updated bio',
      }),
    ).resolves.toMatchObject({
      userId: 1,
      displayName: 'Alice Updated',
      bio: 'Updated bio',
    });

    expect(prisma.profile.update).toHaveBeenCalledWith({
      where: { userId: 1 },
      data: {
        displayName: 'Alice Updated',
        bio: 'Updated bio',
      },
    });
  });

  it('looks up a public profile by user ID', async () => {
    prisma.profile.findUnique.mockResolvedValue({
      id: 2,
      userId: 2,
      displayName: 'Bob',
      bio: null,
    });

    await expect(
      service.findProfileByUserId(2),
    ).resolves.toMatchObject({
      userId: 2,
      displayName: 'Bob',
    });

    expect(prisma.profile.findUnique).toHaveBeenCalledWith({
      where: { userId: 2 },
    });
  });
});
