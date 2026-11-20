import React from 'react';
import { Shield, Sparkles, Heart } from 'lucide-react';
import { PageId } from '../types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#0E0E11]/95 border-t border-[#D4AF37]/20 py-8 px-4 sm:px-6 lg:px-8 text-xs text-zinc-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center">
            <Shield size={14} />
          </div>
          <span className="font-semibold text-white">
            AI Safety Guardian
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">Helping people navigate online truth & public safety</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <button
            onClick={() => onNavigate('responsible-ai')}
            className="hover:text-[#D4AF37] cursor-pointer transition-colors"
          >
            Responsible AI & Privacy
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="hover:text-[#D4AF37] cursor-pointer transition-colors"
          >
            Architecture Pipeline
          </button>
          <button
            onClick={() => onNavigate('misinformation')}
            className="hover:text-[#D4AF37] cursor-pointer transition-colors"
          >
            Misinformation NLP
          </button>
          <button
            onClick={() => onNavigate('violence')}
            className="hover:text-[#D4AF37] cursor-pointer transition-colors"
          >
            Violence Detection
          </button>
        </div>
      </div>
    </footer>
  );
};
