const API_BASE_URI = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class HttpError extends Error {
  status: number;

  constructor(
    status: number,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

async function parseErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null && 'message' in body) {
      const { message } = body as { message?: unknown };
      if (typeof message === 'string')
        return message;
      if (Array.isArray(message))
        return message.join(', ');
    }
  } catch {

  }
  return fallback;
}

interface HttpOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  const isFormData = body instanceof FormData;

  if (!isFormData) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getToken();
    if (token)
      finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URI}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      `Request failed with status ${response.status}`,
    );
    throw new HttpError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const httpGet = <T>(path: string, options?: HttpOptions) =>
  http<T>(path, { ...options, method: 'GET'});

export const httpPost = <T>(path: string, body?: unknown, options?: HttpOptions) =>
  http<T>(path, { ...options, method: 'POST', body});

export const httpPatch = <T>(path: string, body?: unknown, options?: HttpOptions) =>
  http<T>(path, { ...options, method: 'PATCH', body});

export const httpDelete = <T>(path: string, options?: HttpOptions) =>
  http<T>(path, { ...options, method: 'DELETE'});
