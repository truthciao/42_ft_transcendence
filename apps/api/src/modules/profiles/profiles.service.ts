import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: {
        user: {
          connectOrCreate: {
            where: { id: userId },
            create: {
              id: userId,
              username: `user-${userId}`,
              email: `user-${userId}@example.com`,
            },
          },
        },
      },
      update: {},
    });
  }

  async updateProfile(
    userId: number,
    dto: {
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
      preferredLanguage?: string;
    },
  ) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: dto.displayName,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        preferredLanguage: dto.preferredLanguage,
      },
      update: {
        displayName: dto.displayName,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        preferredLanguage: dto.preferredLanguage,
      },
    });
  }

  async findProfileByUserId(userId: number) {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }
}
