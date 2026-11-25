import type { PoseRuleSet } from '../pose/poseAngles';

export const POSE_RULES: Record<string, PoseRuleSet> = {
  mountain: {
    mirror: true,
    source: 'fallback',
    rules: [
      { id: 'left-elbow', landmarks: ['leftShoulder', 'leftElbow', 'leftWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Relax your left arm' },
      { id: 'right-elbow', landmarks: ['rightShoulder', 'rightElbow', 'rightWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Relax your right arm' },
      { id: 'left-hip', landmarks: ['leftShoulder', 'leftHip', 'leftKnee'], minDeg: 168, maxDeg: 180, toleranceDeg: 12, tip: 'Stack your left shoulder over your hip' },
      { id: 'right-hip', landmarks: ['rightShoulder', 'rightHip', 'rightKnee'], minDeg: 168, maxDeg: 180, toleranceDeg: 12, tip: 'Stack your right shoulder over your hip' },
      { id: 'left-knee', landmarks: ['leftHip', 'leftKnee', 'leftAnkle'], minDeg: 168, maxDeg: 180, toleranceDeg: 12, tip: 'Straighten your left knee softly' },
      { id: 'right-knee', landmarks: ['rightHip', 'rightKnee', 'rightAnkle'], minDeg: 168, maxDeg: 180, toleranceDeg: 12, tip: 'Straighten your right knee softly' },
    ],
  },
  tree: {
    mirror: true,
    source: 'fallback',
    rules: [
      { id: 'standing-knee', landmarks: ['leftHip', 'leftKnee', 'leftAnkle'], minDeg: 168, maxDeg: 180, toleranceDeg: 12, tip: 'Keep the standing leg long' },
      { id: 'lifted-hip-knee-ankle', landmarks: ['rightHip', 'rightKnee', 'rightAnkle'], minDeg: 85, maxDeg: 115, toleranceDeg: 15, tip: 'Open the lifted knee out' },
      { id: 'left-elbow', landmarks: ['leftShoulder', 'leftElbow', 'leftWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Reach your left arm tall' },
      { id: 'right-elbow', landmarks: ['rightShoulder', 'rightElbow', 'rightWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Reach your right arm tall' },
      { id: 'left-shoulder', landmarks: ['leftElbow', 'leftShoulder', 'leftHip'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Lengthen through your left side' },
      { id: 'right-shoulder', landmarks: ['rightElbow', 'rightShoulder', 'rightHip'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Lengthen through your right side' },
    ],
  },
  'warrior-2': {
    mirror: true,
    source: 'fallback',
    rules: [
      { id: 'front-knee', landmarks: ['leftHip', 'leftKnee', 'leftAnkle'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Bend the front knee to about 90 degrees' },
      { id: 'back-knee', landmarks: ['rightHip', 'rightKnee', 'rightAnkle'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Straighten the back leg' },
      { id: 'left-shoulder', landmarks: ['leftElbow', 'leftShoulder', 'leftHip'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Square your left shoulder' },
      { id: 'right-shoulder', landmarks: ['rightElbow', 'rightShoulder', 'rightHip'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Square your right shoulder' },
      { id: 'left-elbow', landmarks: ['leftShoulder', 'leftElbow', 'leftWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Extend your left arm' },
      { id: 'right-elbow', landmarks: ['rightShoulder', 'rightElbow', 'rightWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Extend your right arm' },
    ],
  },
  triangle: {
    mirror: true,
    source: 'fallback',
    rules: [
      { id: 'front-knee', landmarks: ['leftHip', 'leftKnee', 'leftAnkle'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Keep the front leg straight' },
      { id: 'back-knee', landmarks: ['rightHip', 'rightKnee', 'rightAnkle'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Keep the back leg straight' },
      { id: 'left-shoulder', landmarks: ['leftElbow', 'leftShoulder', 'leftHip'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Open your left shoulder' },
      { id: 'right-shoulder', landmarks: ['rightElbow', 'rightShoulder', 'rightHip'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Open your right shoulder' },
      { id: 'left-elbow', landmarks: ['leftShoulder', 'leftElbow', 'leftWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Reach your left hand down' },
      { id: 'right-elbow', landmarks: ['rightShoulder', 'rightElbow', 'rightWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Reach your right hand up' },
    ],
  },
  'downward-dog': {
    mirror: false,
    source: 'fallback',
    rules: [
      { id: 'left-elbow', landmarks: ['leftShoulder', 'leftElbow', 'leftWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Press through your left palm' },
      { id: 'right-elbow', landmarks: ['rightShoulder', 'rightElbow', 'rightWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Press through your right palm' },
      { id: 'left-hip', landmarks: ['leftShoulder', 'leftHip', 'leftKnee'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Lift your hips higher' },
      { id: 'right-hip', landmarks: ['rightShoulder', 'rightHip', 'rightKnee'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Lift your hips higher' },
      { id: 'left-knee', landmarks: ['leftHip', 'leftKnee', 'leftAnkle'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Soften your left heel down' },
      { id: 'right-knee', landmarks: ['rightHip', 'rightKnee', 'rightAnkle'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Soften your right heel down' },
    ],
  },
  cobra: {
    mirror: false,
    source: 'fallback',
    rules: [
      { id: 'left-elbow', landmarks: ['leftShoulder', 'leftElbow', 'leftWrist'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Press through your left palm' },
      { id: 'right-elbow', landmarks: ['rightShoulder', 'rightElbow', 'rightWrist'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Press through your right palm' },
      { id: 'left-shoulder', landmarks: ['leftElbow', 'leftShoulder', 'leftHip'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Lift through your chest' },
      { id: 'right-shoulder', landmarks: ['rightElbow', 'rightShoulder', 'rightHip'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Lift through your chest' },
      { id: 'left-hip', landmarks: ['leftShoulder', 'leftHip', 'leftKnee'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Keep your hips on the floor' },
      { id: 'right-hip', landmarks: ['rightShoulder', 'rightHip', 'rightKnee'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Keep your hips on the floor' },
    ],
  },
  childs: {
    mirror: false,
    source: 'fallback',
    rules: [
      { id: 'left-knee', landmarks: ['leftHip', 'leftKnee', 'leftAnkle'], minDeg: 68, maxDeg: 112, toleranceDeg: 15, tip: 'Fold into your left heel' },
      { id: 'right-knee', landmarks: ['rightHip', 'rightKnee', 'rightAnkle'], minDeg: 68, maxDeg: 112, toleranceDeg: 15, tip: 'Fold into your right heel' },
      { id: 'left-shoulder', landmarks: ['leftElbow', 'leftShoulder', 'leftHip'], minDeg: 78, maxDeg: 112, toleranceDeg: 15, tip: 'Relax your left shoulder' },
      { id: 'right-shoulder', landmarks: ['rightElbow', 'rightShoulder', 'rightHip'], minDeg: 78, maxDeg: 112, toleranceDeg: 15, tip: 'Relax your right shoulder' },
      { id: 'left-elbow', landmarks: ['leftShoulder', 'leftElbow', 'leftWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 15, tip: 'Reach your left arms long' },
      { id: 'right-elbow', landmarks: ['rightShoulder', 'rightElbow', 'rightWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 15, tip: 'Reach your right arms long' },
    ],
  },
  chair: {
    mirror: false,
    source: 'fallback',
    rules: [
      { id: 'left-knee', landmarks: ['leftHip', 'leftKnee', 'leftAnkle'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Bend your left knee to about 90 degrees' },
      { id: 'right-knee', landmarks: ['rightHip', 'rightKnee', 'rightAnkle'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Bend your right knee to about 90 degrees' },
      { id: 'left-hip', landmarks: ['leftShoulder', 'leftHip', 'leftKnee'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Sit your hips back' },
      { id: 'right-hip', landmarks: ['rightShoulder', 'rightHip', 'rightKnee'], minDeg: 78, maxDeg: 102, toleranceDeg: 12, tip: 'Sit your hips back' },
      { id: 'left-elbow', landmarks: ['leftShoulder', 'leftElbow', 'leftWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Reach your left arms forward' },
      { id: 'right-elbow', landmarks: ['rightShoulder', 'rightElbow', 'rightWrist'], minDeg: 163, maxDeg: 180, toleranceDeg: 12, tip: 'Reach your right arms forward' },
    ],
  },
};
