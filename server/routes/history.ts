import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/history
router.get('/', (req: Request, res: Response): void => {
  const moduleFilter = (req.query.module || req.query.analysis_type) as string | undefined;
  const q = (req.query.q as string | undefined)?.toLowerCase();
  let history = db.getAnalyses(moduleFilter);

  if (q && q.trim()) {
    const term = q.trim();
    history = history.filter(
      (h) =>
        h.title.toLowerCase().includes(term) ||
        h.explanation.toLowerCase().includes(term) ||
        h.classification.toLowerCase().includes(term) ||
        (h.rawInputSnippet && h.rawInputSnippet.toLowerCase().includes(term))
    );
  }

  res.json({ success: true, count: history.length, data: history });
});

// GET /api/history/:id
router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const item = db.getAnalysisById(id);
  if (!item) {
    res.status(404).json({ error: `Analysis item with ID "${id}" not found.` });
    return;
  }
  res.json({ success: true, data: item });
});

// DELETE /api/history/:id
router.delete('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const deleted = db.deleteAnalysis(id);
  if (!deleted) {
    res.status(404).json({ error: `Analysis item with ID "${id}" not found.` });
    return;
  }
  res.json({ success: true, message: `Record "${id}" deleted successfully.` });
});

export default router;
