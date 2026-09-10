import React, { useState } from 'react';
import { TraceRecord } from '@/lib/types';
import { DecisionBadge } from '../DecisionBadge';
import { LatencyWaterfall } from '../LatencyWaterfall';
import {
  Layers,
  Clock,
  Zap,
  Search,
  Download,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface TracesTabProps {
  traces: TraceRecord[];
  p50LatencyMs: number;
  p95LatencyMs: number;
}

export const TracesTab: React.FC<TracesTabProps> = ({
  traces,
  p50LatencyMs,
  p95LatencyMs,
}) => {
  const [selectedTraceId, setSelectedTraceId] = useState<string>(traces[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTrace = traces.find((t) => t.id === selectedTraceId) || traces[0];

  const filteredTraces = traces.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.id.toLowerCase().includes(q) || t.query.toLowerCase().includes(q);
  });

  const exportTracesJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(traces, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agentshield-traces-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Zero Latency Benchmark Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-cyan-400">p50 Total Latency</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {p50LatencyMs.toFixed(2)} ms
          </div>
          <div className="text-[11px] text-cyan-300/80 mt-1">Median hardware execution</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-indigo-400">p95 Total Latency</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {p95LatencyMs.toFixed(2)} ms
          </div>
          <div className="text-[11px] text-indigo-300/80 mt-1">95th percentile budget</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Moss Engine Budget</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">&lt; 10.0 ms</div>
          <div className="text-[11px] text-slate-400 mt-1">Sub-10ms requirement met</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400">Traces Recorded</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{traces.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Full distributed spans</div>
          </div>
          <button
            onClick={exportTracesJson}
            className="p-2.5 rounded-xl bg-surface-100 hover:bg-slate-700 text-slate-300 hover:text-white border border-border/70 transition-colors cursor-pointer"
            title="Export Traces JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Trace Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Trace Selector List (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-4 border border-border/80 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Recorded Traces
            </h3>
            <span className="text-[11px] font-mono text-slate-500">{filteredTraces.length} available</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter trace ID or query..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-surface-100 border border-border/70 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 w-full"
            />
          </div>

          {/* Scrollable list */}
          <div className="space-y-2 overflow-y-auto max-h-[550px] pr-1">
            {filteredTraces.map((t) => {
              const isSelected = selectedTrace?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTraceId(t.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40 shadow-md'
                      : 'border-border/60 bg-surface-100/70 hover:border-slate-600 hover:bg-surface-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-cyan-400">{t.id}</span>
                    <DecisionBadge decision={t.decision} size="sm" />
                  </div>
                  <div className="text-xs font-mono text-slate-200 truncate">
                    "{t.query}"
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-border/40 pt-1">
                    <span>Total: {t.totalLatencyMs.toFixed(2)}ms</span>
                    <span className="text-cyan-400">Moss: {t.retrievalLatencyMs.toFixed(2)}ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Trace Breakdown & Waterfall (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTrace ? (
            <div className="space-y-4">
              <LatencyWaterfall trace={selectedTrace} />

              {/* Trace JSON inspection */}
              <div className="glass-panel rounded-2xl p-4 border border-border/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Telemetry Payload (Structured JSON)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Trace: {selectedTrace.id}
                  </span>
                </div>
                <pre className="p-3 rounded-xl bg-surface-300/80 border border-border/70 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedTrace, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-xs font-mono text-slate-500 rounded-2xl">
              Select a trace on the left to view stage waterfall profile.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
