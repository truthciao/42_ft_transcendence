import { ProfilesService } from './profiles.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prisma: {
    profile: {
      upsert: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      profile: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    service = new ProfilesService(prisma as unknown as PrismaService);
  });

  it('creates a profile and fallback user when no profile exists', async () => {
    prisma.profile.upsert.mockResolvedValue({ id: 1, userId: 1 });

    await expect(service.getProfile(1)).resolves.toMatchObject({ userId: 1 });
    expect(prisma.profile.upsert).toHaveBeenCalledWith({
      where: { userId: 1 },
      create: {
        user: {
          connectOrCreate: {
            where: { id: 1 },
            create: {
              id: 1,
              username: 'user-1',
              email: 'user-1@example.com', // 👈 补上这行，断言就完全匹配了
            },
          },
        },
      },
      update: {},
    });
  });

  it('updates profile fields for the current user', async () => {
    prisma.profile.upsert.mockResolvedValue({
      userId: 1,
      displayName: 'Alice Updated',
    });

    await expect(
      service.updateProfile(1, {
        displayName: 'Alice Updated',
        bio: 'Updated bio',
      }),
    ).resolves.toMatchObject({
      displayName: 'Alice Updated',
    });

    expect(prisma.profile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 1 },
        update: { displayName: 'Alice Updated', bio: 'Updated bio' },
      }),
    );
  });

  it('looks up a public profile by user ID', async () => {
    prisma.profile.findUnique.mockResolvedValue({
      userId: 2,
      displayName: 'Bob',
    });

    await expect(service.findProfileByUserId(2)).resolves.toMatchObject({
      userId: 2,
    });
    expect(prisma.profile.findUnique).toHaveBeenCalledWith({
      where: { userId: 2 },
    });
  });
});
