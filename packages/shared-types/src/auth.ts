import { z } from 'zod';

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

export const twoFactorCodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'code must be exactly 6 digits');

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'password is required'),
});

export const twoFactorLoginSchema = z.object({
  userId: z.number().int().positive(),
  code: twoFactorCodeSchema,
});

export const twoFactorCodePayloadSchema = z.object({
  code: twoFactorCodeSchema,
});

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  username: z.string(),
});

export const authSuccessResponseSchema = z.object({
  access_token: z.string(),
  user: authUserSchema,
});

export const twoFactorRequiredResponseSchema = z.object({
  requiresTwoFactor: z.literal(true),
  userId: z.number(),
  message: z.string(),
});

export const authResponseSchema = z.union([
  authSuccessResponseSchema,
  twoFactorRequiredResponseSchema,
]);

export const registerResponseSchema = z.object({
  message: z.string(),
  userId: z.number(),
});

export const twoFactorGenerateResponseSchema = z.object({
  otpauthUrl: z.string(),
  secret: z.string(),
});

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
export type TwoFactorLoginPayload = z.infer<
  typeof twoFactorLoginSchema
>;
export type TwoFactorCodePayload = z.infer<
  typeof twoFactorCodePayloadSchema
>;

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthSuccessResponse = z.infer<
  typeof authSuccessResponseSchema
>;
export type TwoFactorRequiredResponse = z.infer<
  typeof twoFactorRequiredResponseSchema
>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

export type RegisterResponse = z.infer<
  typeof registerResponseSchema
>;

export type TwoFactorGenerateResponse = z.infer<
  typeof twoFactorGenerateResponseSchema
>;
