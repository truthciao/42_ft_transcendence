import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateProfilePayload } from '@repo/shared-types';
import { PrismaService } from '../../prisma/prisma.service.js';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

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
    dto: UpdateProfilePayload,
  ) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        displayName: dto.displayName,
        bio: dto.bio,
        preferredLanguage: dto.preferredLanguage,
      },
    });
  }

  async findProfileByUserId(userId: number) {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }

  async uploadAvatar(userId: number, file: Express.Multer.File) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        avatarUrl: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    const updatedProfile = await this.prisma.profile.update({
      where: { userId },
      data: {
        avatarUrl,
      },
    });

    if (profile.avatarUrl) {
      const oldFilename = profile.avatarUrl.split('/').pop();

      if (oldFilename) {
        const oldFilePath = join(
          process.cwd(),
          'uploads',
          'avatars',
          oldFilename,
        );

        try {
          await unlink(oldFilePath);
        } catch {
          // Old avatar may already have been deleted.
        }
      }
    }

    return updatedProfile;
  }
}
