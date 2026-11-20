import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  ArrowLeft,
  Download,
  Printer,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Check,
  Flag,
  XCircle,
  HelpCircle,
  ExternalLink,
  Building,
  Search,
  Globe,
  Info
} from 'lucide-react';
import { AnalysisRecord, PageId } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { BackButton } from '../components/BackButton';
import { apiClient } from '../services/api';

interface ResultDetailPageProps {
  analysis: AnalysisRecord | null;
  onNavigate: (page: PageId) => void;
  onSelectAnalysis: (record: AnalysisRecord) => void;
  onBack?: () => void;
  previousPageName?: string;
}

export const ResultDetailPage: React.FC<ResultDetailPageProps> = ({
  analysis,
  onNavigate,
  onSelectAnalysis,
  onBack,
  previousPageName
}) => {
  const [historyList, setHistoryList] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(analysis);
  const [humanReviewed, setHumanReviewed] = useState(false);
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (analysis) {
      setSelectedRecord(analysis);
    }
  }, [analysis]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const records = await apiClient.getHistory();
      setHistoryList(records);
      if (!selectedRecord && records.length > 0) {
        setSelectedRecord(records[0]);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!selectedRecord) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `safety_analysis_${selectedRecord.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFlagHumanReview = () => {
    setHumanReviewed(true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const renderVerdictBadge = (verdict?: string) => {
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
      {/* Top Bar */}
      <div className="flex flex-col gap-3">
        <div>
          <BackButton
            id="results-back-btn"
            onClick={onBack || (() => onNavigate('dashboard'))}
            label={previousPageName ? `Back to ${previousPageName}` : 'Back to Analyzer'}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Safety Analysis Reports & Evidence Dossier
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Complete audit trail, explainable AI factor breakdowns, and multi-source evidence verification records.
            </p>
          </div>

          {selectedRecord && (
            <div className="flex items-center gap-2">
              <button
                id="export-json-btn"
                onClick={handleDownloadJSON}
                className="px-3.5 py-2 rounded-xl bg-[#141417] hover:bg-[#1C1C22] border border-[#D4AF37]/30 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>

              <button
                id="print-report-btn"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-[#141417] hover:bg-[#1C1C22] border border-[#D4AF37]/30 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer size={14} />
                <span>Print / PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left History Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl bg-[#141417]/90 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Historical Records ({historyList.length})
              </span>
              <span className="text-[11px] text-[#D4AF37]">All Modules</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {historyList.map((item) => {
                const isSelected = selectedRecord?.id === item.id;
                return (
                  <button
                    key={item.id}
                    id={`history-item-${item.id}`}
                    onClick={() => setSelectedRecord(item)}
                    className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-[#1C1C22] border-[#D4AF37] text-white shadow-md shadow-amber-500/10'
                        : 'bg-[#0E0E11] border-zinc-800 text-zinc-400 hover:bg-[#141417] hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                        {item.module === 'misinformation' ? 'Module A (NLP)' : 'Module B (Vision)'}
                      </span>
                      <RiskBadge riskLevel={item.riskLevel} />
                    </div>

                    <p className="text-xs font-bold truncate text-white">{item.title}</p>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>Certainty: {item.confidenceScore}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Deep Report Pane */}
        <div className="lg:col-span-8 space-y-6">
          {selectedRecord ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141417]/95 border border-[#D4AF37]/30 space-y-8 shadow-xl backdrop-blur-md">
              {/* Verdict Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0E0E11] via-[#141417] to-[#0E0E11] border border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0E0E11] text-[#D4AF37] border border-[#D4AF37]/30">
                      {selectedRecord.module.toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">ID: {selectedRecord.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderVerdictBadge(selectedRecord.verdict || selectedRecord.classification)}
                    <RiskBadge riskLevel={selectedRecord.riskLevel} />
                  </div>
                </div>

                <h2 className="text-2xl font-black text-white">{selectedRecord.title}</h2>

                {selectedRecord.articleMetadata && (
                  <div className="p-3 rounded-xl bg-[#0E0E11] border border-zinc-800 text-xs text-zinc-300 space-y-1">
                    <div className="flex flex-wrap gap-4">
                      {selectedRecord.articleMetadata.publisher && (
                        <span>Publisher: <strong className="text-white">{selectedRecord.articleMetadata.publisher}</strong></span>
                      )}
                      {selectedRecord.articleMetadata.publicationDate && (
                        <span>Date: <span className="font-mono text-zinc-400">{selectedRecord.articleMetadata.publicationDate}</span></span>
                      )}
                      {selectedRecord.articleMetadata.author && (
                        <span>Author: <span className="text-zinc-400">{selectedRecord.articleMetadata.author}</span></span>
                      )}
                    </div>
                    {selectedRecord.articleMetadata.originalUrl && (
                      <div className="truncate">
                        <a
                          href={selectedRecord.articleMetadata.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#D4AF37] hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Globe size={11} /> {selectedRecord.articleMetadata.originalUrl}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {new Date(selectedRecord.createdAt).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={13} /> Operator: {selectedRecord.userName || 'Safety Analyst'}
                  </span>
                  {selectedRecord.isDemo && (
                    <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      Simulated Demonstration Record
                    </span>
                  )}
                </div>
              </div>

              {/* Raw Input Preview if available */}
              {selectedRecord.rawInputSnippet && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Source Monitored Content
                  </span>
                  <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap">
                    {selectedRecord.rawInputSnippet}
                  </div>
                </div>
              )}

              {/* Explainable AI Rationale */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#D4AF37]" />
                  <span>Explainable AI (XAI) Assessment</span>
                </span>
                <p className="text-sm text-zinc-200 leading-relaxed p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800">
                  {selectedRecord.explanation}
                </p>
              </div>

              {/* Key Indicators */}
              {selectedRecord.keyFactors && selectedRecord.keyFactors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Observed Risk Factors & Evidence Indicators
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedRecord.keyFactors.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#0E0E11] border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2"
                      >
                        <CheckCircle2 size={14} className="text-[#D4AF37] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Claims if Misinformation */}
              {selectedRecord.claims && selectedRecord.claims.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Claim Decomposition & Evidence Verification ({selectedRecord.claims.length})
                  </span>
                  <div className="space-y-3">
                    {selectedRecord.claims.map((claim) => (
                      <div
                        key={claim.id}
                        className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          {renderVerdictBadge(claim.status)}
                          <span className="font-mono text-zinc-400">Veracity: {claim.veracityScore}/100</span>
                        </div>
                        <p className="font-bold text-white text-sm">"{claim.claimText}"</p>
                        <p className="text-zinc-400 leading-relaxed">{claim.evidenceSummary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporting & Contradicting Evidence */}
              {((selectedRecord.supportingEvidence && selectedRecord.supportingEvidence.length > 0) ||
                (selectedRecord.contradictingEvidence && selectedRecord.contradictingEvidence.length > 0)) && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Supporting vs Contradicting Evidence Dossier
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRecord.supportingEvidence && selectedRecord.supportingEvidence.length > 0 && (
                      <div className="p-4 rounded-2xl bg-[#0E0E11] border border-emerald-500/30 space-y-2 text-xs">
                        <div className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Supporting Evidence
                        </div>
                        {selectedRecord.supportingEvidence.map((s, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-[#141417] border border-zinc-800">
                            <p className="text-zinc-200">{s.statement}</p>
                            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                              <span className="text-emerald-300 font-semibold">{s.sourcePublisher}</span>
                              {s.sourceUrl && s.sourceUrl !== '#' && (
                                <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline">
                                  Link
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedRecord.contradictingEvidence && selectedRecord.contradictingEvidence.length > 0 && (
                      <div className="p-4 rounded-2xl bg-[#0E0E11] border border-red-500/30 space-y-2 text-xs">
                        <div className="text-red-400 font-bold uppercase flex items-center gap-1.5">
                          <XCircle size={14} /> Contradicting / Debunking Evidence
                        </div>
                        {selectedRecord.contradictingEvidence.map((c, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-[#141417] border border-zinc-800">
                            <p className="text-zinc-200">{c.statement}</p>
                            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                              <span className="text-red-300 font-semibold">{c.sourcePublisher}</span>
                              {c.sourceUrl && c.sourceUrl !== '#' && (
                                <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline">
                                  Link
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fact Checks Found */}
              {selectedRecord.factChecks && selectedRecord.factChecks.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Building size={14} className="text-[#D4AF37]" /> Official Fact Checks from Fact Check Databases
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {selectedRecord.factChecks.map((fc, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#0E0E11] border border-zinc-800 space-y-1.5">
                        <div className="flex justify-between font-bold">
                          <span className="text-[#D4AF37]">{fc.publisher}</span>
                          <span className="text-amber-400">Rating: {fc.rating}</span>
                        </div>
                        <p className="text-zinc-200">"{fc.claim}"</p>
                        <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                          <span>{fc.reviewDate || 'Verified'}</span>
                          <a href={fc.url} target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline">
                            Read Article →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Sources */}
              {selectedRecord.sources && selectedRecord.sources.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Search size={14} className="text-[#D4AF37]" /> Retrieved Web Sources ({selectedRecord.sources.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                    {selectedRecord.sources.map((src) => (
                      <div key={src.id} className="p-3 rounded-xl bg-[#0E0E11] border border-zinc-800 space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span className="text-[#D4AF37] font-semibold">{src.sourceType}</span>
                          <span>{src.publishDate || 'Recent'}</span>
                        </div>
                        <p className="font-bold text-white truncate">{src.title}</p>
                        <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                          <span className="truncate max-w-[120px]">{src.publisher}</span>
                          <a href={src.url} target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline">
                            Visit →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Frames breakdown if present */}
              {selectedRecord.frameDetections && selectedRecord.frameDetections.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Sampled Video Frame Timeline ({selectedRecord.frameDetections.length} keyframes)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedRecord.frameDetections.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#0E0E11] border border-zinc-800 text-xs space-y-1"
                      >
                        <div className="flex justify-between items-center text-zinc-400">
                          <span className="font-mono text-[#D4AF37] font-bold">⏱ {f.timestampSeconds}s</span>
                          <span className="text-[11px] font-bold text-zinc-200">{f.category}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-zinc-500">
                          <span>Risk: {f.riskScore}/100</span>
                          <span>Conf: {f.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Human Oversight & Triage Section */}
              <div className="p-5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flag size={16} className="text-[#D4AF37]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Human Review & Operational Sign-off
                    </span>
                  </div>
                  {humanReviewed && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check size={14} /> Review Logged
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter analyst resolution notes or false positive context..."
                    className="w-full px-4 py-2 rounded-xl bg-[#141417] border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#D4AF37] placeholder:text-zinc-500"
                  />
                  <button
                    onClick={handleFlagHumanReview}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black font-bold text-xs shrink-0 cursor-pointer transition-all hover:brightness-110"
                  >
                    Confirm Human Review
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#141417]/60 border border-zinc-800 text-center space-y-2">
              <FileCheck2 size={36} className="mx-auto text-zinc-600" />
              <h3 className="text-base font-bold text-white">No Analysis Selected</h3>
              <p className="text-xs text-zinc-400">Select a record from the history list to inspect.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
