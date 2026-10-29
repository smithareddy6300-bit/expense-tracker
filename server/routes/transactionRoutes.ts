import { Router, Request, Response } from 'express';
import { backendStorage } from '../storage';

const router = Router();

// GET /api/transactions
router.get('/', (_req: Request, res: Response) => {
  const transactions = backendStorage.getTransactions();
  res.json({ transactions });
});

// POST /api/transactions
router.post('/', (req: Request, res: Response) => {
  const { title, amount, type, category, date, paymentMethod, notes, isRecurring } = req.body;
  if (!title || typeof amount !== 'number' || !type || !category || !date) {
    return res.status(400).json({ error: 'Missing required transaction fields.' });
  }

  const transaction = backendStorage.addTransaction({
    title,
    amount: Math.abs(amount),
    type,
    category,
    date,
    paymentMethod: paymentMethod || 'Credit Card',
    notes,
    isRecurring: !!isRecurring,
  });

  res.status(201).json({ transaction });
});

// PUT /api/transactions/:id
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = backendStorage.updateTransaction(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Transaction not found.' });
  }
  res.json({ transaction: updated });
});

// DELETE /api/transactions/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = backendStorage.deleteTransaction(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Transaction not found.' });
  }
  res.json({ success: true, message: 'Transaction deleted.' });
});

// POST /api/transactions/batch-delete
router.post('/batch-delete', (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'ids must be an array of transaction IDs.' });
  }

  const count = backendStorage.batchDeleteTransactions(ids);
  res.json({ success: true, deletedCount: count });
});

export default router;
