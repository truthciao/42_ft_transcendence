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

export interface Login2FAResponse {
  access_token: string;
}

export async function loginWithTwoFactor(
  userId: number,
  code: string,
): Promise<Login2FAResponse> {
  return httpPost<Login2FAResponse>(
    '/auth/login-2fa',
    {
      userId,
      code,
    },
    { auth: false },
  );
}

export interface TwoFactorGenerateResponse {
  otpauthUrl: string;
  secret: string;
}

export function generateTwoFactor() {
  return httpPost<TwoFactorGenerateResponse>(
    '/auth/2fa/generate',
  );
}

export function turnOnTwoFactor(code: string) {
  return httpPost('/auth/2fa/turn-on', {
    code,
  });
}

export function disableTwoFactor() {
  return httpPost('/auth/2fa/toggle', {
    enabled: false,
    isTwoFactorEnabled: false,
  });
}
