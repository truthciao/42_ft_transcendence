import type { Notification } from '@repo/shared-types';
import { httpGet, httpPatch } from '../lib/http';

export function getNotifications() {
  return httpGet<Notification[]>('/notifications');
}

export function getUnreadNotificationCount() {
  return httpGet<number>('/notifications/unread-count');
}

export function markAllNotificationsAsRead() {
  return httpPatch('/notifications/read-all');
}
