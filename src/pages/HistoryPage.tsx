import React, { useState, useEffect } from 'react';
import { PageId, AnalysisRecord, UserProfile } from '../types';
import { apiClient } from '../services/api';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  RefreshCw,
  Clock,
  Shield,
  Loader2,
  Calendar
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { BackButton } from '../components/BackButton';

interface HistoryPageProps {
  onNavigate: (page: PageId) => void;
  onSelectAnalysis: (record: AnalysisRecord) => void;
  user: UserProfile | null;
  onBack?: () => void;
  previousPageName?: string;
  savedDraft?: {
    filterType: string;
    searchQuery: string;
  };
  onSaveDraft?: (draft: {
    filterType: string;
    searchQuery: string;
  }) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onNavigate,
  onSelectAnalysis,
  user,
  onBack,
  previousPageName,
  savedDraft,
  onSaveDraft
}) => {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [filterType, setFilterType] = useState<string>(savedDraft?.filterType || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(savedDraft?.searchQuery || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync draft state to parent for restoration
  useEffect(() => {
    onSaveDraft?.({
      filterType,
      searchQuery
    });
  }, [filterType, searchQuery, onSaveDraft]);

  const loadHistory = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const data = await apiClient.getHistory(filterType, searchQuery);
      setRecords(data);
    } catch (err: any) {
      console.warn('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 250);
    return () => clearTimeout(timer);
  }, [filterType, searchQuery]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this analysis record?')) {
      return;
    }

    setDeletingId(id);
    try {
      await apiClient.deleteHistory(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setStatusMessage('Record removed successfully.');
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back Button & Header */}
      <div className="space-y-3 border-b border-zinc-800/80 pb-6">
        <div>
          <BackButton
            id="history-back-btn"
            onClick={onBack || (() => onNavigate('dashboard'))}
            label={previousPageName ? `Back to ${previousPageName}` : 'Back to Dashboard'}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
              <History className="w-4 h-4" /> Persistent SQLite Audit Log
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Analysis History & Case Records
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Review, inspect, filter, and manage historical AI misinformation and violence classifications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('misinformation')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] hover:brightness-110 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/10 self-start flex items-center gap-1.5 cursor-pointer"
          >
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-[#141417] border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-zinc-400 hover:text-white text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-[#141417]/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="history-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims, keywords, titles..."
            className="w-full bg-[#0E0E11] border border-zinc-700/70 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Records', icon: History },
            { id: 'misinformation', label: 'Misinformation (Text)', icon: FileText },
            { id: 'violence', label: 'Violence & Threat', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black shadow-md shadow-amber-500/10 font-bold'
                    : 'bg-[#0E0E11] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Records List */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#D4AF37]" />
          <p className="text-sm">Querying SQLite database records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-[#141417]/40 border border-zinc-800/60 rounded-2xl p-12 text-center text-zinc-400 space-y-3">
          <History className="w-10 h-10 mx-auto text-zinc-600 opacity-60" />
          <h3 className="text-base font-semibold text-white">No Analysis Records Found</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {searchQuery
              ? `No cases matched your search query "${searchQuery}". Try a different search term or clear the filter.`
              : 'No evaluation cases have been logged yet. Run a Text, Image, or Video analysis to populate the database.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('misinformation')}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Run First Analysis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {records.map((rec) => {
            const isText = rec.module === 'misinformation' || rec.sourceType === 'text';
            const isVideo = rec.sourceType === 'video';
            const isImage = rec.sourceType === 'image' || rec.sourceType === 'webcam';

            return (
              <div
                key={rec.id}
                onClick={() => {
                  onSelectAnalysis(rec);
                  onNavigate('results');
                }}
                className="group bg-[#141417]/90 hover:bg-[#1C1C22] border border-zinc-800 hover:border-[#D4AF37]/40 rounded-xl p-4 sm:p-5 transition-all shadow-md hover:shadow-xl cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0E0E11] text-[#D4AF37] text-[11px] font-semibold border border-[#D4AF37]/30">
                      {isText && <FileText className="w-3 h-3 text-[#D4AF37]" />}
                      {isImage && <ImageIcon className="w-3 h-3 text-amber-400" />}
                      {isVideo && <Video className="w-3 h-3 text-amber-300" />}
                      <span className="capitalize">{rec.sourceType || (isText ? 'text' : 'image')}</span>
                    </span>

                    <RiskBadge level={rec.riskLevel} score={rec.riskScore} size="sm" />

                    <span className="text-zinc-500 text-xs flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(rec.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                    {rec.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {rec.rawInputSnippet || rec.explanation}
                  </p>
                </div>

                {/* Right Side Stats & Actions */}
                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Risk Score</div>
                    <div className="text-lg font-bold text-white font-mono">
                      {rec.riskScore}<span className="text-xs font-normal text-zinc-500">/100</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
                    <button
                      type="button"
                      title="Inspect Details"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAnalysis(rec);
                        onNavigate('results');
                      }}
                      className="p-2 rounded-lg bg-[#0E0E11] hover:bg-[#1C1C22] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Delete Record"
                      disabled={deletingId === rec.id}
                      onClick={(e) => handleDelete(rec.id, e)}
                      className="p-2 rounded-lg bg-[#0E0E11] hover:bg-red-950/80 text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {deletingId === rec.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
