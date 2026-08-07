import { httpGet, httpPatch } from "@/lib/http";
export interface ProfilePayload {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
}

interface ProfileResponse extends ProfilePayload {
  user?: {
    username: string;
    email: string;
  }
}

export async function getProfile(): Promise<ProfileResponse> {
  return httpGet<ProfileResponse>('/profiles/me');
}

export async function updateProfile(payload: ProfilePayload) {
  return httpPatch<ProfileResponse>('/profiles/me', payload)
}
