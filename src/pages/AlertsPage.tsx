import React, { useState, useEffect } from 'react';
import {
  BellRing,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Filter,
  Search,
  Check,
  RefreshCw,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { AlertItem, PageId, UserProfile } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { BackButton } from '../components/BackButton';
import { apiClient } from '../services/api';

interface AlertsPageProps {
  onNavigate: (page: PageId) => void;
  user: UserProfile | null;
  onBack?: () => void;
  previousPageName?: string;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  onNavigate,
  user,
  onBack,
  previousPageName
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAlerts(statusFilter);
      setAlerts(data);
      if (!selectedAlert && data.length > 0) {
        setSelectedAlert(data[0]);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: AlertItem['status']) => {
    if (!selectedAlert) return;
    setUpdating(true);
    try {
      const updated = await apiClient.resolveAlert(
        selectedAlert.id,
        newStatus,
        resolveNotes || undefined,
        user?.name || 'Safety Officer'
      );
      setSelectedAlert(updated);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setResolveNotes('');
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery) return true;
    return (
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="space-y-3">
        <div>
          <BackButton
            id="alerts-back-btn"
            onClick={onBack || (() => onNavigate('dashboard'))}
            label={previousPageName ? `Back to ${previousPageName}` : 'Back to Dashboard'}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                <BellRing size={22} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                High-Risk Alert Management System
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Real-time high-risk detection log, analyst triage workflow, and incident audit trail.
            </p>
          </div>

          <button
            onClick={fetchAlerts}
            className="p-2.5 rounded-xl bg-[#141417] hover:bg-[#1C1C22] border border-[#D4AF37]/30 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Alerts</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#141417]/80 border border-zinc-800 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['all', 'Active', 'Investigating', 'Resolved', 'False Positive'].map((status) => (
            <button
              key={status}
              id={`filter-status-${status.toLowerCase()}`}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer transition-all ${
                statusFilter === status
                  ? 'bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]'
                  : 'bg-[#0E0E11] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {status === 'all' ? 'All Alerts' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by title or category..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#0E0E11] border border-zinc-800 focus:border-[#D4AF37] text-xs text-white focus:outline-none placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Main Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-6 space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              return (
                <div
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                    isSelected
                      ? 'bg-[#141417] border-[#D4AF37] shadow-lg shadow-amber-500/10'
                      : 'bg-[#141417]/60 hover:bg-[#141417] border-zinc-800 hover:border-[#D4AF37]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          alert.status === 'Active'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : alert.status === 'Investigating'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {alert.status}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {alert.module === 'misinformation' ? 'NLP Misinformation' : 'Vision Assault / Weapon'}
                      </span>
                    </div>
                    <RiskBadge level={alert.riskLevel} score={alert.riskScore} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                  <p className="text-xs text-zinc-300 line-clamp-2">{alert.snippet}</p>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    <span>Certainty: {alert.confidenceScore}%</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-2xl bg-[#141417]/60 border border-zinc-800 text-center space-y-2">
              <ShieldAlert size={28} className="mx-auto text-zinc-600" />
              <p className="text-sm font-bold text-white">No alerts matching filter</p>
              <p className="text-xs text-zinc-400">All recent safety anomalies have been triaged.</p>
            </div>
          )}
        </div>

        {/* Selected Alert Details & Triage Actions */}
        <div className="lg:col-span-6 space-y-4">
          {selectedAlert ? (
            <div className="p-6 rounded-3xl bg-[#141417]/90 border border-[#D4AF37]/30 space-y-6 shadow-xl sticky top-20">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-zinc-400 uppercase block font-bold">
                    Incident Triage Detail
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">{selectedAlert.title}</h3>
                </div>
                <RiskBadge level={selectedAlert.riskLevel} score={selectedAlert.riskScore} size="md" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Incident Payload
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed p-3.5 rounded-xl bg-[#0E0E11] border border-zinc-800">
                  {selectedAlert.snippet}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0E0E11] border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Classification</span>
                  <p className="font-bold text-white">{selectedAlert.category}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0E0E11] border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Model Certainty</span>
                  <p className="font-mono font-bold text-[#D4AF37]">{selectedAlert.confidenceScore}%</p>
                </div>
              </div>

              {/* Status Resolution Controls */}
              <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Triage Status & Actions
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus('Investigating')}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Mark Investigating
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('Resolved')}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    Resolve Incident
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('False Positive')}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-xl bg-[#141417] hover:bg-[#1C1C22] border border-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Flag False Positive
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <input
                    type="text"
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    placeholder="Add operator triage note..."
                    className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#D4AF37] placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {/* Responsible AI Non-Autonomous Reminder */}
              <div className="p-3 rounded-xl bg-[#0E0E11]/80 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>Zero Autonomous Dispatch — Requires Verified Human Triage.</span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#141417]/60 border border-zinc-800 text-center space-y-2">
              <BellRing size={32} className="mx-auto text-zinc-600" />
              <p className="text-sm font-bold text-white">Select an alert to inspect</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
