import { Router, Request, Response } from 'express';
import { db } from '../db';
import { UserProfile } from '../../src/types';

const router = Router();

// POST /api/auth/register
router.post('/register', (req: Request, res: Response): void => {
  const { name, email, role } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  const user = db.createUser(
    name || email.split('@')[0],
    email,
    role || 'Web Analyst'
  );

  res.json({
    success: true,
    user
  });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response): void => {
  const { email, name, role } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    user = db.createUser(name || email.split('@')[0], email, role || 'Web Analyst');
  }

  res.json({
    success: true,
    user
  });
});

export default router;
