import React from 'react';
import { Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ResponsibleAIDisclaimerProps {
  type?: 'general' | 'misinformation' | 'violence' | 'compact';
  onLearnMore?: () => void;
}

export const ResponsibleAIDisclaimer: React.FC<ResponsibleAIDisclaimerProps> = ({
  type = 'general',
  onLearnMore
}) => {
  if (type === 'compact') {
    return (
      <div
        id="responsible-ai-compact-banner"
        className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-[#141417] border border-[#D4AF37]/30 text-xs text-zinc-300"
      >
        <div className="flex items-center gap-2">
          <Info size={14} className="text-[#D4AF37] shrink-0" />
          <span>
            <strong className="text-white font-medium">AI Advisory:</strong> Prediction output is an AI-assisted estimate, not absolute proof or judicial determination.
          </span>
        </div>
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="text-[#D4AF37] hover:text-amber-300 font-medium underline underline-offset-2 shrink-0 cursor-pointer"
          >
            Responsible AI Policy
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      id="responsible-ai-full-banner"
      className="p-4 rounded-xl bg-gradient-to-r from-[#141417] via-[#1C1C22] to-[#141417] border border-[#D4AF37]/30 text-zinc-300 text-xs sm:text-sm space-y-2 backdrop-blur-md shadow-lg"
    >
      <div className="flex items-center gap-2 text-zinc-100 font-semibold">
        <ShieldAlert size={18} className="text-[#D4AF37]" />
        <span>Responsible AI & Evaluation Notice</span>
      </div>
      <p className="leading-relaxed text-zinc-300">
        {type === 'misinformation' && (
          <>
            This system evaluates lexical markers, source verifiability, and factual stance using NLP. <strong className="text-white">AI predictions are not definitive fact-checks</strong>. Important or consequential news should always be corroborated with primary evidence and independent human journalists.
          </>
        )}
        {type === 'violence' && (
          <>
            This computer vision system estimates kinetic motion, poses, and visual indicators. <strong className="text-white">It does not determine criminal liability, legal guilt, or lawful self-defense</strong>. Results must be reviewed by trained human personnel.
          </>
        )}
        {type === 'general' && (
          <>
            This platform operates under strict Responsible AI governance. AI models can produce false positives and false negatives. <strong className="text-white">Human-in-the-loop oversight is required</strong> for critical safety decisions, and no emergency dispatch is triggered automatically.
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={13} className="text-emerald-400" /> No Facial Identity Profiling
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 size={13} className="text-emerald-400" /> Privacy First — Ephemeral Frame Processing
        </span>
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="text-[#D4AF37] hover:text-amber-300 font-semibold underline underline-offset-2 ml-auto cursor-pointer"
          >
            View Full AI Governance Matrix &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
