import { Router, Request, Response } from 'express';
import { db } from '../db';
import { executeEvidenceVerificationPipeline } from '../services/evidenceService';

const router = Router();

// POST /api/misinformation/analyze
router.post('/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, claim, headline, url, isUrl, title, userName } = req.body;

    const inputContent = (text || claim || headline || url || '').trim();
    if (!inputContent) {
      res.status(400).json({ error: 'Please provide text, a claim, a headline, or a news article URL to analyze.' });
      return;
    }

    if (inputContent.length > 50000) {
      res.status(400).json({ error: 'Input length exceeds maximum allowed character limit (50,000 chars).' });
      return;
    }

    const record = await executeEvidenceVerificationPipeline({
      text,
      claim,
      headline,
      url,
      isUrl: Boolean(isUrl || (url && url.length > 0)),
      title,
      userName
    });

    const saved = db.addAnalysis(record);

    res.json({
      success: true,
      data: saved
    });
  } catch (error: any) {
    console.error('Error in evidence verification pipeline:', error);

    const errorMessage = error?.message || 'Failed to complete evidence verification pipeline.';
    const isUrlError = errorMessage.includes('Unable to access this article') || errorMessage.includes('timed out');

    res.status(isUrlError ? 400 : 500).json({
      error: errorMessage,
      details: error?.message || 'Evidence verification error'
    });
  }
});

export default router;
