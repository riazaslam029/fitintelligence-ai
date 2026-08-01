import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BiomechanicsStudio } from './components/BiomechanicsStudio';
import { BiometricCheckIn } from './components/BiometricCheckIn';
import { BedrockAiCoach } from './components/BedrockAiCoach';
import { AWSArchitectureConsole } from './components/AWSArchitectureConsole';
import { AWSBuilderArticle } from './components/AWSBuilderArticle';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('studio');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top AWS Builder Challenge Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white text-xs py-2 px-4 text-center font-medium shadow-md flex items-center justify-center gap-2 flex-wrap">
        <Trophy className="w-4 h-4 text-amber-300 animate-bounce" />
        <span>
          <strong>Weekend Challenge:</strong> Turn One Annoying Task Into an App! (July 31 - August 3, 2026).
        </span>
        <button
          onClick={() => setActiveTab('article')}
          className="underline font-bold text-cyan-200 hover:text-white flex items-center gap-1 ml-2"
        >
          View Submission Article <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'studio' && <BiomechanicsStudio />}
        {activeTab === 'checkin' && <BiometricCheckIn />}
        {activeTab === 'bedrock' && <BedrockAiCoach />}
        {activeTab === 'aws' && <AWSArchitectureConsole />}
        {activeTab === 'article' && <AWSBuilderArticle />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>FitIntelligence AI — Built for AWS Builder Center Challenge 2026</span>
          </div>
          <div>
            <span>Powered by Amazon Bedrock, Rekognition, Lambda & DynamoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
