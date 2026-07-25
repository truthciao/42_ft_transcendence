const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface ProfilePayload {
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export async function getProfile() {
  const response = await fetch(`${API_BASE_URL}/users/me`);

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
}

export async function updateProfile(payload: ProfilePayload) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
}
