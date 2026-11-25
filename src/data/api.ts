import { Platform } from 'react-native';

const ENV_BASE = (process.env.EXPO_PUBLIC_API_URL as string | undefined)?.replace(/\/$/, '');
const DEFAULT_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8001' : 'http://localhost:8001';
export const API_BASE_URL = ENV_BASE || DEFAULT_BASE;

export type ApiUser = { id: number; email: string; display_name: string | null; survey?: any | null };
export type ApiReferenceAngle = {
  joint_name: string;
  min_angle: number;
  max_angle: number;
  tolerance_deg: number;
};
export type ApiPose = {
  id: number;
  pose_name: string;
  display_name: string;
  client_id: string | null;
  reference_angles: ApiReferenceAngle[];
};
export type ApiProgramDay = {
  day_number: number;
  title: string;
  theme: string;
  description: string;
  poses: { order_in_day: number; pose: ApiPose }[];
};
export type ApiProgressDay = {
  day: number;
  title: string;
  theme: string;
  poses_total: number;
  poses_done: number;
  completed: boolean;
};
export type ApiProgressStatus = {
  days: ApiProgressDay[];
  final_test_unlocked: boolean;
};
export type ApiHistory = {
  practice_attempts: {
    pose_id: string | number;
    day_number: number;
    accuracy_score: number;
    created_at: string;
  }[];
  final_test_results: {
    predicted_pose_name: string | null;
    accuracy_score: number | null;
    created_at: string;
  }[];
};

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

export async function getPoses(token: string) {
  return request<ApiPose[]>('/api/poses', {}, token);
}

export async function getProgramDays(token: string) {
  return request<ApiProgramDay[]>('/api/program/days', {}, token);
}

export async function getProgressStatus(token: string) {
  return request<ApiProgressStatus>('/api/progress/status', {}, token);
}

export async function getHistory(token: string) {
  return request<ApiHistory>('/api/progress/history', {}, token);
}

export async function submitPracticeAttempt(
  token: string,
  payload: {
    pose_id: string | number;
    day_number: number;
    accuracy_score: number;
    joint_feedback?: Record<string, string> | null;
  },
) {
  return request<{ id: number; accuracy_score: number }>('/api/progress/practice-attempt', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export async function submitFinalTestResult(
  token: string,
  payload: {
    expected_pose_id?: number | null;
    predicted_pose_name?: string | null;
    accuracy_score?: number | null;
    joint_feedback?: Record<string, string> | null;
  },
) {
  return request<{ id: number; predicted_pose_name: string | null }>('/api/progress/final-test-result', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}
