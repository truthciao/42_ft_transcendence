import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });
   
    if (!profile) {
      throw new NotFoundException('Profile not found for this user');
    }
    return profile;
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
    return this.prisma.profile.update({
      where: { userId },
      data: {
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
