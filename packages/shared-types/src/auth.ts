import { z } from 'zod';

export const twoFactorLoginResponseSchema = z.object({
  requiresTwoFactor: z.literal(true),
  userId: z.number(),
});

export const emailSchema = z
  .string()
  .email('email must be a valid email address');

export const usernameSchema = z
  .string()
  .min(3, 'username must be at least 3 characters long')
  .max(30, 'username must not exceed 30 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'username may only contain letters, numbers, and underscores',
  );

export const passwordSchema = z
  .string()
  .min(8, 'password must be at least 8 characters long')
  .max(64, 'password must not exceed 64 characters');

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('email must be a valid email address'),
  password: z.string().min(1, 'password is required'),
});

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  username: z.string(),
});

export const authResponseSchema = z.union([
  z.object({
    access_token: z.string(),
    user: authUserSchema.optional(),
  }),

  twoFactorLoginResponseSchema,
]);

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
