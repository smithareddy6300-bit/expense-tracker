import { Router, Request, Response } from 'express';
import { backendStorage } from '../storage';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = backendStorage.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email address.' });
  }

  if (user.passwordHash !== password) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const { passwordHash: _, ...profile } = user;
  return res.json({ success: true, user: profile });
});

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = backendStorage.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newUser = backendStorage.createUser(name, email, password);
  const { passwordHash: _, ...profile } = newUser;
  return res.status(201).json({ success: true, user: profile });
});

export default router;
