import { httpGet, httpPatch } from '@/lib/http';
import type { UpdateProfilePayload, ProfileResponse } from '@repo/shared-types';

export async function getProfile(): Promise<ProfileResponse> {
  return httpGet<ProfileResponse>('/profiles/me');
}

export async function updateProfile(payload: UpdateProfilePayload) {
  return httpPatch<ProfileResponse>('/profiles/me', payload);
}
