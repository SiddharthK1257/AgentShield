import React from 'react';
import { PipelineDecision } from '@/lib/types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Eye } from 'lucide-react';

interface DecisionBadgeProps {
  decision: PipelineDecision;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({
  decision,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wider',
  };

  const config = {
    ALLOW: {
      bg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400 glow-allow',
      icon: <ShieldCheck className={size === 'lg' ? 'w-4 h-4 text-emerald-400' : 'w-3.5 h-3.5 text-emerald-400'} />,
      label: 'ALLOW',
    },
    WARN: {
      bg: 'bg-amber-950/70 border-amber-500/40 text-amber-400 glow-warn',
      icon: <AlertTriangle className={size === 'lg' ? 'w-4 h-4 text-amber-400' : 'w-3.5 h-3.5 text-amber-400'} />,
      label: 'WARN',
    },
    BLOCK: {
      bg: 'bg-rose-950/70 border-rose-500/40 text-rose-400 glow-block',
      icon: <ShieldAlert className={size === 'lg' ? 'w-4 h-4 text-rose-400' : 'w-3.5 h-3.5 text-rose-400'} />,
      label: 'BLOCK',
    },
    REVIEW: {
      bg: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-400 glow-review',
      icon: <Eye className={size === 'lg' ? 'w-4 h-4 text-cyan-400' : 'w-3.5 h-3.5 text-cyan-400'} />,
      label: 'REVIEW',
    },
  }[decision] || {
    bg: 'bg-slate-800 border-slate-700 text-slate-300',
    icon: null,
    label: decision,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all duration-200 ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
