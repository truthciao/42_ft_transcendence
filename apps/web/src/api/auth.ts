import { httpPost } from '../lib/http';

export interface RegisterPayload {
  email: string;
  username: string;
  password?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  access_token: string;
  user?: {
    id: number;
    email: string;
    username: string;
  };
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return httpPost<AuthResponse>('/auth/register', payload, { auth: false })
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return httpPost<AuthResponse>('/auth/login', payload, { auth: false })
}
