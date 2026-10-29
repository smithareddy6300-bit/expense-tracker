import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Minus,
  PiggyBank,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoal } from '../types/finance';

export const SavingsGoalsManager: React.FC = () => {
  const {
    goals,
    addGoal,
    adjustGoalFunds,
    deleteGoal,
    formatCurrency,
  } = useFinance();

  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [adjustingGoal, setAdjustingGoal] = useState<{
    id: string;
    title: string;
    type: 'deposit' | 'withdraw';
  } | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('100');

  // Form states for new goal
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-06-30');
  const [color, setColor] = useState('#059669');
  const [notes, setNotes] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    addGoal({
      title: title.trim(),
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(initialAmount) || 0,
      targetDate,
      color,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setTargetAmount('');
    setInitialAmount('');
    setNotes('');
    setShowNewGoalModal(false);
  };

  const handleApplyAdjustment = () => {
    if (!adjustingGoal) return;
    const amount = parseFloat(adjustmentAmount);
    if (!isNaN(amount) && amount > 0) {
      adjustGoalFunds(
        adjustingGoal.id,
        adjustingGoal.type === 'deposit' ? amount : -amount
      );
    }
    setAdjustingGoal(null);
  };

  const colorOptions = [
    '#059669', // Emerald
    '#0891b2', // Cyan
    '#2563eb', // Blue
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#ea580c', // Orange
    '#d97706', // Amber
  ];

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-emerald-600" />
            <span>Savings Jars & Long-Term Targets</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Earmark funds for life milestones, travel ambitions, and emergency reserves
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Reserved</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatCurrency(totalSaved)} / {formatCurrency(totalTarget)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowNewGoalModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Savings Target</span>
          </button>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const percent = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
          const remaining = Math.max(0, g.targetAmount - g.currentAmount);
          const isCompleted = g.currentAmount >= g.targetAmount;

          return (
            <div
              key={g.id}
              className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: g.color }}
                    />
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {g.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteGoal(g.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {g.notes && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                    {g.notes}
                  </p>
                )}

                {/* Amount Progress */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-xl font-bold font-mono text-slate-900">
                      {formatCurrency(g.currentAmount)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {' '}/ {formatCurrency(g.targetAmount)}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {percent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: g.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Target: {g.targetDate}</span>
                  </span>
                  <span>{formatCurrency(remaining)} left</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setAdjustingGoal({
                      id: g.id,
                      title: g.title,
                      type: 'deposit',
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAdjustingGoal({
                      id: g.id,
                      title: g.title,
                      type: 'withdraw',
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Create New Savings Target
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Set a dedicated savings jar for a specific future purchase or safety net.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Name
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Home Down Payment, New Camera"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Goal ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="10"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Current Balance ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Jar Theme Color
                </label>
                <div className="flex items-center gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes or Motivation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Where is this money kept? What is the deadline based on?"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Create Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Funds Modal */}
      {adjustingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-xs w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {adjustingGoal.type === 'deposit' ? 'Deposit to Goal' : 'Withdraw from Goal'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {adjustingGoal.title}
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Amount ({useFinance().currency.code})
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  autoFocus
                />
              </div>

              {/* Quick pills */}
              <div className="flex gap-1.5">
                {[50, 100, 250, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAdjustmentAmount(val.toString())}
                    className="flex-1 py-1 text-[11px] font-mono bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustingGoal(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAdjustment}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
