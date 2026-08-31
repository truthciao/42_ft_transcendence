import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateProfilePayload } from '@repo/shared-types';
import { PrismaService } from '../../prisma/prisma.service.js';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { REALTIME_EVENTS } from '../realtime/realtime.constants.js';
import { RealtimeRoomService } from '../realtime/services/realtime-room.service.js';
import { ConversationType } from '../../generated/prisma/enums.js';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeRoomService: RealtimeRoomService,
  ) {}
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


    const conversationMembers =
      await this.prisma.conversationMember.findMany({
        where: {
          conversation: {
            type: ConversationType.DIRECT,
            members: {
              some: {
                userId,
              },
            },
          },
          userId: {
            not: userId,
          },
        },
        select: {
          userId: true,
        },
      });

    const targetUserIds = new Set(
      conversationMembers.map((member) => member.userId),
    );

    for (const targetUserId of targetUserIds) {
      this.realtimeRoomService.emitToUser(
        targetUserId,
        REALTIME_EVENTS.USER_PROFILE_UPDATED,
        {
          userId,
          avatarUrl,
        },
      );
    }
    return updatedProfile;
  }
}
