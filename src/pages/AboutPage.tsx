import React from 'react';
import {
  Layers,
  Cpu,
  Shield,
  FileSearch,
  Video,
  CheckCircle2,
  Sparkles,
  Award,
  Terminal,
  Server,
  Code2,
  Database
} from 'lucide-react';
import { PageId } from '../types';
import { HowAiWorksPipeline } from '../components/HowAiWorksPipeline';
import { ResponsibleAIDisclaimer } from '../components/ResponsibleAIDisclaimer';
import { BackButton } from '../components/BackButton';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  onBack?: () => void;
  previousPageName?: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onBack, previousPageName }) => {
  return (
    <div className="space-y-12 pb-12">
      {/* Top Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#141417]/90 border border-zinc-800 space-y-6 backdrop-blur-md">
        <div>
          <BackButton
            id="about-back-btn"
            onClick={onBack || (() => onNavigate('dashboard'))}
            label={previousPageName ? `Back to ${previousPageName}` : 'Back to Dashboard'}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Platform Architecture Specs</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Award size={13} />
            <span>AI Safety Intelligence Platform</span>
          </span>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            System Architecture & AI Pipeline Deep Dive
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            The AI-Powered Misinformation and Violence Detection System is an end-to-end multi-modal safety intelligence platform developed for advanced threat detection and enterprise safety monitoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('responsible-ai')}
            className="px-5 py-2.5 rounded-xl bg-[#0E0E11] hover:bg-[#1C1C22] text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Shield size={15} className="text-[#D4AF37]" />
            <span>Read Responsible AI Framework</span>
          </button>
        </div>
      </div>

      {/* Reusable Visual Architecture Pipeline */}
      <HowAiWorksPipeline />

      {/* Dual Specialized Pipelines Breakdown */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Dual Core Engines</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Detailed Algorithmic Execution Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module A Deep Dive */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141417]/90 border border-zinc-800 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                <FileSearch size={24} />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#D4AF37]">MODULE A</span>
                <h3 className="text-lg font-bold text-white">NLP Misinformation Engine</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-1">
                <p className="font-bold text-white">1. Sentence-Level Claim Decomposition</p>
                <p className="text-zinc-400">
                  Breaks raw paragraphs into atomic propositions to isolate empirical claims from rhetorical hyperbole.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-1">
                <p className="font-bold text-white">2. Epistemic Stance & Sensationalism Profiling</p>
                <p className="text-zinc-400">
                  Scores linguistic framing, clickbait indicators, emotional urgency triggers, and conspiracy tropes.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-1">
                <p className="font-bold text-white">3. Tri-State Classification & Citation Grounding</p>
                <p className="text-zinc-400">
                  Classifies into Likely Reliable, Suspicious, or Likely Misinformation with continuous 0–100 risk scoring.
                </p>
              </div>
            </div>
          </div>

          {/* Module B Deep Dive */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141417]/90 border border-zinc-800 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                <Video size={24} />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#D4AF37]">MODULE B</span>
                <h3 className="text-lg font-bold text-white">Computer Vision Threat Engine</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-1">
                <p className="font-bold text-white">1. Multimodal Frame Ingestion & Slicing</p>
                <p className="text-zinc-400">
                  Captures static imagery, temporal video sequences at 1 FPS keyframe intervals, or HTML5 webcam streams.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-1">
                <p className="font-bold text-white">2. Kinematic Pose & Interaction Bounding</p>
                <p className="text-zinc-400">
                  Analyzes rapid acceleration vectors, aggressive arm/fist trajectories, and weapon-like geometric outlines.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-1">
                <p className="font-bold text-white">3. Multi-Class Threat Categorization</p>
                <p className="text-zinc-400">
                  Differentiates consensual sparring sports and crowds from active fights, physical assaults, and weapon threats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack & Infrastructure Matrix */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#141417]/90 border border-zinc-800 space-y-6">
        <h3 className="text-xl font-bold text-white">Technology Stack & Infrastructure</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-[#D4AF37] font-bold">
              <Cpu size={16} />
              <span>AI & Inference</span>
            </div>
            <p className="text-zinc-200 font-semibold">Google Gemini 3.7 Flash</p>
            <p className="text-zinc-400">@google/genai SDK on Node.js proxy with temperature calibration.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-[#D4AF37] font-bold">
              <Server size={16} />
              <span>Backend Architecture</span>
            </div>
            <p className="text-zinc-200 font-semibold">Express.js & TypeScript</p>
            <p className="text-zinc-400">REST API with SQLite persistent storage and offline simulation engine.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-[#D4AF37] font-bold">
              <Code2 size={16} />
              <span>Frontend Experience</span>
            </div>
            <p className="text-zinc-200 font-semibold">React 19 & Tailwind CSS</p>
            <p className="text-zinc-400">Motion animations, Lucide icons, responsive layout across all viewports.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Shield size={16} />
              <span>Safety & Governance</span>
            </div>
            <p className="text-zinc-200 font-semibold">Responsible AI Standards</p>
            <p className="text-zinc-400">Human-in-the-loop triage, calibrated confidence, transparent XAI outputs.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
