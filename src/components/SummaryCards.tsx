import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Percent,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const SummaryCards: React.FC = () => {
  const {
    formatCurrency,
    totalIncome,
    totalExpense,
    netCashFlow,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthNet,
    savingsRate,
  } = useFinance();

  // Daily burn rate for current month (assume 29 days into October)
  const dailyBurn = currentMonthExpense > 0 ? currentMonthExpense / 29 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Net Balance */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Net Balance
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(netCashFlow)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-emerald-700 font-medium">
            {formatCurrency(totalIncome)} In
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-600 font-medium">
            {formatCurrency(totalExpense)} Out
          </span>
        </div>
      </div>

      {/* Monthly Income */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            October Income
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600">
            {formatCurrency(currentMonthIncome)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active income & cash inflows</span>
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            October Expenses
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(currentMonthExpense)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          <span>Avg. {formatCurrency(dailyBurn)} / day</span>
        </div>
      </div>

      {/* Net Savings & Rate */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Savings Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-indigo-600">
            {savingsRate}%
          </span>
          <span className="text-xs font-mono font-medium text-slate-500">
            ({formatCurrency(currentMonthNet, { showSign: true })})
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
