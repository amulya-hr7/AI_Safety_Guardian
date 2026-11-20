import { AnalysisRecord } from '../types';

export const MISINFO_STORAGE_KEY = 'guardian_misinformation_state_v1';

export interface MisinfoSavedDraft {
  inputText: string;
  inputUrl: string;
  isUrlMode: boolean;
  titleInput: string;
  currentResult: AnalysisRecord | null;
  savedAt?: number;
}

export const DEFAULT_MISINFO_DRAFT: MisinfoSavedDraft = {
  inputText: '',
  inputUrl: '',
  isUrlMode: false,
  titleInput: '',
  currentResult: null
};

/**
 * Safely loads the saved Misinformation Analyzer draft and result from localStorage
 */
export function loadMisinfoState(): MisinfoSavedDraft {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_MISINFO_DRAFT };
  }

  try {
    const raw = window.localStorage.getItem(MISINFO_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_MISINFO_DRAFT };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_MISINFO_DRAFT };
    }

    // Ensure valid string and object fields
    const draft: MisinfoSavedDraft = {
      inputText: typeof parsed.inputText === 'string' ? parsed.inputText : '',
      inputUrl: typeof parsed.inputUrl === 'string' ? parsed.inputUrl : '',
      isUrlMode: Boolean(parsed.isUrlMode),
      titleInput: typeof parsed.titleInput === 'string' ? parsed.titleInput : '',
      currentResult:
        parsed.currentResult && typeof parsed.currentResult === 'object' && parsed.currentResult.id
          ? (parsed.currentResult as AnalysisRecord)
          : null,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : undefined
    };

    return draft;
  } catch (err) {
    console.warn('[MisinfoStorage] Failed to read draft from localStorage:', err);
    return { ...DEFAULT_MISINFO_DRAFT };
  }
}

/**
 * Safely saves the Misinformation Analyzer draft and current result to localStorage
 */
export function saveMisinfoState(draft: Partial<MisinfoSavedDraft>): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const payload: MisinfoSavedDraft = {
      inputText: typeof draft.inputText === 'string' ? draft.inputText : '',
      inputUrl: typeof draft.inputUrl === 'string' ? draft.inputUrl : '',
      isUrlMode: Boolean(draft.isUrlMode),
      titleInput: typeof draft.titleInput === 'string' ? draft.titleInput : '',
      currentResult: draft.currentResult && draft.currentResult.id ? draft.currentResult : null,
      savedAt: Date.now()
    };

    // If completely empty, remove the key to keep storage clean
    if (!payload.inputText && !payload.inputUrl && !payload.titleInput && !payload.currentResult) {
      window.localStorage.removeItem(MISINFO_STORAGE_KEY);
    } else {
      window.localStorage.setItem(MISINFO_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch (err) {
    console.warn('[MisinfoStorage] Failed to save draft to localStorage:', err);
  }
}

/**
 * Clears the saved Misinformation Analyzer draft and result from localStorage
 */
export function clearMisinfoState(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(MISINFO_STORAGE_KEY);
  } catch (err) {
    console.warn('[MisinfoStorage] Failed to clear draft from localStorage:', err);
  }
}
