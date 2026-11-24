export type PoseRule = {
  points: [string, string, string]; // start, vertex (the joint), end
  target: number;    // degrees
  tolerance: number; // ± degrees
  tip: string;
};

export type PoseDefinition = { mirror: boolean; rules: PoseRule[] };

// STARTING GUESSES. Tune these by doing each pose yourself (see Step 5).
export const POSE_RULES: Record<string, PoseDefinition> = {
  mountain: {
    mirror: false,
    rules: [
      { points: ['leftHip', 'leftKnee', 'leftAnkle'], target: 175, tolerance: 12, tip: 'Straighten your left leg' },
      { points: ['rightHip', 'rightKnee', 'rightAnkle'], target: 175, tolerance: 12, tip: 'Straighten your right leg' },
      { points: ['leftShoulder', 'leftHip', 'leftKnee'], target: 175, tolerance: 12, tip: 'Stand tall, stack shoulders over hips' },
    ],
  },
  tree: {
    mirror: true,
    rules: [
      { points: ['leftHip', 'leftKnee', 'leftAnkle'], target: 175, tolerance: 12, tip: 'Keep your standing leg straight' },
      { points: ['rightHip', 'rightKnee', 'rightAnkle'], target: 60, tolerance: 30, tip: 'Bring your bent knee out to the side' },
    ],
  },
  'warrior-2': {
    mirror: true,
    rules: [
      { points: ['leftHip', 'leftKnee', 'leftAnkle'], target: 95, tolerance: 20, tip: 'Bend your front knee closer to 90°' },
      { points: ['rightHip', 'rightKnee', 'rightAnkle'], target: 175, tolerance: 15, tip: 'Straighten your back leg' },
      { points: ['leftElbow', 'leftShoulder', 'leftHip'], target: 90, tolerance: 20, tip: 'Lift your arms to shoulder height' },
      { points: ['rightElbow', 'rightShoulder', 'rightHip'], target: 90, tolerance: 20, tip: 'Lift your arms to shoulder height' },
    ],
  },
  triangle: {
    mirror: true,
    rules: [
      { points: ['leftHip', 'leftKnee', 'leftAnkle'], target: 175, tolerance: 15, tip: 'Keep both legs straight' },
      { points: ['rightHip', 'rightKnee', 'rightAnkle'], target: 175, tolerance: 15, tip: 'Keep both legs straight' },
    ],
  },
  // Side-on camera needed for the next three:
  'downward-dog': {
    mirror: false,
    rules: [
      { points: ['leftShoulder', 'leftHip', 'leftKnee'], target: 90, tolerance: 25, tip: 'Lift your hips higher' },
      { points: ['leftHip', 'leftKnee', 'leftAnkle'], target: 170, tolerance: 15, tip: 'Straighten your legs' },
      { points: ['leftShoulder', 'leftElbow', 'leftWrist'], target: 170, tolerance: 15, tip: 'Straighten your arms' },
    ],
  },
  cobra: {
    mirror: false,
    rules: [
      { points: ['leftShoulder', 'leftHip', 'leftKnee'], target: 150, tolerance: 20, tip: 'Lift your chest a little higher' },
      { points: ['leftHip', 'leftKnee', 'leftAnkle'], target: 175, tolerance: 15, tip: 'Keep your legs straight' },
    ],
  },
  childs: {
    mirror: false,
    rules: [
      { points: ['leftHip', 'leftKnee', 'leftAnkle'], target: 30, tolerance: 25, tip: 'Sit your hips back toward your heels' },
      { points: ['leftShoulder', 'leftHip', 'leftKnee'], target: 40, tolerance: 25, tip: 'Fold your chest down toward your thighs' },
    ],
  },
  // Add an entry for your 8th pose using its `id` from data/program
};