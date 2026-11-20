import React from 'react';
import { RiskLevel } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level?: RiskLevel;
  riskLevel?: RiskLevel;
  score?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  riskLevel,
  score,
  showIcon = true,
  size = 'md'
}) => {
  const activeLevel = level || riskLevel || 'Low';

  const getColors = () => {
    switch (activeLevel) {
      case 'Critical':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'Moderate':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Low':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    switch (activeLevel) {
      case 'Critical':
        return <AlertOctagon size={iconSize} className="shrink-0" />;
      case 'High':
        return <ShieldAlert size={iconSize} className="shrink-0" />;
      case 'Moderate':
        return <AlertTriangle size={iconSize} className="shrink-0" />;
      case 'Low':
      default:
        return <ShieldCheck size={iconSize} className="shrink-0" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold'
  };

  return (
    <span
      id={`risk-badge-${activeLevel.toLowerCase()}`}
      className={`inline-flex items-center rounded-full border tracking-wide whitespace-nowrap ${getColors()} ${sizeClasses[size]}`}
    >
      {showIcon && getIcon()}
      <span>{activeLevel} Risk</span>
      {typeof score === 'number' && (
        <span className="opacity-80 font-mono text-[11px]">({score}/100)</span>
      )}
    </span>
  );
};
