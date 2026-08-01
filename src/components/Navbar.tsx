import { Activity, MapPin, Bot, Cloud, FileText, ShieldCheck, Zap } from 'lucide-react';
import { awsSimulator } from '../services/awsSimulator';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const credits = awsSimulator.getCreditsUsed();

  const navItems = [
    { id: 'studio', label: 'Biomechanics Coach', icon: Activity },
    { id: 'checkin', label: 'Biometric Check-In', icon: MapPin },
    { id: 'bedrock', label: 'Bedrock AI Assistant', icon: Bot },
    { id: 'aws', label: 'AWS Architecture & Logs', icon: Cloud },
    { id: 'article', label: 'AWS Builder Submission', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-cyan-500/20 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Activity className="w-6 h-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-400">
                FitIntelligence<span className="text-cyan-400 font-extrabold">.AI</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> AWS Challenge
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Automated Form Coach & Biometric Gym Check-in</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* AWS Status & Free Tier Meter */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex flex-col items-end text-right font-mono">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              AWS Free Tier Active
            </div>
            <div className="text-[11px] text-slate-400">
              Credits: <span className="text-cyan-300 font-bold">${credits}</span> / $200.00
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
