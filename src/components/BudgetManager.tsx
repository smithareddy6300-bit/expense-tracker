import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORY_COLORS } from '../data/initialData';
import { ExpenseCategory } from '../types/finance';

export const BudgetManager: React.FC = () => {
  const {
    budgets,
    categorySpendingCurrentMonth,
    updateBudget,
    formatCurrency,
  } = useFinance();

  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [newLimitInput, setNewLimitInput] = useState<string>('');

  const handleStartEdit = (cat: ExpenseCategory, currentLimit: number) => {
    setEditingCategory(cat);
    setNewLimitInput(currentLimit.toString());
  };

  const handleSaveEdit = () => {
    if (editingCategory) {
      const num = parseFloat(newLimitInput);
      if (!isNaN(num) && num >= 0) {
        updateBudget(editingCategory, num);
      }
      setEditingCategory(null);
    }
  };

  // Aggregates
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalSpentInBudgeted = budgets.reduce(
    (acc, b) => acc + (categorySpendingCurrentMonth[b.category] || 0),
    0
  );
  const overallPercent = totalBudgeted > 0 ? Math.round((totalSpentInBudgeted / totalBudgeted) * 100) : 0;
  const totalBuffer = totalBudgeted - totalSpentInBudgeted;

  return (
    <div className="space-y-6">
      {/* Overview Stat Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Monthly Budget Allocations (October 2026)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set spending ceilings across categories to maintain your savings rate
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Budgeted</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {formatCurrency(totalBudgeted)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Spent</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {formatCurrency(totalSpentInBudgeted)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Remaining Buffer</span>
              <span
                className={`font-mono font-bold text-sm ${
                  totalBuffer >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(totalBuffer)}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700">Overall Budget Utilization</span>
            <span className="font-mono font-bold text-slate-900">{overallPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent > 100
                  ? 'bg-rose-500'
                  : overallPercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Category Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const spent = categorySpendingCurrentMonth[b.category] || 0;
          const limit = b.monthlyLimit;
          const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
          const remaining = limit - spent;
          const isOver = percent >= 100;
          const isWarning = percent >= 80 && percent < 100;
          const colorMeta = CATEGORY_COLORS[b.category] || { hex: '#64748b' };

          return (
            <div
              key={b.category}
              className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: colorMeta.hex }}
                    />
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {b.category}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(b.category, b.monthlyLimit)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    title="Edit monthly limit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Numbers */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {' '}/ {formatCurrency(limit)}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      isOver
                        ? 'text-rose-700 bg-rose-50'
                        : isWarning
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>

              {/* Footer status text */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                {isOver ? (
                  <span className="text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Over budget by {formatCurrency(Math.abs(remaining))}</span>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formatCurrency(remaining)} remaining</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleStartEdit(b.category, b.monthlyLimit)}
                  className="text-[11px] text-slate-500 hover:text-slate-900 underline"
                >
                  Adjust limit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Budget Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Adjust Monthly Limit
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Category: <span className="text-slate-800 font-semibold">{editingCategory}</span>
            </p>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Ceiling Amount (USD equivalent)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={newLimitInput}
                  onChange={(e) => setNewLimitInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  placeholder="e.g. 500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
