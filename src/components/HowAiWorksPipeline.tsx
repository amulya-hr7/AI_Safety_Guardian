import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Video,
  Cpu,
  Layers,
  Scale,
  BrainCircuit,
  BellRing,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const HowAiWorksPipeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 'step-input',
      number: '01',
      title: 'Multimodal Input Ingestion',
      icon: FileText,
      badge: 'Data Layer',
      shortDesc: 'Accepts raw text claims, social feeds, surveillance images, and video frame sequences.',
      details:
        'In Module A, raw text is parsed for sentence tokenization and linguistic framing. In Module B, image streams or video sequences are decoded into keyframes at 1 FPS to optimize inference throughput without skipping critical kinetic transitions.',
      tags: ['Tokenization', 'Keyframe Extraction', 'MIME Validation']
    },
    {
      id: 'step-processing',
      number: '02',
      title: 'Deep AI Feature Extraction',
      icon: Cpu,
      badge: 'Neural Engine',
      shortDesc: 'Gemini 3.7 Flash NLP embeddings and Computer Vision spatial kinematics.',
      details:
        'Module A extracts lexical sensationalism, semantic stance, and factual predicates. Module B computes bounding spatial topologies, pose vectors, and movement velocities to isolate interpersonal physical altercations from benign sports or gatherings.',
      tags: ['Gemini 3.7 Flash', 'Pose Kinematics', 'Semantic Stance']
    },
    {
      id: 'step-classification',
      number: '03',
      title: 'Taxonomic Safety Classification',
      icon: Layers,
      badge: 'Inference',
      shortDesc: 'Assigns fine-grained categorical labels with strict boundary thresholds.',
      details:
        'Misinformation is classified into Likely Reliable, Suspicious, or Likely Misinformation. Visual feeds are categorized into Fighting, Assault, Aggressive Activity, Weapon Indicators, or Normal/Safe baselines.',
      tags: ['Softmax Calibration', 'Multi-Class Labeling', 'Threshold Gates']
    },
    {
      id: 'step-confidence',
      number: '04',
      title: 'Confidence & Risk Scoring',
      icon: Scale,
      badge: 'Risk Quantification',
      shortDesc: 'Calculates continuous 0–100 risk indexes calibrated with model certainty.',
      details:
        'Outputs a dual metric: Risk Score (severity of potential harm or falsehood) and Model Confidence (epistemic certainty of the AI prediction), ensuring transparent probabilistic assessments.',
      tags: ['Risk Index (0-100)', 'Model Certainty', 'Probabilistic Output']
    },
    {
      id: 'step-xai',
      number: '05',
      title: 'Explainable AI (XAI) Synthesis',
      icon: BrainCircuit,
      badge: 'Interpretability',
      shortDesc: 'Generates natural-language reasoning, key factors, and fact-checking recommendations.',
      details:
        'Every prediction provides human-interpretable rationale: extracted verifiable claims, identified linguistic markers, detected object indicators, and recommended trusted verification sources (Reuters, WHO, etc.).',
      tags: ['Claim Attribution', 'Linguistic Reasoning', 'Source Grounding']
    },
    {
      id: 'step-alerts',
      number: '06',
      title: 'Alert Dispatch & Human-in-the-Loop',
      icon: BellRing,
      badge: 'Operational Safety',
      shortDesc: 'Flags critical threats for analyst review without automated hazardous escalations.',
      details:
        'High-risk events populate the dashboard telemetry and alert triage queues. The system explicitly enforces human operator oversight before taking institutional actions, preventing automated false-positive harms.',
      tags: ['Real-Time Triage', 'Human Review Queue', 'Audit Logging']
    }
  ];

  return (
    <motion.div
      id="how-ai-works-container"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 md:p-8 rounded-3xl bg-[#141417]/90 border border-[#D4AF37]/25 space-y-8 backdrop-blur-md shadow-2xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-semibold mb-2">
            <Sparkles size={14} />
            <span>End-to-End Architectural Pipeline</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            How the AI Safety Detection Engine Works
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            A transparent 6-stage operational pipeline engineered for accuracy, explainability, and Responsible AI compliance.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#1C1C22] p-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-300">
          <ShieldCheck size={16} className="text-emerald-400 ml-1" />
          <span className="font-medium pr-2">Responsible Safety Ready</span>
        </div>
      </div>

      {/* Pipeline Step Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = activeStep === idx;
          return (
            <motion.button
              key={step.id}
              id={`pipeline-step-button-${idx + 1}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveStep(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-[#1C1C22] border-[#D4AF37] text-white shadow-lg shadow-amber-500/15'
                  : 'bg-[#0E0E11]/80 border-zinc-800 text-zinc-400 hover:bg-[#18181D] hover:text-white hover:border-[#D4AF37]/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-[#D4AF37]' : 'text-zinc-500'}`}>
                  {step.number}
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#141417] text-[#D4AF37] border border-[#D4AF37]/30">
                  {step.badge}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon size={16} className={isSelected ? 'text-[#D4AF37]' : 'text-zinc-400'} />
                <span className="text-xs font-bold leading-tight text-white line-clamp-1">{step.title}</span>
              </div>
              {isSelected && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#F59E0B]"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Active Step Deep-Dive Card */}
      {(() => {
        const currentStep = steps[activeStep] || steps[0];
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#141417] via-[#1C1C22] to-[#141417] border border-[#D4AF37]/25 space-y-4 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    {React.createElement(currentStep.icon, { size: 24 })}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#D4AF37]">STAGE {currentStep.number}</span>
                    <h3 className="text-xl font-bold text-white">{currentStep.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Step {activeStep + 1} of {steps.length}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                    className="p-2 rounded-lg bg-[#18181D] hover:bg-[#22222A] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Next Stage</span>
                    <ArrowRight size={14} />
                  </motion.button>
                </div>
              </div>

              <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                {currentStep.details}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-zinc-400 font-semibold mr-1">Key Sub-systems:</span>
                {currentStep.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-[#141417] border border-[#D4AF37]/30 text-xs font-medium text-[#D4AF37]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        );
      })()}
    </motion.div>
  );
};
