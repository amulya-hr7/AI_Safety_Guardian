import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'gold' | 'amber' | 'sky' | 'red' | 'emerald' | 'indigo' | 'purple' | string;
  badgeText?: string;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'gold',
  badgeText,
  onClick
}) => {
  const colorMap: Record<string, { bg: string; iconBg: string }> = {
    gold: {
      bg: 'bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#D4AF37]',
      iconBg: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
    },
    amber: {
      bg: 'bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#D4AF37]',
      iconBg: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
    },
    sky: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      iconBg: 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
    },
    red: {
      bg: 'bg-red-500/15 border-red-500/30 text-red-400',
      iconBg: 'bg-red-500/20 text-red-300 border border-red-500/30'
    },
    emerald: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    },
    indigo: {
      bg: 'bg-amber-400/10 border-amber-400/30 text-amber-300',
      iconBg: 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
    },
    purple: {
      bg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
      iconBg: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
    }
  };

  const defaultScheme = {
    bg: 'bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#D4AF37]',
    iconBg: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
  };

  const scheme = (color && colorMap[color]) || colorMap.gold || defaultScheme;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`p-5 rounded-2xl bg-[#141417]/90 border transition-all duration-200 backdrop-blur-md shadow-xl ${
        onClick
          ? 'cursor-pointer border-zinc-800/80 hover:border-[#D4AF37]/60 hover:bg-[#18181D] hover:shadow-2xl hover:shadow-amber-500/10'
          : 'border-zinc-800/80'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{value}</span>
            {badgeText && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${scheme?.bg || 'border-zinc-700 text-zinc-300'}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${scheme?.iconBg || 'bg-zinc-800 text-zinc-300 border border-zinc-700'}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};
