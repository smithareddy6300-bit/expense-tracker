import { Router, Request, Response } from 'express';
import { backendStorage } from '../storage';

const router = Router();

// GET /api/goals
router.get('/', (_req: Request, res: Response) => {
  const goals = backendStorage.getGoals();
  res.json({ goals });
});

// POST /api/goals
router.post('/', (req: Request, res: Response) => {
  const { title, targetAmount, currentAmount, targetDate, color, notes } = req.body;
  if (!title || typeof targetAmount !== 'number' || !targetDate) {
    return res.status(400).json({ error: 'Missing required goal parameters.' });
  }

  const goal = backendStorage.addGoal({
    title,
    targetAmount,
    currentAmount: currentAmount || 0,
    targetDate,
    color: color || '#059669',
    notes,
  });

  res.status(201).json({ goal });
});

// PUT /api/goals/:id
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = backendStorage.updateGoal(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Goal not found.' });
  }
  res.json({ goal: updated });
});

// DELETE /api/goals/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = backendStorage.deleteGoal(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Goal not found.' });
  }
  res.json({ success: true, message: 'Goal removed.' });
});

export default router;
