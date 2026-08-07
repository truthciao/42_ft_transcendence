import { httpGet, httpPatch } from '@/lib/http';
import type { ProfilePayload, ProfileResponse } from '@repo/shared-types';

export async function getProfile(): Promise<ProfileResponse> {
  return httpGet<ProfileResponse>('/profiles/me');
}

export async function updateProfile(payload: ProfilePayload) {
  return httpPatch<ProfileResponse>('/profiles/me', payload);
}
