/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId, UserProfile, AnalysisRecord } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MisinformationPage } from './pages/MisinformationPage';
import { ViolencePage } from './pages/ViolencePage';
import { HistoryPage } from './pages/HistoryPage';
import { ResultDetailPage } from './pages/ResultDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { AboutPage } from './pages/AboutPage';
import { ResponsibleAIPage } from './pages/ResponsibleAIPage';
import { AuthPage } from './pages/AuthPage';
import { apiClient } from './services/api';
import { NavigationHistoryEntry, getPageTitle, PAGE_TITLES } from './services/navigation';
import { loadMisinfoState, saveMisinfoState, MisinfoSavedDraft } from './services/misinfoStorage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [navHistory, setNavHistory] = useState<NavigationHistoryEntry[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(1);
  const [healthStatus, setHealthStatus] = useState({
    status: 'ok',
    engine: 'demo_simulation',
    hasApiKey: false
  });

  // State preservation across page changes & browser refreshes
  const [misinfoDraft, setMisinfoDraft] = useState<MisinfoSavedDraft>(() => loadMisinfoState());

  useEffect(() => {
    saveMisinfoState(misinfoDraft);
  }, [misinfoDraft]);

  const [violenceDraft, setViolenceDraft] = useState<{
    activeTab: 'image' | 'video' | 'webcam';
    selectedImage: string | null;
    videoFile: string | null;
    notes: string;
    currentResult: AnalysisRecord | null;
  }>({
    activeTab: 'image',
    selectedImage: null,
    videoFile: null,
    notes: '',
    currentResult: null
  });

  const [historyDraft, setHistoryDraft] = useState<{
    filterType: string;
    searchQuery: string;
  }>({
    filterType: 'all',
    searchQuery: ''
  });

  // Check backend health & API key availability on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const health = await apiClient.getHealth();
        setHealthStatus(health);
        // If server has Gemini API Key, default demo mode to false unless user toggles
        if (health.hasApiKey) {
          setIsDemoMode(false);
        }
      } catch (err) {
        console.warn('Backend initial health check:', err);
      }

      // Check current user session
      try {
        const currentUser = await apiClient.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      }

      // Load active alerts count
      try {
        const alerts = await apiClient.getAlerts('Active');
        setActiveAlertsCount(alerts.length);
      } catch (err) {
        console.warn('Failed to load active alerts count:', err);
      }
    };

    initApp();
  }, []);

  // Initialize and synchronize with browser history (popstate / hash)
  useEffect(() => {
    const initialHash = window.location.hash.replace('#', '') as PageId;
    if (initialHash && PAGE_TITLES[initialHash]) {
      setCurrentPage(initialHash);
      try {
        window.history.replaceState({ page: initialHash }, '', `#${initialHash}`);
      } catch (e) {
        console.warn('Initial replaceState failed:', e);
      }
    } else {
      try {
        window.history.replaceState({ page: 'landing' }, '', '#landing');
      } catch (e) {
        console.warn('Initial replaceState failed:', e);
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      let targetPage: PageId = 'landing';
      if (event.state && event.state.page && PAGE_TITLES[event.state.page as PageId]) {
        targetPage = event.state.page as PageId;
      } else {
        const hash = window.location.hash.replace('#', '') as PageId;
        if (hash && PAGE_TITLES[hash]) {
          targetPage = hash;
        }
      }

      setCurrentPage(targetPage);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleToggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setUser(null);
  };

  const handleNavigate = useCallback((page: PageId, options?: { replace?: boolean }) => {
    if ((page as string) === 'analyze') {
      page = 'misinformation';
    }

    if (page === currentPage) return;

    // When navigating to violence detection, always give user a fresh canvas
    if (page === 'violence') {
      setViolenceDraft({
        activeTab: 'image',
        selectedImage: null,
        videoFile: null,
        notes: '',
        currentResult: null
      });
    }

    const currentEntry: NavigationHistoryEntry = {
      page: currentPage,
      label: getPageTitle(currentPage),
      timestamp: Date.now(),
      analysisId: selectedAnalysis?.id
    };

    if (!options?.replace) {
      setNavHistory((prev) => [...prev, currentEntry]);
      try {
        window.history.pushState(
          { page, fromPage: currentPage, analysisId: selectedAnalysis?.id },
          '',
          `#${page}`
        );
      } catch (e) {
        console.warn('pushState error:', e);
      }
    } else {
      try {
        window.history.replaceState(
          { page, analysisId: selectedAnalysis?.id },
          '',
          `#${page}`
        );
      } catch (e) {
        console.warn('replaceState error:', e);
      }
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedAnalysis]);

  const handleBack = useCallback(() => {
    if (navHistory.length > 0) {
      const previous = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, -1));

      if (previous.page === 'violence') {
        setViolenceDraft({
          activeTab: 'image',
          selectedImage: null,
          videoFile: null,
          notes: '',
          currentResult: null
        });
      }

      setCurrentPage(previous.page);

      try {
        window.history.replaceState(
          { page: previous.page, analysisId: selectedAnalysis?.id },
          '',
          `#${previous.page}`
        );
      } catch (e) {
        console.warn('replaceState error:', e);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Default fallback when opened without in-app history stack
      let fallback: PageId = 'dashboard';
      if (currentPage === 'results') {
        if (selectedAnalysis?.module === 'violence') {
          fallback = 'violence';
        } else if (selectedAnalysis?.module === 'misinformation') {
          fallback = 'misinformation';
        } else {
          fallback = 'history';
        }
      } else if (currentPage === 'responsible-ai') {
        fallback = 'about';
      }
      handleNavigate(fallback, { replace: true });
    }
  }, [navHistory, currentPage, selectedAnalysis, handleNavigate]);

  const handleSelectAnalysis = useCallback((record: AnalysisRecord) => {
    setSelectedAnalysis(record);
    handleNavigate('results');
  }, [handleNavigate]);

  const previousNavEntry = navHistory.length > 0 ? navHistory[navHistory.length - 1] : null;
  const previousPageTitle = previousNavEntry ? previousNavEntry.label : undefined;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-zinc-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black antialiased relative">
      {/* Black & Gold Luxury Atmospheric Background Texture & Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep black canvas gradient with subtle warm amber/gold depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C] via-[#101014] to-[#0B0B0C]" />

        {/* Dynamic Gold & Amber Ambient Glow Orbs */}
        <div className="absolute -top-32 -right-20 w-[600px] h-[600px] bg-amber-500/[0.07] rounded-full blur-3xl" />
        <div className="absolute top-1/4 -left-32 w-[550px] h-[550px] bg-[#D4AF37]/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/3 w-[650px] h-[650px] bg-amber-600/[0.05] rounded-full blur-3xl" />
        <div className="absolute top-2/3 -right-24 w-[500px] h-[500px] bg-[#D4AF37]/[0.05] rounded-full blur-3xl" />

        {/* Subtle gold grid mesh overlay */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(rgba(212, 175, 55, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Top Navigation */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
          isDemoMode={isDemoMode}
          onToggleDemoMode={handleToggleDemoMode}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          healthStatus={healthStatus}
        />

        {/* Main Content Area with Sidebar */}
        <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
          {/* Sidebar */}
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            activeAlertsCount={activeAlertsCount}
          />

          {/* Page View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {currentPage === 'landing' && (
                  <LandingPage onNavigate={handleNavigate} />
                )}

                {currentPage === 'dashboard' && (
                  <DashboardPage
                    onNavigate={handleNavigate}
                    onSelectAnalysis={handleSelectAnalysis}
                    isDemoMode={isDemoMode}
                  />
                )}

                {currentPage === 'history' && (
                  <HistoryPage
                    onNavigate={handleNavigate}
                    onSelectAnalysis={handleSelectAnalysis}
                    user={user}
                    onBack={handleBack}
                    previousPageName={previousPageTitle}
                    savedDraft={historyDraft}
                    onSaveDraft={setHistoryDraft}
                  />
                )}

                {currentPage === 'misinformation' && (
                  <MisinformationPage
                    onNavigate={handleNavigate}
                    onSelectAnalysis={handleSelectAnalysis}
                    user={user}
                    isDemoMode={isDemoMode}
                    onBack={handleBack}
                    previousPageName={previousPageTitle}
                    savedDraft={misinfoDraft}
                    onSaveDraft={setMisinfoDraft}
                  />
                )}

                {currentPage === 'violence' && (
                  <ViolencePage
                    onNavigate={handleNavigate}
                    onSelectAnalysis={handleSelectAnalysis}
                    user={user}
                    isDemoMode={isDemoMode}
                    onBack={handleBack}
                    previousPageName={previousPageTitle}
                    savedDraft={violenceDraft}
                    onSaveDraft={setViolenceDraft}
                  />
                )}

                {currentPage === 'results' && (
                  <ResultDetailPage
                    analysis={selectedAnalysis}
                    onNavigate={handleNavigate}
                    onSelectAnalysis={setSelectedAnalysis}
                    onBack={handleBack}
                    previousPageName={previousPageTitle}
                  />
                )}

                {currentPage === 'alerts' && (
                  <AlertsPage
                    onNavigate={handleNavigate}
                    user={user}
                    onBack={handleBack}
                    previousPageName={previousPageTitle}
                  />
                )}

                {currentPage === 'about' && (
                  <AboutPage
                    onNavigate={handleNavigate}
                    onBack={handleBack}
                    previousPageName={previousPageTitle}
                  />
                )}

                {currentPage === 'responsible-ai' && (
                  <ResponsibleAIPage
                    onNavigate={handleNavigate}
                    onBack={handleBack}
                    previousPageName={previousPageTitle}
                  />
                )}

                {currentPage === 'auth' && (
                  <AuthPage
                    onLoginSuccess={(u) => {
                      setUser(u);
                      handleNavigate('dashboard');
                    }}
                    onNavigate={handleNavigate}
                    onBack={handleBack}
                    previousPageName={previousPageTitle}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Global Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>
    </div>
  );
}

