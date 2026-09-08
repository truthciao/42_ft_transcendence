import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('email must be a valid email address'),

  username: z
    .string()
    .min(3, 'username must be at least 3 characters long')
    .max(30, 'username must not exceed 30 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'username may only contain letters, numbers, and underscores',
    ),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;

export const currentUserSchema = userSchema.extend({
  isTwoFactorEnabled: z.boolean(),
  preferredLanguage: z.string().nullable(),
});

export type CurrentUser = z.infer<typeof currentUserSchema>;

export const userSearchResultSchema = userSchema.pick({
  id: true,
  username: true,
  email: true,
});

export type UserSearchResult = z.infer<typeof userSearchResultSchema>;

export const userSearchResponseSchema = z.object({
  users: z.array(userSearchResultSchema),
  hasMore: z.boolean(),
});

export type UserSearchResponse = z.infer<
  typeof userSearchResponseSchema
>;
