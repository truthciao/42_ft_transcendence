import { z } from 'zod';

export const createConversationSchema = z.object({
  targetUserId: z
    .number()
    .int('targetUserId must be an integer')
    .min(1, 'targetUserId must be at least 1'),
});

export const sendMessageSchema = z.object({
  conversationId: z
    .number()
    .int('conversationId must be an integer')
    .min(1, 'conversationId must be at least 1'),

  content: z
    .string()
    .min(1, 'content is required')
    .max(4000, 'content must not exceed 4000 characters'),
});

export const joinConversationSchema = z.object({
  conversationId: z
    .number()
    .int('conversationId must be an integer')
    .min(1, 'conversationId must be at least 1'),
});

export const getMessagesSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(30),
});

export type CreateConversationPayload = z.infer<typeof createConversationSchema>;

export type SendMessagePayload = z.infer<typeof sendMessageSchema>;

export type JoinConversationPayload = z.infer<typeof joinConversationSchema>;

export type GetMessagesPayload = z.infer<typeof getMessagesSchema>;