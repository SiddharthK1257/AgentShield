import React, { useState } from 'react';
import { ContextChunk } from '@/lib/types';
import {
  Database,
  Zap,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  Layers
} from 'lucide-react';

interface ContextTabProps {
  onSearchRetrieval: (query: string) => Promise<{ chunks: ContextChunk[]; latencyMs: number }>;
}

export const ContextTab: React.FC<ContextTabProps> = ({ onSearchRetrieval }) => {
  const [query, setQuery] = useState('Find the refund policy and explain it.');
  const [isSearching, setIsSearching] = useState(false);
  const [retrievalResult, setRetrievalResult] = useState<{
    chunks: ContextChunk[];
    latencyMs: number;
  } | null>(null);

  const sampleQueries = [
    'Find the refund policy and explain it.',
    'What is the SLA for critical issues?',
    'Tool authorization matrix for database operations',
    'Verify customer refund terms according to sales memo',
  ];

  const handleSearch = async (q = query) => {
    setIsSearching(true);
    try {
      const res = await onSearchRetrieval(q);
      setRetrievalResult(res);
    } finally {
      setIsSearching(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'SAFE':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> SAFE
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> BLOCKED
          </span>
        );
      case 'FLAGGED':
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> FLAGGED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Search & Evaluation Card */}
      <div className="glass-panel p-5 rounded-2xl border border-border/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                Moss Semantic Context Validation Engine
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Continuous context integrity scanning: relevance, source trust, contradiction, and injection detection
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Sub-10ms In-Process Index</span>
          </div>
        </div>

        {/* Quick query buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">Test Retrieval:</span>
          {sampleQueries.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuery(q);
                handleSearch(q);
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-50 text-slate-300 hover:text-white border border-border/70 text-[11px] font-mono transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge base via Moss..."
            className="flex-1 rounded-xl bg-surface-200 border border-border/80 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSearching ? <Zap className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Query Moss</span>
          </button>
        </div>
      </div>

      {/* Retrieval Output */}
      {retrievalResult && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Retrieved Context Chunks ({retrievalResult.chunks.length})
            </h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Moss Retrieval: {retrievalResult.latencyMs.toFixed(2)} ms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {retrievalResult.chunks.map((chunk, idx) => (
              <div
                key={chunk.id}
                className={`p-4 rounded-xl border space-y-3 ${
                  chunk.status === 'BLOCKED'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : chunk.status === 'FLAGGED'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-surface-100/80 border-border/70'
                }`}
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                    <span className="text-xs font-mono text-cyan-400 truncate max-w-[220px]">
                      {chunk.source}
                    </span>
                  </div>
                  {statusBadge(chunk.status)}
                </div>

                {/* Score Indicators Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded-lg bg-surface-200/80 border border-border/50">
                    <span className="text-[10px] uppercase text-slate-400 block">Relevance</span>
                    <strong className="text-sm font-bold text-white mt-0.5 block">
                      {chunk.relevance}%
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-200/80 border border-border/50">
                    <span className="text-[10px] uppercase text-slate-400 block">Trust Rating</span>
                    <strong className="text-sm font-bold text-white mt-0.5 block">
                      {chunk.trust}%
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-200/80 border border-border/50">
                    <span className="text-[10px] uppercase text-slate-400 block">Injection Risk</span>
                    <strong className={`text-sm font-bold mt-0.5 block ${chunk.injectionRisk > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {chunk.injectionRisk}%
                    </strong>
                  </div>
                </div>

                {/* Content Snippet */}
                <p className="text-xs text-slate-300 leading-relaxed font-mono p-2.5 rounded-lg bg-surface-300/80 border border-slate-800">
                  {chunk.text}
                </p>

                {/* Why flagged or verified */}
                {chunk.reason && (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 pt-1">
                    <span className="text-slate-500">Evaluation:</span>
                    <span className={chunk.status === 'BLOCKED' ? 'text-rose-400' : chunk.status === 'FLAGGED' ? 'text-amber-400' : 'text-emerald-400'}>
                      {chunk.reason}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Enterprise Knowledge Base Sources */}
      <div className="glass-panel p-5 rounded-2xl border border-border/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          Indexed Knowledge Bases in Moss In-Process Store (5 Documents)
        </h3>

        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-surface-100/70 border border-border/60 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-white font-mono">
                Enterprise Refund &amp; Cancellation Policy (Official v4.2)
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                corp-legal-portal://policies/refund-v4.2.pdf • Trust: 98% • Verified 2026-08-15
              </div>
            </div>
            <span className="text-emerald-400 font-mono text-xs font-semibold">SAFE</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-100/70 border border-border/60 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-white font-mono">
                Agent Information Security &amp; Secret Protection Standard
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                security-infosec://standards/agent-safety-sec01.md • Trust: 99% • Verified 2026-08-20
              </div>
            </div>
            <span className="text-emerald-400 font-mono text-xs font-semibold">SAFE</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-100/70 border border-border/60 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-white font-mono">
                Tool Execution Authorization &amp; Privilege Matrix
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                ops-iam://permissions/agent-tool-matrix.json • Trust: 96% • Verified 2026-07-10
              </div>
            </div>
            <span className="text-emerald-400 font-mono text-xs font-semibold">SAFE</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-100/70 border border-border/60 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-white font-mono">
                Customer SLA &amp; Escalation Guidelines
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                zendesk-kb://articles/sla-escalation-policy • Trust: 95% • Verified 2026-06-01
              </div>
            </div>
            <span className="text-emerald-400 font-mono text-xs font-semibold">SAFE</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-amber-300 font-mono">
                Legacy Deprecated Sales Memo (Archived 2024 - Conflicting Grounding)
              </div>
              <div className="text-[11px] text-amber-400/80 font-mono">
                unverified-archive://legacy/sales-memo-2024.txt • Trust: 35% • Flagged for Contradiction
              </div>
            </div>
            <span className="text-amber-400 font-mono text-xs font-semibold">CONTRADICTION TEST</span>
          </div>
        </div>
      </div>
    </div>
  );
};
