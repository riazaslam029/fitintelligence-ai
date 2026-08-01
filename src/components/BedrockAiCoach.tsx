import { useState } from 'react';
import { Bot, Send, Sparkles, Cpu, Zap, Copy, Check } from 'lucide-react';
import { awsSimulator } from '../services/awsSimulator';

export const BedrockAiCoach: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bedrock'; text: string; timestamp: string }>>([
    {
      sender: 'bedrock',
      text: `Hello! I am your **Amazon Bedrock AI Fitness Coach** powered by Amazon Nova Pro. I continuously analyze your exercise biomechanics telemetry, joint angles, and attendance records from Amazon DynamoDB to deliver personalized fitness & form advice. How can I assist your training today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const samplePrompts = [
    'Analyze my latest Squat Form History & joint telemetry',
    'Build a 4-Day Hypertrophy & Biomechanics routine',
    'What cues fix knee valgus collapse on heavy squats?',
    'Optimal post-workout protein & macro strategy',
  ];

  const handleSendMessage = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isProcessing) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    const aiAnswer = await awsSimulator.invokeBedrock(text);

    setMessages((prev) => [
      ...prev,
      {
        sender: 'bedrock' as const,
        text: aiAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setIsProcessing(false);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            Amazon Bedrock Nova Fitness Coach
          </h2>
          <p className="text-xs text-slate-400">Intelligent athletic reasoning using Amazon Nova Pro / Lite models</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Model: <span className="text-cyan-300 font-bold">amazon.nova-pro-v1:0</span>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col h-[580px] overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                    : 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {msg.sender === 'user' ? 'YOU' : <Sparkles className="w-5 h-5" />}
              </div>

              {/* Bubble */}
              <div
                className={`group relative p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-70 font-mono mb-1">
                  <span>{msg.sender === 'user' ? 'You' : 'Amazon Bedrock Nova Pro'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-line font-sans">{msg.text}</div>

                {msg.sender === 'bedrock' && (
                  <button
                    onClick={() => handleCopyText(msg.text, idx)}
                    className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    title="Copy Answer"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-3 text-xs text-cyan-400 font-mono animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
              </div>
              Streaming response from Amazon Bedrock...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 border-t border-slate-800/60 bg-slate-950/50 flex items-center gap-2 overflow-x-auto">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-full text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 whitespace-nowrap transition"
            >
              + {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask Amazon Bedrock for biomechanics analysis, workout plans, or recovery advice..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isProcessing}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
