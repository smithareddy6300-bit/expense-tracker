import React, { useState } from 'react';
import {
  Calendar,
  Check,
  CreditCard,
  Pause,
  Play,
  Plus,
  Repeat,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../data/initialData';
import { ExpenseCategory, PaymentMethod } from '../types/finance';

export const RecurringManager: React.FC = () => {
  const {
    recurringBills,
    addRecurringBill,
    toggleRecurringBill,
    deleteRecurringBill,
    formatCurrency,
  } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Entertainment & Fun');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState('2026-11-15');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    addRecurringBill({
      title: title.trim(),
      amount: parseFloat(amount) || 0,
      category,
      billingCycle,
      nextDueDate,
      paymentMethod,
      isActive: true,
    });

    setTitle('');
    setAmount('');
    setShowAddModal(false);
  };

  // Calculations for monthly commitment
  const monthlyCommitment = recurringBills.reduce((acc, bill) => {
    if (!bill.isActive) return acc;
    if (bill.billingCycle === 'monthly') return acc + bill.amount;
    if (bill.billingCycle === 'yearly') return acc + bill.amount / 12;
    if (bill.billingCycle === 'weekly') return acc + (bill.amount * 52) / 12;
    return acc;
  }, 0);

  const annualCommitment = monthlyCommitment * 12;

  // Days until due helper
  const getDaysUntil = (dateStr: string) => {
    const today = new Date('2026-10-29').getTime();
    const target = new Date(dateStr).getTime();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-600" />
            <span>Recurring Bills & Subscriptions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit automatic charges, monthly renewals, and fixed commitments
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Total</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatCurrency(monthlyCommitment)} / mo
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Annual Projection</span>
            <span className="font-mono font-bold text-slate-600 text-sm">
              {formatCurrency(annualCommitment)} / yr
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Grid of Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringBills.map((bill) => {
          const daysLeft = getDaysUntil(bill.nextDueDate);
          const colorMeta = CATEGORY_COLORS[bill.category] || { hex: '#64748b' };

          return (
            <div
              key={bill.id}
              className={`bg-white rounded-xl p-4 border transition-colors flex flex-col justify-between ${
                bill.isActive ? 'border-slate-200/80 shadow-xs' : 'border-slate-200/40 opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: colorMeta.hex }}
                    />
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {bill.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleRecurringBill(bill.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                      title={bill.isActive ? 'Pause subscription' : 'Resume subscription'}
                    >
                      {bill.isActive ? (
                        <Pause className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRecurringBill(bill.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                      title="Delete bill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount & Frequency */}
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {formatCurrency(bill.amount)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / {bill.billingCycle}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                  <div className="flex items-center justify-between">
                    <span>Category:</span>
                    <span className="text-slate-700 font-medium truncate max-w-[150px]">
                      {bill.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment:</span>
                    <span className="text-slate-700 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      <span>{bill.paymentMethod}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Due Date Indicator */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Next: {bill.nextDueDate}</span>
                </span>
                <span
                  className={`font-semibold font-mono text-[11px] px-1.5 py-0.5 rounded ${
                    daysLeft <= 3
                      ? 'text-rose-700 bg-rose-50'
                      : daysLeft <= 7
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-slate-600 bg-slate-100'
                  }`}
                >
                  {daysLeft <= 0 ? 'Due Today' : `in ${daysLeft} days`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Recurring Bill or Subscription
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Track periodic subscriptions, utilities, and memberships.
            </p>

            <form onSubmit={handleAddBill} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Service / Provider Name
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spotify, Gym Pass, Electric Bill"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 15.99"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI / Mobile Pay">UPI / Mobile Pay</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Next Renewal / Due Date
                </label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
