import { AnalysisRecord, AlertItem, DashboardStats, UserProfile } from '../types';

export const apiClient = {
  // Health & Stats
  async getHealth(): Promise<{ status: string; engine: string; hasApiKey: boolean }> {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline', engine: 'Simulated Engine', hasApiKey: false };
    }
  },

  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) {
      throw new Error(`Failed to load dashboard statistics (HTTP ${res.status})`);
    }
    const json = await res.json();
    
    // Normalize both snake_case (FastAPI) and camelCase (Express/TypeScript) keys
    const data = json.data || json;
    
    const total = data.total_analyses ?? data.totalAnalyses ?? 0;
    const misinfo = data.misinformation_analyses ?? data.misinformationCount ?? data.text_analyses ?? 0;
    const violence = data.violence_analyses ?? data.violenceCount ?? ((data.image_analyses || 0) + (data.video_analyses || 0)) ?? 0;
    const highRisk = data.high_risk_analyses ?? data.high_risk ?? data.highRiskAlertsCount ?? 0;
    const moderateRisk = data.moderate_risk_analyses ?? data.risk_distribution?.medium ?? data.risk_distribution?.moderate ?? data.riskDistribution?.moderate ?? 0;
    const lowRisk = data.low_risk_analyses ?? data.risk_distribution?.low ?? data.riskDistribution?.low ?? 0;
    const criticalRisk = data.risk_distribution?.critical ?? data.riskDistribution?.critical ?? 0;
    const highPct = data.high_risk_percentage ?? (total > 0 ? Math.round((highRisk / total) * 1000) / 10 : 0);
    const avgConf = data.average_confidence ?? data.averageConfidence ?? 0;
    const recentActivity = data.recent_activity || data.recentAnalyses || [];
    const activeAlerts = data.activeAlerts || [];

    // Map recent items to AnalysisRecord format if needed
    const recentAnalyses: AnalysisRecord[] = recentActivity.map((item: any) => {
      if (item.module && item.title) return item;
      return {
        id: item.id || `rec-${Math.random().toString(36).substring(2, 8)}`,
        module: item.analysis_type === 'text' || item.module === 'misinformation' ? 'misinformation' : 'violence',
        sourceType: item.analysis_type || 'text',
        title: item.title || (item.analysis_type === 'text' ? 'Text Analysis' : 'Visual Threat Scan'),
        classification: item.classification || 'Evaluated',
        riskLevel: item.risk_level || (item.risk_score >= 70 ? 'High' : item.risk_score >= 40 ? 'Moderate' : 'Low'),
        riskScore: item.risk_score ?? item.riskScore ?? 0,
        confidenceScore: item.confidence ?? item.confidenceScore ?? 85,
        explanation: item.explanation || 'Recorded database analysis',
        keyFactors: item.keyFactors || item.details?.key_factors || [],
        claims: item.claims || item.details?.claims || [],
        detectedObjects: item.detectedObjects || item.details?.detected_objects || [],
        threatIndicators: item.threatIndicators || item.details?.threat_indicators || [],
        rawInputSnippet: item.raw_input_snippet || item.rawInputSnippet,
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        isDemo: Boolean(item.is_demo || item.isDemo)
      };
    });

    return {
      hasData: total > 0,
      message: data.message,
      totalAnalyses: total,
      misinformationCount: misinfo,
      violenceCount: violence,
      highRiskAlertsCount: highRisk,
      resolvedAlertsCount: data.resolvedAlertsCount ?? 0,
      averageConfidence: avgConf,
      textAnalyses: data.text_analyses ?? misinfo,
      imageAnalyses: data.image_analyses ?? 0,
      videoAnalyses: data.video_analyses ?? 0,
      misinformationAnalyses: misinfo,
      violenceAnalyses: violence,
      highRiskAnalyses: highRisk,
      moderateRiskAnalyses: moderateRisk,
      lowRiskAnalyses: lowRisk,
      highRiskPercentage: highPct,
      riskDistribution: {
        low: lowRisk,
        moderate: moderateRisk,
        high: data.risk_distribution?.high ?? data.riskDistribution?.high ?? highRisk,
        critical: criticalRisk
      },
      recentAnalyses,
      activeAlerts
    };
  },

  async seedDemo(): Promise<void> {
    await fetch('/api/demo/seed', { method: 'POST' });
  },

  // Misinformation
  async analyzeMisinformation(params: {
    text?: string;
    claim?: string;
    headline?: string;
    url?: string;
    isUrl?: boolean;
    title?: string;
    isDemo?: boolean;
    userName?: string;
  }): Promise<AnalysisRecord> {
    const res = await fetch('/api/misinformation/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || json.details || 'Misinformation analysis failed.');
    }
    return json.data;
  },

  // Violence
  async analyzeViolence(params: {
    imageBase64?: string;
    imageUrl?: string;
    sourceType?: 'image' | 'video' | 'webcam';
    title?: string;
    notes?: string;
    isDemo?: boolean;
    userName?: string;
    frameDetections?: any[];
    videoFrames?: { timestampSeconds: number; frameBase64: string }[];
  }): Promise<AnalysisRecord> {
    const res = await fetch('/api/violence/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Violence analysis failed.');
    }
    return json.data;
  },

  // Alerts
  async getAlerts(status?: string): Promise<AlertItem[]> {
    const url = status ? `/api/alerts?status=${encodeURIComponent(status)}` : '/api/alerts';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async resolveAlert(
    alertId: string,
    status: AlertItem['status'],
    notes?: string,
    assignedTo?: string
  ): Promise<AlertItem> {
    const res = await fetch(`/api/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, assignedTo })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update alert.');
    }
    return json.data;
  },

  // History
  async getHistory(moduleFilter?: string, searchQuery?: string): Promise<AnalysisRecord[]> {
    const params = new URLSearchParams();
    if (moduleFilter && moduleFilter !== 'all') {
      params.append('module', moduleFilter);
      params.append('analysis_type', moduleFilter);
    }
    if (searchQuery && searchQuery.trim()) {
      params.append('q', searchQuery.trim());
    }
    const queryString = params.toString();
    const url = queryString ? `/api/history?${queryString}` : '/api/history';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async getAnalysisById(id: string): Promise<AnalysisRecord> {
    const res = await fetch(`/api/history/${id}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Analysis record not found.');
    }
    return json.data;
  },

  async deleteHistory(id: string): Promise<boolean> {
    const res = await fetch(`/api/history/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to delete record.');
    }
    return true;
  },

  // Auth
  async login(email: string, name?: string, role?: UserProfile['role']): Promise<UserProfile> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Login failed.');
    }
    return json.user;
  },

  async register(name: string, email: string, role?: UserProfile['role']): Promise<UserProfile> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Registration failed.');
    }
    return json.user;
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const res = await fetch('/api/auth/me');
      const json = await res.json();
      return json.user || null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
  }
};
