import { PageId } from '../types';

export interface NavigationHistoryEntry {
  page: PageId;
  label: string;
  timestamp: number;
  analysisId?: string;
}

export const PAGE_TITLES: Record<PageId, string> = {
  landing: 'Home',
  dashboard: 'Dashboard',
  misinformation: 'Misinformation Analyzer',
  violence: 'Violence Detection',
  history: 'History',
  results: 'Safety Dossier',
  alerts: 'Threat Alerts',
  about: 'System Architecture',
  'responsible-ai': 'Responsible AI',
  auth: 'Sign In'
};

export const getPageTitle = (page: PageId): string => {
  return PAGE_TITLES[page] || 'Previous Page';
};
