import React from 'react';
import { motion } from 'motion/react';
import {
  FileSearch,
  Video,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Shield,
  HelpCircle,
  Users,
  Compass,
  Lightbulb,
  Search,
  Zap,
  Eye
} from 'lucide-react';
import { PageId } from '../types';
import { HowAiWorksPipeline } from '../components/HowAiWorksPipeline';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-12">
      {/* Human-Friendly Welcome Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl bg-[#141417]/90 border border-[#D4AF37]/25 p-6 sm:p-10 lg:p-14 backdrop-blur-md shadow-2xl space-y-8"
      >
        <div className="relative max-w-4xl space-y-5">
          {/* Friendly Status Badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-wrap items-center gap-2.5"
          >
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              <Sparkles size={13} className="text-[#D4AF37]" />
              <span>Public Safety & Truth Guardian</span>
            </motion.span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <HeartHandshake size={13} className="text-emerald-400" />
              <span>Free, Transparent & Human-Centered</span>
            </span>
          </motion.div>

          {/* Warm, Clear Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]"
          >
            Clear answers for what’s real, and what’s safe online.
          </motion.h1>

          {/* Friendly Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl"
          >
            The internet moves fast, and it can be hard to tell what is genuine information versus misleading hype or harmful footage. This platform gives you a clear, calm, and transparent way to verify viral news, double-check suspicious claims, and spot dangerous imagery before sharing.
          </motion.p>

          {/* Quick Value Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3"
          >
            <div className="p-4 rounded-2xl bg-[#1C1C22] border border-zinc-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                <Search size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white">Fact-Check Any Claim</p>
                <p className="text-xs text-zinc-400">Break down news, social media posts, and rumors with trusted source citations.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1C22] border border-zinc-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                <Eye size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white">Detect Harmful Media</p>
                <p className="text-xs text-zinc-400">Analyze images, video clips, and webcams to identify physical violence safely.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1C22] border border-zinc-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Lightbulb size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white">Plain-English Explanations</p>
                <p className="text-xs text-zinc-400">No confusing black-box AI scores. You see exactly why something was flagged.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* "About This Website & How It Helps You" Explanatory Guide Section with Scroll Animation */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 sm:p-10 rounded-3xl bg-[#141417]/80 border border-zinc-800 space-y-6"
      >
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
            <Compass size={14} />
            <span>How This Website Works</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How does this platform help you?
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Whether you are reading a breaking news headline or checking a suspicious video sent to a group chat, you can test it here in 3 easy steps:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-[#1C1C22] border border-zinc-800 space-y-3 relative overflow-hidden transition-colors hover:border-[#D4AF37]/50"
          >
            <div className="flex items-center justify-between">
              <span className="h-8 w-8 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-sm flex items-center justify-center border border-[#D4AF37]/40">
                1
              </span>
              <span className="text-[11px] font-medium text-zinc-400">Input Content</span>
            </div>
            <h3 className="text-base font-bold text-white">Paste Text or Upload Media</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Copy and paste any headline, WhatsApp message, social post, or upload a photo or video you want to examine.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-[#1C1C22] border border-zinc-800 space-y-3 relative overflow-hidden transition-colors hover:border-[#D4AF37]/50"
          >
            <div className="flex items-center justify-between">
              <span className="h-8 w-8 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-sm flex items-center justify-center border border-[#D4AF37]/40">
                2
              </span>
              <span className="text-[11px] font-medium text-zinc-400">Multi-Angle Analysis</span>
            </div>
            <h3 className="text-base font-bold text-white">AI Fact & Threat Check</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Our models verify individual assertions against consensus records, evaluate sensational emotional tone, and check visual motions.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-[#1C1C22] border border-zinc-800 space-y-3 relative overflow-hidden transition-colors hover:border-[#D4AF37]/50"
          >
            <div className="flex items-center justify-between">
              <span className="h-8 w-8 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-sm flex items-center justify-center border border-[#D4AF37]/40">
                3
              </span>
              <span className="text-[11px] font-medium text-zinc-400">Clear Insights</span>
            </div>
            <h3 className="text-base font-bold text-white">Get a Clear Human Verdict</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Receive a simple, color-coded summary (Reliable, Suspicious, or Misleading) with highlighted sentences and trusted reference links.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Two Core Modules Grid */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Choose a Tool</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore Our Two Verification Modules
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
            Pick between text fact-checking or video/image threat detection depending on what you wish to verify.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module A: Misinformation */}
          <motion.div
            id="module-a-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-3xl bg-[#141417]/90 border border-zinc-800 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-6 group shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  <FileSearch size={28} />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#1C1C22] text-[#D4AF37] border border-[#D4AF37]/30">
                  Text & News Check
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                Misinformation & Claim Verification
              </h3>

              <p className="text-sm text-zinc-300 leading-relaxed">
                Analyzes submitted news articles, social media broadcasts, and viral claims. Automatically parses sentence-level assertions, evaluates empirical veracity against consensus, and outputs clear epistemic confidence ratings.
              </p>

              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>3-State Verdict: Likely Reliable, Suspicious, or Likely Misinformation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Sensationalism Index & Emotional Framing Analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Independent fact-checking citation recommendations (Reuters, WHO, AP)</span>
                </li>
              </ul>
            </div>

            <motion.button
              id="goto-misinfo-module-btn"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('misinformation')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#F59E0B] hover:brightness-110 text-black font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 transition-all"
            >
              <span>Check for Misinformation</span>
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>

          {/* Module B: Violence Detection */}
          <motion.div
            id="module-b-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-8 rounded-3xl bg-[#141417]/90 border border-zinc-800 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-6 group shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  <Video size={28} />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#1C1C22] text-[#D4AF37] border border-[#D4AF37]/30">
                  Image & Video Check
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                Violence & Threat Visual Detection
              </h3>

              <p className="text-sm text-zinc-300 leading-relaxed">
                Computer vision assessment for image uploads, video sequences, and device camera feeds. Detects kinetic fights, physical assaults, aggressive gestures, and weapon indicators while distinguishing safe baselines like sparring sports.
              </p>

              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Tri-modal support: Static Image, Video Slicing, and Live Webcam</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Temporal timeline with frame-by-frame risk timestamps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Privacy-preserving analysis with zero permanent facial recognition</span>
                </li>
              </ul>
            </div>

            <motion.button
              id="goto-violence-module-btn"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('violence')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#F59E0B] hover:brightness-110 text-black font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 transition-all"
            >
              <span>Check for Violence</span>
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* How AI Works Pipeline Component */}
      <HowAiWorksPipeline />
    </div>
  );
};

