import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    type: 'positive' | 'warning' | 'neutral' | 'accent';
  };
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtext,
  icon,
  badge,
  onClick,
  className = '',
}) => {
  const badgeStyles = {
    positive: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    accent: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-xl p-4 transition-all duration-200 border border-border/80 hover:border-slate-700 ${
        onClick ? 'cursor-pointer hover:bg-surface-50/50 group' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {icon && <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</div>}
      </div>

      <div className="flex items-baseline space-x-1.5">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between">
        {subtext && (
          <span className="text-xs text-slate-400 truncate max-w-[180px]">
            {subtext}
          </span>
        )}
        {badge && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles[badge.type]}`}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};
