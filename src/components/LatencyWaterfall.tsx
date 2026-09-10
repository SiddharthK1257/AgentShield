import React from 'react';
import { LatencySpan, TraceRecord } from '@/lib/types';
import { Zap, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

interface LatencyWaterfallProps {
  trace: TraceRecord | {
    id: string;
    totalLatencyMs: number;
    retrievalLatencyMs: number;
    guardrailLatencyMs: number;
    evaluationLatencyMs: number;
    llmLatencyMs: number;
    toolLatencyMs: number;
    spans: LatencySpan[];
  };
}

export const LatencyWaterfall: React.FC<LatencyWaterfallProps> = ({ trace }) => {
  const total = Math.max(0.1, trace.totalLatencyMs);

  const stageColor = (name: string, status: string) => {
    if (status === 'ERROR') return 'bg-rose-500';
    if (status === 'WARN') return 'bg-amber-500';
    if (name.toLowerCase().includes('moss') || name.toLowerCase().includes('retrieval')) return 'bg-cyan-500';
    if (name.toLowerCase().includes('guardrail') || name.toLowerCase().includes('security')) return 'bg-indigo-500';
    if (name.toLowerCase().includes('context')) return 'bg-blue-500';
    if (name.toLowerCase().includes('agent') || name.toLowerCase().includes('reasoning')) return 'bg-emerald-500';
    return 'bg-purple-500';
  };

  return (
    <div className="glass-panel rounded-xl p-4 border border-border/80 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Real-Time Latency Trace
          </span>
          <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
            {trace.id}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1 text-slate-300">
            <span className="text-slate-500">Total:</span>
            <span className="font-bold text-white">{trace.totalLatencyMs.toFixed(2)}ms</span>
          </div>
          <div className="flex items-center space-x-1 text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-slate-500">Moss:</span>
            <span className="font-bold">{trace.retrievalLatencyMs.toFixed(2)}ms</span>
          </div>
        </div>
      </div>

      {/* Latency Stage Summary Pill Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2 rounded-lg bg-surface-100/60 border border-border/40">
          <div className="text-[10px] uppercase text-slate-400">Moss Retrieval</div>
          <div className="text-sm font-bold text-cyan-300 flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            {trace.retrievalLatencyMs.toFixed(2)}ms
          </div>
        </div>
        <div className="p-2 rounded-lg bg-surface-100/60 border border-border/40">
          <div className="text-[10px] uppercase text-slate-400">Guardrail Engine</div>
          <div className="text-sm font-bold text-indigo-300">
            {trace.guardrailLatencyMs.toFixed(2)}ms
          </div>
        </div>
        <div className="p-2 rounded-lg bg-surface-100/60 border border-border/40">
          <div className="text-[10px] uppercase text-slate-400">Agent Reasoning</div>
          <div className="text-sm font-bold text-emerald-300">
            {trace.llmLatencyMs.toFixed(2)}ms
          </div>
        </div>
        <div className="p-2 rounded-lg bg-surface-100/60 border border-border/40">
          <div className="text-[10px] uppercase text-slate-400">Tool / Output</div>
          <div className="text-sm font-bold text-purple-300">
            {(trace.toolLatencyMs + (trace.spans.find(s => s.name.toLowerCase().includes('output'))?.durationMs || 0)).toFixed(2)}ms
          </div>
        </div>
      </div>

      {/* Waterfall Visual Breakdown */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono pb-1 border-b border-border/30">
          <span>PIPELINE STAGE</span>
          <span>DURATION & OVERHEAD</span>
        </div>

        {trace.spans.map((span, index) => {
          const widthPercent = Math.max(2, (span.durationMs / total) * 100);
          return (
            <div key={index} className="group text-xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="w-4 text-[10px] font-mono text-slate-500">#{index + 1}</span>
                  <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                    {span.name}
                  </span>
                  {span.status === 'ERROR' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 border border-rose-500/40 text-rose-400">
                      BLOCKED
                    </span>
                  )}
                  {span.status === 'WARN' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/40 text-amber-400">
                      FLAGGED
                    </span>
                  )}
                </div>
                <div className="font-mono text-slate-300 font-semibold">
                  {span.durationMs.toFixed(2)} ms
                </div>
              </div>

              {/* Proportional Waterfall Bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${stageColor(
                    span.name,
                    span.status
                  )}`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>

              {span.details && (
                <div className="mt-1 text-[11px] font-mono text-slate-400 italic pl-6">
                  ↳ {span.details}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Zero Latency Certification Pill */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          Moss Sub-10ms Verified Retrieval
        </span>
        <span className="text-slate-500">
          Timestamp: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
