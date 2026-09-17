import { getJSON, setJSON, removeItem } from '../utils/storage';
import type { AssessmentResult, DayResult, UserProfile } from '../types';

export const USER_KEY = 'kayalaya.user';
export const DAYS_KEY = 'kayalaya.completedDays';
export const ASSESSMENT_KEY = 'kayalaya.assessment';

export interface PersistedState {
  user: UserProfile | null;
  completedDays: Record<number, DayResult>;
  assessment: AssessmentResult | null;
}

export async function loadState(): Promise<PersistedState> {
  const [user, days, assessment] = await Promise.all([
    getJSON<UserProfile>(USER_KEY),
    getJSON<Record<number, DayResult>>(DAYS_KEY),
    getJSON<AssessmentResult>(ASSESSMENT_KEY),
  ]);
  return { user: user ?? null, completedDays: days ?? {}, assessment: assessment ?? null };
}

export async function loadUser(): Promise<UserProfile | null> {
  return (await getJSON<UserProfile>(USER_KEY)) ?? null;
}

export async function saveUser(user: UserProfile | null): Promise<void> {
  if (user) {
    await setJSON(USER_KEY, user);
  } else {
    await removeItem(USER_KEY);
  }
}

export async function saveCompletedDays(days: Record<number, DayResult>): Promise<void> {
  await setJSON(DAYS_KEY, days);
}

export async function saveAssessment(result: AssessmentResult | null): Promise<void> {
  if (result) {
    await setJSON(ASSESSMENT_KEY, result);
  } else {
    await removeItem(ASSESSMENT_KEY);
  }
}