import type { BiomechanicsMetrics, ExerciseType, Keypoint } from '../types';

/**
 * Calculates the angle between three 2D keypoints (A-B-C) where B is the vertex.
 */
export function calculateAngle(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number },
  pointC: { x: number; y: number }
): number {
  const radians =
    Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

/**
 * Generates dynamic synthetic pose keypoints for demonstration & video simulation.
 */
export function generateSyntheticPose(
  exercise: ExerciseType,
  frameProgress: number // 0.0 to 1.0 (phase of movement)
): Keypoint[] {
  // Center canvas dimensions normalized 0-100
  const phase = Math.sin(frameProgress * Math.PI * 2);
  const normalizedPhase = (phase + 1) / 2; // 0 to 1

  let head = { x: 50, y: 18 };
  let shoulderL = { x: 42, y: 30 };
  let shoulderR = { x: 58, y: 30 };
  let elbowL = { x: 38, y: 44 };
  let elbowR = { x: 62, y: 44 };
  let wristL = { x: 38, y: 58 };
  let wristR = { x: 62, y: 58 };
  let hipL = { x: 44, y: 55 };
  let hipR = { x: 56, y: 55 };
  let kneeL = { x: 44, y: 73 };
  let kneeR = { x: 56, y: 73 };
  let ankleL = { x: 44, y: 90 };
  let ankleR = { x: 56, y: 90 };

  if (exercise === 'squat') {
    // Squat movement: hips descend, knees flex outwards, torso inclines slightly
    const drop = normalizedPhase * 22; // Hips drop down by 22 units
    head.y += drop * 0.9;
    shoulderL.y += drop * 0.9;
    shoulderR.y += drop * 0.9;
    elbowL.y += drop * 0.9;
    elbowR.y += drop * 0.9;
    wristL.y += drop * 0.9;
    wristR.y += drop * 0.9;
    hipL.y += drop;
    hipR.y += drop;

    // Knees push forward/out
    kneeL.x -= drop * 0.15;
    kneeR.x += drop * 0.15;
    kneeL.y += drop * 0.4;
    kneeR.y += drop * 0.4;
  } else if (exercise === 'pushup') {
    // Horizontal pushup pose
    head = { x: 20 + normalizedPhase * 3, y: 45 + normalizedPhase * 10 };
    shoulderL = { x: 30 + normalizedPhase * 3, y: 46 + normalizedPhase * 10 };
    shoulderR = { x: 30 + normalizedPhase * 3, y: 46 + normalizedPhase * 10 };
    elbowL = { x: 32, y: 36 + normalizedPhase * 12 };
    elbowR = { x: 32, y: 56 + normalizedPhase * 12 };
    wristL = { x: 33, y: 50 };
    wristR = { x: 33, y: 50 };
    hipL = { x: 55 + normalizedPhase * 3, y: 46 + normalizedPhase * 10 };
    hipR = { x: 55 + normalizedPhase * 3, y: 46 + normalizedPhase * 10 };
    kneeL = { x: 75 + normalizedPhase * 3, y: 46 + normalizedPhase * 10 };
    kneeR = { x: 75 + normalizedPhase * 3, y: 46 + normalizedPhase * 10 };
    ankleL = { x: 90, y: 46 + normalizedPhase * 10 };
    ankleR = { x: 90, y: 46 + normalizedPhase * 10 };
  } else if (exercise === 'deadlift') {
    // Hinge movement: Hips travel backward, torso inclines dramatically
    const hinge = normalizedPhase * 25;
    head = { x: 42 + hinge * 0.4, y: 22 + hinge * 0.8 };
    shoulderL = { x: 44 + hinge * 0.3, y: 32 + hinge * 0.7 };
    shoulderR = { x: 56 + hinge * 0.3, y: 32 + hinge * 0.7 };
    wristL = { x: 44 + hinge * 0.3, y: 55 + hinge * 0.7 };
    wristR = { x: 56 + hinge * 0.3, y: 55 + hinge * 0.7 };
    hipL = { x: 41 - hinge * 0.2, y: 54 + hinge * 0.2 };
    hipR = { x: 59 - hinge * 0.2, y: 54 + hinge * 0.2 };
    kneeL = { x: 43, y: 72 + hinge * 0.1 };
    kneeR = { x: 57, y: 72 + hinge * 0.1 };
  } else if (exercise === 'overhead_press') {
    // Overhead press: Hands push vertically straight up
    const press = normalizedPhase * 28;
    wristL = { x: 40, y: 42 - press };
    wristR = { x: 60, y: 42 - press };
    elbowL = { x: 36, y: 48 - press * 0.5 };
    elbowR = { x: 64, y: 48 - press * 0.5 };
  }

  return [
    { ...head, score: 0.99, name: 'head' },
    { ...shoulderL, score: 0.98, name: 'left_shoulder' },
    { ...shoulderR, score: 0.98, name: 'right_shoulder' },
    { ...elbowL, score: 0.95, name: 'left_elbow' },
    { ...elbowR, score: 0.95, name: 'right_elbow' },
    { ...wristL, score: 0.94, name: 'left_wrist' },
    { ...wristR, score: 0.94, name: 'right_wrist' },
    { ...hipL, score: 0.96, name: 'left_hip' },
    { ...hipR, score: 0.96, name: 'right_hip' },
    { ...kneeL, score: 0.95, name: 'left_knee' },
    { ...kneeR, score: 0.95, name: 'right_knee' },
    { ...ankleL, score: 0.92, name: 'left_ankle' },
    { ...ankleR, score: 0.92, name: 'right_ankle' },
  ];
}

/**
 * Analyzes exercise biomechanics based on keypoint positions.
 */
export function analyzeBiomechanics(
  exercise: ExerciseType,
  keypoints: Keypoint[]
): BiomechanicsMetrics {
  const findPt = (name: string) => keypoints.find((k) => k.name === name) || { x: 50, y: 50 };

  const shoulderL = findPt('left_shoulder');
  const shoulderR = findPt('right_shoulder');
  const elbowL = findPt('left_elbow');
  const hipL = findPt('left_hip');
  const kneeL = findPt('left_knee');
  const ankleL = findPt('left_ankle');
  const wristL = findPt('left_wrist');

  const kneeAngle = calculateAngle(hipL, kneeL, ankleL);
  const hipAngle = calculateAngle(shoulderL, hipL, kneeL);
  const elbowAngle = calculateAngle(shoulderL, elbowL, wristL);
  const torsoAngle = Math.round(Math.abs(Math.atan2(shoulderL.x - hipL.x, shoulderL.y - hipL.y) * (180 / Math.PI)));

  let formScore = 95;
  let formStatus: 'optimal' | 'warning' | 'critical' = 'optimal';
  const feedbackMessages: string[] = [];
  let depthReached = false;

  if (exercise === 'squat') {
    if (kneeAngle < 95) {
      depthReached = true;
      feedbackMessages.push('✓ Great squat depth! Parallel threshold reached.');
    } else {
      feedbackMessages.push('↓ Dip lower: Aim for knee angle < 90° for full range of motion.');
    }

    if (torsoAngle > 45) {
      formScore -= 20;
      formStatus = 'warning';
      feedbackMessages.push('⚠ Torso leaning too far forward. Chest up to protect spinal lumbar!');
    }

    // Check knee caving vs ankle alignment
    if (Math.abs(kneeL.x - ankleL.x) > 12) {
      formScore -= 25;
      formStatus = 'critical';
      feedbackMessages.push('❌ Valgus knee collapse detected! Push knees outward over toes.');
    }
  } else if (exercise === 'pushup') {
    if (elbowAngle < 90) {
      depthReached = true;
      feedbackMessages.push('✓ Excellent chest depth!');
    } else {
      feedbackMessages.push('↓ Lower your chest closer to the floor.');
    }

    if (hipAngle < 160) {
      formScore -= 20;
      formStatus = 'warning';
      feedbackMessages.push('⚠ Hips sagging or piking. Engage core to maintain straight plank line.');
    }
  } else if (exercise === 'deadlift') {
    if (torsoAngle < 30 && hipAngle < 100) {
      depthReached = true;
      feedbackMessages.push('✓ Optimal hip hinge position.');
    }
    if (hipAngle > 140) {
      feedbackMessages.push('⚠ Lockout position active. Squeeze glutes at peak.');
    }
    if (kneeAngle < 110) {
      formScore -= 15;
      formStatus = 'warning';
      feedbackMessages.push('⚠ Too much knee bend (squatting the deadlift). Hinge at hips.');
    }
  } else if (exercise === 'overhead_press') {
    if (elbowAngle > 165) {
      depthReached = true;
      feedbackMessages.push('✓ Full overhead lock-out achieved.');
    }
    if (torsoAngle > 20) {
      formScore -= 25;
      formStatus = 'warning';
      feedbackMessages.push('⚠ Hyper-extending lumbar back. Tuck pelvis and brace core.');
    }
  }

  // Symmetry check
  const symmetryScore = Math.max(70, Math.min(100, Math.round(100 - Math.abs(shoulderL.y - shoulderR.y) * 4)));

  return {
    kneeAngle,
    hipAngle,
    elbowAngle,
    torsoAngle,
    symmetryScore,
    depthReached,
    formScore: Math.max(40, formScore),
    formStatus,
    feedbackMessages: feedbackMessages.length > 0 ? feedbackMessages : ['Maintain controlled movement tempo.'],
  };
}
