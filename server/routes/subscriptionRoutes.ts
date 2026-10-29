import { Router, Request, Response } from 'express';
import { backendStorage } from '../storage';

const router = Router();

// GET /api/recurring
router.get('/', (_req: Request, res: Response) => {
  const recurringBills = backendStorage.getRecurringBills();
  res.json({ recurringBills });
});

// POST /api/recurring
router.post('/', (req: Request, res: Response) => {
  const { title, amount, category, billingCycle, nextDueDate, paymentMethod } = req.body;
  if (!title || typeof amount !== 'number' || !category || !nextDueDate) {
    return res.status(400).json({ error: 'Missing required subscription fields.' });
  }

  const bill = backendStorage.addRecurringBill({
    title,
    amount,
    category,
    billingCycle: billingCycle || 'monthly',
    nextDueDate,
    paymentMethod: paymentMethod || 'Credit Card',
    isActive: true,
  });

  res.status(201).json({ recurringBill: bill });
});

// PATCH /api/recurring/:id/toggle
router.patch('/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const toggled = backendStorage.toggleRecurringBill(id);
  if (!toggled) {
    return res.status(404).json({ error: 'Subscription not found.' });
  }
  res.json({ recurringBill: toggled });
});

// DELETE /api/recurring/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = backendStorage.deleteRecurringBill(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Subscription not found.' });
  }
  res.json({ success: true, message: 'Subscription removed.' });
});

export default router;
