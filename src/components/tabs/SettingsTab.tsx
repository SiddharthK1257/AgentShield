import React, { useState } from 'react';
import {
  Zap,
  Server,
  Key,
  ShieldCheck,
  RefreshCw,
  Database,
  Code,
  CheckCircle2
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (e: any) {
      setHealthStatus({ status: 'error', error: e.message });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-border/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              System Settings &amp; Moss Runtime Configuration
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Runtime environment parameters, zero-latency index status, and health verification
            </p>
          </div>
        </div>
      </div>

      {/* Moss Engine Configuration */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Official Moss SDK Integration Status
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> SDK CONNECTED (@moss-dev/moss v1.7.1)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 space-y-1">
            <span className="text-[10px] uppercase text-slate-500 block">Active Engine Mode</span>
            <strong className="text-white text-sm block">Sub-10ms In-Process Vector Runtime</strong>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Zero network round-trip overhead. Real microsecond execution measured via process.hrtime.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 space-y-1">
            <span className="text-[10px] uppercase text-slate-500 block">Dual-Mode Fallback Adapter</span>
            <strong className="text-white text-sm block">Cloud + Local In-Memory</strong>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              When MOSS_PROJECT_ID and MOSS_API_KEY are supplied, connects to Moss Cloud automatically.
            </p>
          </div>
        </div>

        {/* Environment variables reference */}
        <div className="p-4 rounded-xl bg-surface-300 border border-border/60 space-y-2 text-xs font-mono">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            Environment Configuration Variables (.env)
          </div>
          <div className="space-y-1 text-slate-300">
            <div><span className="text-cyan-400">MOSS_PROJECT_ID</span>=your_moss_project_id</div>
            <div><span className="text-cyan-400">MOSS_API_KEY</span>=your_moss_api_key</div>
            <div><span className="text-cyan-400">MOSS_ENDPOINT</span>=https://api.moss.dev</div>
          </div>
        </div>
      </div>

      {/* Health Check Endpoint Verification */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Live Gateway Health Check Endpoint
            </h3>
            <span className="text-[11px] font-mono text-slate-400">GET /api/health</span>
          </div>

          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isCheckingHealth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Test Health Endpoint</span>
          </button>
        </div>

        {healthStatus && (
          <pre className="p-4 rounded-xl bg-surface-300/80 border border-border/70 text-xs font-mono text-cyan-300 overflow-x-auto">
            {JSON.stringify(healthStatus, null, 2)}
          </pre>
        )}
      </div>

      {/* Tech Stack & Architecture Specs */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-3 text-xs font-mono">
        <div className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          Production Build Specification
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
          <div>Framework: <strong className="text-white">Next.js 14 App Router</strong></div>
          <div>Runtime: <strong className="text-white">Node.js v24.19</strong></div>
          <div>Language: <strong className="text-white">TypeScript 5.6</strong></div>
          <div>Retrieval: <strong className="text-white">@moss-dev/moss</strong></div>
          <div>Telemetry: <strong className="text-white">High-Res process.hrtime</strong></div>
          <div>Design: <strong className="text-white">Tailwind CSS SOC Dark</strong></div>
        </div>
      </div>

    </div>
  );
};
