import { useState } from 'react';
import { MapPin, ShieldCheck, Camera, CheckCircle2, Flame, Award, Cpu, RefreshCw } from 'lucide-react';
import type { GymCheckIn } from '../types';
import { awsSimulator } from '../services/awsSimulator';
import confetti from 'canvas-confetti';

export const BiometricCheckIn: React.FC = () => {
  const [selectedGym, setSelectedGym] = useState<string>('Equinox Metro Fitness Hub');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [checkInResult, setCheckInResult] = useState<GymCheckIn | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<GymCheckIn[]>([
    {
      id: 'chk-prev-1',
      timestamp: 'Yesterday, 08:30 AM',
      gymName: 'Equinox Metro Fitness Hub',
      distanceMeters: 14,
      rekognitionConfidence: 99.2,
      verified: true,
      streakCount: 4,
      lambdaRequestId: 'req-lam-99231',
    },
    {
      id: 'chk-prev-2',
      timestamp: '2 days ago, 06:15 PM',
      gymName: 'Equinox Metro Fitness Hub',
      distanceMeters: 28,
      rekognitionConfidence: 98.7,
      verified: true,
      streakCount: 3,
      lambdaRequestId: 'req-lam-88123',
    },
  ]);

  const handleRunCheckIn = async () => {
    setIsVerifying(true);
    setCheckInResult(null);

    // Get current GPS coords or fallback mock
    let coords = { lat: 37.7749, lng: -122.4194 };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        },
        () => {}
      );
    }

    const result = await awsSimulator.verifyGymCheckIn(selectedGym, coords);
    setCheckInResult(result);
    setIsVerifying(false);

    if (result.verified) {
      setCheckInHistory((prev) => [result, ...prev]);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Geofenced Biometric Check-In
          </h2>
          <p className="text-xs text-slate-400">
            Powered by Amazon Rekognition (Face Verification) + AWS Lambda (Geofence Engine)
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs">
            <Flame className="w-4 h-4 text-orange-400" />
            Current Streak: <span className="font-bold text-white">5 Days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Check-in Console (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-md space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Step 1: Select Registered Gym Hub</h3>

            <select
              value={selectedGym}
              onChange={(e) => setSelectedGym(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="Equinox Metro Fitness Hub">Equinox Metro Fitness Hub (Geofence: 500m)</option>
              <option value="Gold Gym Downtown Center">Gold Gym Downtown Center (Geofence: 500m)</option>
              <option value="CrossFit Athletic Zone">CrossFit Athletic Zone (Geofence: 500m)</option>
            </select>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider pt-2">
              Step 2: Facial Biometric Snapshot & Location Pulse
            </h3>

            {/* Webcam / Snapshot Simulator Box */}
            <div className="relative rounded-2xl bg-slate-950 border border-cyan-500/20 aspect-video flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center mb-3 animate-pulse bg-cyan-950/20">
                <Camera className="w-10 h-10 text-cyan-400" />
              </div>
              <span className="text-xs text-slate-300 font-medium">Amazon Rekognition Face Scan Ready</span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">Target Bucket: s3://fitintelligence-biometrics/</span>

              {/* Scanning Laser Effect if Verifying */}
              {isVerifying && (
                <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center">
                  <div className="w-full h-1 bg-cyan-400 shadow-lg shadow-cyan-400 animate-bounce" />
                  <span className="mt-4 font-mono text-xs text-cyan-300 font-bold flex items-center gap-2">
                    <Cpu className="w-4 h-4 animate-spin" /> Calling Amazon Rekognition CompareFaces...
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleRunCheckIn}
              disabled={isVerifying}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Biometrics & Geofence...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-300" /> Execute Biometric Check-In
                </>
              )}
            </button>
          </div>

          {/* Verification Result Output */}
          {checkInResult && (
            <div
              className={`p-5 rounded-2xl border backdrop-blur-md transition-all ${
                checkInResult.verified
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {checkInResult.verified ? 'Check-In Verified & Logged!' : 'Geofence / Biometric Validation Failed'}
                  </h4>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    Rekognition Confidence: <span className="font-bold text-emerald-400">{checkInResult.rekognitionConfidence}%</span> •
                    Proximity: <span className="font-bold text-cyan-300">{checkInResult.distanceMeters}m</span>
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Lambda Request ID: {checkInResult.lambdaRequestId}</span>
                <span>Saved to DynamoDB</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Attendance Matrix & AWS Telemetry (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Gym Attendance Matrix */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Weekly Attendance Matrix
            </h3>

            <div className="grid grid-cols-7 gap-2 text-center font-mono">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key={day} className="space-y-1">
                  <span className="text-[10px] text-slate-400">{day}</span>
                  <div
                    className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                      idx < 5
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-950 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {idx < 5 ? '✓' : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History List */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md space-y-3 flex-1">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Verified Check-In Log</span>
              <MapPin className="w-4 h-4 text-cyan-400" />
            </h3>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {checkInHistory.map((item) => (
                <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-white font-bold">{item.gymName}</span>
                    <span className="text-slate-400 text-[10px]">{item.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Dist: {item.distanceMeters}m</span>
                    <span className="text-emerald-400">Match: {item.rekognitionConfidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
