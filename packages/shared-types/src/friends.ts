import { z } from 'zod';

export const friendSchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),

  username: z
    .string()
    .min(1, 'username must not be empty'),

  email: z
    .string()
    .email('email must be a valid email address'),
});

export const sendFriendRequestSchema = z.object({
  addresseeId: z
    .number()
    .int('addresseeId must be an integer')
    .min(1, 'addresseeId must be a positive integer'),
});

export const messageResponseSchema = z.object({
  message: z.string(),
});

export const pendingRequestSchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),

  requesterId: z
    .number()
    .int('requesterId must be an integer')
    .min(1, 'requesterId must be a positive integer'),

  addresseeId: z
    .number()
    .int('addresseeId must be an integer')
    .min(1, 'addresseeId must be a positive integer'),

  status: z.literal('PENDING'),

  createdAt: z
    .string()
    .datetime('createdAt must be a valid ISO datetime'),

  requester: friendSchema,
});

export type Friend = z.infer<typeof friendSchema>;

export type SendFriendRequestDto =
  z.infer<typeof sendFriendRequestSchema>;

export type MessageResponse =
  z.infer<typeof messageResponseSchema>;

export type PendingRequest =
  z.infer<typeof pendingRequestSchema>;