const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const DEFAULT_USER_ID = import.meta.env.VITE_USER_ID ?? '1';

export interface ProfilePayload {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
}

function profileHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-User-Id': DEFAULT_USER_ID,
  };
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body: unknown = await response.json();

    if (typeof body === 'object' && body !== null && 'message' in body) {
      const { message } = body as { message?: unknown };
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.join(', ');
    }
  } catch {
    // Some proxies return an empty or non-JSON error response.
  }

  return fallback;
}

export async function getProfile() {
  const response = await fetch(`${API_BASE_URL}/profiles/me`, {
    headers: profileHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to fetch profile'));
  }

  return response.json();
}

export async function updateProfile(payload: ProfilePayload) {
  const response = await fetch(`${API_BASE_URL}/profiles/me`, {
    method: 'PATCH',
    headers: profileHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to update profile'));
  }

  return response.json();
}
