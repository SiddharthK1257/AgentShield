import React from 'react';
import { SystemMetrics, TraceRecord, SecurityEvent } from '@/lib/types';
import { MetricCard } from '../MetricCard';
import { DecisionBadge } from '../DecisionBadge';
import {
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  FileCheck,
  Clock,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  Bot
} from 'lucide-react';

interface OverviewTabProps {
  metrics: SystemMetrics;
  recentTraces: TraceRecord[];
  recentEvents: SecurityEvent[];
  onOpenReliabilityModal: () => void;
  onSelectTrace: (trace: TraceRecord) => void;
  onNavigateToLiveAgent: () => void;
  onNavigateToSecurity: () => void;
  onNavigateToContext: () => void;
  onNavigateToTraces: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  metrics,
  recentTraces,
  recentEvents,
  onOpenReliabilityModal,
  onSelectTrace,
  onNavigateToLiveAgent,
  onNavigateToSecurity,
  onNavigateToContext,
  onNavigateToTraces,
}) => {
  return (
    <div className="space-y-6">
      {/* Top SOC Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Agent Reliability"
          value={metrics.reliabilityAverage}
          unit="/ 100"
          subtext="Click to view explainable formula"
          icon={<Shield className="w-5 h-5 text-emerald-400" />}
          badge={{ text: metrics.reliabilityAverage >= 70 ? 'OPTIMAL' : 'REVIEW', type: 'positive' }}
          onClick={onOpenReliabilityModal}
        />

        <MetricCard
          title="Threats Blocked"
          value={metrics.threatsBlocked}
          subtext={`${((metrics.threatsBlocked / Math.max(1, metrics.totalRequests)) * 100).toFixed(1)}% intercept rate`}
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          badge={{ text: `${metrics.threatsBlocked} THREATS`, type: metrics.threatsBlocked > 0 ? 'warning' : 'neutral' }}
          onClick={onNavigateToSecurity}
        />

        <MetricCard
          title="Avg Moss Retrieval"
          value={metrics.averageMossRetrievalMs}
          unit="ms"
          subtext="Sub-10ms in-process index"
          icon={<Zap className="w-5 h-5 text-cyan-400" />}
          badge={{ text: 'ZERO-LATENCY', type: 'accent' }}
          onClick={onNavigateToContext}
        />

        <MetricCard
          title="Evaluation Pass Rate"
          value={metrics.evaluationPassRatePercent}
          unit="%"
          subtext={`${metrics.activePoliciesCount} active guardrail rules`}
          icon={<FileCheck className="w-5 h-5 text-indigo-400" />}
          badge={{ text: 'CONTINUOUS', type: 'positive' }}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-border/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase text-slate-400">Total Requests</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{metrics.totalRequests}</div>
            <div className="text-[11px] text-slate-500 mt-1">Processed today</div>
          </div>
          <Activity className="w-8 h-8 text-slate-600" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase text-slate-400">Contexts Evaluated</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{metrics.contextsEvaluated}</div>
            <div className="text-[11px] text-slate-500 mt-1">Knowledge chunks validated</div>
          </div>
          <Database className="w-8 h-8 text-slate-600" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase text-slate-400">p50 / p95 Total Latency</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {metrics.p50LatencyMs}ms <span className="text-slate-500 font-normal text-sm">/ {metrics.p95LatencyMs}ms</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Real measured execution</div>
          </div>
          <Clock className="w-8 h-8 text-slate-600" />
        </div>
      </div>

      {/* Pipeline Architecture Interactive Diagram Card */}
      <div className="glass-panel rounded-2xl p-5 border border-border/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Runtime Zero-Latency Trust Architecture
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic multi-stage validation intercepting input, context, tools, and responses
            </p>
          </div>
          <button
            onClick={onNavigateToLiveAgent}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            Launch Agent Simulator <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono pt-2">
          
          <div className="p-3 rounded-xl bg-surface-100 border border-slate-700">
            <span className="text-[10px] uppercase text-slate-500 block">Stage 1</span>
            <strong className="text-slate-200 block mt-1">Input Guard</strong>
            <span className="text-[10px] text-slate-400">Jailbreak Scan</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40">
            <span className="text-[10px] uppercase text-cyan-400 block">Stage 2</span>
            <strong className="text-white block mt-1">Moss Retrieval</strong>
            <span className="text-[10px] text-cyan-300 font-bold">&lt; 10ms Target</span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40">
            <span className="text-[10px] uppercase text-indigo-400 block">Stage 3</span>
            <strong className="text-white block mt-1">Context Validator</strong>
            <span className="text-[10px] text-indigo-300">Contradictions</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-100 border border-slate-700">
            <span className="text-[10px] uppercase text-slate-500 block">Stage 4</span>
            <strong className="text-slate-200 block mt-1">Security Engine</strong>
            <span className="text-[10px] text-slate-400">Exfiltration / Poison</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-100 border border-slate-700">
            <span className="text-[10px] uppercase text-slate-500 block">Stage 5</span>
            <strong className="text-slate-200 block mt-1">Tool Guardrail</strong>
            <span className="text-[10px] text-slate-400">Least-Privilege</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40">
            <span className="text-[10px] uppercase text-emerald-400 block">Stage 6</span>
            <strong className="text-white block mt-1">Reliability Scorer</strong>
            <span className="text-[10px] text-emerald-300 font-bold">0–100 Rating</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Traces & Security Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Traces Card */}
        <div className="glass-panel rounded-2xl p-5 border border-border/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Live Request Stream & Latency Spans
              </h3>
              <button
                onClick={onNavigateToTraces}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                All Traces <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTraces.slice(0, 4).map((trace) => (
                <div
                  key={trace.id}
                  onClick={() => onSelectTrace(trace)}
                  className="p-3 rounded-xl bg-surface-100/70 border border-border/60 hover:border-cyan-500/40 hover:bg-surface-50 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{trace.id}</span>
                      <DecisionBadge decision={trace.decision} size="sm" />
                    </div>
                    <div className="text-xs font-mono text-slate-200 truncate mt-1">
                      "{trace.query}"
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-white">
                      {trace.totalLatencyMs.toFixed(2)}ms
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400">
                      Moss: {trace.retrievalLatencyMs.toFixed(2)}ms
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border/60 text-xs text-slate-500 flex justify-between font-mono">
            <span>High-precision process.hrtime telemetry</span>
            <span>Real hardware execution</span>
          </div>
        </div>

        {/* Security Threat Stream */}
        <div className="glass-panel rounded-2xl p-5 border border-border/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Active Security Threat Stream
              </h3>
              <button
                onClick={onNavigateToSecurity}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                SOC Radar <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentEvents.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-surface-100/70 border border-border/60 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-rose-400">
                        {evt.threatType}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        Risk {evt.riskScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-sans">
                      {evt.reason}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <DecisionBadge decision={evt.decision} size="sm" />
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border/60 text-xs text-slate-500 flex justify-between font-mono">
            <span>Fail-Closed Principle Active</span>
            <span>Zero Unverified Bypasses</span>
          </div>
        </div>

      </div>
    </div>
  );
};
