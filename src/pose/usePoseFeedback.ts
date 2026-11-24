import { useCallback, useRef, useState } from 'react';
import { getImageJointAngle } from 'expo-mediapipe-pose';
import type { PoseDefinition } from '../data/poseRules';

type FrameLike = { landmarks: any; additionalData: any };

const ANGLE_SMOOTHING = 0.35; // lower = smoother
const SCORE_SMOOTHING = 0.25;

const swapSide = (n: string) =>
  n.startsWith('left') ? 'right' + n.slice(4)
  : n.startsWith('right') ? 'left' + n.slice(5)
  : n;

export function usePoseFeedback(definition: PoseDefinition | undefined) {
  const [accuracy, setAccuracy] = useState(0);
  const [correction, setCorrection] = useState<string | null>(null);
  const [inPose, setInPose] = useState(false);
  const angles = useRef<Record<string, number>>({});
  const score = useRef(0);

  const reset = useCallback(() => {
    angles.current = {};
    score.current = 0;
    setAccuracy(0);
    setCorrection(null);
    setInPose(false);
  }, []);

  const evaluateSide = (frame: FrameLike, def: PoseDefinition, mirrored: boolean) => {
    let passed = 0;
    let unknown = false;
    let firstFail: string | null = null;
    for (let i = 0; i < def.rules.length; i++) {
      const rule = def.rules[i];
      const pts = mirrored ? rule.points.map(swapSide) : rule.points;
      const r = getImageJointAngle(
        { landmarks: frame.landmarks, imageSize: frame.additionalData },
        pts[0] as any, pts[1] as any, pts[2] as any,
      );
      if (r.status !== 'available') { unknown = true; continue; }
      const key = `${mirrored ? 'm' : 'n'}:${i}`;
      const prev = angles.current[key];
      const angle = prev === undefined ? r.value : prev + ANGLE_SMOOTHING * (r.value - prev);
      angles.current[key] = angle;
      // if (__DEV__) console.log(key, Math.round(angle)); // for tuning
      if (Math.abs(angle - rule.target) <= rule.tolerance) passed++;
      else if (!firstFail) firstFail = rule.tip;
    }
    return { passed, unknown, firstFail };
  };

  const onFrame = useCallback((frame: FrameLike) => {
    if (!definition || definition.rules.length === 0) return;
    const a = evaluateSide(frame, definition, false);
    const b = definition.mirror ? evaluateSide(frame, definition, true) : null;
    const best = b && b.passed > a.passed ? b : a;

    if (best.unknown) {
      score.current *= 1 - SCORE_SMOOTHING;
      setAccuracy(Math.round(score.current / 5) * 5);
      setInPose(false);
      setCorrection('Fix: Step back so your whole body is visible');
      return;
    }
    const pct = (best.passed / definition.rules.length) * 100;
    score.current += SCORE_SMOOTHING * (pct - score.current);
    const ok = best.passed === definition.rules.length;
    setAccuracy(Math.round(score.current / 5) * 5);
    setInPose(ok);
    setCorrection(ok ? 'Great — hold it steady!' : `Fix: ${best.firstFail}`);
  }, [definition]);

  return { accuracy, correction, inPose, onFrame, reset };
}