import type {
  Notification,
  NotificationPreference,
  UpdateNotificationPreferences,
} from '@repo/shared-types';
import { httpGet, httpPatch, httpPut } from '../lib/http';

export function getNotifications() {
  return httpGet<Notification[]>('/notifications');
}

export function getUnreadNotificationCount() {
  return httpGet<number>('/notifications/unread-count');
}

export function markAllNotificationsAsRead() {
  return httpPatch('/notifications/read-all');
}

export function getNotificationPreferences() {
  return httpGet<NotificationPreference[]>(
    '/notifications/preferences',
  );
}

export function updateNotificationPreferences(
  preferences: UpdateNotificationPreferences['preferences'],
) {
  return httpPut('/notifications/preferences', { preferences });
}
