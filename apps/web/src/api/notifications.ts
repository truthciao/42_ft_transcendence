import { httpGet, httpPatch } from '../lib/http';

export interface Notification {
  id: number;
  type: string;
  recipientId: number;
  actorId: number | null;
  friendshipId: number | null;
  workspaceId: number | null
  read: boolean;
  createdAt: string;
  actor: {
    id: number;
    username: string;
  } | null;
  workspace: {
    id: number,
    name: string,
    icon: string | null;
  } | null;
}

export function getNotifications() {
  return httpGet<Notification[]>('/notifications');
}

export function getUnreadNotificationCount() {
  return httpGet<number>('/notifications/unread-count');
}

export function markAllNotificationsAsRead() {
  return httpPatch('/notifications/read-all');
}
