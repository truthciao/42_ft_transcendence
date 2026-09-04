import { NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotificationsService } from './notifications.service.js';

const findManyNotifications =
  jest.fn<() => Promise<unknown[]>>();

const countNotifications =
  jest.fn<() => Promise<number>>();

const findUniqueNotification =
  jest.fn<() => Promise<unknown | null>>();

const updateNotification =
  jest.fn<() => Promise<unknown>>();

const updateManyNotifications =
  jest.fn<() => Promise<unknown>>();

const findManyNotificationPreferences =
  jest.fn<() => Promise<unknown[]>>();

const upsertNotificationPreference =
  jest.fn<() => Promise<unknown>>();

describe('NotificationsService', () => {
  let service: NotificationsService;

  const prisma = {
    notification: {
      findMany: findManyNotifications,
      count: countNotifications,
      findUnique: findUniqueNotification,
      update: updateNotification,
      updateMany: updateManyNotifications,
    },
    notificationPreference: {
      findMany: findManyNotificationPreferences,
      upsert: upsertNotificationPreference,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new NotificationsService(
      prisma as unknown as PrismaService,
    );
  });

  describe('getNotifications', () => {
    it('returns notifications for the current user', async () => {
      const notifications = [
        {
          id: 1,
          recipientId: 42,
          type: 'FRIEND_REQUEST_RECEIVED',
          read: false,
        },
      ];

      prisma.notification.findMany.mockResolvedValue(notifications);

      await expect(service.getNotifications(42)).resolves.toEqual(
        notifications,
      );

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          recipientId: 42,
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
    });
  });

  describe('getUnreadCount', () => {
    it('returns the unread notification count for the current user', async () => {
      prisma.notification.count.mockResolvedValue(3);

      await expect(service.getUnreadCount(42)).resolves.toBe(3);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: {
          recipientId: 42,
          read: false,
        },
      });
    });
  });

  describe('markAsRead', () => {
    it('marks the current user notification as read', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 1,
        recipientId: 42,
        read: false,
      });

      prisma.notification.update.mockResolvedValue({
        id: 1,
        recipientId: 42,
        read: true,
      });

      await expect(service.markAsRead(1, 42)).resolves.toMatchObject({
        id: 1,
        recipientId: 42,
        read: true,
      });

      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          read: true,
        },
      });
    });

    it('rejects when the notification belongs to another user', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 1,
        recipientId: 99,
        read: false,
      });

      await expect(service.markAsRead(1, 42)).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('marks all unread notifications as read for the current user', async () => {
      prisma.notification.updateMany.mockResolvedValue({
        count: 3,
      });

      await expect(service.markAllAsRead(42)).resolves.toEqual({
        success: true,
      });

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          recipientId: 42,
          read: false,
        },
        data: {
          read: true,
        },
      });
    });
  });

  describe('getPreferences', () => {
    it('returns all notification types with default preferences', async () => {
      prisma.notificationPreference.findMany.mockResolvedValue([]);

      const result = await service.getPreferences(42);

      expect(result).toHaveLength(8);

      expect(result).toEqual([
        {
          type: 'FRIEND_REQUEST_RECEIVED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'FRIEND_REQUEST_ACCEPTED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'FRIEND_REQUEST_REJECTED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'FRIEND_REMOVED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'WORKSPACE_INVITE_RECEIVED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'WORKSPACE_INVITE_ACCEPTED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'WORKSPACE_MEMBER_REMOVED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'WORKSPACE_ROLE_CHANGED',
          viaInApp: true,
          viaEmail: false,
        },
      ]);

      expect(prisma.notificationPreference.findMany).toHaveBeenCalledWith({
        where: {
          userId: 42,
        },
      });
    });

    it('returns saved preferences when they exist', async () => {
      prisma.notificationPreference.findMany.mockResolvedValue([
        {
          type: 'FRIEND_REQUEST_RECEIVED',
          viaInApp: false,
          viaEmail: true,
        },
      ]);

      const result = await service.getPreferences(42);

      expect(result).toEqual([
        {
          type: 'FRIEND_REQUEST_RECEIVED',
          viaInApp: false,
          viaEmail: true,
        },
        {
          type: 'FRIEND_REQUEST_ACCEPTED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'FRIEND_REQUEST_REJECTED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'FRIEND_REMOVED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'WORKSPACE_INVITE_RECEIVED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'WORKSPACE_INVITE_ACCEPTED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'WORKSPACE_MEMBER_REMOVED',
          viaInApp: true,
          viaEmail: false,
        },
        {
          type: 'WORKSPACE_ROLE_CHANGED',
          viaInApp: true,
          viaEmail: false,
        },
      ]);
    });
  });

  describe('updatePreferences', () => {
    it('upserts preferences for the current user', async () => {
      const preferences = [
        {
          type: 'FRIEND_REQUEST_RECEIVED',
          viaInApp: false,
          viaEmail: true,
        },
        {
          type: 'FRIEND_REQUEST_ACCEPTED',
          viaInApp: true,
          viaEmail: false,
        },
      ];

      prisma.notificationPreference.upsert
        .mockResolvedValueOnce({
          id: 1,
          userId: 42,
          ...preferences[0],
        })
        .mockResolvedValueOnce({
          id: 2,
          userId: 42,
          ...preferences[1],
        });

      await service.updatePreferences(42, preferences as any);

      expect(prisma.notificationPreference.upsert).toHaveBeenNthCalledWith(
        1,
        {
          where: {
            userId_type: {
              userId: 42,
              type: 'FRIEND_REQUEST_RECEIVED',
            },
          },
          update: {
            viaInApp: false,
            viaEmail: true,
          },
          create: {
            userId: 42,
            type: 'FRIEND_REQUEST_RECEIVED',
            viaInApp: false,
            viaEmail: true,
          },
        },
      );

      expect(prisma.notificationPreference.upsert).toHaveBeenNthCalledWith(
        2,
        {
          where: {
            userId_type: {
              userId: 42,
              type: 'FRIEND_REQUEST_ACCEPTED',
            },
          },
          update: {
            viaInApp: true,
            viaEmail: false,
          },
          create: {
            userId: 42,
            type: 'FRIEND_REQUEST_ACCEPTED',
            viaInApp: true,
            viaEmail: false,
          },
        },
      );

      expect(prisma.notificationPreference.upsert).toHaveBeenCalledTimes(2);
    });
  });
});