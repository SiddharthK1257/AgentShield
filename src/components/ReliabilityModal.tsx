import React from 'react';
import { ReliabilityScore } from '@/lib/types';
import { X, ShieldCheck, AlertOctagon, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReliabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  reliability: ReliabilityScore | null;
}

export const ReliabilityModal: React.FC<ReliabilityModalProps> = ({
  isOpen,
  onClose,
  reliability,
}) => {
  if (!isOpen || !reliability) return null;

  const { overall, breakdown, grade, passed, explanation } = reliability;

  const signals = [
    {
      name: 'Context Relevance',
      score: breakdown.contextRelevance,
      weight: '20%',
      desc: 'Topical and semantic alignment of retrieved knowledge vectors to the query.',
      color: breakdown.contextRelevance >= 80 ? 'bg-emerald-500' : breakdown.contextRelevance >= 50 ? 'bg-amber-500' : 'bg-rose-500',
    },
    {
      name: 'Source Trust',
      score: breakdown.sourceTrust,
      weight: '20%',
      desc: 'Cryptographic provenance and domain authority rating of retrieved documents.',
      color: breakdown.sourceTrust >= 80 ? 'bg-emerald-500' : breakdown.sourceTrust >= 50 ? 'bg-amber-500' : 'bg-rose-500',
    },
    {
      name: 'Evidence Coverage',
      score: breakdown.evidenceCoverage,
      weight: '15%',
      desc: 'Factual grounding citations connecting generated answer statements directly to verified sources.',
      color: breakdown.evidenceCoverage >= 80 ? 'bg-emerald-500' : breakdown.evidenceCoverage >= 50 ? 'bg-amber-500' : 'bg-rose-500',
    },
    {
      name: 'Policy Compliance',
      score: breakdown.policyCompliance,
      weight: '15%',
      desc: 'Strict adherence to active security guardrail policies and instruction boundaries.',
      color: breakdown.policyCompliance === 100 ? 'bg-emerald-500' : 'bg-rose-500',
    },
    {
      name: 'Security Risk Score (Inverted)',
      score: breakdown.security,
      weight: '15%',
      desc: 'Safety clearance against prompt injection, context tampering, and exfiltration vectors.',
      color: breakdown.security >= 80 ? 'bg-emerald-500' : breakdown.security >= 50 ? 'bg-amber-500' : 'bg-rose-500',
    },
    {
      name: 'Response Confidence',
      score: breakdown.responseConfidence,
      weight: '10%',
      desc: 'Internal consistency metric and lexical entailment certainty.',
      color: breakdown.responseConfidence >= 80 ? 'bg-emerald-500' : breakdown.responseConfidence >= 50 ? 'bg-amber-500' : 'bg-rose-500',
    },
    {
      name: 'Latency Budget Score',
      score: breakdown.latency,
      weight: '5%',
      desc: 'Execution speed evaluated against Moss zero-latency (<10ms target) retrieval budget.',
      color: breakdown.latency >= 90 ? 'bg-emerald-500' : 'bg-amber-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 bg-surface-200 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${passed ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'}`}>
              {passed ? <ShieldCheck className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Agent Reliability Score Breakdown
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Grade: {grade}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Explainable multi-signal decision formula evaluated at runtime
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-6 pr-1">
          
          {/* Main Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-surface-100 border border-border/60 text-center">
              <span className="text-xs font-medium uppercase text-slate-400">Aggregate Reliability</span>
              <div className="mt-1 flex items-baseline justify-center space-x-1">
                <span className={`text-4xl font-extrabold font-mono ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {overall}
                </span>
                <span className="text-sm text-slate-500">/ 100</span>
              </div>
              <div className="mt-2">
                {passed ? (
                  <span className="inline-flex items-center text-xs font-medium text-emerald-400 gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PASSED THRESHOLD (≥70)
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-medium text-rose-400 gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> FAILED SAFETY THRESHOLD
                  </span>
                )}
              </div>
            </div>

            <div className="md:col-span-2 p-4 rounded-xl bg-surface-100 border border-border/60 flex flex-col justify-center">
              <span className="text-xs font-medium uppercase text-slate-400 mb-1">Deterministic Formula</span>
              <code className="text-xs font-mono text-cyan-300 bg-surface-300/80 p-2.5 rounded-lg border border-slate-800 block overflow-x-auto">
                Reliability = 0.20(Relevance) + 0.20(Trust) + 0.15(Evidence) + 0.15(Policy) + 0.15(Security) + 0.10(Confidence) + 0.05(Latency)
              </code>
            </div>
          </div>

          {/* Detailed Signal Bars */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Evaluated Signals & Weights
            </h3>

            <div className="space-y-2.5">
              {signals.map((sig) => (
                <div key={sig.name} className="p-3 rounded-xl bg-surface-100/70 border border-border/40">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-200">{sig.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        Weight: {sig.weight}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-slate-100">
                      {sig.score} <span className="text-slate-500 font-normal">/ 100</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${sig.color}`}
                      style={{ width: `${Math.max(4, sig.score)}%` }}
                    />
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {sig.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Explainability Notes */}
          <div className="p-4 rounded-xl bg-surface-100/80 border border-border/60">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Runtime Audit Log & Justifications
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
              {explanation.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 select-none">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs text-slate-500">
          <span>AgentShield v1.0 • Autonomous Decision Trust Matrix</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
