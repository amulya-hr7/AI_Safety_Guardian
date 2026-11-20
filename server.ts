import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { db } from './server/db';
import misinformationRoutes from './server/routes/misinformation';
import violenceRoutes from './server/routes/violence';
import alertsRoutes from './server/routes/alerts';
import historyRoutes from './server/routes/history';
import authRoutes from './server/routes/auth';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing with generous limit for base64 camera frames/images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Universal Health Check Handlers (supports Cloud Run, kubernetes, nginx, and client health probes)
  const healthCheckHandler = (req: express.Request, res: express.Response) => {
    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    res.status(200).json({
      status: 'operational',
      engine: hasGemini ? 'Google Gemini 3.7 Flash Live' : 'Demo / Simulated High-Fidelity Engine',
      hasApiKey: hasGemini,
      timestamp: new Date().toISOString()
    });
  };

  app.get('/api/health', healthCheckHandler);
  app.get('/health', healthCheckHandler);
  app.get('/healthz', healthCheckHandler);
  app.get('/_health', healthCheckHandler);

  app.get('/api/stats', (req, res) => {
    try {
      const stats = db.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Database query error' });
    }
  });

  // FastAPI endpoint parity: GET /api/dashboard/stats
  app.get('/api/dashboard/stats', (req, res) => {
    try {
      const stats = db.getDashboardStats();
      res.json({
        has_data: stats.totalAnalyses > 0,
        message: stats.totalAnalyses === 0 ? 'No analyses performed yet.' : 'Database query successful',
        total_analyses: stats.totalAnalyses,
        misinformation_analyses: stats.misinformationCount,
        violence_analyses: stats.violenceCount,
        text_analyses: stats.text_analyses,
        image_analyses: stats.image_analyses,
        video_analyses: stats.video_analyses,
        high_risk_analyses: stats.high_risk_analyses,
        moderate_risk_analyses: stats.moderate_risk_analyses,
        low_risk_analyses: stats.low_risk_analyses,
        high_risk_percentage: stats.high_risk_percentage,
        high_risk: stats.high_risk_analyses,
        average_confidence: stats.averageConfidence,
        risk_distribution: {
          low: stats.riskDistribution.low,
          moderate: stats.riskDistribution.moderate,
          medium: stats.riskDistribution.moderate,
          high: stats.riskDistribution.high,
          critical: stats.riskDistribution.critical
        },
        recent_activity: stats.recentAnalyses,
        recentAnalyses: stats.recentAnalyses,
        activeAlerts: stats.activeAlerts
      });
    } catch (err: any) {
      res.status(500).json({
        has_data: false,
        error: 'Failed to query database',
        detail: err?.message || String(err)
      });
    }
  });

  // FastAPI endpoint parity: POST /api/analyze/text
  app.post('/api/analyze/text', (req, res, next) => {
    req.url = '/analyze';
    misinformationRoutes(req, res, next);
  });

  // FastAPI endpoint parity: POST /api/analyze/image & POST /api/analyze/video
  app.post('/api/analyze/image', (req, res, next) => {
    req.url = '/analyze';
    req.body.sourceType = 'image';
    violenceRoutes(req, res, next);
  });

  app.post('/api/analyze/video', (req, res, next) => {
    req.url = '/analyze';
    req.body.sourceType = 'video';
    violenceRoutes(req, res, next);
  });

  app.post('/api/demo/seed', (req, res) => {
    db.seedDemoData();
    res.json({ success: true, message: 'Demo dataset reset successfully.' });
  });

  // Mount modular route handlers
  app.use('/api/misinformation', misinformationRoutes);
  app.use('/api/violence', violenceRoutes);
  app.use('/api/alerts', alertsRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/auth', authRoutes);

  // Production static serving vs Vite middleware for development
  const distCandidate = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distCandidate, 'index.html'));
  const isDevProcess = Boolean(
    process.env.NODE_ENV === 'development' ||
    process.env.npm_lifecycle_event === 'dev'
  );
  const isProduction = process.env.NODE_ENV === 'production' || (hasDist && !isDevProcess);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const candidates = [
      distCandidate,
      path.resolve(process.cwd(), 'dist'),
      path.resolve(__dirname, '.'),
      path.resolve(__dirname, 'dist'),
      path.resolve(__dirname, '..', 'dist')
    ];
    const distPath = candidates.find(p => fs.existsSync(path.join(p, 'index.html'))) || distCandidate;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('<!DOCTYPE html><html><head><title>AI Safety System</title></head><body>AI Safety Detection System is starting up...</body></html>');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Safety Detection Server running on http://0.0.0.0:${PORT} (env: ${isProduction ? 'production' : 'development'})`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
