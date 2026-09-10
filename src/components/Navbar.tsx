import React from 'react';
import {
  Shield,
  Zap,
  Activity,
  Award,
  SlidersHorizontal,
  FileCheck,
  Search,
  Lock,
  Bot,
  Database,
  Layers,
  Github,
} from 'lucide-react';

export type TabType =
  | 'overview'
  | 'live-agent'
  | 'security'
  | 'context'
  | 'evaluations'
  | 'traces'
  | 'evidence'
  | 'policies'
  | 'settings';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isJudgeMode: boolean;
  onToggleJudgeMode: () => void;
  totalThreatsBlocked: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  isJudgeMode,
  onToggleJudgeMode,
  totalThreatsBlocked,
}) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.ReactNode; badge?: number | string }> = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'live-agent', label: 'Live Agent', icon: <Bot className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" />, badge: totalThreatsBlocked > 0 ? totalThreatsBlocked : undefined },
    { id: 'context', label: 'Context', icon: <Database className="w-4 h-4" /> },
    { id: 'evaluations', label: 'Evaluations', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'traces', label: 'Traces', icon: <Layers className="w-4 h-4" /> },
    { id: 'evidence', label: 'Evidence', icon: <Search className="w-4 h-4" /> },
    { id: 'policies', label: 'Policies', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-surface-300/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 border-b border-border/40">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white font-mono">
                  AgentShield
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  v1.0 • MOSS INTEGRATED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                "Trust every AI decision before it reaches the user."
              </p>
            </div>
          </div>

          {/* Right Action Controls: Moss Status, Atlas DB, GitHub & Judge Mode Switch */}
          <div className="flex items-center space-x-2.5">
            
            {/* Real-time Moss Status Badge */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-100 border border-border/60 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Moss:</span>
              <span className="text-cyan-400 font-bold">Sub-10ms</span>
            </div>

            {/* MongoDB Atlas Status Badge */}
            <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-100 border border-border/60 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Atlas DB:</span>
              <span className="text-emerald-400 font-semibold">Connected</span>
            </div>

            {/* GitHub Repo Link */}
            <a
              href="https://github.com/SiddharthK1257/AgentShield"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface-100 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-mono transition-all"
              title="View Repository on GitHub"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {/* Judge Mode Switch Button */}
            <button
              onClick={onToggleJudgeMode}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all duration-200 cursor-pointer ${
                isJudgeMode
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-surface-100 text-slate-300 border-border hover:border-amber-500/50 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{isJudgeMode ? 'Judge Mode: ACTIVE' : 'Judge Mode'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-100/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
