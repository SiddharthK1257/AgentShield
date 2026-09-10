import React, { useState } from 'react';
import { EvaluationRecord } from '@/lib/types';
import { DecisionBadge } from '../DecisionBadge';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  X,
  Shield,
  Activity,
  Award,
  HelpCircle
} from 'lucide-react';

interface EvaluationsTabProps {
  evaluations: EvaluationRecord[];
}

export const EvaluationsTab: React.FC<EvaluationsTabProps> = ({ evaluations }) => {
  const [selectedEval, setSelectedEval] = useState<EvaluationRecord | null>(null);

  const passedCount = evaluations.filter((e) => e.passed).length;
  const passRate = evaluations.length > 0 ? Math.round((passedCount / evaluations.length) * 100) : 100;
  const avgScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((acc, curr) => acc + curr.score, 0) / evaluations.length)
    : 92;

  return (
    <div className="space-y-6">
      
      {/* Top Continuous Evaluation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400">Continuous Pass Rate</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{passRate}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{passedCount} of {evaluations.length} runs passed</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400">Mean Reliability Score</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{avgScore}/100</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Across all runtime evaluations</div>
          </div>
          <Award className="w-8 h-8 text-cyan-500/40" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400">Total Evaluated Runs</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{evaluations.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Automated benchmark ledger</div>
          </div>
          <Activity className="w-8 h-8 text-slate-600" />
        </div>
      </div>

      {/* Evaluations List Card */}
      <div className="glass-panel rounded-2xl p-5 border border-border/80 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Continuous Evaluation Runs
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Click any run to view input, decision, detected issues, and score breakdown
            </p>
          </div>
        </div>

        {/* Evaluation Run Cards */}
        <div className="space-y-3">
          {evaluations.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setSelectedEval(ev)}
              className="p-4 rounded-xl bg-surface-100/70 border border-border/60 hover:border-cyan-500/40 hover:bg-surface-50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    Evaluation #{ev.id.replace('EVAL-', '')}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Trace {ev.traceId}
                  </span>
                  <DecisionBadge decision={ev.decision} size="sm" />
                </div>

                <div className="text-xs font-mono text-white truncate">
                  "{ev.input}"
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span>Coverage: {ev.evidenceCoveragePercent}%</span>
                  <span>•</span>
                  <span>Hallucination Risk: {ev.hallucinationRisk}%</span>
                  <span>•</span>
                  <span>Latency: {ev.latencyMs.toFixed(2)}ms</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0 justify-between sm:justify-end">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Score</div>
                  <div className={`text-xl font-bold font-mono ${ev.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {ev.score}/100
                  </div>
                </div>

                <div>
                  {ev.passed ? (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      PASSED
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-rose-950 text-rose-400 border border-rose-500/30">
                      FAILED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Detail Modal */}
      {selectedEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 bg-surface-200 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${selectedEval.passed ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                  {selectedEval.passed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">
                    Evaluation Report #{selectedEval.id.replace('EVAL-', '')}
                  </h3>
                  <div className="text-xs font-mono text-slate-400">
                    Trace ID: {selectedEval.traceId} • Run ID: {selectedEval.runId}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEval(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Input */}
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">
                  Evaluated Input
                </span>
                <p className="p-3 rounded-xl bg-surface-100 border border-border/60 font-mono text-white">
                  "{selectedEval.input}"
                </p>
              </div>

              {/* Response */}
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">
                  Model Response / Interception
                </span>
                <p className="p-3 rounded-xl bg-surface-100 border border-border/60 text-slate-200 font-sans leading-relaxed">
                  {selectedEval.response}
                </p>
              </div>

              {/* Detected Issues */}
              {selectedEval.detectedIssues.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-rose-400 block mb-1">
                    Detected Safety Issues
                  </span>
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-1 font-mono text-rose-300">
                    {selectedEval.detectedIssues.map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span>›</span>
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7-Signal Score Breakdown Matrix */}
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1.5">
                  Reliability Breakdown Matrix
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                  <div className="p-2 rounded-lg bg-surface-100 border border-border/50">
                    <span className="text-[10px] uppercase text-slate-500 block">Context Relevance</span>
                    <strong className="text-white mt-0.5 block">{selectedEval.breakdown.contextRelevance}/100</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-100 border border-border/50">
                    <span className="text-[10px] uppercase text-slate-500 block">Source Trust</span>
                    <strong className="text-white mt-0.5 block">{selectedEval.breakdown.sourceTrust}/100</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-100 border border-border/50">
                    <span className="text-[10px] uppercase text-slate-500 block">Evidence Coverage</span>
                    <strong className="text-white mt-0.5 block">{selectedEval.breakdown.evidenceCoverage}/100</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-100 border border-border/50">
                    <span className="text-[10px] uppercase text-slate-500 block">Policy Compliance</span>
                    <strong className="text-white mt-0.5 block">{selectedEval.breakdown.policyCompliance}/100</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-100 border border-border/50">
                    <span className="text-[10px] uppercase text-slate-500 block">Security Score</span>
                    <strong className="text-white mt-0.5 block">{selectedEval.breakdown.security}/100</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-100 border border-border/50">
                    <span className="text-[10px] uppercase text-slate-500 block">Latency Budget</span>
                    <strong className="text-white mt-0.5 block">{selectedEval.breakdown.latency}/100</strong>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-border/60 flex justify-end">
              <button
                onClick={() => setSelectedEval(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-200"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
