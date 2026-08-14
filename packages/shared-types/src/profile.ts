import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'displayName must be at least 2 characters long')
    .max(100, 'displayName must not exceed 100 characters')
    .optional(),

  bio: z
    .string()
    .max(500, 'bio must not exceed 500 characters')
    .optional(),

  avatarUrl: z
    .string()
    .url('avatarUrl must be a valid HTTP/HTTPS URL')
    .max(2048, 'avatarUrl must not exceed 2048 characters')
    .refine(
      (value) => /^https?:\/\//.test(value),
      'avatarUrl must be a valid HTTP/HTTPS URL',
    )
    .optional(),

  preferredLanguage: z.enum(['en', 'fr', 'zh']).optional(),
});

export const profileResponseSchema = updateProfileSchema.extend({
  user: z
    .object({
      username: z
        .string()
        .min(1, 'username must not be empty'),

      email: z
        .string()
        .email('email must be a valid email address'),
    })
    .optional(),
});

export type UpdateProfilePayload =
  z.infer<typeof updateProfileSchema>;

export type ProfileResponse =
  z.infer<typeof profileResponseSchema>;
