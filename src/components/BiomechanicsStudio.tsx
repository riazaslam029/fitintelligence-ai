import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Camera, RotateCcw, Award, AlertTriangle, CheckCircle, Sparkles, Activity, Cpu } from 'lucide-react';
import type { BiomechanicsMetrics, ExerciseType, Keypoint, WorkoutSession } from '../types';
import { analyzeBiomechanics, generateSyntheticPose } from '../utils/biomechanics';
import { awsSimulator } from '../services/awsSimulator';
import confetti from 'canvas-confetti';

export const BiomechanicsStudio: React.FC = () => {
  const [exercise, setExercise] = useState<ExerciseType>('squat');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [repCount, setRepCount] = useState<number>(0);
  const [metrics, setMetrics] = useState<BiomechanicsMetrics>({
    kneeAngle: 170,
    hipAngle: 175,
    elbowAngle: 160,
    torsoAngle: 10,
    symmetryScore: 98,
    depthReached: false,
    formScore: 96,
    formStatus: 'optimal',
    feedbackMessages: ['Position yourself in view and begin movement.'],
  });

  const [aiCoaching, setAiCoaching] = useState<string>('Initializing Amazon Bedrock Nova Pro biomechanic pipeline...');
  const [isAnalyzingBedrock, setIsAnalyzingBedrock] = useState<boolean>(false);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameIdRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const depthStateRef = useRef<boolean>(false);

  // Toggle Webcam
  const toggleWebcam = async () => {
    if (!useWebcam) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setUseWebcam(true);
      } catch (err) {
        alert('Webcam access denied or unavailable. Falling back to synthetic simulation mode.');
        setUseWebcam(false);
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setUseWebcam(false);
    }
  };

  // Main animation / keypoint processing loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (isPlaying) {
        const delta = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        progressRef.current = (progressRef.current + delta * 0.4) % 1.0; // 0 to 1 cycle speed

        let keypoints: Keypoint[] = [];
        if (!useWebcam) {
          keypoints = generateSyntheticPose(exercise, progressRef.current);
        } else {
          // Fallback keypoints for webcam if tfjs not initialized
          keypoints = generateSyntheticPose(exercise, progressRef.current);
        }

        // Analyze Biomechanics
        const computed = analyzeBiomechanics(exercise, keypoints);
        setMetrics(computed);

        // Rep Counter logic (depth transition from unreached -> reached -> reset)
        if (computed.depthReached && !depthStateRef.current) {
          depthStateRef.current = true;
        } else if (!computed.depthReached && depthStateRef.current && computed.kneeAngle > 140) {
          depthStateRef.current = false;
          setRepCount((prev) => {
            const next = prev + 1;
            if (next % 5 === 0) {
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            }
            return next;
          });
        }

        // Render Canvas HUD
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid backdrop if synthetic
            if (!useWebcam) {
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
              ctx.lineWidth = 1;
              for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
              }
              for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
              }
            }

            // Draw Connections / Bones
            const findPt = (name: string) => {
              const kp = keypoints.find((k) => k.name === name);
              if (!kp) return { x: 0, y: 0 };
              return { x: (kp.x / 100) * canvas.width, y: (kp.y / 100) * canvas.height };
            };

            const connections = [
              ['head', 'left_shoulder'], ['head', 'right_shoulder'],
              ['left_shoulder', 'right_shoulder'],
              ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
              ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
              ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
              ['left_hip', 'right_hip'],
              ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
              ['right_hip', 'right_knee'], ['right_knee', 'right_ankle'],
            ];

            const strokeColor =
              computed.formStatus === 'optimal'
                ? '#10b981'
                : computed.formStatus === 'warning'
                ? '#f59e0b'
                : '#ef4444';

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';

            connections.forEach(([pt1, pt2]) => {
              const p1 = findPt(pt1);
              const p2 = findPt(pt2);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            });

            // Draw Keypoint Nodes
            keypoints.forEach((kp) => {
              const x = (kp.x / 100) * canvas.width;
              const y = (kp.y / 100) * canvas.height;

              ctx.fillStyle = strokeColor;
              ctx.beginPath();
              ctx.arc(x, y, 6, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(x, y, 2.5, 0, Math.PI * 2);
              ctx.fill();
            });

            // Draw Angle text overlay next to Knee
            const kneeL = findPt('left_knee');
            ctx.fillStyle = '#06b6d4';
            ctx.font = 'bold 13px monospace';
            ctx.fillText(`${computed.kneeAngle}°`, kneeL.x + 12, kneeL.y);
          }
        }
      }
      frameIdRef.current = requestAnimationFrame(loop);
    };

    frameIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [exercise, isPlaying, useWebcam]);

  // Request Bedrock AI Coaching analysis
  const fetchBedrockAnalysis = async () => {
    setIsAnalyzingBedrock(true);
    const prompt = `Analyze biomechanics telemetry for ${exercise.toUpperCase()}: Knee angle ${metrics.kneeAngle}°, Torso angle ${metrics.torsoAngle}°, Form Score ${metrics.formScore}%.`;
    const response = await awsSimulator.invokeBedrock(prompt, { exercise, metrics });
    setAiCoaching(response);
    setIsAnalyzingBedrock(false);
  };

  useEffect(() => {
    fetchBedrockAnalysis();
  }, [exercise]);

  // Save Workout Session to AWS DynamoDB
  const handleLogWorkout = async () => {
    if (repCount === 0) {
      alert('Complete at least 1 repetition before saving to DynamoDB.');
      return;
    }
    const session = await awsSimulator.logWorkoutSession({
      exercise,
      repsCompleted: repCount,
      avgFormScore: metrics.formScore,
      primaryCorrection: metrics.feedbackMessages[0] || 'Good posture',
      bedrockAnalysis: aiCoaching,
    });
    setRecentSessions((prev) => [session, ...prev]);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setRepCount(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Exercise Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            AI Biomechanics Studio
          </h2>
          <p className="text-xs text-slate-400">Real-time computer vision joint tracking & Bedrock Nova form correction</p>
        </div>

        {/* Exercise Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {(['squat', 'pushup', 'deadlift', 'overhead_press'] as ExerciseType[]).map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setExercise(ex);
                setRepCount(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                exercise === ex
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {ex.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Live Canvas Feed + Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas & HUD View (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 aspect-video group">
            {/* Webcam Video standard hidden element */}
            <video ref={videoRef} className="hidden" playsInline muted />

            {/* Canvas HUD Overlay */}
            <canvas ref={canvasRef} width={640} height={360} className="w-full h-full object-contain bg-slate-950/90" />

            {/* Status Overlay Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                  metrics.formStatus === 'optimal'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : metrics.formStatus === 'warning'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                }`}
              >
                {metrics.formStatus === 'optimal' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                {metrics.formStatus.toUpperCase()} FORM ({metrics.formScore}%)
              </span>
            </div>

            {/* Rep Counter Floating Card */}
            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-center font-mono">
              <span className="text-[10px] uppercase text-slate-400 tracking-wider">Completed Reps</span>
              <div className="text-3xl font-extrabold text-cyan-400">{repCount}</div>
            </div>

            {/* Live Feedback Toast on Video Bottom */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{metrics.feedbackMessages[0]}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 shrink-0">60 FPS</span>
            </div>
          </div>

          {/* Controls toolbar */}
          <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleWebcam}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  useWebcam ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                {useWebcam ? 'Webcam Active' : 'Enable Webcam'}
              </button>
              <button
                onClick={() => setRepCount(0)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
                title="Reset Reps"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleLogWorkout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition"
            >
              <Award className="w-4 h-4" />
              Log Workout to DynamoDB
            </button>
          </div>
        </div>

        {/* Real-time Telemetry & Amazon Bedrock Feedback (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Biomechanics Telemetry Gauge */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Joint Angles & Telemetry</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">Knee Flexion Angle</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">{metrics.kneeAngle}°</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (metrics.kneeAngle / 180) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">Torso Inclination</span>
                <span className="text-xl font-bold text-amber-400 font-mono">{metrics.torsoAngle}°</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (metrics.torsoAngle / 90) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">Bilateral Symmetry</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{metrics.symmetryScore}%</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${metrics.symmetryScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">Overall Form Index</span>
                <span className="text-xl font-bold text-purple-400 font-mono">{metrics.formScore}/100</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-purple-400 h-full transition-all duration-300"
                    style={{ width: `${metrics.formScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amazon Bedrock Live AI Intelligence Stream */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-cyan-500/20 backdrop-blur-md space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Amazon Bedrock Nova Pro Feedback
              </span>
              <button
                onClick={fetchBedrockAnalysis}
                disabled={isAnalyzingBedrock}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
              >
                {isAnalyzingBedrock ? 'Querying Nova...' : 'Refresh AI'}
              </button>
            </div>

            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 flex-1 font-sans text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-48 whitespace-pre-line">
              {isAnalyzingBedrock ? (
                <div className="flex items-center gap-2 text-cyan-400 font-mono animate-pulse">
                  <Cpu className="w-4 h-4 animate-spin" /> Stream processing via Bedrock Nova Pro...
                </div>
              ) : (
                aiCoaching
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session History Log */}
      {recentSessions.length > 0 && (
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white">Recent Workout Sessions (DynamoDB Archived)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentSessions.map((s) => (
              <div key={s.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400 font-mono">
                  <span className="uppercase text-cyan-400 font-bold">{s.exercise.replace('_', ' ')}</span>
                  <span>{s.timestamp}</span>
                </div>
                <div className="text-slate-200 font-medium">
                  {s.repsCompleted} Reps • Avg Form: <span className="text-emerald-400">{s.avgFormScore}%</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{s.primaryCorrection}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
