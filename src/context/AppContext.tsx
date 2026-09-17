import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AssessmentResult, DayResult, SurveyAnswers, UserProfile } from '../types';
import { DAY_COUNT } from '../data/program';
import {
  loadState,
  loadUser,
  saveAssessment,
  saveCompletedDays,
  saveUser,
} from '../data/storage';

export interface AppContextValue {
  hydrated: boolean;
  user: UserProfile | null;
  completedDays: Record<number, DayResult>;
  poseProgress: Record<number, number>;
  assessment: AssessmentResult | null;
  nextDayId: number;
  isProgramComplete: boolean;
  isAssessmentUnlocked: boolean;
  completedDayCount: number;
  totalPracticeSeconds: number;
  totalSessions: number;
  averageAccuracy: number;
  streakDays: number;
  signIn: (name: string, email: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  completeSurvey: (survey: SurveyAnswers) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeDay: (dayId: number, accuracy: number, timeSeconds: number) => Promise<void>;
  markPoseCompletion: (dayId: number, count: number) => void;
  completeAssessment: (result: AssessmentResult) => Promise<void>;
  resetProgress: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function computeStreak(days: Record<number, DayResult>): number {
  const keys = new Set<string>();
  let latest: string | null = null;
  for (const result of Object.values(days)) {
    const key = toDateKey(result.completedAt);
    keys.add(key);
    if (!latest || key > latest) {
      latest = key;
    }
  }
  if (!latest) {
    return 0;
  }
  const today = toDateKey(new Date().toISOString());
  if (latest !== today) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (latest !== yesterday) {
      return 0;
    }
  }
  let streak = 0;
  const cursor = new Date(latest);
  while (keys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [completedDays, setCompletedDays] = useState<Record<number, DayResult>>({});
  const [poseProgress, setPoseProgress] = useState<Record<number, number>>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const state = await loadState();
      if (!mounted) {
        return;
      }
      setUser(state.user);
      setCompletedDays(state.completedDays);
      setAssessment(state.assessment);
      setHydrated(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

const signIn = useCallback(async (name: string, email: string) => {
    const existing = await loadUser();
    const fallback = email.trim().split('@')[0];
    const next: UserProfile = existing
      ? { ...existing, name: name.trim() || existing.name || fallback, email }
      : { name: name.trim() || fallback, email, createdAt: new Date().toISOString(), survey: null };
    setUser(next);
    await saveUser(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
  }, []);

  const completeSurvey = useCallback(async (survey: SurveyAnswers) => {
    setUser((prev) => {
      const next = prev ? { ...prev, survey } : null;
      if (next) {
        saveUser(next);
      }
      return next;
    });
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      setUser((prev) => {
        const next = prev ? { ...prev, ...updates } : prev;
        if (next) {
          saveUser(next);
        }
        return next;
      });
    },
    [],
  );

  const completeDay = useCallback(
    async (dayId: number, accuracy: number, timeSeconds: number) => {
      setCompletedDays((prev) => {
        const next = {
          ...prev,
          [dayId]: { dayId, accuracy, timeSeconds, completedAt: new Date().toISOString() } as DayResult,
        };
        saveCompletedDays(next);
        return next;
      });
    },
    [],
  );

  const completeAssessment = useCallback(async (result: AssessmentResult) => {
    setAssessment(result);
    await saveAssessment(result);
  }, []);

  const markPoseCompletion = useCallback((dayId: number, count: number) => {
    setPoseProgress((prev) => ({
      ...prev,
      [dayId]: Math.max(prev[dayId] ?? 0, count),
    }));
  }, []);

  const resetProgress = useCallback(async () => {
    setCompletedDays({});
    setPoseProgress({});
    setAssessment(null);
    await saveCompletedDays({});
    await saveAssessment(null);
  }, []);

  const completedDayCount = Object.keys(completedDays).length;

  const value = useMemo<AppContextValue>(() => {
    const completed = Object.values(completedDays);
    const totalSessions = completed.length;
    const all = DAY_COUNT;
    const isProgramComplete = Object.keys(completedDays).length >= all;
    let nextDayId = 1;
    for (let id = 1; id <= all; id += 1) {
      if (!completedDays[id]) {
        nextDayId = id;
        break;
      }
    }
    if (isProgramComplete) {
      nextDayId = all;
    }
    const totalPracticeSeconds = completed.reduce((sum, d) => sum + d.timeSeconds, 0);
    const averageAccuracy = totalSessions
      ? Math.round(completed.reduce((sum, d) => sum + d.accuracy, 0) / totalSessions)
      : 0;

    return {
      hydrated,
      user,
      completedDays,
      poseProgress,
      assessment,
      nextDayId,
      isProgramComplete,
      isAssessmentUnlocked: isProgramComplete,
      completedDayCount: completedDayCount,
      totalPracticeSeconds,
      totalSessions,
      averageAccuracy,
      streakDays: computeStreak(completedDays),
      signIn,
      signOut,
      completeSurvey,
      updateProfile,
      completeDay,
      markPoseCompletion,
      completeAssessment,
      resetProgress,
    };
  }, [
    hydrated,
    user,
    completedDays,
    poseProgress,
    assessment,
    completedDayCount,
    signIn,
    signOut,
    completeSurvey,
    updateProfile,
    completeDay,
    markPoseCompletion,
    completeAssessment,
    resetProgress,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}