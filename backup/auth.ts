const API_BASE_URL = 'http://localhost:3000';

// 1. define the variable type sent to backend
export interface RegisterPayload {
    email: string;
    password: string;
    username: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

// 2. register request function 
export async function register(payload: RegisterPayload) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorText = Array.isArray(data.message)
      ? data.message.join('; ')
      : data.message;
    throw new Error(errorText || 'Registration failed');
  }

  return data;
}

// 3. login function 
export async function login(payload: LoginPayload) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorText = Array.isArray(data.message)
      ? data.message.join('; ')
      : data.message;
    throw new Error(errorText || 'Login failed');
  }

  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  if (data.user?.id) {
    localStorage.setItem('user_id', String(data.user.id));
  }

  return data;
}