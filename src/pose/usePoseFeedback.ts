import { useEffect, useRef, useState } from 'react';
import type { PoseFrame } from 'expo-mediapipe-pose/core';
import { evaluatePoseFrame, type PoseEvaluation, type PoseRuleSet } from './poseAngles';

const SCORE_SMOOTHING = 0.25;
const EMPTY: PoseEvaluation = {
  status: 'unconfigured',
  score: null,
  coverage: 0,
  feedback: 'Reference angles are not configured',
};

export function usePoseFeedback(definition: PoseRuleSet | undefined) {
  const previousRef = useRef<PoseEvaluation | null>(null);
  const [state, setState] = useState<PoseEvaluation>(EMPTY);

  useEffect(() => {
    previousRef.current = null;
    setState(EMPTY);
  }, [definition]);

  const onFrame = (frame: PoseFrame) => {
    if (!definition) {
      setState(EMPTY);
      return;
    }
    const current = evaluatePoseFrame(frame, definition);
    const previous = previousRef.current;
    let next = current;

    if (current.score === null) {
      const decayed = previous?.score != null ? Math.max(0, previous.score - 3) : 0;
      next = { ...current, score: decayed };
    } else if (previous?.score != null) {
      next = {
        ...current,
        score: Math.round(previous.score * (1 - SCORE_SMOOTHING) + current.score * SCORE_SMOOTHING),
      };
    }

    previousRef.current = next;
    setState(next);
  };

  return {
    correction: state.feedback,
    onFrame,
    correct: state.status === 'correct',
    accuracy: Math.round(state.score ?? 0),
    status: state.status,
    source: definition?.source ?? 'fallback',
  };
}
