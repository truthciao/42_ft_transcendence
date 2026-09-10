import { z } from 'zod';

export const friendshipStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'BLOCKED',
]);

export type FriendshipStatus = z.infer<typeof friendshipStatusSchema>;

export const friendUserSchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),
  username: z.string().min(1, 'username must not be empty'),
  email: z.string().email('email must be a valid email address'),
  avatarUrl: z.string().nullable(),
});

export type FriendUser = z.infer<typeof friendUserSchema>;

export const friendSchema = friendUserSchema.extend({
  online: z.boolean(),
});

export type Friend = z.infer<typeof friendSchema>;

export const friendshipSchema = z.object({
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
  status: friendshipStatusSchema,
  createdAt: z.string().datetime('createdAt must be a valid ISO datetime'),
});

export type Friendship = z.infer<typeof friendshipSchema>;

export const pendingFriendRequestSchema = friendshipSchema.extend({
  status: z.literal('PENDING'),
});

export const pendingRequestSchema = pendingFriendRequestSchema.extend({
  requester: friendUserSchema,
});

export type PendingRequest = z.infer<typeof pendingRequestSchema>;

export const sentPendingRequestSchema = pendingFriendRequestSchema.extend({
  addressee: friendUserSchema.pick({
    id: true,
    username: true,
    email: true,
  }),
});

export type SentPendingRequest = z.infer<typeof sentPendingRequestSchema>;

export const sendFriendRequestSchema = z.object({
  addresseeId: z
    .number()
    .int('addresseeId must be an integer')
    .min(1, 'addresseeId must be a positive integer'),
});

export type SendFriendRequestDto = z.infer<typeof sendFriendRequestSchema>;

export const addFriendSearchSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, 'username must be at least 2 characters long'),
});

export type AddFriendSearchValues = z.infer<typeof addFriendSearchSchema>;

export const messageResponseSchema = z.object({
  message: z.string(),
});

export type MessageResponse = z.infer<typeof messageResponseSchema>;
