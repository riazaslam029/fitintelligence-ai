import { useState, useEffect } from 'react';
import { Cloud, Terminal, Cpu, Database, Key, Server, Lock, Layers, Zap } from 'lucide-react';
import type { AWSLogEntry } from '../types';
import { awsSimulator } from '../services/awsSimulator';

export const AWSArchitectureConsole: React.FC = () => {
  const [logs, setLogs] = useState<AWSLogEntry[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('bedrock');
  const [filterService, setFilterService] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // AWS Credentials State
  const [awsConfig, setAwsConfig] = useState(awsSimulator.getConfig());

  useEffect(() => {
    const unsubscribe = awsSimulator.subscribeLogs((newLogs) => {
      setLogs(newLogs);
    });
    return unsubscribe;
  }, []);

  const handleConfigChange = (field: string, value: any) => {
    const updated = { ...awsConfig, [field]: value };
    setAwsConfig(updated);
    awsSimulator.setConfig(updated);
  };

  const filteredLogs = filterService === 'ALL' ? logs : logs.filter((l) => l.service === filterService);

  const nodes = [
    {
      id: 'bedrock',
      name: 'Amazon Bedrock (Nova)',
      icon: Cpu,
      color: 'from-purple-500 to-indigo-600',
      description: 'Generates real-time biomechanics form analysis, exercise cues, and personalized routines using Amazon Nova Pro / Lite models.',
      freeTier: 'Access via $200 AWS Free Tier Credits for Nova models & Lambda.',
      codeSnippet: `const response = await bedrockClient.send(new InvokeModelCommand({
  modelId: "amazon.nova-pro-v1:0",
  body: JSON.stringify({ prompt: "Analyze knee flex telemetry..." })
}));`,
    },
    {
      id: 'rekognition',
      name: 'Amazon Rekognition',
      icon: Lock,
      color: 'from-cyan-500 to-blue-600',
      description: 'Performs facial comparison (`CompareFaces`) to verify user identity during gym check-ins.',
      freeTier: '5,000 face analysis images/month in AWS Free Tier.',
      codeSnippet: `const result = await rekognition.compareFaces({
  SourceImage: { S3Object: { Bucket: "fitintelligence", Name: "user.jpg" } },
  TargetImage: { Bytes: webcamBuffer },
  SimilarityThreshold: 90.0
});`,
    },
    {
      id: 'lambda',
      name: 'AWS Lambda',
      icon: Server,
      color: 'from-amber-500 to-orange-600',
      description: 'Executes serverless geofencing math & orchestrates check-in verification triggers.',
      freeTier: '1,000,000 free requests per month.',
      codeSnippet: `export const handler = async (event) => {
  const { userLat, userLng, gymId } = JSON.parse(event.body);
  const isWithinGeofence = calculateDistance(userLat, userLng) <= 500;
  return { statusCode: 200, body: JSON.stringify({ verified: isWithinGeofence }) };
};`,
    },
    {
      id: 'dynamodb',
      name: 'Amazon DynamoDB',
      icon: Database,
      color: 'from-emerald-500 to-teal-600',
      description: 'Stores user workout logs, historical form scores, and gym attendance streaks.',
      freeTier: '25 GB of storage & 25 provisioned Write/Read Units.',
      codeSnippet: `await docClient.put({
  TableName: "FitIntelligence_Workouts",
  Item: { SessionId: "sess-102", Exercise: "Squat", FormScore: 96 }
});`,
    },
    {
      id: 's3',
      name: 'Amazon S3',
      icon: Layers,
      color: 'from-blue-500 to-cyan-600',
      description: 'Stores raw video telemetry keypoints, facial reference profiles, and export artifacts.',
      freeTier: '5 GB standard storage in AWS Free Tier.',
      codeSnippet: `await s3.putObject({
  Bucket: "fitintelligence-telemetry",
  Key: "telemetry/session-102.json",
  Body: JSON.stringify(telemetryData)
});`,
    },
  ];

  const activeNodeObj = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-cyan-400" />
            AWS Cloud Architecture & Infrastructure Console
          </h2>
          <p className="text-xs text-slate-400">Live telemetry, request logs, and Free Tier service orchestration</p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">Mode:</span>
          <span
            className={`px-3 py-1 rounded-full font-bold border ${
              awsConfig.useRealAWS
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {awsConfig.useRealAWS ? 'Live AWS SDK Active' : 'AWS Sandbox Simulator'}
          </span>
        </div>
      </div>

      {/* Grid: Architecture Diagram + Node Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Architecture Diagram (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            System Topology (Click service node to inspect)
          </h3>

          {/* Interactive Topology Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {nodes.map((node) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${node.color} flex items-center justify-center mb-2 shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xs font-bold text-white">{node.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">AWS Free Tier</span>
                </button>
              );
            })}
          </div>

          {/* Node Detail Box */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                {activeNodeObj.name} Specs
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                {activeNodeObj.freeTier}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activeNodeObj.description}</p>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400">AWS SDK Execution Example:</span>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                {activeNodeObj.codeSnippet}
              </pre>
            </div>
          </div>
        </div>

        {/* Live AWS Log Stream (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live AWS API Stream
            </h3>

            {/* Filter */}
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-[11px] px-2 py-1 text-slate-300 font-mono"
            >
              <option value="ALL">All Services</option>
              <option value="Amazon Bedrock">Amazon Bedrock</option>
              <option value="Amazon Rekognition">Amazon Rekognition</option>
              <option value="AWS Lambda">AWS Lambda</option>
              <option value="Amazon DynamoDB">Amazon DynamoDB</option>
            </select>
          </div>

          {/* Log Stream List */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[460px] pr-1">
            {filteredLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">No AWS logs recorded yet. Run a form analysis or check-in!</div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-cyan-400 font-bold">{log.service}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span>{log.action}</span>
                    <span className="font-mono text-emerald-400">{log.latencyMs}ms</span>
                  </div>

                  {expandedLogId === log.id && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                      <span className="text-cyan-300 font-bold block mb-1">Payload JSON:</span>
                      <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live AWS Credentials Configuration Drawer */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          Optional AWS Credentials Configuration (For Judges & Live AWS SDK Testing)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">AWS Region</label>
            <input
              type="text"
              value={awsConfig.region}
              onChange={(e) => handleConfigChange('region', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">AWS Access Key ID</label>
            <input
              type="text"
              placeholder="AKIAIOSFODNN7EXAMPLE"
              value={awsConfig.accessKeyId}
              onChange={(e) => handleConfigChange('accessKeyId', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">AWS Secret Access Key</label>
            <input
              type="password"
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              value={awsConfig.secretAccessKey}
              onChange={(e) => handleConfigChange('secretAccessKey', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Bedrock Model ID</label>
            <input
              type="text"
              value={awsConfig.bedrockModelId}
              onChange={(e) => handleConfigChange('bedrockModelId', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
