import React, { useState } from 'react';
import { SecurityEvent, ThreatSeverity } from '@/lib/types';
import { DecisionBadge } from '../DecisionBadge';
import {
  ShieldAlert,
  Shield,
  AlertTriangle,
  Lock,
  Filter,
  Search,
  ExternalLink,
  CheckCircle2,
  X,
  FileCode,
  Terminal,
  Activity
} from 'lucide-react';

interface SecurityTabProps {
  events: SecurityEvent[];
}

export const SecurityTab: React.FC<SecurityTabProps> = ({ events }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'RESOLVED'];

  const filteredEvents = events.filter((e) => {
    if (filterSeverity === 'RESOLVED') {
      if (e.status !== 'RESOLVED' && e.status !== 'REVIEWED') return false;
    } else if (filterSeverity !== 'ALL') {
      if (e.severity !== filterSeverity) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.threatType.toLowerCase().includes(q) ||
        e.reason.toLowerCase().includes(q) ||
        e.traceId.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const criticalCount = events.filter((e) => e.severity === 'CRITICAL').length;
  const highCount = events.filter((e) => e.severity === 'HIGH').length;
  const mediumCount = events.filter((e) => e.severity === 'MEDIUM').length;

  return (
    <div className="space-y-6">
      
      {/* SOC Threat Radar Top Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-rose-400">Critical Threats</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{criticalCount}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">Direct injections &amp; tool violations</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-amber-400">High Risk Threats</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{highCount}</div>
          <div className="text-[11px] text-amber-300/80 mt-1">Context injection attempts</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-cyan-400">Medium / Warnings</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{mediumCount}</div>
          <div className="text-[11px] text-cyan-300/80 mt-1">Conflicting sources &amp; low trust</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Active Defense</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">100%</div>
          <div className="text-[11px] text-slate-400 mt-1">Fail-closed enforcement</div>
        </div>
      </div>

      {/* Security Event Log Explorer */}
      <div className="glass-panel rounded-2xl p-5 border border-border/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              Runtime Security Event Log
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Continuous runtime threat interception stream with forensic evidence capture
            </p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threat, trace, reason..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-surface-100 border border-border/70 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterSeverity(opt)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                filterSeverity === opt
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-surface-100/50 hover:bg-surface-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Events Table / List */}
        <div className="space-y-2.5 pt-1">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No security events matching current criteria.
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const isCrit = evt.severity === 'CRITICAL';
              const isHigh = evt.severity === 'HIGH';
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCrit
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-400 hover:bg-rose-950/30'
                      : isHigh
                      ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/30'
                      : 'bg-surface-100/70 border-border/60 hover:border-slate-600 hover:bg-surface-50'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className={`text-xs font-mono font-bold ${isCrit ? 'text-rose-400' : 'text-amber-400'}`}>
                        {evt.threatType}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        Trace: {evt.traceId}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans line-clamp-1">
                      {evt.reason}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Risk Score</div>
                      <div className="text-sm font-bold font-mono text-rose-400">
                        {evt.riskScore}/100
                      </div>
                    </div>

                    <DecisionBadge decision={evt.decision} size="sm" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Forensic Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700 bg-surface-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-500/40">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">
                    {selectedEvent.threatType}
                  </h3>
                  <div className="text-xs font-mono text-slate-400">
                    Event ID: {selectedEvent.id} • Trace: {selectedEvent.traceId}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded-lg bg-surface-100 border border-border/50">
                  <span className="text-[10px] uppercase text-slate-500 block">Decision</span>
                  <strong className="text-rose-400 mt-0.5 block">{selectedEvent.decision}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-100 border border-border/50">
                  <span className="text-[10px] uppercase text-slate-500 block">Risk Score</span>
                  <strong className="text-rose-400 mt-0.5 block">{selectedEvent.riskScore}/100</strong>
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase font-mono font-semibold text-slate-400 block mb-1">
                  Incident Reason
                </span>
                <p className="p-3 rounded-xl bg-surface-100 border border-border/60 text-slate-200 leading-relaxed font-sans">
                  {selectedEvent.reason}
                </p>
              </div>

              <div>
                <span className="text-[11px] uppercase font-mono font-semibold text-slate-400 block mb-1">
                  Forensic Trigger Evidence
                </span>
                <div className="p-3 rounded-xl bg-surface-300 border border-border/60 space-y-1.5 font-mono text-slate-300">
                  {selectedEvent.evidence.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 text-rose-300">
                      <span>›</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
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
