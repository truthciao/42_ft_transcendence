import { httpGet, httpPatch, httpPost } from '@/lib/http';
import type { UpdateProfilePayload, ProfileResponse } from '@repo/shared-types';

export async function getProfile(): Promise<ProfileResponse> {
  return httpGet<ProfileResponse>('/profiles/me');
}

export async function updateProfile(payload: UpdateProfilePayload) {
  return httpPatch<ProfileResponse>('/profiles/me', payload);
}

export async function uploadAvatar(
  file: File,
): Promise<ProfileResponse> {
  const formData = new FormData();

  formData.append('avatar', file);

  return httpPost<ProfileResponse>('/profiles/me/avatar', formData);
}