import React, { useState } from 'react';
import { EvidenceItem } from '@/lib/types';
import {
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileText,
  ArrowDown,
  Quote,
  Layers,
  Sparkles
} from 'lucide-react';

export const SAMPLE_EVIDENCE_ITEMS: Array<{
  id: string;
  answer: string;
  claim: string;
  supportingSnippet: string;
  source: string;
  contextScore: number;
  trustScore: number;
  validationResult: 'VALIDATED' | 'UNVERIFIED' | 'CONTRADICTED';
  relevanceExplanation: string;
}> = [
  {
    id: 'ev-01',
    answer:
      'Under our Enterprise Refund Policy (v4.2), customers are eligible for a 100% full refund within 30 days of purchase for all unused software licenses and subscriptions. Priority processing takes 2 business days.',
    claim: '100% full refund within 30 days of purchase for unused licenses.',
    supportingSnippet:
      'Customers are eligible for a 100% full refund within 30 days of purchase for all unused software licenses and subscriptions. Requests made between 31 and 60 days are eligible for prorated credit.',
    source: 'corp-legal-portal://policies/refund-v4.2.pdf',
    contextScore: 96,
    trustScore: 98,
    validationResult: 'VALIDATED',
    relevanceExplanation:
      'Official cryptographic legal policy document matching exact lexical keywords "full refund" and "30 days" with 98% provenance authority.',
  },
  {
    id: 'ev-02',
    answer:
      'Standard customer support tickets have a 24-hour SLA resolution window, while critical incident tickets (#INCIDENT-URGENT) have a guaranteed 15-minute response SLA.',
    claim: 'Guaranteed 15-minute response SLA for critical tickets.',
    supportingSnippet:
      'Standard customer support ticket resolution window is 24 hours. Critical severity tickets (#INCIDENT-URGENT) have a guaranteed 15-minute response SLA.',
    source: 'zendesk-kb://articles/sla-escalation-policy',
    contextScore: 92,
    trustScore: 95,
    validationResult: 'VALIDATED',
    relevanceExplanation:
      'Verified Zendesk enterprise documentation matching query tokens "SLA" and "critical incident tickets".',
  },
  {
    id: 'ev-03',
    answer:
      'Destructive operations including drop_database, delete_user, exec_system_cmd, or export_api_keys require Level-3 administrative approval and are permanently blocked in automated execution.',
    claim: 'Destructive operations are permanently blocked in automated execution.',
    supportingSnippet:
      'The agent is authorized to invoke read-only lookup tools... Destructive operations including drop_database, delete_user, exec_system_cmd, or export_api_keys require Level-3 administrative approval and are permanently blocked in automated execution.',
    source: 'ops-iam://permissions/agent-tool-matrix.json',
    contextScore: 94,
    trustScore: 96,
    validationResult: 'VALIDATED',
    relevanceExplanation:
      'Enterprise IAM permission matrix defining least-privilege boundaries and permanent automated execution prohibitions.',
  },
];

export const EvidenceTab: React.FC = () => {
  const [selectedEvidence, setSelectedEvidence] = useState(SAMPLE_EVIDENCE_ITEMS[0]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-border/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              Evidence Explorer &amp; Factual Grounding Tracer
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Verify explainability from generated answer statements down to source knowledge documents
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout: Selector on left, Hierarchical drill-down on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Evidence Claims List (4 cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 border border-border/80 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Grounding Audit Entries ({SAMPLE_EVIDENCE_ITEMS.length})
          </h3>

          <div className="space-y-2.5">
            {SAMPLE_EVIDENCE_ITEMS.map((item) => {
              const isSelected = selectedEvidence.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedEvidence(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40 shadow-md'
                      : 'border-border/60 bg-surface-100/70 hover:border-slate-600 hover:bg-surface-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-cyan-400">{item.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                      {item.validationResult}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 line-clamp-2 font-mono">
                    "{item.claim}"
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
                    Source: {item.source}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Drill-Down Flowchart (8 cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-border/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Hierarchical Grounding Trace
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Entry: {selectedEvidence.id}
            </span>
          </div>

          {/* Drill-down Flow */}
          <div className="space-y-3 pt-2">
            
            {/* Step 1: Answer */}
            <div className="p-3.5 rounded-xl bg-surface-100 border border-border/70 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                <span>1. AGENT ANSWER</span>
                <span className="text-cyan-400">Model Output</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {selectedEvidence.answer}
              </p>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-cyan-500/60" />
            </div>

            {/* Step 2: Supporting Evidence */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-400">
                <span>2. EXTRACTED FACTUAL CLAIM</span>
                <span>Grounding Substring</span>
              </div>
              <p className="text-xs text-cyan-200 font-mono font-medium">
                "{selectedEvidence.claim}"
              </p>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-cyan-500/60" />
            </div>

            {/* Step 3: Retrieved Source & Supporting Snippet */}
            <div className="p-3.5 rounded-xl bg-surface-100 border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                <span>3. RETRIEVED SOURCE DOCUMENT</span>
                <span className="text-slate-300 font-mono">{selectedEvidence.source}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-300 border border-border/60 text-xs font-mono text-slate-300 leading-relaxed">
                "{selectedEvidence.supportingSnippet}"
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-cyan-500/60" />
            </div>

            {/* Step 4: Context Score & Validation Result */}
            <div className="p-4 rounded-xl bg-surface-50 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase font-mono text-emerald-300">
                    Validation Result: {selectedEvidence.validationResult}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-sans">
                  {selectedEvidence.relevanceExplanation}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="p-2 rounded-lg bg-surface-200 border border-border text-center font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">Context Score</div>
                  <div className="text-sm font-bold text-cyan-400">{selectedEvidence.contextScore}%</div>
                </div>
                <div className="p-2 rounded-lg bg-surface-200 border border-border text-center font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">Trust Rating</div>
                  <div className="text-sm font-bold text-emerald-400">{selectedEvidence.trustScore}%</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
