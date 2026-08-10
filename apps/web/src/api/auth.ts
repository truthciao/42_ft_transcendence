import { httpPost } from '../lib/http';
import type {
  RegisterPayload,
  LoginPayload,
  AuthResponse,
} from '@repo/shared-types';

export type {
  RegisterPayload,
  LoginPayload,
  AuthResponse,
} from '@repo/shared-types';
export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  return httpPost<AuthResponse>('/auth/register', payload, { auth: false });
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return httpPost<AuthResponse>('/auth/login', payload, { auth: false });
}
