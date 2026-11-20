import React from 'react';
import {
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { PageId, UserProfile } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  user: UserProfile | null;
  onLogout: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  healthStatus: { status: string; engine: string; hasApiKey: boolean };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  user,
  onLogout,
  isDemoMode,
  onToggleDemoMode,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  healthStatus
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0E0E11]/95 backdrop-blur-md border-b border-[#D4AF37]/25 shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-400 hover:text-[#D4AF37] hover:bg-[#18181C] lg:hidden cursor-pointer transition-colors border border-transparent hover:border-[#D4AF37]/20"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div
            id="navbar-brand-logo"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-xl bg-[#141417] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-md shadow-amber-500/10 group-hover:border-[#D4AF37] group-hover:shadow-amber-500/25 transition-all">
              <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-[#D4AF37] transition-colors">
                  AI Safety Guardian
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#18181C] text-[#D4AF37] border border-[#D4AF37]/30">
                  Live
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">
                Misinformation & Threat Intelligence Platform
              </span>
            </div>
          </div>
        </div>

        {/* Center / Engine Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141417] border border-[#D4AF37]/25 text-xs shadow-inner">
          <span className="relative flex h-2 w-2">
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            ></span>
          </span>
          <span className="text-zinc-400 font-normal">Active Engine:</span>
          <span className={`font-semibold ${isDemoMode ? 'text-amber-300' : 'text-emerald-400'}`}>
            {isDemoMode ? 'Demo Simulator' : 'Gemini 3.7 Flash'}
          </span>
        </div>

        {/* Right Tools & User Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Demo Mode Switch */}
          <button
            id="navbar-demo-mode-toggle"
            onClick={onToggleDemoMode}
            title="Toggle between Live Gemini AI and Offline Demo Simulation"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              isDemoMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-[#141417] border-[#D4AF37]/25 text-zinc-300 hover:text-white hover:bg-[#1C1C22] hover:border-[#D4AF37]/50'
            }`}
          >
            {isDemoMode ? <ToggleRight size={18} className="text-amber-400" /> : <ToggleLeft size={18} className="text-zinc-400" />}
            <span className="hidden sm:inline">Demo Mode</span>
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white leading-tight">{user.name}</span>
                <span className="text-[10px] text-[#D4AF37] font-medium">{user.role}</span>
              </div>
              <button
                id="navbar-logout-btn"
                onClick={onLogout}
                title="Sign out"
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#18181C] border border-zinc-800 hover:border-[#D4AF37]/40 cursor-pointer transition-colors"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              id="navbar-login-btn"
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#F59E0B] hover:brightness-110 text-black font-bold text-xs cursor-pointer transition-all shadow-md shadow-amber-500/20"
            >
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

