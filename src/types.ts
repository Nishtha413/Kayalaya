import type { MaterialCommunityIcons } from 'expo-vector-icons';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type Difficulty = 'Beginner' | 'Easy' | 'Moderate';

export interface Pose {
  id: string;
  name: string;
  sanskrit: string;
  icon: IconName;
  difficulty: Difficulty;
  description: string;
  tips: string[];
  duration: number;
  builds: string[];
  rest?: boolean;
}

export interface DayProgram {
  id: number;
  title: string;
  theme: string;
  description: string;
  poseIds: string[];
}

export interface PoseResult {
  poseId: string;
  accuracy: number;
  timeSeconds: number;
}

export interface DayResult {
  dayId: number;
  accuracy: number;
  timeSeconds: number;
  completedAt: string;
}

export interface SurveyAnswers {
  age: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  experience: string;
  goals: string[];
  dailyMinutes: string;
}

export interface UserProfile {
  name: string;
  email: string;
  createdAt: string;
  survey: SurveyAnswers | null;
}

export interface PerPoseAssessment {
  poseId: string;
  correct: boolean;
}

export interface AssessmentResult {
  date: string;
  totalPoses: number;
  correctCount: number;
  score: number;
  marks: number;
  perPose: PerPoseAssessment[];
  strengths: string[];
  improvements: string[];
}

export type RootStackParamList = {
  Splash: undefined;
  Auth: { mode?: 'create' | 'login' } | undefined;
  Survey: { name?: string; survey?: SurveyAnswers };
  Main: undefined;
  PosePractice: {
    dayId: number;
    poseIndex: number;
    marks?: PerPoseAssessment[];
  };
  DayComplete: { dayId: number };
  AssessmentIntro: undefined;
  Assessment: undefined;
  AssessmentResult: { result: AssessmentResult };
};

export type MainTabParamList = {
  Home: undefined;
  Journey: { dayId?: number } | undefined;
  Profile: undefined;
};