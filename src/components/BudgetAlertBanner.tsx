import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface BudgetAlertBannerProps {
  onNavigateToBudgets: () => void;
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({
  onNavigateToBudgets,
}) => {
  const { budgetAlerts, formatCurrency } = useFinance();

  if (budgetAlerts.length === 0) return null;

  const topAlert = budgetAlerts[0];
  const isOver = topAlert.percent >= 100;

  return (
    <div
      className={`rounded-xl p-3.5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isOver
          ? 'bg-rose-50/70 border-rose-200 text-rose-900'
          : 'bg-amber-50/70 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isOver ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          {isOver ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        </div>
        <div className="text-xs">
          <span className="font-bold">
            {isOver ? 'Budget Exceeded:' : 'Budget Alert:'}
          </span>{' '}
          <span className="font-semibold">{topAlert.category}</span> is at{' '}
          <span className="font-mono font-bold">{topAlert.percent}%</span> of limit ({formatCurrency(topAlert.spent)} / {formatCurrency(topAlert.limit)})
          {budgetAlerts.length > 1 && (
            <span className="ml-1 text-slate-600">
              (+{budgetAlerts.length - 1} other {budgetAlerts.length - 1 === 1 ? 'category' : 'categories'})
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onNavigateToBudgets}
        className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
          isOver
            ? 'bg-rose-600 hover:bg-rose-700 text-white'
            : 'bg-amber-600 hover:bg-amber-700 text-white'
        }`}
      >
        <span>Manage Budgets</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
