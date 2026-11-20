import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileSearch,
  Video,
  FileCheck2,
  BellRing,
  Sparkles,
  ShieldAlert,
  Info,
  Home,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { PageId } from '../types';
import { ResponsibleAIDisclaimer } from './ResponsibleAIDisclaimer';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  activeAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activeAlertsCount
}) => {
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);

  const navigationGroups = [
    {
      group: 'Overview',
      items: [
        {
          id: 'landing' as PageId,
          label: 'Overview & Intro',
          icon: Home,
          badge: null
        },
        {
          id: 'dashboard' as PageId,
          label: 'Live Dashboard',
          icon: LayoutDashboard,
          badge: null
        }
      ]
    },
    {
      group: 'Detection Hub',
      items: [
        {
          id: 'misinformation' as PageId,
          label: 'Text Misinformation',
          icon: FileSearch,
          badge: 'NLP'
        },
        {
          id: 'violence' as PageId,
          label: 'Visual Violence',
          icon: Video,
          badge: 'Vision'
        }
      ]
    },
    {
      group: 'Triage & History',
      items: [
        {
          id: 'alerts' as PageId,
          label: 'Alert Management',
          icon: BellRing,
          badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : null,
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-mono'
        },
        {
          id: 'history' as PageId,
          label: 'Audit Log & Cases',
          icon: FileCheck2,
          badge: null
        }
      ]
    },
    {
      group: 'Governance & Docs',
      items: [
        {
          id: 'responsible-ai' as PageId,
          label: 'Responsible AI Policy',
          icon: ShieldAlert,
          badge: null
        },
        {
          id: 'about' as PageId,
          label: 'Pipeline Architecture',
          icon: Info,
          badge: null
        }
      ]
    }
  ];

  const handleItemClick = (page: PageId) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-main-sidebar"
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 shrink-0 bg-[#0E0E11]/95 lg:bg-[#0E0E11]/90 backdrop-blur-xl border-r border-[#D4AF37]/20 p-4 flex flex-col justify-between transition-transform duration-200 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1 flex-1">
          {navigationGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#D4AF37]/75 uppercase tracking-wider">
                {group.group}
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#F59E0B] text-black font-bold shadow-md shadow-amber-500/20'
                          : 'text-zinc-400 hover:text-white hover:bg-[#18181C] hover:border-[#D4AF37]/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={16}
                          className={`shrink-0 transition-colors ${
                            isActive ? 'text-black' : 'text-zinc-400 group-hover:text-[#D4AF37]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-black/25 text-black border-black/30'
                              : item.badgeColor || 'bg-[#18181C] text-[#D4AF37] border-[#D4AF37]/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Responsible AI & Evaluation Notice in Sidebar Menu */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="bg-[#141417] border border-[#D4AF37]/20 rounded-xl p-3 space-y-2">
              <button
                type="button"
                onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Responsible AI Notice</span>
                </div>
                {isNoticeExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {isNoticeExpanded ? (
                <div className="space-y-2 pt-1 text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-800">
                  <p>
                    <strong className="text-zinc-200">Human Oversight:</strong> All classifications and confidence scores are probabilistic assistive indicators requiring human verification.
                  </p>
                  <p>
                    <strong className="text-zinc-200">No Autonomous Action:</strong> This system does not trigger automated law enforcement dispatch or punitive measures.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleItemClick('responsible-ai')}
                    className="text-[#D4AF37] hover:underline font-semibold text-[11px] block pt-1 cursor-pointer"
                  >
                    View Full Governance Policy &rarr;
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Probabilistic evaluation under human-in-the-loop oversight. Click to view policy.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Safety Status */}
        <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-zinc-300">System Operational</span>
          </div>
          <span className="font-mono text-[#D4AF37]/80 text-[10px]">v2.4 Gold</span>
        </div>
      </aside>
    </>
  );
};

