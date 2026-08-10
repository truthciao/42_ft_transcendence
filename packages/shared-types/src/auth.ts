import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  password: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  username: z.string(),
});

export const authResponseSchema = z.object({
  access_token: z.string(),
  user: authUserSchema.optional(),
});

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;