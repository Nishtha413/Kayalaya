import type { PoseRuleSet } from './poseAngles';

export type Reading = (points: string[]) => number | null;

export const swapSide = (name: string) =>
  name.startsWith('left')
    ? `right${name.slice(4)}`
    : name.startsWith('right')
      ? `left${name.slice(5)}`
      : name;

export function evaluateSide(
  definition: PoseRuleSet,
  read: Reading,
  mirror: boolean,
  history: Record<string, number>,
) {
  let sum = 0;
  let valid = 0;
  let worst = 0;
  let tip = '';
  const angles: Record<string, number> = {};

  for (const [index, rule] of definition.rules.entries()) {
    const points = mirror ? rule.landmarks.map(swapSide) : rule.landmarks;
    const key = `${mirror}:${index}`;
    const raw = read(points);
    if (raw === null || !Number.isFinite(raw) || raw < 0 || raw > 180) {
      delete history[key];
      continue;
    }

    const smoothed = history[key] === undefined ? raw : history[key] + 0.35 * (raw - history[key]);
    history[key] = smoothed;
    angles[points.join('_')] = Math.round(smoothed);
    valid += 1;

    const low = Math.max(0, rule.minDeg - rule.toleranceDeg);
    const high = Math.min(180, rule.maxDeg + rule.toleranceDeg);
    const error = Math.max(0, low - smoothed, smoothed - high);
    const rawError = Math.max(0, low - raw, raw - high);
    const deviation = Math.max(error, rawError);
    sum += Math.max(0, 100 - 2 * deviation);

    if (deviation > worst) {
      worst = deviation;
      tip = mirror ? rule.tip.replace(/left|right/g, swapSide) : rule.tip;
    }
  }

  const available = valid === definition.rules.length && valid > 0;
  return {
    score: available ? Math.round(sum / valid) : null,
    correct: available && worst === 0,
    coverage: definition.rules.length ? valid / definition.rules.length : 0,
    angles,
    feedback: !available
      ? 'Step back so the required joints are visible'
      : worst
        ? tip
        : 'Great — hold it steady!',
  };
}

export function evaluateFrame(
  definition: PoseRuleSet,
  read: Reading,
  history: Record<string, number>,
) {
  const normal = evaluateSide(definition, read, false, history);
  if (!definition.mirror) return normal;
  const mirrored = evaluateSide(definition, read, true, history);
  return (mirrored.score ?? -1) > (normal.score ?? -1) ? mirrored : normal;
}
