import React, { useState } from 'react';
import { GuardrailPolicy, PipelineDecision, ThreatSeverity } from '@/lib/types';
import { DecisionBadge } from '../DecisionBadge';
import {
  SlidersHorizontal,
  Plus,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';

interface PoliciesTabProps {
  policies: GuardrailPolicy[];
  onTogglePolicy: (id: string, enabled: boolean) => Promise<void>;
  onChangeAction: (id: string, action: PipelineDecision) => Promise<void>;
  onCreatePolicy: (policy: Partial<GuardrailPolicy>) => Promise<void>;
}

export const PoliciesTab: React.FC<PoliciesTabProps> = ({
  policies,
  onTogglePolicy,
  onChangeAction,
  onCreatePolicy,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'injection' | 'context' | 'exfiltration' | 'tool' | 'evidence' | 'reliability'>('injection');
  const [riskLevel, setRiskLevel] = useState<ThreatSeverity>('HIGH');
  const [action, setAction] = useState<PipelineDecision>('BLOCK');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onCreatePolicy({
      name,
      description,
      category,
      riskLevel,
      action,
      enabled: true,
    });

    setName('');
    setDescription('');
    setShowCreateModal(false);
  };

  const actionOptions: PipelineDecision[] = ['ALLOW', 'WARN', 'BLOCK', 'REVIEW'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              Guardrail Policy Builder &amp; Rule Manager
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Configure real-time interception actions, risk severity tiers, and dynamic rule enforcement
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>New Policy Rule</span>
        </button>
      </div>

      {/* Policy Rules List */}
      <div className="space-y-3">
        {policies.map((pol) => (
          <div
            key={pol.id}
            className={`p-4 rounded-2xl border transition-all ${
              pol.enabled
                ? 'bg-surface-100/90 border-border/80 shadow-sm'
                : 'bg-surface-300/40 border-border/40 opacity-60'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Left Details */}
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono font-bold text-cyan-400">{pol.id}</span>
                  <span className="text-sm font-bold text-white font-mono">{pol.name}</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {pol.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {pol.description}
                </p>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-4 shrink-0 justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                
                {/* Risk Level Badge */}
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Risk Tier</span>
                  <span className={`text-xs font-mono font-bold ${
                    pol.riskLevel === 'CRITICAL' ? 'text-rose-400' : pol.riskLevel === 'HIGH' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    {pol.riskLevel}
                  </span>
                </div>

                {/* Interception Action Select */}
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Action</span>
                  <select
                    value={pol.action}
                    onChange={(e) => onChangeAction(pol.id, e.target.value as PipelineDecision)}
                    className="rounded-lg bg-surface-200 border border-border/80 px-2.5 py-1 text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {actionOptions.map((act) => (
                      <option key={act} value={act}>
                        {act}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enable/Disable Toggle */}
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">State</span>
                  <button
                    onClick={() => onTogglePolicy(pol.id, !pol.enabled)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      pol.enabled
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {pol.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Policy */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700 bg-surface-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Define Custom Guardrail Policy
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prevent SQL Drop Statements"
                  className="w-full rounded-lg bg-surface-100 border border-border/80 p-2.5 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">
                  Description &amp; Purpose
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the protection mechanism and interception boundary..."
                  className="w-full rounded-lg bg-surface-100 border border-border/80 p-2.5 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Threat Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-lg bg-surface-100 border border-border/80 p-2 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="injection">injection</option>
                    <option value="context">context</option>
                    <option value="exfiltration">exfiltration</option>
                    <option value="tool">tool</option>
                    <option value="evidence">evidence</option>
                    <option value="reliability">reliability</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Risk Severity Tier
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as ThreatSeverity)}
                    className="w-full rounded-lg bg-surface-100 border border-border/80 p-2 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">
                  Enforcement Action
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as PipelineDecision)}
                  className="w-full rounded-lg bg-surface-100 border border-border/80 p-2 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="BLOCK">BLOCK</option>
                  <option value="WARN">WARN</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="ALLOW">ALLOW</option>
                </select>
              </div>

              <div className="pt-3 border-t border-border/60 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-100 hover:bg-slate-800 text-xs font-mono text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold"
                >
                  Save Policy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
