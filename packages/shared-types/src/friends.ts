import { z } from 'zod';

export const friendSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
});

export const sendFriendRequestSchema = z.object({
  addresseeId: z.number(),
});

export const messageResponseSchema = z.object({
  message: z.string(),
});

export type Friend = z.infer<typeof friendSchema>;
export type SendFriendRequestDto =
  z.infer<typeof sendFriendRequestSchema>;
export type MessageResponse =
  z.infer<typeof messageResponseSchema>;

export const pendingRequestSchema = z.object({
  id: z.number(),
  requesterId: z.number(),
  addresseeId: z.number(),
  status: z.literal('PENDING'),
  createdAt: z.string(),

  requester: friendSchema,
});

export type PendingRequest =
  z.infer<typeof pendingRequestSchema>;
