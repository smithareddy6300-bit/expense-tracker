import { Router } from 'express';
import authRoutes from './authRoutes';
import transactionRoutes from './transactionRoutes';
import budgetRoutes from './budgetRoutes';
import goalRoutes from './goalRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import { backendStorage } from '../storage';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/transactions', transactionRoutes);
apiRouter.use('/budgets', budgetRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/recurring', subscriptionRoutes);

// Health check / status
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Personal Expense Tracker Backend API',
  });
});

// Reset demo data
apiRouter.post('/reset', (_req, res) => {
  backendStorage.resetAll();
  res.json({ success: true, message: 'Backend data reset to demo initial data.' });
});

export default apiRouter;
