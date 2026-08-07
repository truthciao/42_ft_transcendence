export interface RegisterPayload {
  email: string;
  username: string;
  password?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  user?: AuthUser;
}
