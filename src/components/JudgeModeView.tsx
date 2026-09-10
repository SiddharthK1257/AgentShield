import React, { useState } from 'react';
import { AgentRunResponse } from '@/lib/types';
import { DecisionBadge } from './DecisionBadge';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  Info,
  RefreshCw,
  Terminal,
  Clock,
  HelpCircle,
  Play
} from 'lucide-react';

interface JudgeModeViewProps {
  lastResult: AgentRunResponse | null;
  isRunning: boolean;
  onRunSafe: () => void;
  onRunAttack: () => void;
  onOpenReliabilityModal: () => void;
}

export const JudgeModeView: React.FC<JudgeModeViewProps> = ({
  lastResult,
  isRunning,
  onRunSafe,
  onRunAttack,
  onOpenReliabilityModal,
}) => {
  const [showWhyBlocked, setShowWhyBlocked] = useState(false);
  const [showSafeRecovery, setShowSafeRecovery] = useState(false);

  const isBlocked = lastResult?.decision === 'BLOCK';
  const isWarn = lastResult?.decision === 'WARN';
  const isAllow = lastResult?.decision === 'ALLOW';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="text-center space-y-2 py-4 border-b border-border/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          Zero-Latency Runtime Guardrail Pipeline
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
          AGENTSHIELD
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium max-w-2xl mx-auto">
          "Trust every AI decision before it reaches the user."
        </p>
        <p className="text-xs text-slate-500">
          Executive Judge Mode • High-Speed Interactive Flow for YC Fall 2026 x Moss Hackathon
        </p>

        {/* Quick Trigger Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onRunSafe}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            1. Run Safe Request
          </button>
          <button
            onClick={onRunAttack}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            2. Run Prompt Injection Attack
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-3 animate-pulse border border-cyan-500/40">
          <Zap className="w-8 h-8 text-cyan-400 mx-auto animate-bounce" />
          <div className="text-base font-bold text-white font-mono">
            Evaluating Runtime Guardrails via Moss...
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Input Guardrail → Moss In-Process Vector Search → Context Validation → Security Engine
          </div>
        </div>
      )}

      {/* Dramatic Block Notification when an attack is caught */}
      {!isRunning && lastResult && isBlocked && (
        <div className="glass-panel rounded-2xl p-6 border-2 border-rose-500/80 bg-gradient-to-b from-rose-950/40 to-surface-200/90 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/30 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-950 text-rose-400 border border-rose-500/40 glow-block">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
                    🚨 Security Threat Intercepted
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700">
                    Trace {lastResult.traceId}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white font-mono">
                  {lastResult.security.threatType.replace(/_/g, ' ')}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-slate-400">Risk Score</div>
                <div className="text-2xl font-black font-mono text-rose-400">
                  {lastResult.security.riskScore}/100
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-slate-400">Decision</div>
                <DecisionBadge decision="BLOCK" size="lg" />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-100 border border-border/70 text-xs font-mono text-slate-300">
            <span className="text-slate-500 font-bold uppercase block mb-1">Attempted Query</span>
            "{lastResult.query || lastResult.response.replace('[BLOCKED BY AGENTSHIELD]', '').trim()}"
          </div>

          {/* Interactive Inspection Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setShowWhyBlocked(!showWhyBlocked)}
              className="px-4 py-2 rounded-xl bg-surface-50 hover:bg-slate-700 text-slate-100 text-xs font-semibold font-mono border border-slate-600 flex items-center gap-2 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              {showWhyBlocked ? 'Hide Explanation' : 'Why was this blocked?'}
            </button>

            {lastResult.safeRecovery && (
              <button
                onClick={() => setShowSafeRecovery(!showSafeRecovery)}
                className="px-4 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold font-mono border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                {showSafeRecovery ? 'Hide Safe Recovery' : 'Safe Recovery Mode'}
              </button>
            )}

            <button
              onClick={onOpenReliabilityModal}
              className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-border flex items-center gap-1.5 cursor-pointer"
            >
              <span>Reliability: {lastResult.reliability.overall}/100</span>
              <span className="text-rose-400 font-bold">(FAILED)</span>
            </button>
          </div>

          {/* Expanded "Why Was This Blocked?" */}
          {showWhyBlocked && (
            <div className="p-4 rounded-xl bg-surface-300/90 border border-rose-500/40 space-y-3 animate-in fade-in duration-200">
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Info className="w-4 h-4 text-rose-400" />
                Security Engine Evidence & Threat Analysis
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lastResult.security.reason}
              </p>
              <div className="space-y-1 text-xs font-mono text-slate-400">
                <div className="font-semibold text-slate-300">Detected Trigger Evidence:</div>
                {lastResult.security.evidence.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 text-rose-300">
                    <span>›</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-border/50">
                Confidence: {(lastResult.security.confidence * 100).toFixed(0)}% • Intercepted at Stage: {lastResult.security.stage}
              </div>
            </div>
          )}

          {/* Expanded Safe Recovery */}
          {showSafeRecovery && lastResult.safeRecovery && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2 animate-in fade-in duration-200">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Safe Recovery Alternative (Zero Downtime)
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {lastResult.safeRecovery}
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                AgentShield isolates the attack without crashing the host agent runtime.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sequential Pipeline Card Flow (The core Judge story) */}
      {!isRunning && lastResult && (
        <div className="glass-panel rounded-2xl p-6 border border-border/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Live Request Trust Verification Flow
            </h2>
            <div className="flex items-center gap-2">
              <DecisionBadge decision={lastResult.decision} size="md" />
              <span className="text-xs font-mono text-slate-400">
                {lastResult.latency.totalMs.toFixed(2)}ms Total
              </span>
            </div>
          </div>

          {/* Flow Steps */}
          <div className="space-y-3 pt-2">
            
            {/* 1. Live Request */}
            <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">User Query</span>
                  <span className="text-xs font-mono text-slate-400">{lastResult.latency.inputGuardrailMs.toFixed(2)}ms</span>
                </div>
                <div className="text-xs font-mono text-white mt-1">
                  "{lastResult.query || lastResult.spans[0]?.details || 'User request submitted'}"
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-slate-600" />
            </div>

            {/* 2. Moss Retrieval */}
            <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase text-slate-400">Moss Fast Retrieval</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      SUB-10MS TARGET
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {lastResult.latency.retrievalMs.toFixed(2)} ms
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Retrieved {lastResult.retrievedContext.length} knowledge chunks. Primary source:{' '}
                  <span className="font-mono text-cyan-300">
                    {lastResult.retrievedContext[0]?.source || 'None (Direct execution)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-slate-600" />
            </div>

            {/* 3. Context Validation */}
            <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">Context Validation</span>
                  <span className="text-xs font-mono text-slate-400">{lastResult.latency.contextValidationMs.toFixed(2)}ms</span>
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center justify-between">
                  <span>
                    Status:{' '}
                    <strong className={isBlocked ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'}>
                      {isBlocked ? 'THREAT DETECTED' : isWarn ? 'CONFLICTING CONTEXT' : 'VERIFIED SAFE'}
                    </strong>
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Relevance: {lastResult.reliability.breakdown.contextRelevance}% • Trust: {lastResult.reliability.breakdown.sourceTrust}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-slate-600" />
            </div>

            {/* 4. Security Gate */}
            <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                isBlocked ? 'bg-rose-950 text-rose-400 border border-rose-500/40' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              }`}>
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">Security Gate</span>
                  <span className="text-xs font-mono text-slate-400">{lastResult.latency.securityEngineMs.toFixed(2)}ms</span>
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center justify-between">
                  <span>
                    Threat Type:{' '}
                    <strong className="font-mono text-white">{lastResult.security.threatType}</strong>
                  </span>
                  <DecisionBadge decision={lastResult.security.decision} size="sm" />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-slate-600" />
            </div>

            {/* 5. Agent Response / Synthesis */}
            <div className="p-3.5 rounded-xl bg-surface-100 border border-border/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                5
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">Agent Response</span>
                  <span className="text-xs font-mono text-slate-400">{lastResult.latency.agentLlmMs.toFixed(2)}ms</span>
                </div>
                <div className="text-xs text-slate-200 mt-1.5 p-2.5 rounded-lg bg-surface-300/80 border border-slate-800 font-sans leading-relaxed">
                  {lastResult.response}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-slate-600" />
            </div>

            {/* 6. Reliability Score */}
            <div
              onClick={onOpenReliabilityModal}
              className="p-4 rounded-xl bg-surface-50 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${lastResult.reliability.passed ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                  {lastResult.reliability.passed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-slate-400">Agent Reliability Score</div>
                  <div className="text-xs text-cyan-300 flex items-center gap-1">
                    Click to view full mathematical calculation ›
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black font-mono text-white">
                  {lastResult.reliability.overall}
                  <span className="text-sm font-normal text-slate-400">/100</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Grade: {lastResult.reliability.grade}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
