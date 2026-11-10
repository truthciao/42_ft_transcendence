import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'displayName must be at least 2 characters long')
    .max(100, 'displayName must not exceed 100 characters')
    .nullable()
    .optional(),

  bio: z
    .string()
    .max(500, 'bio must not exceed 500 characters')
    .nullable()
    .optional(),

  preferredLanguage: z.enum(['en', 'fr', 'zh']).optional(),
});

export const profileResponseSchema = z.object({
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  preferredLanguage: z.enum(['en', 'fr', 'zh']),

  user: z
    .object({
      username: z.string().min(1),
      email: z.string().email(),
    })
    .optional(),
});

export const profileFormSchema = z.object({
  displayName: z
    .string()
    .refine(
      (value) => value === '' || value.length >= 2,
      'displayName must be at least 2 characters long',
    )
    .max(100, 'displayName must not exceed 100 characters'),

  bio: z.string().max(500, 'bio must not exceed 500 characters'),

  preferredLanguage: z.enum(['en', 'fr', 'zh']),
});

const ALLOWED_AVATAR_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export const avatarFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'Avatar must not exceed 5 MB',
  )
  .refine(
    (file) => {
      const extension = file.name
        .slice(file.name.lastIndexOf('.'))
        .toLowerCase();

      return ALLOWED_AVATAR_TYPES[file.type]?.includes(extension) ?? false;
    },
    'File type and extension do not match',
  );

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;

export type ProfileResponse = z.infer<typeof profileResponseSchema>;

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
