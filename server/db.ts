import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { AnalysisRecord, AlertItem, DashboardStats, UserProfile } from '../src/types';
import { INITIAL_DEMO_ANALYSES, INITIAL_DEMO_ALERTS } from '../src/data/demoData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.sqlite');

class SQLiteDatabaseStore {
  private db: Database | null = null;
  private isInitialized = false;
  private inMemoryAnalyses: AnalysisRecord[] = [...INITIAL_DEMO_ANALYSES];
  private inMemoryAlerts: AlertItem[] = [...INITIAL_DEMO_ALERTS];

  private users: UserProfile[] = [
    {
      id: 'usr-demo-1',
      name: 'Dr. Sarah Chen',
      email: 'schen@guardian.ai',
      role: 'Web Analyst',
      token: 'demo-token-123'
    },
    {
      id: 'usr-demo-2',
      name: 'Alex Mercer',
      email: 'amercer@guardian.ai',
      role: 'Web User',
      token: 'demo-token-456'
    }
  ];

  constructor() {
    this.init().catch((err) => {
      console.warn('Background SQLite init deferred to in-memory store:', err?.message || err);
    });
  }

  async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const SQL = await initSqlJs();

      if (fs.existsSync(DB_FILE)) {
        const fileBuffer = fs.readFileSync(DB_FILE);
        this.db = new SQL.Database(fileBuffer);
      } else {
        this.db = new SQL.Database();
      }

      // Create SQLite schema
      this.db.run(`
        CREATE TABLE IF NOT EXISTS analyses (
          id TEXT PRIMARY KEY,
          module TEXT NOT NULL,
          analysis_type TEXT NOT NULL,
          title TEXT NOT NULL,
          classification TEXT NOT NULL,
          risk_level TEXT NOT NULL,
          risk_score REAL NOT NULL,
          confidence_score REAL NOT NULL,
          sensationalism_index REAL,
          linguistic_tone TEXT,
          explanation TEXT NOT NULL,
          key_factors TEXT,
          claims_json TEXT,
          detected_objects TEXT,
          threat_indicators TEXT,
          frame_detections TEXT,
          raw_input_snippet TEXT,
          is_demo INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          verdict TEXT,
          supporting_evidence TEXT,
          contradicting_evidence TEXT,
          fact_checks TEXT,
          sources TEXT,
          caveats TEXT,
          article_metadata TEXT
        );
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS alerts (
          id TEXT PRIMARY KEY,
          analysis_id TEXT NOT NULL,
          module TEXT NOT NULL,
          title TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          risk_level TEXT NOT NULL,
          risk_score REAL NOT NULL,
          confidence_score REAL NOT NULL,
          category TEXT NOT NULL,
          snippet TEXT,
          status TEXT NOT NULL,
          resolution_notes TEXT,
          assigned_to TEXT,
          resolved_at TEXT
        );
      `);

      // Ensure any missing columns on pre-existing database files are migrated
      this.migrateSchema();

      // Seed initial records into SQLite if empty
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM analyses');
      stmt.step();
      const count = (stmt.getAsObject().count as number) || 0;
      stmt.free();

      if (count === 0) {
        for (const item of this.inMemoryAnalyses) {
          this.insertAnalysisToSqlite(item);
        }
        for (const alert of this.inMemoryAlerts) {
          this.insertAlertToSqlite(alert);
        }
      } else {
        // Hydrate in-memory from SQLite
        this.syncFromSqlite();
      }

      this.saveToDisk();
      this.isInitialized = true;
    } catch (err) {
      console.warn('SQLite storage engine fell back to resilient in-memory store:', err);
    }
  }

  private migrateSchema() {
    if (!this.db) return;
    try {
      // Migrate analyses table columns if missing
      const stmt = this.db.prepare('PRAGMA table_info(analyses)');
      const existingCols = new Set<string>();
      while (stmt.step()) {
        const col = stmt.getAsObject();
        if (col.name) existingCols.add(String(col.name).toLowerCase());
      }
      stmt.free();

      const requiredAnalysesCols: [string, string][] = [
        ['verdict', 'TEXT'],
        ['supporting_evidence', 'TEXT'],
        ['contradicting_evidence', 'TEXT'],
        ['fact_checks', 'TEXT'],
        ['sources', 'TEXT'],
        ['caveats', 'TEXT'],
        ['article_metadata', 'TEXT'],
        ['raw_input_snippet', 'TEXT'],
        ['sensationalism_index', 'REAL'],
        ['linguistic_tone', 'TEXT'],
        ['claims_json', 'TEXT'],
        ['detected_objects', 'TEXT'],
        ['threat_indicators', 'TEXT'],
        ['frame_detections', 'TEXT']
      ];

      for (const [colName, colType] of requiredAnalysesCols) {
        if (!existingCols.has(colName.toLowerCase())) {
          try {
            this.db.run(`ALTER TABLE analyses ADD COLUMN ${colName} ${colType}`);
          } catch (alterErr) {
            console.warn(`Could not add column ${colName} to analyses:`, alterErr);
          }
        }
      }

      // Migrate alerts table columns if missing
      const alertStmt = this.db.prepare('PRAGMA table_info(alerts)');
      const existingAlertCols = new Set<string>();
      while (alertStmt.step()) {
        const col = alertStmt.getAsObject();
        if (col.name) existingAlertCols.add(String(col.name).toLowerCase());
      }
      alertStmt.free();

      const requiredAlertCols: [string, string][] = [
        ['resolution_notes', 'TEXT'],
        ['assigned_to', 'TEXT'],
        ['resolved_at', 'TEXT'],
        ['snippet', 'TEXT']
      ];

      for (const [colName, colType] of requiredAlertCols) {
        if (!existingAlertCols.has(colName.toLowerCase())) {
          try {
            this.db.run(`ALTER TABLE alerts ADD COLUMN ${colName} ${colType}`);
          } catch (alterErr) {
            console.warn(`Could not add column ${colName} to alerts:`, alterErr);
          }
        }
      }
    } catch (err) {
      console.warn('Failed during SQLite schema migration check:', err);
    }
  }

  private saveToDisk() {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE, buffer);
    } catch (err) {
      console.warn('Failed to persist SQLite DB to disk:', err);
    }
  }

  private insertAnalysisToSqlite(analysis: AnalysisRecord) {
    if (!this.db) return;
    try {
      this.db.run(
        `INSERT OR REPLACE INTO analyses (
          id, module, analysis_type, title, classification, risk_level,
          risk_score, confidence_score, sensationalism_index, linguistic_tone,
          explanation, key_factors, claims_json, detected_objects,
          threat_indicators, frame_detections, raw_input_snippet, is_demo, created_at,
          verdict, supporting_evidence, contradicting_evidence, fact_checks, sources, caveats, article_metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          analysis.id,
          analysis.module,
          analysis.sourceType || (analysis.module === 'misinformation' ? 'text' : 'image'),
          analysis.title,
          analysis.classification,
          analysis.riskLevel,
          analysis.riskScore,
          analysis.confidenceScore,
          analysis.sensationalismIndex ?? null,
          analysis.linguisticTone ?? null,
          analysis.explanation,
          JSON.stringify(analysis.keyFactors || []),
          JSON.stringify(analysis.claims || []),
          JSON.stringify(analysis.detectedObjects || []),
          JSON.stringify(analysis.threatIndicators || []),
          JSON.stringify(analysis.frameDetections || []),
          analysis.rawInputSnippet ?? null,
          analysis.isDemo ? 1 : 0,
          analysis.createdAt || new Date().toISOString(),
          analysis.verdict ?? null,
          JSON.stringify(analysis.supportingEvidence || []),
          JSON.stringify(analysis.contradictingEvidence || []),
          JSON.stringify(analysis.factChecks || []),
          JSON.stringify(analysis.sources || []),
          JSON.stringify(analysis.caveats || []),
          analysis.articleMetadata ? JSON.stringify(analysis.articleMetadata) : null
        ]
      );
    } catch (err) {
      console.warn('Failed SQLite analysis insert:', err);
    }
  }

  private insertAlertToSqlite(alert: AlertItem) {
    if (!this.db) return;
    try {
      this.db.run(
        `INSERT OR REPLACE INTO alerts (
          id, analysis_id, module, title, timestamp, risk_level,
          risk_score, confidence_score, category, snippet, status,
          resolution_notes, assigned_to, resolved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          alert.id,
          alert.analysisId,
          alert.module,
          alert.title,
          alert.timestamp,
          alert.riskLevel,
          alert.riskScore,
          alert.confidenceScore,
          alert.category,
          alert.snippet,
          alert.status,
          alert.resolutionNotes || null,
          alert.assignedTo || null,
          alert.resolvedAt || null
        ]
      );
    } catch (err) {
      console.warn('Failed SQLite alert insert:', err);
    }
  }

  private syncFromSqlite() {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare('SELECT * FROM analyses ORDER BY created_at DESC');
      const loaded: AnalysisRecord[] = [];
      while (stmt.step()) {
        loaded.push(this.rowToAnalysisRecord(stmt.getAsObject()));
      }
      stmt.free();
      if (loaded.length > 0) {
        this.inMemoryAnalyses = loaded;
      }

      const alertStmt = this.db.prepare('SELECT * FROM alerts ORDER BY timestamp DESC');
      const loadedAlerts: AlertItem[] = [];
      while (alertStmt.step()) {
        loadedAlerts.push(this.rowToAlertItem(alertStmt.getAsObject()));
      }
      alertStmt.free();
      if (loadedAlerts.length > 0) {
        this.inMemoryAlerts = loadedAlerts;
      }
    } catch (err) {
      console.warn('Failed to sync from SQLite:', err);
    }
  }

  // User methods
  getUserByEmail(email: string): UserProfile | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByToken(token: string): UserProfile | undefined {
    return this.users.find((u) => u.token === token);
  }

  createUser(name: string, email: string, role: UserProfile['role']): UserProfile {
    const existing = this.getUserByEmail(email);
    if (existing) return existing;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: role || 'Web Analyst',
      token: `token-${Math.random().toString(36).substring(2)}-${Date.now()}`
    };
    this.users.push(newUser);
    return newUser;
  }

  // Analyses methods
  getAnalyses(moduleFilter?: string): AnalysisRecord[] {
    if (this.db) {
      try {
        let query = 'SELECT * FROM analyses';
        const params: any[] = [];

        if (moduleFilter && moduleFilter !== 'all') {
          if (moduleFilter === 'misinformation' || moduleFilter === 'text') {
            query += " WHERE module = 'misinformation' OR analysis_type = 'text'";
          } else if (moduleFilter === 'violence' || moduleFilter === 'image' || moduleFilter === 'video') {
            query += " WHERE module = 'violence' OR analysis_type IN ('image', 'video', 'webcam')";
          }
        }

        query += ' ORDER BY created_at DESC';

        const stmt = this.db.prepare(query);
        stmt.bind(params);

        const records: AnalysisRecord[] = [];
        while (stmt.step()) {
          records.push(this.rowToAnalysisRecord(stmt.getAsObject()));
        }
        stmt.free();
        return records;
      } catch (err) {
        console.warn('Falling back to memory for getAnalyses:', err);
      }
    }

    // In-memory fallback
    let result = [...this.inMemoryAnalyses];
    if (moduleFilter && moduleFilter !== 'all') {
      if (moduleFilter === 'misinformation' || moduleFilter === 'text') {
        result = result.filter((r) => r.module === 'misinformation' || r.sourceType === 'text');
      } else if (moduleFilter === 'violence' || moduleFilter === 'image' || moduleFilter === 'video') {
        result = result.filter((r) => r.module === 'violence' || ['image', 'video', 'webcam'].includes(r.sourceType));
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAnalysisById(id: string): AnalysisRecord | undefined {
    if (this.db) {
      try {
        const stmt = this.db.prepare('SELECT * FROM analyses WHERE id = :id LIMIT 1');
        stmt.bind({ ':id': id });
        let record: AnalysisRecord | undefined = undefined;
        if (stmt.step()) {
          record = this.rowToAnalysisRecord(stmt.getAsObject());
        }
        stmt.free();
        if (record) return record;
      } catch (err) {
        console.warn('Error querying SQLite for getAnalysisById:', err);
      }
    }
    return this.inMemoryAnalyses.find((a) => a.id === id);
  }

  deleteAnalysis(id: string): boolean {
    if (this.db) {
      try {
        this.db.run('DELETE FROM analyses WHERE id = ?', [id]);
        this.db.run('DELETE FROM alerts WHERE analysis_id = ?', [id]);
        this.saveToDisk();
      } catch (err) {
        console.warn('Failed to delete from SQLite:', err);
      }
    }

    this.inMemoryAnalyses = this.inMemoryAnalyses.filter((a) => a.id !== id);
    this.inMemoryAlerts = this.inMemoryAlerts.filter((a) => a.analysisId !== id);
    return true;
  }

  addAnalysis(analysis: AnalysisRecord): AnalysisRecord {
    // 1. Save in memory first
    const existingIndex = this.inMemoryAnalyses.findIndex((a) => a.id === analysis.id);
    if (existingIndex >= 0) {
      this.inMemoryAnalyses[existingIndex] = analysis;
    } else {
      this.inMemoryAnalyses.unshift(analysis);
    }

    // 2. Generate alert if high or critical risk
    if (analysis.riskLevel === 'High' || analysis.riskLevel === 'Critical') {
      const alertId = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const snippet =
        analysis.rawInputSnippet?.substring(0, 140) ||
        analysis.explanation.substring(0, 140) ||
        'Anomaly triggered high-risk safety triage.';

      const newAlert: AlertItem = {
        id: alertId,
        analysisId: analysis.id,
        module: analysis.module,
        title: `High Risk Detected: ${analysis.title}`,
        timestamp: analysis.createdAt || new Date().toISOString(),
        riskLevel: analysis.riskLevel,
        riskScore: analysis.riskScore,
        confidenceScore: analysis.confidenceScore,
        category: analysis.classification,
        snippet,
        status: 'Active'
      };

      this.inMemoryAlerts.unshift(newAlert);
      this.insertAlertToSqlite(newAlert);
    }

    // 3. Write to SQLite
    this.insertAnalysisToSqlite(analysis);
    this.saveToDisk();

    return analysis;
  }

  // Alerts methods
  getAlerts(statusFilter?: string): AlertItem[] {
    if (this.db) {
      try {
        let query = 'SELECT * FROM alerts';
        const params: any[] = [];

        if (statusFilter && statusFilter !== 'all') {
          query += ' WHERE LOWER(status) = LOWER(?)';
          params.push(statusFilter);
        }

        query += ' ORDER BY timestamp DESC';

        const stmt = this.db.prepare(query);
        stmt.bind(params);

        const alerts: AlertItem[] = [];
        while (stmt.step()) {
          alerts.push(this.rowToAlertItem(stmt.getAsObject()));
        }
        stmt.free();
        return alerts;
      } catch (err) {
        console.warn('Falling back to memory for getAlerts:', err);
      }
    }

    let list = [...this.inMemoryAlerts];
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((a) => a.status.toLowerCase() === statusFilter.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  resolveAlert(
    alertId: string,
    status: AlertItem['status'],
    notes?: string,
    assignedTo?: string
  ): AlertItem | undefined {
    const resolvedAt = status === 'Resolved' || status === 'False Positive' ? new Date().toISOString() : null;

    // Update in-memory
    const alert = this.inMemoryAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = status;
      if (notes) alert.resolutionNotes = notes;
      if (assignedTo) alert.assignedTo = assignedTo;
      if (resolvedAt) alert.resolvedAt = resolvedAt;
    }

    // Update SQLite
    if (this.db) {
      try {
        this.db.run(
          `UPDATE alerts SET
            status = ?,
            resolution_notes = COALESCE(?, resolution_notes),
            assigned_to = COALESCE(?, assigned_to),
            resolved_at = COALESCE(?, resolved_at)
          WHERE id = ?`,
          [status, notes || null, assignedTo || null, resolvedAt, alertId]
        );
        this.saveToDisk();
      } catch (err) {
        console.warn('Failed to update alert in SQLite:', err);
      }
    }

    return alert;
  }

  // Real Dynamic Dashboard Statistics Calculation (No Hardcoded Values)
  getDashboardStats(): DashboardStats & {
    has_data: boolean;
    message?: string;
    text_analyses: number;
    image_analyses: number;
    video_analyses: number;
    misinformation_analyses: number;
    violence_analyses: number;
    high_risk_analyses: number;
    moderate_risk_analyses: number;
    low_risk_analyses: number;
    high_risk_percentage: number;
  } {
    const all = this.getAnalyses();
    const total = all.length;

    if (total === 0) {
      return {
        has_data: false,
        message: 'No analyses performed yet.',
        totalAnalyses: 0,
        misinformationCount: 0,
        violenceCount: 0,
        highRiskAlertsCount: 0,
        resolvedAlertsCount: 0,
        averageConfidence: 0,
        text_analyses: 0,
        image_analyses: 0,
        video_analyses: 0,
        misinformation_analyses: 0,
        violence_analyses: 0,
        high_risk_analyses: 0,
        moderate_risk_analyses: 0,
        low_risk_analyses: 0,
        high_risk_percentage: 0,
        riskDistribution: {
          low: 0,
          moderate: 0,
          high: 0,
          critical: 0
        },
        recentAnalyses: [],
        activeAlerts: []
      };
    }

    const misinfoCount = all.filter((a) => a.module === 'misinformation' || a.sourceType === 'text').length;
    const violenceCount = all.filter((a) => a.module === 'violence' || ['image', 'video', 'webcam'].includes(a.sourceType)).length;
    const imageCount = all.filter((a) => a.sourceType === 'image' || a.sourceType === 'webcam').length;
    const videoCount = all.filter((a) => a.sourceType === 'video').length;

    const lowCount = all.filter((a) => a.riskLevel === 'Low').length;
    const modCount = all.filter((a) => a.riskLevel === 'Moderate').length;
    const highCount = all.filter((a) => a.riskLevel === 'High').length;
    const critCount = all.filter((a) => a.riskLevel === 'Critical').length;

    const totalHighRisk = highCount + critCount;
    const highRiskPct = total > 0 ? Math.round((totalHighRisk / total) * 1000) / 10 : 0;

    const totalConfidence = all.reduce((sum, a) => sum + (a.confidenceScore || 85), 0);
    const avgConf = Math.round(totalConfidence / total);

    const allAlerts = this.getAlerts();
    const resolvedCount = allAlerts.filter((a) => a.status === 'Resolved' || a.status === 'False Positive').length;
    const activeAlerts = allAlerts.filter((a) => a.status === 'Active' || a.status === 'Investigating');

    return {
      has_data: true,
      message: 'Statistics calculated from active database state.',
      totalAnalyses: total,
      misinformationCount: misinfoCount,
      violenceCount: violenceCount,
      highRiskAlertsCount: totalHighRisk,
      resolvedAlertsCount: resolvedCount,
      averageConfidence: avgConf,
      text_analyses: misinfoCount,
      image_analyses: imageCount,
      video_analyses: videoCount,
      misinformation_analyses: misinfoCount,
      violence_analyses: violenceCount,
      high_risk_analyses: totalHighRisk,
      moderate_risk_analyses: modCount,
      low_risk_analyses: lowCount,
      high_risk_percentage: highRiskPct,
      riskDistribution: {
        low: lowCount,
        moderate: modCount,
        high: highCount,
        critical: critCount
      },
      recentAnalyses: all.slice(0, 8),
      activeAlerts
    };
  }

  // Helper row converters
  private rowToAnalysisRecord(row: any): AnalysisRecord {
    return {
      id: row.id,
      module: row.module,
      sourceType: row.analysis_type,
      title: row.title,
      classification: row.classification,
      verdict: row.verdict || (['LIKELY TRUE', 'LIKELY FALSE', 'MISLEADING', 'UNVERIFIED'].includes(row.classification) ? row.classification : undefined),
      riskLevel: row.risk_level,
      riskScore: Number(row.risk_score),
      confidenceScore: Number(row.confidence_score),
      sensationalismIndex: row.sensationalism_index !== null && row.sensationalism_index !== undefined ? Number(row.sensationalism_index) : undefined,
      linguisticTone: row.linguistic_tone || undefined,
      explanation: row.explanation,
      keyFactors: row.key_factors ? this.safeJsonParse(row.key_factors, []) : [],
      claims: row.claims_json ? this.safeJsonParse(row.claims_json, []) : [],
      supportingEvidence: row.supporting_evidence ? this.safeJsonParse(row.supporting_evidence, []) : [],
      contradictingEvidence: row.contradicting_evidence ? this.safeJsonParse(row.contradicting_evidence, []) : [],
      factChecks: row.fact_checks ? this.safeJsonParse(row.fact_checks, []) : [],
      sources: row.sources ? this.safeJsonParse(row.sources, []) : [],
      caveats: row.caveats ? this.safeJsonParse(row.caveats, []) : [],
      articleMetadata: row.article_metadata ? this.safeJsonParse(row.article_metadata, undefined) : undefined,
      detectedObjects: row.detected_objects ? this.safeJsonParse(row.detected_objects, []) : [],
      threatIndicators: row.threat_indicators ? this.safeJsonParse(row.threat_indicators, []) : [],
      frameDetections: row.frame_detections ? this.safeJsonParse(row.frame_detections, []) : [],
      rawInputSnippet: row.raw_input_snippet || undefined,
      isDemo: Boolean(row.is_demo),
      createdAt: row.created_at
    };
  }

  private safeJsonParse(val: any, fallback: any): any {
    if (typeof val !== 'string') return val || fallback;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }

  private rowToAlertItem(row: any): AlertItem {
    return {
      id: row.id,
      analysisId: row.analysis_id,
      module: row.module,
      title: row.title,
      timestamp: row.timestamp,
      riskLevel: row.risk_level,
      riskScore: Number(row.risk_score),
      confidenceScore: Number(row.confidence_score),
      category: row.category,
      snippet: row.snippet || '',
      status: row.status,
      resolutionNotes: row.resolution_notes || undefined,
      assignedTo: row.assigned_to || undefined,
      resolvedAt: row.resolved_at || undefined
    };
  }

  async clearAllData() {
    this.inMemoryAnalyses = [];
    this.inMemoryAlerts = [];
    if (this.db) {
      try {
        this.db.run('DELETE FROM analyses');
        this.db.run('DELETE FROM alerts');
        this.saveToDisk();
      } catch (err) {
        console.warn('Error clearing SQLite:', err);
      }
    }
  }

  seedDemoData() {
    this.inMemoryAnalyses = [...INITIAL_DEMO_ANALYSES];
    this.inMemoryAlerts = [...INITIAL_DEMO_ALERTS];
    if (this.db) {
      try {
        this.db.run('DELETE FROM analyses');
        this.db.run('DELETE FROM alerts');
        for (const a of this.inMemoryAnalyses) {
          this.insertAnalysisToSqlite(a);
        }
        for (const al of this.inMemoryAlerts) {
          this.insertAlertToSqlite(al);
        }
        this.saveToDisk();
      } catch (err) {
        console.warn('Error re-seeding SQLite:', err);
      }
    }
  }
}

export const db = new SQLiteDatabaseStore();
