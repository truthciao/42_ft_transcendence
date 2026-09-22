import { z } from 'zod';

export const userRoleSchema = z.enum(['USER', 'ADMIN']);

export type UserRole = z.infer<typeof userRoleSchema>;

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
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;

export const adminUserSchema = userSchema.extend({
  role: userRoleSchema,
  createdAt: z.string(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

export const publicUserProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  displayName: z.string().nullable(),
});

export type PublicUserProfile = z.infer<
  typeof publicUserProfileSchema
>;

export const currentUserSchema = userSchema.extend({
  role: userRoleSchema,
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
