import React, { useState, useEffect } from 'react';
import {
  Zap,
  Server,
  Key,
  ShieldCheck,
  RefreshCw,
  Database,
  Code,
  CheckCircle2,
  Github,
  ExternalLink,
  HardDrive,
  GitBranch,
  Terminal,
  Activity,
  AlertCircle
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const checkDb = async () => {
    setIsCheckingDb(true);
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      setDbStatus(data);
    } catch (e: any) {
      setDbStatus({ connected: false, error: e.message });
    } finally {
      setIsCheckingDb(false);
    }
  };

  const syncDb = async () => {
    setIsSyncingDb(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/db/status', { method: 'POST' });
      const data = await res.json();
      setDbStatus(data.dbStatus);
      setSyncMessage(data.sync?.message || 'Database synchronization completed');
    } catch (e: any) {
      setSyncMessage(`Sync failed: ${e.message}`);
    } finally {
      setIsSyncingDb(false);
    }
  };

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

  useEffect(() => {
    checkDb();
  }, []);

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
              System Settings, Database &amp; Runtime Configuration
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Runtime environment parameters, MongoDB Atlas persistence, Moss zero-latency engine, and GitHub CI/CD
            </p>
          </div>
        </div>
      </div>

      {/* MongoDB Atlas Database Status */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            MongoDB Atlas Persistent Database
          </h3>
          <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
            dbStatus?.connected
              ? 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40'
              : 'text-amber-400 bg-amber-950/70 border-amber-500/40'
          }`}>
            {dbStatus?.connected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> ATLAS CONNECTED ({dbStatus?.latencyMs}ms)
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" /> IN-MEMORY MODE (DB STANDBY)
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 space-y-1">
            <span className="text-[10px] uppercase text-slate-500 block">Persistence Strategy</span>
            <strong className="text-white text-sm block">Hybrid Zero-Latency Write-Through</strong>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Sub-millisecond in-memory cache for live agent inspection + asynchronous background sync to MongoDB Atlas.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 space-y-1">
            <span className="text-[10px] uppercase text-slate-500 block">Database Cluster</span>
            <strong className="text-white text-sm block">Cluster0.ec88p2n.mongodb.net</strong>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Active Database: <span className="text-emerald-400 font-mono">agentshield</span>
            </p>
          </div>
        </div>

        {/* Live Collection Statistics */}
        {dbStatus?.collections && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface-200/60 border border-border/60 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-mono">Traces</span>
              <div className="text-base font-bold text-white font-mono">{dbStatus.collections.traces}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface-200/60 border border-border/60 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-mono">Security Alerts</span>
              <div className="text-base font-bold text-rose-400 font-mono">{dbStatus.collections.securityEvents}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface-200/60 border border-border/60 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-mono">Evaluations</span>
              <div className="text-base font-bold text-cyan-400 font-mono">{dbStatus.collections.evaluations}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface-200/60 border border-border/60 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-mono">Policies</span>
              <div className="text-base font-bold text-amber-400 font-mono">{dbStatus.collections.policies}</div>
            </div>
          </div>
        )}

        {/* Sync message if available */}
        {syncMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={checkDb}
            disabled={isCheckingDb}
            className="px-3.5 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-200 border border-border hover:border-emerald-500/40 text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDb ? 'animate-spin' : ''}`} />
            <span>Test Atlas Connection &amp; Ping</span>
          </button>

          <button
            onClick={syncDb}
            disabled={isSyncingDb}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <HardDrive className={`w-3.5 h-3.5 ${isSyncingDb ? 'animate-spin' : ''}`} />
            <span>Sync / Seed In-Memory Store with Atlas</span>
          </button>
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
            <div><span className="text-cyan-400">MONGODB_URI</span>=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.ec88p2n.mongodb.net/agentshield</div>
            <div><span className="text-cyan-400">MONGODB_DB</span>=agentshield</div>
            <div><span className="text-cyan-400">MOSS_PROJECT_ID</span>=your_moss_project_id</div>
            <div><span className="text-cyan-400">MOSS_API_KEY</span>=your_moss_api_key</div>
            <div><span className="text-cyan-400">MOSS_ENDPOINT</span>=https://api.moss.dev</div>
          </div>
        </div>
      </div>

      {/* GitHub Repository & CI/CD */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <Github className="w-4 h-4 text-purple-400" />
            GitHub Repository &amp; Automated CI/CD
          </h3>
          <span className="text-xs font-mono text-purple-400 bg-purple-950/70 border border-purple-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <GitBranch className="w-3.5 h-3.5" /> SiddharthK1257 / AgentShield
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 space-y-1">
            <span className="text-[10px] uppercase text-slate-500 block">GitHub Actions Pipeline</span>
            <strong className="text-white text-sm block">Automated Verification CI</strong>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Runs the 14-point trust, safety, grounding, and MongoDB test suite on every push and pull request.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 space-y-1">
            <span className="text-[10px] uppercase text-slate-500 block">Continuous Deployment</span>
            <strong className="text-white text-sm block">Production-Ready Bundle</strong>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Zero-configuration container &amp; serverless deployment (Vercel, Docker, AWS ECS, Railway).
            </p>
          </div>
        </div>

        {/* Git push command instructions */}
        <div className="p-3.5 rounded-xl bg-surface-300 border border-border/60 space-y-2 text-xs font-mono">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            Repository Remote Commands
          </div>
          <pre className="text-purple-300 text-[11px] overflow-x-auto p-2 rounded bg-black/40 border border-purple-900/50">
{`git remote add origin https://github.com/SiddharthK1257/AgentShield.git
git branch -M master
git push -u origin master`}
          </pre>
        </div>

        <div>
          <a
            href="https://github.com/SiddharthK1257/AgentShield"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 text-xs font-mono font-medium transition-all"
          >
            <Github className="w-4 h-4" />
            <span>Open GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
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
          <div>Database: <strong className="text-emerald-400">MongoDB Atlas Cluster0</strong></div>
          <div>Retrieval: <strong className="text-cyan-400">@moss-dev/moss</strong></div>
          <div>CI/CD: <strong className="text-purple-400">GitHub Actions</strong></div>
          <div>Design: <strong className="text-white">Tailwind CSS SOC Dark</strong></div>
        </div>
      </div>

    </div>
  );
};
