import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotificationType } from '../../generated/prisma/enums.js';
import type { NotificationPreference } from '@repo/shared-types';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: {
        recipientId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: {
        recipientId: userId,
        read: false,
      },
    });
  }

  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification || notification.recipientId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });
  }

  async getPreferences(userId: number) {
    const prefs = await this.prisma.notificationPreference.findMany({
      where: { userId },
    });

    const allTypes = [
      NotificationType.FRIEND_REQUEST_RECEIVED,
      NotificationType.FRIEND_REQUEST_ACCEPTED,
      NotificationType.FRIEND_REQUEST_REJECTED,
      NotificationType.FRIEND_REMOVED,
      NotificationType.WORKSPACE_INVITE_RECEIVED,
      NotificationType.WORKSPACE_INVITE_ACCEPTED,
      NotificationType.WORKSPACE_MEMBER_REMOVED,
      NotificationType.WORKSPACE_ROLE_CHANGED,
    ];

    return allTypes.map((type) => {
      const found = prefs.find((p) => p.type === type);

      return (
        found ?? {
          type,
          viaInApp: true,
          viaEmail: false,
          viaPush: false,
        }
      );
    });
  }

  async updatePreferences(userId: number, items: NotificationPreference[]) {
    const results: NotificationPreference[] = [];

    for (const item of items) {
      const upserted = await this.prisma.notificationPreference.upsert({
        where: {
          userId_type: {
            userId,
            type: item.type,
          },
        },
        create: {
          userId,
          type: item.type,
          viaInApp: item.viaInApp,
          viaEmail: item.viaEmail,
          viaPush: item.viaPush,
        },
        update: {
          viaInApp: item.viaInApp,
          viaEmail: item.viaEmail,
          viaPush: item.viaPush,
        },
      });

      results.push(upserted);
    }

    return results;
  }
}
