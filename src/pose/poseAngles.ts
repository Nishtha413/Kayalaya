import {
  getImageJointAngle,
  LANDMARK_NAMES,
  type LandmarkName,
  type PoseFrame,
} from 'expo-mediapipe-pose/core';
import type { ApiPose } from '../data/api';

export type AngleRule = {
  id: string;
  landmarks: [LandmarkName, LandmarkName, LandmarkName];
  minDeg: number;
  maxDeg: number;
  toleranceDeg: number;
  tip: string;
};

export type PoseRuleSet = {
  mirror: boolean;
  rules: AngleRule[];
  source: 'backend' | 'fallback';
};

export type PoseEvaluation = {
  status: 'unconfigured' | 'cannot_evaluate' | 'correct' | 'needs_adjustment';
  score: number | null;
  coverage: number;
  feedback: string | null;
};

const BASE_LANDMARKS: Record<string, string> = {
  hip: 'hip',
  knee: 'knee',
  ankle: 'ankle',
  shoulder: 'shoulder',
  elbow: 'elbow',
  wrist: 'wrist',
};

const SIDE_SWAP: Record<string, string> = { left: 'right', right: 'left' };

function toLandmark(side: string | null, segment: string): LandmarkName | null {
  const base = BASE_LANDMARKS[segment];
  if (!base) return null;
  const name = side ? `${side}${base[0].toUpperCase()}${base.slice(1)}` : base;
  return LANDMARK_NAMES.includes(name as LandmarkName) ? (name as LandmarkName) : null;
}

function landmarksForJoint(jointName: string): AngleRule['landmarks'] | null {
  const tokens = jointName.split('_').filter(Boolean);
  const side = tokens[0] === 'left' || tokens[0] === 'right' ? tokens.shift()! : null;
  if (tokens.length !== 3) return null;
  const converted = tokens.map((token) => toLandmark(side, token));
  if (converted.some((name) => !name)) return null;
  return converted as AngleRule['landmarks'];
}

function swapLandmarkSide(name: LandmarkName): LandmarkName {
  const match = /^(left|right)(.+)$/.exec(name);
  if (!match) return name;
  const swapped = `${SIDE_SWAP[match[1]]}${match[2]}`;
  return LANDMARK_NAMES.includes(swapped as LandmarkName) ? (swapped as LandmarkName) : name;
}

export function poseRulesFromApiPose(pose: ApiPose | undefined): PoseRuleSet | null {
  if (!pose?.reference_angles?.length) return null;
  const rules = pose.reference_angles.flatMap((angle) => {
    const landmarks = landmarksForJoint(angle.joint_name);
    if (!landmarks) return [];
    const toleranceDeg = Math.max(1, angle.tolerance_deg || 8);
    return [{
      id: angle.joint_name,
      landmarks,
      minDeg: angle.min_angle,
      maxDeg: Math.min(angle.max_angle, 180),
      toleranceDeg,
      tip: `Adjust your ${angle.joint_name.replace(/_/g, ' ')} angle`,
    }];
  });
  if (!rules.length) return null;
  const jointNames = pose.reference_angles.map((angle) => angle.joint_name);
  const mirror = !(jointNames.some((name) => name.startsWith('left_')) && jointNames.some((name) => name.startsWith('right_')));
  return { mirror, rules, source: 'backend' };
}

type SideEvaluation = {
  score: number;
  coverage: number;
  feedback: string | null;
  allCorrect: boolean;
};

function evaluateSide(frame: PoseFrame, ruleSet: PoseRuleSet, mirrored: boolean): SideEvaluation {
  let scoreSum = 0;
  let availableCount = 0;
  let largestNormalizedError = 0;
  let feedback: string | null = null;

  for (const rule of ruleSet.rules) {
    const landmarks = mirrored ? rule.landmarks.map(swapLandmarkSide) : rule.landmarks;
    const measurement = getImageJointAngle(
      { landmarks: frame.landmarks, imageSize: frame.additionalData },
      landmarks[0],
      landmarks[1],
      landmarks[2],
      { minVisibility: 0.5 },
    );
    if (measurement.status !== 'available') continue;
    const error = Math.max(rule.minDeg - measurement.value, 0, measurement.value - rule.maxDeg);
    const normalizedError = Math.min(1, error / (2 * rule.toleranceDeg));
    scoreSum += 100 * (1 - normalizedError);
    availableCount += 1;
    if (normalizedError > largestNormalizedError) {
      largestNormalizedError = normalizedError;
      feedback = normalizedError > 0 ? rule.tip : null;
    }
  }

  if (!availableCount) {
    return {
      score: 0,
      coverage: 0,
      feedback: 'Move your full body into camera view',
      allCorrect: false,
    };
  }

  return {
    score: scoreSum / availableCount,
    coverage: availableCount / ruleSet.rules.length,
    feedback,
    allCorrect: largestNormalizedError === 0 && availableCount === ruleSet.rules.length,
  };
}

function toEvaluation(side: SideEvaluation): PoseEvaluation {
  if (side.coverage < 1) {
    return {
      status: 'cannot_evaluate',
      score: null,
      coverage: side.coverage,
      feedback: 'Move your full body into camera view',
    };
  }
  if (side.allCorrect) {
    return { status: 'correct', score: 100, coverage: 1, feedback: null };
  }
  return {
    status: 'needs_adjustment',
    score: Math.round(side.score),
    coverage: 1,
    feedback: side.feedback,
  };
}

export function evaluatePoseFrame(frame: PoseFrame, ruleSet: PoseRuleSet | undefined): PoseEvaluation {
  if (!ruleSet?.rules.length) {
    return { status: 'unconfigured', score: null, coverage: 0, feedback: 'Reference angles are not configured' };
  }
  const normal = evaluateSide(frame, ruleSet, false);
  if (!ruleSet.mirror) return toEvaluation(normal);
  const mirrored = evaluateSide(frame, ruleSet, true);
  const best = mirrored.coverage > normal.coverage ||
    (mirrored.coverage === normal.coverage && mirrored.score > normal.score)
    ? mirrored
    : normal;
  return toEvaluation(best);
}
