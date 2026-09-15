import { z } from 'zod';

export const createConversationSchema = z.object({
  targetUserId: z
    .number()
    .int('targetUserId must be an integer')
    .min(1, 'targetUserId must be at least 1'),
});

export const createConversationByUsernameSchema = z.object({
  username: z.string().trim().min(1, 'username is required'),
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
  search: z.string().trim().min(1).optional(),
});

export const searchMessagesSchema = z.object({
  q: z.string().trim().min(1, 'search query is required'),
});

export const chatMessageSchema = z.object({
  id: z.number(),
  conversationId: z.number(),
  content: z.string(),
  senderId: z.number(),
  createdAt: z.string(),

  sender: z
    .object({
      id: z.number(),
      username: z.string(),
    })
    .optional(),
});

export const conversationMemberSchema = z.object({
  userId: z.number(),

  user: z.object({
    id: z.number(),
    username: z.string(),

    profile: z
      .object({
        displayName: z.string().nullable(),
        avatarUrl: z.string().nullable(),
      })
      .nullable(),
  }),
});

export const conversationSchema = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string().nullable(),
  isFriend: z.boolean(),

  createdAt: z.string(),
  updatedAt: z.string(),

  lastReadMessageId: z.number().nullable(),
  unreadCount: z.number(),

  lastMessage: chatMessageSchema
    .pick({
      id: true,
      content: true,
      createdAt: true,
      senderId: true,
    })
    .nullable(),

  members: z.array(conversationMemberSchema),
});

export const messagePageSchema = z.object({
  messages: z.array(chatMessageSchema),
  nextCursor: z.number().nullable(),
});

export type CreateConversationPayload =
  z.infer<typeof createConversationSchema>;

export type SendMessagePayload =
  z.infer<typeof sendMessageSchema>;

export type JoinConversationPayload =
  z.infer<typeof joinConversationSchema>;

export type GetMessagesPayload =
  z.infer<typeof getMessagesSchema>;

export type ChatMessage =
  z.infer<typeof chatMessageSchema>;

export type ConversationMember =
  z.infer<typeof conversationMemberSchema>;

export type Conversation =
  z.infer<typeof conversationSchema>;

export type MessagePage =
  z.infer<typeof messagePageSchema>;

export type ConversationItem = Conversation;