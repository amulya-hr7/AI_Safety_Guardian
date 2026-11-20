export type ModuleType = 'misinformation' | 'violence';

export type MisinformationVerdict = 'LIKELY TRUE' | 'LIKELY FALSE' | 'MISLEADING' | 'UNVERIFIED';

export type MisinformationClassification =
  | 'Likely Reliable'
  | 'Suspicious'
  | 'Likely Misinformation'
  | MisinformationVerdict;

export type ViolenceClassification =
  | 'Normal / Safe'
  | 'Aggressive Activity'
  | 'Fighting'
  | 'Physical Assault'
  | 'Weapon-related Visual Indicators';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type SourceCategory =
  | 'Government / Official'
  | 'Fact-Checking Organization'
  | 'Reputable News Outlet'
  | 'Academic / Research'
  | 'Independent Source';

export interface EvidenceSource {
  id: string;
  publisher: string;
  title: string;
  url: string;
  publishDate?: string;
  sourceType: SourceCategory;
  relevance: 'Supporting' | 'Contradicting' | 'Context' | 'Neutral';
  snippet: string;
}

export interface FactCheckMatch {
  claim: string;
  claimant?: string;
  publisher: string;
  rating: string;
  reviewDate?: string;
  url: string;
}

export interface EvidenceItem {
  id: string;
  type: 'supporting' | 'contradicting';
  claimReference?: string;
  statement: string;
  sourcePublisher: string;
  sourceUrl: string;
  publishedDate?: string;
}

export interface ExtractedClaim {
  id: string;
  claimText: string;
  veracityScore: number; // 0-100 (0=debunked, 100=verified)
  status: 'LIKELY TRUE' | 'LIKELY FALSE' | 'MISLEADING' | 'UNVERIFIED' | 'Verified' | 'Unverified' | 'Disputed' | 'False';
  evidenceSummary: string;
  needsFactCheck: boolean;
  suggestedSources?: string[];
  supportingSources?: string[];
  contradictingSources?: string[];
}

export interface VideoFrameDetection {
  timestampSeconds: number;
  frameIndex: number;
  category: ViolenceClassification;
  riskScore: number;
  confidence: number;
  visualIndicators: string[];
}

export interface ArticleMetadata {
  headline?: string;
  publisher?: string;
  publicationDate?: string;
  originalUrl?: string;
  author?: string;
  summary?: string;
}

export interface AnalysisRecord {
  id: string;
  module: ModuleType;
  createdAt: string;
  title: string;
  sourceType: 'text' | 'image' | 'video' | 'webcam' | 'url';
  rawInputSnippet?: string;
  imageUrl?: string;
  
  // Scoring & Verdict
  classification: string;
  verdict?: MisinformationVerdict;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  confidenceScore: number; // 0-100 (confidence of the AI prediction)
  
  // Explainability
  explanation: string;
  keyFactors: string[];
  
  // Evidence-Based Misinformation Pipeline
  claims?: ExtractedClaim[];
  supportingEvidence?: EvidenceItem[];
  contradictingEvidence?: EvidenceItem[];
  factChecks?: FactCheckMatch[];
  sources?: EvidenceSource[];
  caveats?: string[];
  articleMetadata?: ArticleMetadata;
  sensationalismIndex?: number; // 0-100
  linguisticTone?: string;
  searchFailed?: boolean;
  searchFailedReason?: string;
  
  // Specific to Violence
  detectedObjects?: string[];
  threatIndicators?: string[];
  frameDetections?: VideoFrameDetection[];
  
  // Metadata
  userId?: string;
  userName?: string;
  isDemo?: boolean;
  reviewedByHuman?: boolean;
  humanNotes?: string;
}

export interface AlertItem {
  id: string;
  analysisId: string;
  module: ModuleType;
  title: string;
  timestamp: string;
  riskLevel: RiskLevel;
  riskScore: number;
  confidenceScore: number;
  category: string;
  snippet: string;
  status: 'Active' | 'Investigating' | 'Resolved' | 'False Positive';
  assignedTo?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface DashboardStats {
  hasData?: boolean;
  message?: string;
  totalAnalyses: number;
  misinformationCount: number;
  violenceCount: number;
  highRiskAlertsCount: number;
  resolvedAlertsCount: number;
  averageConfidence: number;
  textAnalyses?: number;
  imageAnalyses?: number;
  videoAnalyses?: number;
  misinformationAnalyses?: number;
  violenceAnalyses?: number;
  highRiskAnalyses?: number;
  moderateRiskAnalyses?: number;
  lowRiskAnalyses?: number;
  highRiskPercentage?: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  recentAnalyses: AnalysisRecord[];
  activeAlerts: AlertItem[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Web Analyst' | 'Web User';
  token: string;
}

export interface MisinformationInputPayload {
  text?: string;
  claim?: string;
  headline?: string;
  url?: string;
  isUrl?: boolean;
  title?: string;
  userName?: string;
}

export type PageId =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'misinformation'
  | 'violence'
  | 'history'
  | 'results'
  | 'alerts'
  | 'about'
  | 'responsible-ai';
