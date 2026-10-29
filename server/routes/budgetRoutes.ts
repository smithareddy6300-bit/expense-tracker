import { Router, Request, Response } from 'express';
import { backendStorage } from '../storage';

const router = Router();

// GET /api/budgets
router.get('/', (_req: Request, res: Response) => {
  const budgets = backendStorage.getBudgets();
  res.json({ budgets });
});

// PUT /api/budgets/:category
router.put('/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  const { monthlyLimit } = req.body;
  if (typeof monthlyLimit !== 'number' || monthlyLimit < 0) {
    return res.status(400).json({ error: 'Valid monthlyLimit is required.' });
  }

  const updated = backendStorage.updateBudget(decodeURIComponent(category), monthlyLimit);
  res.json({ budget: updated });
});

export default router;
