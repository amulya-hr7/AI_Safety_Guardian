import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
  label?: string;
  fallbackLabel?: string;
  className?: string;
  id?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label,
  fallbackLabel = 'Back',
  className = '',
  id = 'global-back-btn'
}) => {
  const displayLabel = label || fallbackLabel;

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141417] hover:bg-[#1C1C22] active:bg-[#0E0E11] text-zinc-300 hover:text-white border border-zinc-800 hover:border-[#D4AF37]/50 text-xs font-semibold transition-all shadow-sm group cursor-pointer shrink-0 ${className}`}
      title={displayLabel}
    >
      <ArrowLeft
        size={14}
        className="text-[#D4AF37] group-hover:-translate-x-0.5 transition-transform shrink-0"
      />
      <span className="truncate max-w-[200px] sm:max-w-[300px]">{displayLabel}</span>
    </button>
  );
};
