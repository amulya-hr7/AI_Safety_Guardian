import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/alerts
router.get('/', (req: Request, res: Response): void => {
  const status = req.query.status as string | undefined;
  const alerts = db.getAlerts(status);
  res.json({ success: true, count: alerts.length, data: alerts });
});

// POST /api/alerts/:id/resolve
router.post('/:id/resolve', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status, notes, assignedTo } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Status is required to update alert resolution.' });
    return;
  }

  const updated = db.resolveAlert(id, status, notes, assignedTo);
  if (!updated) {
    res.status(404).json({ error: `Alert with ID "${id}" not found.` });
    return;
  }

  res.json({ success: true, data: updated });
});

export default router;
