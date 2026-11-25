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
  loadToken,
  saveAssessment,
  saveCompletedDays,
  saveToken,
  saveUser,
} from '../data/storage';
import * as api from '../data/api';
import { poseRulesFromApiPose, type PoseRuleSet } from '../pose/poseAngles';

export interface AppContextValue {
  hydrated: boolean;
  user: UserProfile | null;
  completedDays: Record<number, DayResult>;
  poseProgress: Record<number, number>;
  assessment: AssessmentResult | null;
  serverProgress: api.ApiProgressStatus | null;
  poses: api.ApiPose[];
  nextDayId: number;
  isProgramComplete: boolean;
  isAssessmentUnlocked: boolean;
  completedDayCount: number;
  totalPracticeSeconds: number;
  totalSessions: number;
  averageAccuracy: number;
  streakDays: number;
  signIn: (mode: 'login' | 'create', payload: { name?: string; email: string; password: string }) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  completeSurvey: (survey: SurveyAnswers) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeDay: (dayId: number, accuracy: number, timeSeconds: number) => Promise<void>;
  markPoseCompletion: (dayId: number, count: number) => void;
  completeAssessment: (result: AssessmentResult) => Promise<void>;
  getPoseRules: (clientId: string) => PoseRuleSet | undefined;
  refreshProgress: () => Promise<void>;
  recordPoseAttempt: (dayId: number, poseId: string, accuracy: number, timeSeconds: number) => Promise<void>;
  submitFinalTestResult: (accuracy: number) => Promise<void>;
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
  const [serverProgress, setServerProgress] = useState<api.ApiProgressStatus | null>(null);
  const [poses, setPoses] = useState<api.ApiPose[]>([]);

  const applyRemoteProgress = useCallback((status: api.ApiProgressStatus) => {
    setServerProgress(status);
    setCompletedDays((previous) => {
      const next: Record<number, DayResult> = {};
      for (const day of status.days) {
        if (!day.completed) continue;
        next[day.day] = previous[day.day] ?? {
          dayId: day.day,
          accuracy: 100,
          timeSeconds: 0,
          completedAt: new Date().toISOString(),
        };
      }
      saveCompletedDays(next);
      return next;
    });
  }, []);

  const loadRemoteData = useCallback(async (token: string) => {
    const [status, poseList] = await Promise.all([
      api.getProgressStatus(token),
      api.getPoses(token),
    ]);
    applyRemoteProgress(status);
    setPoses(poseList);
  }, [applyRemoteProgress]);

  const refreshProgress = useCallback(async () => {
    const token = await loadToken();
    if (!token) return;
    const status = await api.getProgressStatus(token);
    applyRemoteProgress(status);
  }, [applyRemoteProgress]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const state = await loadState();
      const token = await loadToken();
      let nextUser = state.user;
      let remoteLoaded = false;
      if (token) {
        try {
          const me = await api.getMe(token);
          const localMatch = nextUser && nextUser.email === me.email ? nextUser : null;
          nextUser = {
            name: me.display_name || localMatch?.name || me.email.split('@')[0],
            email: me.email,
            createdAt: localMatch?.createdAt || new Date().toISOString(),
            survey: (me.survey as any) ?? localMatch?.survey ?? null,
          };
          await saveUser(nextUser);
          await loadRemoteData(token).then(() => { remoteLoaded = true; }).catch((error) => console.warn('Unable to load backend data', error));
        } catch {
          await saveToken(null);
          nextUser = null;
          await saveUser(null);
        }
      }
      if (!mounted) return;
      setUser(nextUser);
      if (!remoteLoaded) setCompletedDays(nextUser ? state.completedDays : {});
      setAssessment(nextUser ? state.assessment : null);
      setHydrated(true);
    })();
    return () => { mounted = false; };
  }, [loadRemoteData]);

  useEffect(() => {
    if (!user) {
      setServerProgress(null);
      setPoses([]);
    }
  }, [user]);

  const signIn = useCallback(async (mode: 'login' | 'create', payload: { name?: string; email: string; password: string }) => {
    const email = payload.email.trim().toLowerCase();
    let auth: { access_token: string; user: api.ApiUser };
    if (mode === 'create') {
      await api.register(email, payload.password, (payload.name || '').trim());
      auth = await api.login(email, payload.password);
    } else {
      auth = await api.login(email, payload.password);
    }
    await saveToken(auth.access_token);
    const existing = await loadState().then((s) => s.user);
    const localMatch = existing && existing.email === auth.user.email ? existing : null;
    const profile: UserProfile = {
      name: auth.user.display_name || localMatch?.name || (payload.name || '').trim() || email.split('@')[0],
      email: auth.user.email,
      createdAt: localMatch?.createdAt || new Date().toISOString(),
      survey: (auth.user.survey as any) ?? localMatch?.survey ?? null,
    };
    setUser(profile);
    await saveUser(profile);
    await loadRemoteData(auth.access_token).catch((error) => console.warn('Unable to load backend progress', error));
    return profile;
  }, [loadRemoteData]);

  const signOut = useCallback(async () => {
    setUser(null);
    setServerProgress(null);
    setPoses([]);
    setCompletedDays({});
    setPoseProgress({});
    setAssessment(null);
    await saveUser(null);
    await saveToken(null);
    await saveCompletedDays({});
    await saveAssessment(null);
  }, []);

  const completeSurvey = useCallback(async (survey: SurveyAnswers) => {
    let next: UserProfile | null = null;
    setUser((prev) => {
      next = prev ? { ...prev, survey } : null;
      return next;
    });
    if (next) {
      await saveUser(next);
      const token = await loadToken();
      if (token) {
        try {
          await api.saveSurvey(token, survey);
        } catch {
          console.warn('Survey saved locally; backend sync will retry on next app session');
        }
      }
    }
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

  const submitFinalTestResult = useCallback(async (accuracy: number) => {
    const token = await loadToken();
    if (!token) return;
    try {
      await api.submitFinalTestResult(token, {
        predicted_pose_name: null,
        accuracy_score: Math.round(accuracy),
        joint_feedback: null,
      });
      await refreshProgress();
    } catch (error) {
      console.warn('Unable to submit final assessment result', error);
    }
  }, [refreshProgress]);

  const completeAssessment = useCallback(async (result: AssessmentResult) => {
    setAssessment(result);
    await saveAssessment(result);
    await submitFinalTestResult(result.score);
  }, [submitFinalTestResult]);

  const markPoseCompletion = useCallback((dayId: number, count: number) => {
    setPoseProgress((prev) => ({
      ...prev,
      [dayId]: Math.max(prev[dayId] ?? 0, count),
    }));
  }, []);

  const getPoseRules = useCallback((clientId: string) => {
    const key = clientId.toLowerCase().replace(/_/g, '-');
    const pose = poses.find((item) =>
      item.client_id === clientId ||
      item.pose_name === clientId ||
      String(item.id) === clientId ||
      item.client_id?.toLowerCase() === key ||
      item.pose_name.toLowerCase() === key,
    );
    return poseRulesFromApiPose(pose) ?? undefined;
  }, [poses]);

  const recordPoseAttempt = useCallback(async (
    dayId: number,
    poseId: string,
    accuracy: number,
    timeSeconds: number,
  ) => {
    const token = await loadToken();
    if (!token) return;
    try {
      await api.submitPracticeAttempt(token, {
        pose_id: poseId,
        day_number: dayId,
        accuracy_score: Math.round(accuracy),
        joint_feedback: { held_seconds: String(Math.round(timeSeconds)) },
      });
      await refreshProgress();
    } catch (error) {
      console.warn('Unable to save practice attempt', error);
    }
  }, [refreshProgress]);

  const resetProgress = useCallback(async () => {
    setCompletedDays({});
    setPoseProgress({});
    setAssessment(null);
    setServerProgress(null);
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
      serverProgress,
      poses,
      nextDayId,
      isProgramComplete,
      isAssessmentUnlocked: serverProgress?.final_test_unlocked ?? isProgramComplete,
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
      getPoseRules,
      refreshProgress,
      recordPoseAttempt,
      submitFinalTestResult,
      resetProgress,
    };
  }, [
    hydrated,
    user,
    completedDays,
    poseProgress,
    assessment,
    serverProgress,
    poses,
    completedDayCount,
    signIn,
    signOut,
    completeSurvey,
    updateProfile,
    completeDay,
    markPoseCompletion,
    completeAssessment,
    getPoseRules,
    refreshProgress,
    recordPoseAttempt,
    submitFinalTestResult,
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
