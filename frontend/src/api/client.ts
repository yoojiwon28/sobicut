const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'sobicut_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const method = options.method ?? 'GET';

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(`[API] ${method} ${path} → 네트워크 실패`, err);
    }
    throw err;
  }

  if (res.status === 401) {
    clearToken();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    let message = `요청에 실패했어요. (${res.status})`;
    let detail: unknown;
    try {
      const data = await res.json();
      detail = data;
      message = data.detail ?? data.message ?? message;
    } catch {
      // 응답 body가 없거나 JSON이 아닌 경우 무시
    }
    if (import.meta.env.DEV) {
      console.error(`[API] ${method} ${path} → ${res.status} 실패`, detail ?? message);
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    if (import.meta.env.DEV) console.log(`[API] ${method} ${path} → ${res.status} 성공`);
    return undefined as T;
  }

  const json = await res.json();
  if (import.meta.env.DEV) {
    console.log(`[API] ${method} ${path} → ${res.status} 성공`, json);
  }
  return json;
}