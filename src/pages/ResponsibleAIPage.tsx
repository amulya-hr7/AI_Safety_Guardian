import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  AlertTriangle,
  Scale,
  Sparkles,
  HeartHandshake,
  Users,
  Compass
} from 'lucide-react';
import { PageId } from '../types';
import { ResponsibleAIDisclaimer } from '../components/ResponsibleAIDisclaimer';
import { BackButton } from '../components/BackButton';

interface ResponsibleAIPageProps {
  onNavigate: (page: PageId) => void;
  onBack?: () => void;
  previousPageName?: string;
}

export const ResponsibleAIPage: React.FC<ResponsibleAIPageProps> = ({
  onNavigate,
  onBack,
  previousPageName
}) => {
  const sixPillars = [
    {
      title: '1. Fairness',
      desc: 'The models are strictly evaluated to prevent demographic, racial, or cultural bias. Visual inferences focus entirely on kinetic trajectories and physical objects rather than personal identity or attire.',
      icon: Scale,
      color: 'gold'
    },
    {
      title: '2. Reliability & Safety',
      desc: 'Rigorous probabilistic calibration ensures confidence scores reflect true statistical uncertainty. Content with borderline confidence is explicitly routed for human review.',
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      title: '3. Privacy & Security',
      desc: 'Visual frames and webcam snapshots are processed ephemerally in volatile memory. No permanent facial recognition templates, biometric embeddings, or surveillance logs are stored.',
      icon: Lock,
      color: 'gold'
    },
    {
      title: '4. Inclusiveness',
      desc: 'Claim verification accounts for regional linguistic idioms, satire, colloquial phrasing, and parody to avoid disproportionately penalizing non-standard dialects.',
      icon: Users,
      color: 'gold'
    },
    {
      title: '5. Transparency (XAI)',
      desc: 'Every AI classification includes Explainable AI (XAI) rationale, key linguistic or visual factor breakdowns, and direct source citation recommendations.',
      icon: Compass,
      color: 'amber'
    },
    {
      title: '6. Accountability',
      desc: 'Operational governance enforces strict human-in-the-loop sign-off. The platform never acts as an autonomous punitive authority.',
      icon: HeartHandshake,
      color: 'gold'
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Header Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#141417]/90 border border-zinc-800 space-y-6 backdrop-blur-md">
        <div>
          <BackButton
            id="responsible-ai-back-btn"
            onClick={onBack || (() => onNavigate('dashboard'))}
            label={previousPageName ? `Back to ${previousPageName}` : 'Back to Dashboard'}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={13} />
            <span>Ethical AI Governance</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold">
            <Sparkles size={13} />
            <span>Responsible AI Framework</span>
          </span>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Responsible AI, Ethics & Data Privacy
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            AI systems designed to identify misinformation and physical threats operate in sensitive socio-technical environments. This framework outlines the ethical principles, technical boundaries, and privacy safeguards governing this platform.
          </p>
        </div>
      </div>

      {/* Prominent Disclaimer */}
      <ResponsibleAIDisclaimer type="general" />

      {/* 6 Pillars Grid */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Pillars of Alignment</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            The 6 Core Responsible AI Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sixPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#141417]/90 border border-zinc-800 space-y-4 hover:border-[#D4AF37]/40 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#0E0E11] text-[#D4AF37] border border-zinc-800">
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-500">Pillar 0{idx + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{p.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Critical Operational Safeguards & Boundaries */}
      <section className="p-8 sm:p-10 rounded-3xl bg-[#141417]/90 border border-zinc-800 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle size={15} />
            <span>Strict System Boundaries</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            Ethical Boundaries & Non-Autonomous Protections
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
          <div className="p-5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <ShieldAlert size={16} />
              <span>No Autonomous Law Enforcement Dispatch</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              The system explicitly forbids automatic calls or direct API integration with police, 911/emergency dispatch, or armed security services. Automated decisions carry unacceptable false-positive risks; human safety officers must evaluate every high-risk incident.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <EyeOff size={16} />
              <span>No Biometric Identification or Mass Tracking</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Camera feeds and uploaded visual frames are never matched against biometric watchlists, identity databases, or facial recognition stores. Visual features are evaluated solely for pose kinematics and weapons.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-[#D4AF37] font-bold">
              <UserCheck size={16} />
              <span>Mandatory Human-in-the-Loop Triage</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              AI outputs serve as triage recommendations to prioritize human analyst workflows. In high-stakes contexts (content takedowns, disciplinary inquiries, security escalations), human judgment remains the sole authoritative decision-maker.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Lock size={16} />
              <span>Ephemeral Ingestion & Secure Key Proxies</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              All Gemini AI calls are secured server-side via Node.js/Express proxies without exposing API secrets to client browsers. Ingestion buffers are cleaned following inference.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
