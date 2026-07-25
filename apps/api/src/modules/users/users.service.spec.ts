import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new UsersService(prisma as unknown as PrismaService);
  });

  it('returns the current profile when one exists', async () => {
    const profile = {
      id: 1,
      username: 'alice',
      displayName: 'Alice',
      bio: 'Hello',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.user.findFirst.mockResolvedValue(profile);

    await expect(service.getProfile()).resolves.toEqual(profile);
    expect(prisma.user.findFirst).toHaveBeenCalled();
  });

  it('updates profile fields for the current user', async () => {
    const currentUser = {
      id: 1,
      username: 'alice',
      displayName: 'Alice',
      bio: 'Hello',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.user.findFirst.mockResolvedValueOnce(currentUser);
    prisma.user.update.mockResolvedValue({
      ...currentUser,
      displayName: 'Alice Updated',
      bio: 'Updated bio',
    });

    await expect(
      service.updateProfile({ displayName: 'Alice Updated', bio: 'Updated bio' }),
    ).resolves.toMatchObject({
      displayName: 'Alice Updated',
      bio: 'Updated bio',
    });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { displayName: 'Alice Updated', bio: 'Updated bio' },
      }),
    );
  });

  it('creates a fallback user when no profile exists yet', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      username: 'user-1',
      displayName: null,
      bio: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(service.getProfile()).resolves.toMatchObject({
      username: 'user-1',
    });

    expect(prisma.user.create).toHaveBeenCalled();
  });
});
