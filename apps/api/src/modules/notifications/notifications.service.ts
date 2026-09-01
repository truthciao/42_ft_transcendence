import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotificationType } from '../../generated/prisma/enums.js';

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
          }
        }
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

    // Define all notification types explicitly
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

    const map: Record<string, any> = {};
    for (const t of allTypes) {
      const found = prefs.find((p) => p.type === t);
      map[t] = found ?? {
        type: t,
        viaInApp: true,
        viaEmail: false,
        viaPush: false,
      };
    }

    return Object.values(map);
  }

  async updatePreferences(userId: number, items: Array<{ type: any; viaInApp?: boolean; viaEmail?: boolean; viaPush?: boolean; }>) {
    const results = [] as any[];
    for (const item of items) {
      const upserted = await this.prisma.notificationPreference.upsert({
        where: { userId_type: { userId, type: item.type } },
        create: {
          userId,
          type: item.type,
          viaInApp: item.viaInApp ?? true,
          viaEmail: item.viaEmail ?? false,
          viaPush: item.viaPush ?? false,
        },
        update: {
          viaInApp: item.viaInApp ?? true,
          viaEmail: item.viaEmail ?? false,
          viaPush: item.viaPush ?? false,
        },
      });
      results.push(upserted);
    }

    return results;
  }
}
