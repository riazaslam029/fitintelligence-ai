import type { AWSLogEntry, GymCheckIn, WorkoutSession } from '../types';

class AWSServiceSimulator {
  private logs: AWSLogEntry[] = [];
  private listeners: ((logs: AWSLogEntry[]) => void)[] = [];
  private totalCreditsUsed = 0.42; // AWS Free Tier tracking

  // Mock AWS Config (or optional real keys)
  private config = {
    useRealAWS: false,
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    bedrockModelId: 'amazon.nova-pro-v1:0',
  };

  public setConfig(newConfig: Partial<typeof this.config>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig() {
    return { ...this.config };
  }

  public getLogs(): AWSLogEntry[] {
    return [...this.logs];
  }

  public subscribeLogs(listener: (logs: AWSLogEntry[]) => void) {
    this.listeners.push(listener);
    listener([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.getLogs()));
  }

  private addLog(entry: Omit<AWSLogEntry, 'id' | 'timestamp'>) {
    const newEntry: AWSLogEntry = {
      ...entry,
      id: `aws-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.logs.unshift(newEntry);
    if (this.logs.length > 50) this.logs.pop();
    this.totalCreditsUsed += 0.0015;
    this.notify();
  }

  public getCreditsUsed() {
    return Math.min(200.0, Math.round(this.totalCreditsUsed * 1000) / 1000);
  }

  /**
   * Invokes Amazon Bedrock Nova Pro/Lite for intelligent biomechanics coaching or workout plans.
   */
  public async invokeBedrock(prompt: string, context?: Record<string, any>): Promise<string> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400)); // Simulate AWS latency

    let aiResponse = '';
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('squat')) {
      aiResponse = `**Amazon Bedrock Nova Pro Analysis**:
• **Biomechanics Breakdown**: Your knee tracking during the eccentric phase showed minor inward knee valgus at 84° depth.
• **Actionable Cue**: Imagine screwing your feet into the floor outward while descending. Keep your sternum elevated.
• **Recommended Accessory Work**: 3x12 Goblet Squats with resistance band around knees to reinforce hip abductor engagement.`;
    } else if (lowerPrompt.includes('deadlift') || lowerPrompt.includes('back')) {
      aiResponse = `**Amazon Bedrock Nova Pro Analysis**:
• **Biomechanics Breakdown**: Spine neutral alignment was 92% maintained. Minor lumbar flex noted at floor pull off.
• **Actionable Cue**: Pull the slack out of the barbell before lifting. Brace your core (360-degree intra-abdominal pressure) like preparing for a punch.
• **Recommended Cue**: 3x8 Romanian Deadlifts with 2-second pause below knees.`;
    } else if (lowerPrompt.includes('routine') || lowerPrompt.includes('plan')) {
      aiResponse = `**Amazon Bedrock Hypertrophy & Form Optimization Plan**:
1. **Day 1 (Lower Body Focus)**: Barbell Back Squats (4x8), Bulgarian Split Squats (3x10), Romanian Deadlifts (3x10).
2. **Day 2 (Upper Body Push)**: Overhead Barbell Press (4x6), Incline Dumbbell Bench (3x10), Tricep Dips (3x12).
3. **Day 3 (Posterior Chain & Core)**: Conventional Deadlift (4x5), Lat Pulldowns (3x12), Cable Woodchoppers (3x15).
*Bedrock Note: Geofenced gym attendance logging ensures 100% adherence tracking!*`;
    } else {
      aiResponse = `**Amazon Bedrock AI Fitness Assistant**:
Based on your biometric telemetry and historical workout metrics stored in Amazon DynamoDB:
• Form Score Average: **89.4%** across 14 recent sets.
• Key Insight: Your joint symmetry is optimal. Maintain 3-second controlled eccentrics to maximize muscle hypertrophy while preventing tendon strain.`;
    }

    const latencyMs = Date.now() - startTime;
    this.addLog({
      service: 'Amazon Bedrock',
      action: `InvokeModel (${this.config.bedrockModelId})`,
      status: 'SUCCESS',
      latencyMs,
      payload: {
        modelId: this.config.bedrockModelId,
        inputTokenCount: prompt.length * 2,
        outputTokenCount: aiResponse.length * 2,
        context,
        promptSnippet: prompt.substring(0, 80) + '...',
      },
    });

    return aiResponse;
  }

  /**
   * Simulates Amazon Rekognition facial biometric verification & geofenced check-in.
   */
  public async verifyGymCheckIn(
    gymName: string,
    userCoords: { lat: number; lng: number }
  ): Promise<GymCheckIn> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulated local gym hub center
    const gymCoords = { lat: 37.7749, lng: -122.4194 };
    const distanceMeters = Math.round(
      Math.sqrt(
        Math.pow((userCoords.lat - gymCoords.lat) * 111000, 2) +
          Math.pow((userCoords.lng - gymCoords.lng) * 111000, 2)
      ) + Math.random() * 10
    );

    const confidence = Math.round(98.4 + Math.random() * 1.5 * 10) / 10;
    const verified = distanceMeters <= 500 && confidence > 95.0;
    const lambdaRequestId = `req-lam-${Math.random().toString(36).substr(2, 9)}`;

    // Log Rekognition call
    this.addLog({
      service: 'Amazon Rekognition',
      action: 'CompareFaces (Biometric Verification)',
      status: verified ? 'SUCCESS' : 'WARNING',
      latencyMs: Math.round(startTime * 0.4),
      payload: {
        SourceImage: { S3Object: { Bucket: 'fitintelligence-biometrics', Name: 'user-face-profile.jpg' } },
        TargetImage: { Bytes: '[Base64 Webcam Buffer]' },
        SimilarityThreshold: 90.0,
        MatchConfidence: `${confidence}%`,
      },
    });

    // Log Lambda Execution
    this.addLog({
      service: 'AWS Lambda',
      action: 'process-geofence-checkin',
      status: 'SUCCESS',
      latencyMs: Date.now() - startTime,
      payload: {
        requestId: lambdaRequestId,
        gymName,
        distanceMeters,
        geofenceRadiusMeters: 500,
        verdict: verified ? 'GEOFENCE_PASS' : 'OUT_OF_BOUNDS',
      },
    });

    // Log DynamoDB update
    this.addLog({
      service: 'Amazon DynamoDB',
      action: 'PutItem (GymCheckIns Table)',
      status: 'SUCCESS',
      latencyMs: 32,
      payload: {
        TableName: 'FitIntelligence_CheckIns',
        Item: {
          CheckInId: `chk-${Date.now()}`,
          GymName: gymName,
          Verified: verified,
          Timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      id: `chk-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gymName,
      distanceMeters,
      rekognitionConfidence: confidence,
      verified,
      streakCount: verified ? 5 : 0,
      lambdaRequestId,
    };
  }

  /**
   * Logs workout session metrics into Amazon DynamoDB & triggers S3 telemetry archive.
   */
  public async logWorkoutSession(session: Omit<WorkoutSession, 'id' | 'timestamp'>): Promise<WorkoutSession> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 400));

    const id = `session-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.addLog({
      service: 'Amazon DynamoDB',
      action: 'PutItem (WorkoutLogs)',
      status: 'SUCCESS',
      latencyMs: Date.now() - startTime,
      payload: {
        TableName: 'FitIntelligence_Workouts',
        Item: { SessionId: id, Exercise: session.exercise, Reps: session.repsCompleted, FormScore: session.avgFormScore },
      },
    });

    this.addLog({
      service: 'Amazon S3',
      action: 'PutObject (raw-telemetry-video-frames)',
      status: 'SUCCESS',
      latencyMs: 140,
      payload: {
        Bucket: 'fitintelligence-pose-telemetry',
        Key: `raw_telemetry/${id}.json`,
        ContentLengthBytes: 40960,
      },
    });

    return { ...session, id, timestamp };
  }
}

export const awsSimulator = new AWSServiceSimulator();
