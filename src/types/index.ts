export type ExerciseType = 'squat' | 'pushup' | 'deadlift' | 'overhead_press';

export interface Keypoint {
  x: number;
  y: number;
  score: number;
  name: string;
}

export interface BiomechanicsMetrics {
  kneeAngle: number;
  hipAngle: number;
  elbowAngle: number;
  torsoAngle: number;
  symmetryScore: number;
  depthReached: boolean;
  formScore: number; // 0 - 100
  formStatus: 'optimal' | 'warning' | 'critical';
  feedbackMessages: string[];
}

export interface WorkoutSession {
  id: string;
  timestamp: string;
  exercise: ExerciseType;
  repsCompleted: number;
  avgFormScore: number;
  primaryCorrection: string;
  bedrockAnalysis: string;
}

export interface GymCheckIn {
  id: string;
  timestamp: string;
  gymName: string;
  distanceMeters: number;
  rekognitionConfidence: number;
  verified: boolean;
  streakCount: number;
  lambdaRequestId: string;
}

export interface AWSLogEntry {
  id: string;
  timestamp: string;
  service: 'Amazon Bedrock' | 'Amazon Rekognition' | 'AWS Lambda' | 'Amazon DynamoDB' | 'Amazon S3' | 'Amazon EC2';
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  latencyMs: number;
  payload: Record<string, any>;
}

export interface UserStats {
  totalCheckIns: number;
  currentStreak: number;
  workoutsLogged: number;
  avgFormScore: number;
  awsCreditsUsed: number;
}
