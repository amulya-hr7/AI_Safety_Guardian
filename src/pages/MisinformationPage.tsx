import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  FileSearch,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  ExternalLink,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  Globe,
  FileText,
  ShieldCheck,
  XCircle,
  Clock,
  Layers,
  Search,
  Building,
  Info,
  RotateCcw,
  Plus,
  Upload
} from 'lucide-react';
import { AnalysisRecord, ExtractedClaim, MisinformationVerdict, PageId, UserProfile } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { BackButton } from '../components/BackButton';
import { apiClient } from '../services/api';
import { loadMisinfoState, saveMisinfoState, clearMisinfoState, MisinfoSavedDraft } from '../services/misinfoStorage';
import confetti from 'canvas-confetti';

interface MisinformationPageProps {
  onNavigate: (page: PageId) => void;
  onSelectAnalysis: (record: AnalysisRecord) => void;
  user: UserProfile | null;
  isDemoMode: boolean;
  onBack?: () => void;
  previousPageName?: string;
  savedDraft?: MisinfoSavedDraft;
  onSaveDraft?: (draft: MisinfoSavedDraft) => void;
}

export const MisinformationPage: React.FC<MisinformationPageProps> = ({
  onNavigate,
  onSelectAnalysis,
  user,
  isDemoMode,
  onBack,
  previousPageName,
  savedDraft,
  onSaveDraft
}) => {
  // Priority: savedDraft prop from App, fallback to persistent localStorage
  const initialDraft = (savedDraft && (savedDraft.inputText || savedDraft.inputUrl || savedDraft.titleInput || savedDraft.currentResult))
    ? savedDraft
    : loadMisinfoState();

  const [inputMode, setInputMode] = useState<'text' | 'url'>(initialDraft.isUrlMode ? 'url' : 'text');
  const [textInput, setTextInput] = useState(initialDraft.inputText || '');
  const [urlInput, setUrlInput] = useState(initialDraft.inputUrl || '');
  const [titleInput, setTitleInput] = useState(initialDraft.titleInput || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisRecord | null>(initialDraft.currentResult || null);
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync draft state to parent and persistent storage whenever content or result changes
  useEffect(() => {
    const draft: MisinfoSavedDraft = {
      inputText: textInput,
      inputUrl: urlInput,
      isUrlMode: inputMode === 'url',
      titleInput,
      currentResult
    };
    onSaveDraft?.(draft);
    saveMisinfoState(draft);
  }, [textInput, urlInput, inputMode, titleInput, currentResult, onSaveDraft]);

  // Handle manual or dragged text file upload
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setTextInput(text);
        setInputMode('text');
        if (!titleInput.trim()) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTitleInput(cleanName);
        }
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the uploaded text file. Please try again or paste the text directly.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Start fresh new analysis, intentionally clearing previous content and result
  const handleNewAnalysis = () => {
    setTextInput('');
    setUrlInput('');
    setTitleInput('');
    setCurrentResult(null);
    setError(null);
    clearMisinfoState();
    onSaveDraft?.({
      inputText: '',
      inputUrl: '',
      isUrlMode: false,
      titleInput: '',
      currentResult: null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active sub-tab in results
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'all' | 'supporting' | 'contradicting' | 'factchecks' | 'sources'>('all');

  const testExamples: {
    label: string;
    category: string;
    type: 'text' | 'url';
    title: string;
    content: string;
  }[] = [
    {
      label: 'Factual News',
      category: 'Science',
      type: 'text',
      title: 'NASA James Webb Space Telescope Atmosphere Discovery',
      content:
        'NASA astronomers using the James Webb Space Telescope detected carbon dioxide and methane in the atmosphere of exoplanet K2-18b.'
    },
    {
      label: 'Debunked Conspiracy',
      category: 'Health',
      type: 'text',
      title: '5G Cellular Pathogen Transmission Claim',
      content:
        '5G microwave towers are actively lowering human hemoglobin oxygen absorption and directly transmitting synthetic viruses into urban populations.'
    },
    {
      label: 'Misleading / Out of Context',
      category: 'Finance',
      type: 'text',
      title: 'Federal Reserve ATM Immediate Shutdown Claim',
      content:
        'The Federal Reserve is shutting down all ATM networks tomorrow to confiscate private savings accounts and force people onto digital tokens.'
    },
    {
      label: 'Unverifiable Rumor',
      category: 'Speculation',
      type: 'text',
      title: 'Secret Underground Bunker Excavation Rumor',
      content:
        'An anonymous insider claims a private tech billionaire is secretly digging a 50-story subterranean tunnel system under Zurich without permits.'
    }
  ];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const isUrl = inputMode === 'url';
    const content = isUrl ? urlInput.trim() : textInput.trim();

    if (!content) {
      setError(
        isUrl
          ? 'Please enter a valid news article URL.'
          : 'Please enter article text, a single claim, or a headline.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await apiClient.analyzeMisinformation({
        text: isUrl ? undefined : content,
        url: isUrl ? content : undefined,
        isUrl,
        title: titleInput.trim() || undefined,
        isDemo: isDemoMode,
        userName: user?.name
      });

      // Update state with newly generated real result
      setCurrentResult(result);

      // Save the actual user content and newly generated result immediately to persistent storage
      const newDraft: MisinfoSavedDraft = {
        inputText: isUrl ? '' : content,
        inputUrl: isUrl ? content : '',
        isUrlMode: isUrl,
        titleInput: titleInput.trim(),
        currentResult: result
      };
      saveMisinfoState(newDraft);
      onSaveDraft?.(newDraft);

      if (result.verdict === 'LIKELY TRUE' || result.riskLevel === 'Low') {
        try {
          confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
        } catch {
          // confetti optional
        }
      }

      setTimeout(() => {
        const el = document.getElementById('misinformation-result-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'Evidence verification pipeline encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExample = (ex: (typeof testExamples)[0]) => {
    setInputMode(ex.type);
    setTitleInput(ex.title);
    if (ex.type === 'url') {
      setUrlInput(ex.content);
      setTextInput('');
    } else {
      setTextInput(ex.content);
      setUrlInput('');
    }
    // When switching to a test example, clear any prior result so user can run fresh
    setCurrentResult(null);
    setError(null);
  };

  const handleCopyExplanation = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult.explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderVerdictBadge = (verdict?: MisinformationVerdict | string) => {
    const v = (verdict || 'UNVERIFIED').toUpperCase();
    if (v === 'LIKELY TRUE' || v === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs uppercase tracking-wider shadow-sm">
          <CheckCircle2 size={14} className="text-emerald-400" />
          LIKELY TRUE
        </span>
      );
    }
    if (v === 'LIKELY FALSE' || v === 'FALSE' || v === 'DEBUNKED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 font-extrabold text-xs uppercase tracking-wider shadow-sm">
          <XCircle size={14} className="text-red-400" />
          LIKELY FALSE
        </span>
      );
    }
    if (v === 'MISLEADING' || v === 'DISPUTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-extrabold text-xs uppercase tracking-wider shadow-sm">
          <AlertTriangle size={14} className="text-amber-400" />
          MISLEADING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-500/15 border border-zinc-500/40 text-zinc-300 font-extrabold text-xs uppercase tracking-wider shadow-sm">
        <HelpCircle size={14} className="text-zinc-400" />
        UNVERIFIED
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Back Button & Page Title */}
      <div className="space-y-3 border-b border-zinc-800/80 pb-6">
        <div>
          <BackButton
            id="misinformation-back-btn"
            onClick={onBack || (() => onNavigate('dashboard'))}
            label={previousPageName ? `Back to ${previousPageName}` : 'Back to Dashboard'}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                <FileSearch size={22} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Evidence-Based Misinformation Analyzer
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Live multi-source verification pipeline powered by Google Search Grounding and official Fact-Check databases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-[#141417] border border-[#D4AF37]/30 text-zinc-300 font-mono">
              Pipeline: <strong className="text-[#D4AF37]">Evidence Retrieval & Fact-Check Grounding</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Benchmark Claims & Samples */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#D4AF37]/80 uppercase tracking-wider">
            Verification Test Cases
          </span>
          <span className="text-xs text-[#D4AF37]">Click to test pipeline</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {testExamples.map((sample, idx) => (
            <button
              key={`test-sample-${idx}-${sample.title.slice(0, 15)}`}
              id={`sample-misinfo-${idx + 1}`}
              type="button"
              onClick={() => handleSelectExample(sample)}
              className="p-3.5 rounded-2xl bg-[#141417]/90 hover:bg-[#1C1C22] border border-zinc-800 text-left cursor-pointer transition-all hover:border-[#D4AF37]/60 space-y-1.5 flex flex-col justify-between shadow-lg hover:shadow-amber-500/10 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30">
                  {sample.label}
                </span>
                <Sparkles size={13} className="text-[#D4AF37]/60 group-hover:text-[#D4AF37]" />
              </div>
              <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-200">
                {sample.title}
              </p>
              <p className="text-[11px] text-zinc-400 line-clamp-2">{sample.content}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Persistent Session Restore Indicator */}
      {currentResult && (
        <div
          id="misinfo-restored-indicator"
          className="p-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/15 via-[#16161B] to-[#141417] border border-[#D4AF37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#D4AF37] block sm:inline mr-2">
                Latest Analysis Restored:
              </span>
              <span className="text-xs text-zinc-200 font-medium truncate inline-block max-w-[300px] sm:max-w-[450px] align-bottom">
                {currentResult.title}
              </span>
            </div>
          </div>
          <button
            id="misinfo-banner-new-analysis-btn"
            type="button"
            onClick={handleNewAnalysis}
            className="px-3 py-1.5 rounded-xl bg-[#1C1C22] hover:bg-[#25252D] text-xs text-zinc-200 hover:text-white border border-zinc-700 hover:border-[#D4AF37]/50 font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-sm"
          >
            <Plus size={13} className="text-[#D4AF37]" />
            <span>Start New Analysis</span>
          </button>
        </div>
      )}

      {/* Input Form Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#141417]/95 border border-[#D4AF37]/25 shadow-2xl space-y-6 backdrop-blur-md">
        {/* Input Mode Selector */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex bg-[#0E0E11] p-1 rounded-xl border border-zinc-800">
            <button
              id="input-mode-text"
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                inputMode === 'text'
                  ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText size={14} />
              <span>Text / Claim / Headline</span>
            </button>

            <button
              id="input-mode-url"
              type="button"
              onClick={() => setInputMode('url')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                inputMode === 'url'
                  ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe size={14} />
              <span>Article Web URL</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck size={14} className="text-[#D4AF37]" />
            <span>Strict Evidence-First Verification</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-xs sm:text-sm text-red-300 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="font-bold">Verification Notice</p>
                <p className="text-xs text-red-200/90 mt-0.5">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {inputMode === 'url' && (
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('text');
                    setError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer"
                >
                  Paste Text Instead
                </button>
              )}
              <button
                type="button"
                onClick={() => handleAnalyze()}
                className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} /> Retry
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Optional Headline / Article Title
            </label>
            <input
              id="misinfo-title-input"
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="e.g. Breaking News Headline, Social Post Topic, or Medical Announcement"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0E0E11] border border-zinc-800 focus:border-[#D4AF37] text-sm text-white focus:outline-none placeholder-zinc-500 transition-colors"
            />
          </div>

          {inputMode === 'text' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Article Body, Single Factual Claim, or Breaking Headline *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".txt,.md,.text,.json,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    id="btn-upload-text-file"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-[#D4AF37] hover:text-white hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Upload size={12} />
                    <span>Upload Text/Article File</span>
                  </button>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {textInput.length} chars
                  </span>
                </div>
              </div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`relative rounded-2xl transition-all ${
                  isDragOver ? 'ring-2 ring-[#D4AF37] bg-amber-500/5' : ''
                }`}
              >
                <textarea
                  id="misinfo-text-input"
                  rows={5}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste news article paragraphs, a viral claim, tweet, WhatsApp broadcast, or headline (or drag & drop a text file here)..."
                  className="w-full p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 focus:border-[#D4AF37] text-sm text-white focus:outline-none leading-relaxed placeholder-zinc-500 transition-colors font-sans"
                  required
                />
                {isDragOver && (
                  <div className="absolute inset-0 rounded-2xl bg-black/75 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                    <p className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                      <Upload size={16} /> Drop text file to load article content
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Direct News Article URL *
                </label>
                <span className="text-[11px] text-zinc-500">
                  HTTP/HTTPS article web link
                </span>
              </div>
              <div className="relative">
                <input
                  id="misinfo-url-input"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.reuters.com/world/... or https://bbc.com/news/..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0E0E11] border border-zinc-800 focus:border-[#D4AF37] text-sm text-white focus:outline-none placeholder-zinc-500 transition-colors font-mono"
                  required
                />
                <Globe size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
              </div>
              <p className="text-[11px] text-zinc-400">
                The server will fetch the article text, publisher metadata, and date, then verify claims against live independent sources.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 size={15} className="text-[#D4AF37]" />
              <span>Multi-source search grounding • Independent fact-check lookup</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {(textInput || urlInput || titleInput || currentResult) && (
                <button
                  id="misinfo-clear-btn"
                  type="button"
                  onClick={handleNewAnalysis}
                  className="px-4 py-2.5 rounded-xl bg-[#1C1C22] hover:bg-[#25252D] text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={13} className="text-zinc-400" />
                  <span>{currentResult ? 'New Analysis / Clear' : 'Clear'}</span>
                </button>
              )}

              <button
                id="submit-misinfo-analysis-btn"
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#F59E0B] hover:brightness-110 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-black" />
                    <span>Searching Web Evidence & Fact-Checks...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Verify with Live Evidence Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Analysis Results View */}
      {currentResult && (
        <div
          id="misinformation-result-section"
          className="p-6 sm:p-8 rounded-3xl bg-[#141417]/95 border border-[#D4AF37]/30 space-y-8 shadow-2xl backdrop-blur-md animate-fade-in"
        >
          {/* Header Verdict Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 rounded-2xl bg-gradient-to-r from-[#0E0E11] via-[#16161B] to-[#0E0E11] border border-[#D4AF37]/40 shadow-inner">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF37]">
                  Final Verification Verdict
                </span>
                {renderVerdictBadge(currentResult.verdict || currentResult.classification)}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {currentResult.title}
              </h2>
              {currentResult.articleMetadata?.publisher && (
                <p className="text-xs text-zinc-400">
                  Publisher: <strong className="text-zinc-200">{currentResult.articleMetadata.publisher}</strong>
                  {currentResult.articleMetadata.publicationDate && (
                    <span> • Date: <span className="text-zinc-300 font-mono">{currentResult.articleMetadata.publicationDate}</span></span>
                  )}
                  {currentResult.articleMetadata.originalUrl && (
                    <a
                      href={currentResult.articleMetadata.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-[#D4AF37] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Original Link</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#0E0E11] border border-zinc-800 text-center min-w-28">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Confidence</span>
                <span className="text-2xl font-black font-mono text-[#D4AF37]">
                  {currentResult.confidenceScore}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#0E0E11] border border-zinc-800 text-center min-w-28">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Sensationalism</span>
                <span className="text-2xl font-black font-mono text-white">
                  {currentResult.sensationalismIndex ?? 15}<span className="text-xs text-zinc-500 font-normal">/100</span>
                </span>
              </div>
              <RiskBadge riskLevel={currentResult.riskLevel} />

              <button
                id="misinfo-result-header-new-btn"
                type="button"
                onClick={handleNewAnalysis}
                className="p-3 rounded-2xl bg-[#1C1C22] hover:bg-[#25252D] text-zinc-200 hover:text-white border border-zinc-700 hover:border-[#D4AF37]/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                title="Start a new analysis and clear current result"
              >
                <Plus size={15} className="text-[#D4AF37]" />
                <span>New Analysis</span>
              </button>
            </div>
          </div>

          {/* Search Failure Handling Notification */}
          {currentResult.searchFailed && (
            <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-300 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <HelpCircle size={18} className="text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Evidence Retrieval Notice</p>
                  <p className="text-zinc-300 mt-0.5">
                    {currentResult.explanation}
                  </p>
                  {currentResult.searchFailedReason && (
                    <p className="text-[11px] text-zinc-400 font-mono mt-1">
                      Reason: {currentResult.searchFailedReason}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAnalyze()}
                className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-xs font-bold text-[#D4AF37] flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RotateCcw size={13} /> Retry Verification
              </button>
            </div>
          )}

          {/* Evidence-First Explanation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-[#D4AF37]" />
                <span>Evidence-First Verification Explanation</span>
              </h3>
              <button
                onClick={handleCopyExplanation}
                className="text-xs text-zinc-400 hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Explanation'}</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E0E11]/90 border border-zinc-800 text-sm text-zinc-200 leading-relaxed space-y-3">
              <p>{currentResult.explanation}</p>

              {currentResult.keyFactors && currentResult.keyFactors.length > 0 && (
                <div className="pt-3 border-t border-zinc-800/80 space-y-1.5">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
                    Observed Key Evidence Factors:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                    {currentResult.keyFactors.map((factor, fIdx) => (
                      <li key={`key-factor-${fIdx}-${factor.slice(0, 25)}`} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Extracted Factual Claims Breakdown */}
          {currentResult.claims && currentResult.claims.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-[#D4AF37]" />
                  <span>Extracted Factual Claims ({currentResult.claims.length})</span>
                </h3>
              </div>

              <div className="space-y-3">
                {currentResult.claims.map((claim, cIdx) => (
                  <div
                    key={claim.id || `claim-item-${cIdx}-${claim.claimText?.slice(0, 20)}`}
                    className="p-4 rounded-2xl bg-[#0E0E11]/90 border border-zinc-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {renderVerdictBadge(claim.status)}
                        <span className="text-xs text-zinc-400 font-mono">
                          Veracity Score: {claim.veracityScore}/100
                        </span>
                      </div>
                      {claim.needsFactCheck && (
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <AlertTriangle size={12} /> Independent Review Recommended
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-white">
                      "{claim.claimText}"
                    </p>

                    <p className="text-xs text-zinc-300 leading-relaxed bg-[#141417] p-3 rounded-xl border border-zinc-800">
                      <strong className="text-[#D4AF37]">Evidence Consensus:</strong> {claim.evidenceSummary}
                    </p>

                    {claim.suggestedSources && claim.suggestedSources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-semibold text-zinc-400">
                          Primary Sources Consulted:
                        </span>
                        {claim.suggestedSources.map((src, sIdx) => (
                          <span
                            key={`claim-source-${claim.id || cIdx}-${sIdx}-${src.slice(0, 20)}`}
                            className="px-2 py-0.5 rounded bg-[#141417] text-[11px] text-[#D4AF37] border border-[#D4AF37]/30"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Navigation Tabs (Supporting vs Contradicting vs Fact-Checks vs Verified Sources) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-[#D4AF37]" />
                <span>Evidence & Verified Sources Dossier</span>
              </h3>

              <div className="flex gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveEvidenceTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeEvidenceTab === 'all'
                      ? 'bg-[#D4AF37] text-black font-bold'
                      : 'bg-[#0E0E11] text-zinc-400 hover:text-white'
                  }`}
                >
                  All Evidence
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEvidenceTab('supporting')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeEvidenceTab === 'supporting'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-[#0E0E11] text-zinc-400 hover:text-white'
                  }`}
                >
                  Supporting ({currentResult.supportingEvidence?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEvidenceTab('contradicting')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeEvidenceTab === 'contradicting'
                      ? 'bg-red-500 text-white font-bold'
                      : 'bg-[#0E0E11] text-zinc-400 hover:text-white'
                  }`}
                >
                  Contradicting ({currentResult.contradictingEvidence?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEvidenceTab('factchecks')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeEvidenceTab === 'factchecks'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-[#0E0E11] text-zinc-400 hover:text-white'
                  }`}
                >
                  Fact Checks ({currentResult.factChecks?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEvidenceTab('sources')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeEvidenceTab === 'sources'
                      ? 'bg-[#D4AF37] text-black font-bold'
                      : 'bg-[#0E0E11] text-zinc-400 hover:text-white'
                  }`}
                >
                  Sources ({currentResult.sources?.length || 0})
                </button>
              </div>
            </div>

            {/* Supporting & Contradicting Grid */}
            {(activeEvidenceTab === 'all' || activeEvidenceTab === 'supporting' || activeEvidenceTab === 'contradicting') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supporting Evidence Box */}
                {(activeEvidenceTab === 'all' || activeEvidenceTab === 'supporting') && (
                  <div className="p-4 rounded-2xl bg-[#0E0E11] border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 size={16} />
                      <span>Supporting Evidence</span>
                    </div>

                    {currentResult.supportingEvidence && currentResult.supportingEvidence.length > 0 ? (
                      <div className="space-y-2.5">
                        {currentResult.supportingEvidence.map((item, idx) => (
                          <div
                            key={item.id || `sup-evidence-${idx}-${item.sourcePublisher}`}
                            className="p-3 rounded-xl bg-[#141417] border border-zinc-800 text-xs space-y-1.5"
                          >
                            <p className="text-zinc-200">{item.statement}</p>
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                              <span className="font-semibold text-emerald-300">{item.sourcePublisher}</span>
                              {item.sourceUrl && item.sourceUrl !== '#' && (
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#D4AF37] hover:underline flex items-center gap-1"
                                >
                                  <span>View Source</span>
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No direct supporting evidence found.</p>
                    )}
                  </div>
                )}

                {/* Contradicting Evidence Box */}
                {(activeEvidenceTab === 'all' || activeEvidenceTab === 'contradicting') && (
                  <div className="p-4 rounded-2xl bg-[#0E0E11] border border-red-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                      <XCircle size={16} />
                      <span>Contradicting / Debunking Evidence</span>
                    </div>

                    {currentResult.contradictingEvidence && currentResult.contradictingEvidence.length > 0 ? (
                      <div className="space-y-2.5">
                        {currentResult.contradictingEvidence.map((item, idx) => (
                          <div
                            key={item.id || `con-evidence-${idx}-${item.sourcePublisher}`}
                            className="p-3 rounded-xl bg-[#141417] border border-zinc-800 text-xs space-y-1.5"
                          >
                            <p className="text-zinc-200">{item.statement}</p>
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                              <span className="font-semibold text-red-300">{item.sourcePublisher}</span>
                              {item.sourceUrl && item.sourceUrl !== '#' && (
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#D4AF37] hover:underline flex items-center gap-1"
                                >
                                  <span>View Source</span>
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No contradicting evidence found.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Official Fact-Checks from DB */}
            {(activeEvidenceTab === 'all' || activeEvidenceTab === 'factchecks') &&
              currentResult.factChecks &&
              currentResult.factChecks.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#0E0E11] border border-[#D4AF37]/30 space-y-3">
                  <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
                    <Building size={16} />
                    <span>Official Fact-Check Database Matches ({currentResult.factChecks.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentResult.factChecks.map((fc, idx) => (
                      <div
                        key={`factcheck-${idx}-${fc.publisher}-${fc.url || ''}`}
                        className="p-3.5 rounded-xl bg-[#141417] border border-zinc-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#D4AF37]">{fc.publisher}</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                            Rating: {fc.rating}
                          </span>
                        </div>
                        <p className="text-white font-medium">"{fc.claim}"</p>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                          <span>{fc.reviewDate || 'Verified'}</span>
                          <a
                            href={fc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#D4AF37] hover:underline flex items-center gap-1"
                          >
                            <span>Read Fact-Check</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Verified Sources List */}
            {(activeEvidenceTab === 'all' || activeEvidenceTab === 'sources') &&
              currentResult.sources &&
              currentResult.sources.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                    <Search size={16} className="text-[#D4AF37]" />
                    <span>Retrieved Verified Web Sources ({currentResult.sources.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {currentResult.sources.map((src, idx) => (
                      <div
                        key={src.id || `verified-source-${idx}-${src.url || src.publisher}`}
                        className="p-3 rounded-xl bg-[#141417] border border-zinc-800 text-xs space-y-1.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[#D4AF37] font-semibold">
                              {src.sourceType}
                            </span>
                            <span>{src.publishDate || 'Recent'}</span>
                          </div>
                          <p className="font-bold text-white text-xs line-clamp-1">{src.title}</p>
                          <p className="text-zinc-400 text-[11px] line-clamp-2 mt-0.5">{src.snippet}</p>
                        </div>
                        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-mono truncate max-w-[120px]">
                            {src.publisher}
                          </span>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>Visit</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Important Caveats */}
            {currentResult.caveats && currentResult.caveats.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                  <Info size={14} className="text-[#D4AF37]" />
                  <span>Important Verification Notes & Caveats:</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-zinc-400 text-[11px]">
                  {currentResult.caveats.map((c, idx) => (
                    <li key={`caveat-item-${idx}-${c.slice(0, 25)}`}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800">
            <span className="text-xs text-zinc-400">
              Audit ID: <span className="font-mono text-white">{currentResult.id}</span>
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                id="misinfo-bottom-new-analysis-btn"
                type="button"
                onClick={handleNewAnalysis}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1C1C22] hover:bg-[#25252D] text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus size={14} className="text-[#D4AF37]" />
                <span>New Analysis</span>
              </button>

              <button
                id="open-results-detail-btn"
                type="button"
                onClick={() => {
                  onSelectAnalysis(currentResult);
                  onNavigate('results');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0E0E11] hover:bg-[#1C1C22] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Open Complete Safety Dossier</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
