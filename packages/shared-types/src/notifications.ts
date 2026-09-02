import { z } from 'zod';

export const notificationTypeSchema = z.enum([
  'FRIEND_REQUEST_RECEIVED',
  'FRIEND_REQUEST_ACCEPTED',
  'FRIEND_REQUEST_REJECTED',
  'FRIEND_REMOVED',
  'WORKSPACE_INVITE_RECEIVED',
  'WORKSPACE_INVITE_ACCEPTED',
  'WORKSPACE_MEMBER_REMOVED',
  'WORKSPACE_ROLE_CHANGED',
]);

export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationPreferenceSchema = z.object({
  type: notificationTypeSchema,
  viaInApp: z.boolean(),
  viaEmail: z.boolean(),
  viaPush: z.boolean(),
});

export type NotificationPreference = z.infer<
  typeof notificationPreferenceSchema
>;

export const updateNotificationPreferencesSchema = z.object({
  preferences: z.array(notificationPreferenceSchema),
});

export type UpdateNotificationPreferences = z.infer<
  typeof updateNotificationPreferencesSchema
>;

export const notificationActorSchema = z.object({
  id: z.number(),
  username: z.string(),
});

export const notificationWorkspaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  icon: z.string().nullable(),
});

export const notificationSchema = z.object({
  id: z.number(),
  recipientId: z.number(),
  type: notificationTypeSchema,

  actorId: z.number().nullable(),
  actor: notificationActorSchema.nullable(),

  friendshipId: z.number().nullable(),

  workspaceId: z.number().nullable(),
  workspace: notificationWorkspaceSchema.nullable(),

  read: z.boolean(),
  createdAt: z.string(),
});

export const notificationsSchema = z.array(notificationSchema);

export type Notification = z.infer<typeof notificationSchema>;