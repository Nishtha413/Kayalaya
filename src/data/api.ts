import { Platform } from 'react-native';

const ENV_BASE = (process.env.EXPO_PUBLIC_API_URL as string | undefined)?.replace(/\/$/, '');
const DEFAULT_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8001' : 'http://localhost:8001';
export const API_BASE_URL = ENV_BASE || DEFAULT_BASE;

export type ApiUser = { id: number; email: string; display_name: string | null; survey?: any | null };

async function request<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const detail = data?.detail;
    let message = 'Request failed';
    if (typeof detail === 'string') message = detail;
    else if (Array.isArray(detail)) message = detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
    else if (data?.message) message = data.message;
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export async function login(email: string, password: string) {
  return request<{ access_token: string; token_type: string; user: ApiUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string, display_name: string) {
  return request<ApiUser>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name }),
  });
}

export async function getMe(token: string) {
  return request<ApiUser>('/api/auth/me', {}, token);
}

export async function saveSurvey(token: string, survey: unknown) {
  return request<ApiUser>('/api/auth/me/survey', {
    method: 'PUT',
    body: JSON.stringify({ survey }),
  }, token);
}