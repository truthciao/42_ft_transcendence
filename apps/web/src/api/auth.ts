import { httpPost } from '../lib/http';
import type {
  RegisterPayload,
  LoginPayload,
  TwoFactorLoginPayload,
  TwoFactorCodePayload,
  AuthResponse,
  AuthSuccessResponse,
  RegisterResponse,
  TwoFactorGenerateResponse,
} from '@repo/shared-types';

export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  return httpPost<RegisterResponse>('/auth/register', payload, { auth: false });
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return httpPost<AuthResponse>('/auth/login', payload, { auth: false });
}

export async function loginWithTwoFactor(
  payload: TwoFactorLoginPayload,
): Promise<AuthSuccessResponse> {
  return httpPost<AuthSuccessResponse>('/auth/2fa/login', payload, { auth: false });
}

export function generateTwoFactor() : Promise<TwoFactorGenerateResponse> {
  return httpPost<TwoFactorGenerateResponse>('/auth/2fa/generate');
}

export function turnOnTwoFactor(
  payload: TwoFactorCodePayload,
) {
  return httpPost('/auth/2fa/turn-on', payload);
}

export function disableTwoFactor() {
  return httpPost('/auth/2fa/toggle', {
    enabled: false,
  });
}
