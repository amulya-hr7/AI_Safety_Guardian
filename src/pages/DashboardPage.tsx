import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  Video,
  ShieldAlert,
  TrendingUp,
  Activity,
  ArrowRight,
  RefreshCw,
  Sparkles,
  BellRing,
  AlertCircle,
  FolderOpen,
  Plus
} from 'lucide-react';
import { AnalysisRecord, DashboardStats, PageId } from '../types';
import { StatsCard } from '../components/StatsCard';
import { RiskBadge } from '../components/RiskBadge';
import { apiClient } from '../services/api';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onSelectAnalysis: (record: AnalysisRecord) => void;
  isDemoMode: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectAnalysis,
  isDemoMode
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await apiClient.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err);
      setError(err?.message || 'Unable to connect to the analysis engine.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div id="dashboard-loading-state" className="space-y-8 pb-12 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-[#1C1C22] rounded-xl" />
            <div className="h-4 w-96 max-w-full bg-[#1C1C22]/60 rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-[#1C1C22] rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-[#141417]/80 border border-zinc-800 p-6 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-[#1C1C22] rounded" />
                <div className="h-8 w-8 bg-[#1C1C22] rounded-xl" />
              </div>
              <div className="h-8 w-16 bg-[#1C1C22] rounded-lg" />
              <div className="h-3 w-32 bg-[#1C1C22]/60 rounded" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-3xl bg-[#141417]/80 border border-zinc-800 p-6" />
          <div className="lg:col-span-2 h-80 rounded-3xl bg-[#141417]/80 border border-zinc-800 p-6" />
        </div>

        <div className="flex items-center justify-center py-6 text-zinc-400 gap-2">
          <RefreshCw className="animate-spin text-[#D4AF37]" size={18} />
          <span className="text-xs font-semibold">Querying SQLite Database & Analytics Engine...</span>
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (error || !stats) {
    return (
      <div id="dashboard-error-state" className="py-16 px-4 max-w-2xl mx-auto text-center space-y-6">
        <div className="p-4 rounded-3xl bg-red-950/40 border border-red-500/30 inline-flex text-red-400 mb-2">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Database Service Unavailable</h2>
          <p className="text-sm text-zinc-400">
            {error || 'An unexpected communication error occurred while connecting to the analytics backend.'}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 text-xs text-zinc-400 font-mono text-left">
          <p className="text-zinc-200 font-semibold mb-1">Diagnostics:</p>
          <p>• API Route: GET /api/dashboard/stats</p>
          <p>• Database: SQLite (database.sqlite)</p>
          <p>• Status: Connection interrupted</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            id="dashboard-retry-btn"
            onClick={fetchStats}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:brightness-110 shadow-lg shadow-amber-500/10"
          >
            <RefreshCw size={15} />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // Real Database Calculated Values
  const totalAnalyses = stats.totalAnalyses;
  const misinformationCount = stats.misinformationCount;
  const violenceCount = stats.violenceCount;
  const highRiskAlertsCount = stats.highRiskAlertsCount;
  const hasRecords = totalAnalyses > 0;

  const lowCount = stats.riskDistribution.low || 0;
  const modCount = stats.riskDistribution.moderate || 0;
  const highCount = stats.riskDistribution.high || 0;
  const critCount = stats.riskDistribution.critical || 0;

  const riskTotal = lowCount + modCount + highCount + critCount || 1;
  const lowPct = hasRecords ? Math.round((lowCount / riskTotal) * 100) : 0;
  const modPct = hasRecords ? Math.round((modCount / riskTotal) * 100) : 0;
  const highPct = hasRecords ? Math.round((highCount / riskTotal) * 100) : 0;
  const critPct = hasRecords ? Math.round((critCount / riskTotal) * 100) : 0;

  const highRiskPercent = stats.highRiskPercentage ?? (hasRecords ? Math.round(((highCount + critCount) / totalAnalyses) * 1000) / 10 : 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Safety Intelligence Dashboard
            </h1>
            {isDemoMode && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Demo Mode Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Dynamic SQLite analytics metrics, risk distribution, and threat triage stream across NLP & Computer Vision models.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="dashboard-refresh-btn"
            onClick={handleRefresh}
            className="min-h-[44px] p-2.5 px-3 rounded-xl bg-[#141417] hover:bg-[#1C1C22] border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-[#D4AF37]' : ''} />
            <span>Refresh Data</span>
          </button>

          <button
            id="dashboard-new-scan-btn"
            onClick={() => onNavigate('misinformation')}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer transition-all"
          >
            <Sparkles size={15} />
            <span>New Safety Scan</span>
          </button>
        </div>
      </div>

      {/* High-Risk Alert Notice Banner if any active */}
      {stats.activeAlerts && stats.activeAlerts.length > 0 && (
        <div
          id="dashboard-alert-banner"
          className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-[#141417] to-[#0E0E11] border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
              <BellRing size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">High-Risk Threat Alert</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/30 text-white font-mono font-bold">
                  {stats.activeAlerts.length} Unresolved
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                {stats.activeAlerts[0]?.title} — High risk indicators detected in database.
              </p>
            </div>
          </div>

          <button
            id="banner-view-alerts-btn"
            onClick={() => onNavigate('alerts')}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-sm"
          >
            <span>Triage Alerts</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Primary KPI Stats Grid (Real SQLite Database Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          id="stat-card-total"
          title="Total Analyses"
          value={totalAnalyses}
          subtitle={hasRecords ? `${misinformationCount} text · ${violenceCount} visual` : '0 analyses recorded'}
          icon={Activity}
          color="gold"
          badgeText="Database"
        />

        <StatsCard
          id="stat-card-misinfo"
          title="Misinformation Evaluated"
          value={misinformationCount}
          subtitle={hasRecords ? 'NLP claims & news posts' : 'No NLP claims scanned'}
          icon={FileSearch}
          color="gold"
          badgeText="NLP Engine"
          onClick={() => onNavigate('misinformation')}
        />

        <StatsCard
          id="stat-card-violence"
          title="Violence Scans"
          value={violenceCount}
          subtitle={hasRecords ? 'Images, video & webcam' : 'No visual media scanned'}
          icon={Video}
          color="gold"
          badgeText="CV Engine"
          onClick={() => onNavigate('violence')}
        />

        <StatsCard
          id="stat-card-alerts"
          title="High-Risk Alerts"
          value={highRiskAlertsCount}
          subtitle={hasRecords ? `${highRiskPercent}% overall threat rate` : '0 threats flagged'}
          icon={ShieldAlert}
          color="red"
          badgeText="Threat Triage"
          onClick={() => onNavigate('alerts')}
        />
      </div>

      {/* Analytics & Risk Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="p-6 rounded-3xl bg-[#141417]/90 border border-zinc-800 space-y-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Risk Distribution</h3>
              <p className="text-xs text-zinc-400">Severity breakdown across SQLite records</p>
            </div>
            <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <TrendingUp size={18} />
            </div>
          </div>

          {/* Proportional Multi-color Bar */}
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded-full bg-[#0E0E11] overflow-hidden flex border border-zinc-800">
              {hasRecords ? (
                <>
                  <div style={{ width: `${lowPct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Low: ${lowPct}%`} />
                  <div style={{ width: `${modPct}%` }} className="bg-amber-500 transition-all duration-500" title={`Moderate: ${modPct}%`} />
                  <div style={{ width: `${highPct}%` }} className="bg-orange-500 transition-all duration-500" title={`High: ${highPct}%`} />
                  <div style={{ width: `${critPct}%` }} className="bg-red-500 transition-all duration-500" title={`Critical: ${critPct}%`} />
                </>
              ) : (
                <div className="w-full bg-zinc-800/40 text-center text-[9px] text-zinc-500 py-0.5">Empty</div>
              )}
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
              <span>0%</span>
              <span>{hasRecords ? '100% Calibrated' : 'No records yet'}</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-300 font-medium">Low / Likely Reliable</span>
              </div>
              <span className="font-mono font-bold text-white">{lowCount} ({lowPct}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-zinc-300 font-medium">Moderate / Suspicious</span>
              </div>
              <span className="font-mono font-bold text-white">{modCount} ({modPct}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span className="text-zinc-300 font-medium">High Threat</span>
              </div>
              <span className="font-mono font-bold text-white">{highCount} ({highPct}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-zinc-300 font-medium">Critical Misinfo / Assault</span>
              </div>
              <span className="font-mono font-bold text-white">{critCount} ({critPct}%)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0E0E11] border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
            <span>Average Model Certainty:</span>
            <span className="font-mono font-bold text-[#D4AF37]">{hasRecords ? `${stats.averageConfidence}%` : 'N/A'}</span>
          </div>
        </div>

        {/* Quick Launch & Recent Analysis Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quick Misinfo Card */}
            <div
              onClick={() => onNavigate('misinformation')}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#141417] via-[#1C1C22] to-[#0E0E11] border border-zinc-800 hover:border-[#D4AF37]/50 transition-all cursor-pointer group space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  <FileSearch size={22} />
                </div>
                <span className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Launch &rarr;
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Scan Text / News Claim</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  NLP claim extraction, factual stance checking & sensationalism scoring.
                </p>
              </div>
            </div>

            {/* Quick Violence Card */}
            <div
              onClick={() => onNavigate('violence')}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#141417] via-[#1C1C22] to-[#0E0E11] border border-zinc-800 hover:border-[#D4AF37]/50 transition-all cursor-pointer group space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  <Video size={22} />
                </div>
                <span className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Launch &rarr;
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Scan Visual Media / Cam</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Computer vision fighting, assault, and weapon indicator detection.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Analysis Stream (Derived directly from SQLite Database) */}
          <div className="p-6 rounded-3xl bg-[#141417]/90 border border-zinc-800 space-y-4 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Recent Analysis Stream</h3>
                <p className="text-xs text-zinc-400">Latest inferences processed by the safety engine</p>
              </div>
              {hasRecords && (
                <button
                  onClick={() => onNavigate('history')}
                  className="text-xs text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                >
                  View Full History &rarr;
                </button>
              )}
            </div>

            {stats.recentAnalyses && stats.recentAnalyses.length > 0 ? (
              <div className="space-y-2.5">
                {stats.recentAnalyses.map((record) => (
                  <div
                    key={record.id}
                    id={`recent-item-${record.id}`}
                    onClick={() => {
                      onSelectAnalysis(record);
                      onNavigate('results');
                    }}
                    className="p-3.5 rounded-2xl bg-[#0E0E11] hover:bg-[#1C1C22] border border-zinc-800/80 hover:border-[#D4AF37]/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          record.module === 'misinformation'
                            ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {record.module === 'misinformation' ? <FileSearch size={16} /> : <Video size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{record.title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span className="capitalize">{record.module}</span>
                          <span>•</span>
                          <span>{new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span className="font-mono">Conf: {record.confidenceScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <RiskBadge level={record.riskLevel} score={record.riskScore} size="sm" />
                      <span className="text-zinc-500">&rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* If there are no records, show: "No analyses performed yet." */
              <div
                id="dashboard-empty-state"
                className="py-12 px-6 rounded-2xl bg-[#0E0E11] border border-dashed border-zinc-800 text-center space-y-4"
              >
                <div className="p-3 rounded-2xl bg-[#141417] border border-zinc-800 text-zinc-400 inline-flex">
                  <FolderOpen size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">No analyses performed yet.</h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    The SQLite database is clean and ready. Submit your first text claim or visual media to view real-time statistics and threat intelligence.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigate('misinformation')}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1C1C22] hover:bg-[#27272A] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Scan Misinformation</span>
                  </button>
                  <button
                    onClick={() => onNavigate('violence')}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:brightness-110 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Scan Visual Threats</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
