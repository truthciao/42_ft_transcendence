import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  preferredLanguage: z.enum(['en', 'fr', 'zh']).optional(),
});

export const profileResponseSchema = updateProfileSchema.extend({
  user: z.object({
    username: z.string(),
    email: z.string(),
  }).optional(),
});

export type UpdateProfilePayload =
  z.infer<typeof updateProfileSchema>;

export type ProfileResponse =
  z.infer<typeof profileResponseSchema>;
