import type { Notification } from '@repo/shared-types';
import { httpGet, httpPatch } from '../lib/http';
import { httpPut } from '../lib/http';

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
  return httpGet<any[]>('/notifications/preferences');
}

export function updateNotificationPreferences(preferences: unknown) {
  return httpPut('/notifications/preferences', { preferences });
}
