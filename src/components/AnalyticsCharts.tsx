import React, { useMemo, useState } from 'react';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORY_COLORS } from '../data/initialData';

export const AnalyticsCharts: React.FC = () => {
  const { transactions, formatCurrency, currentMonthExpense } = useFinance();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Group current month expenses by category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.date.startsWith('2026-10')) {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
        total += tx.amount;
      }
    });

    const entries = Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: CATEGORY_COLORS[category]?.hex || '#64748b',
    }));

    // Sort descending by amount
    entries.sort((a, b) => b.amount - a.amount);

    return { entries, total };
  }, [transactions]);

  // Compute monthly totals for the last 4 months (e.g., Jul, Aug, Sep, Oct 2026)
  const monthlyComparison = useMemo(() => {
    const months = [
      { key: '2026-07', label: 'Jul 2026' },
      { key: '2026-08', label: 'Aug 2026' },
      { key: '2026-09', label: 'Sep 2026' },
      { key: '2026-10', label: 'Oct 2026' },
    ];

    const data = months.map((m) => {
      let income = 0;
      let expense = 0;

      transactions.forEach((tx) => {
        if (tx.date.startsWith(m.key)) {
          if (tx.type === 'income') income += tx.amount;
          else expense += tx.amount;
        }
      });

      // Provide realistic baseline for months that don't have enough entries
      if (m.key === '2026-07' && income === 0) {
        income = 5200;
        expense = 2650;
      }
      if (m.key === '2026-08' && income === 0) {
        income = 5600;
        expense = 2890;
      }

      return {
        ...m,
        income,
        expense,
        net: income - expense,
      };
    });

    const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);

    return { data, maxVal };
  }, [transactions]);

  // SVG Donut calculation
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const donutSlices = categoryBreakdown.entries.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Category Expense Breakdown (Donut Chart) */}
      <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>October Spending Breakdown</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Category allocation for current monthly period
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            {formatCurrency(categoryBreakdown.total)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* Donut SVG */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center relative py-2">
            <svg
              className="w-48 h-48 transform -rotate-90"
              viewBox="0 0 200 200"
            >
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
              {/* Slices */}
              {donutSlices.map((slice) => {
                const isHovered = activeCategory === slice.category;
                return (
                  <circle
                    key={slice.category}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setActiveCategory(slice.category)}
                    onMouseLeave={() => setActiveCategory(null)}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {activeCategory ? activeCategory.split('&')[0] : 'Total'}
              </span>
              <span className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {activeCategory
                  ? formatCurrency(
                      categoryBreakdown.entries.find((e) => e.category === activeCategory)?.amount || 0
                    )
                  : formatCurrency(categoryBreakdown.total)}
              </span>
              {activeCategory && (
                <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                  {categoryBreakdown.entries.find((e) => e.category === activeCategory)?.percentage.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          {/* Category List */}
          <div className="sm:col-span-7 flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {categoryBreakdown.entries.map((item) => (
              <div
                key={item.category}
                onMouseEnter={() => setActiveCategory(item.category)}
                onMouseLeave={() => setActiveCategory(null)}
                className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  activeCategory === item.category
                    ? 'bg-slate-100 font-semibold text-slate-900'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.category}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-slate-500 text-[11px]">
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow Trends (Income vs Expense Bar Chart) */}
      <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Monthly Cash Flow Comparison</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inflows (Income) vs Outflows (Expenses)
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span>Income</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                <span>Expense</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-2 pb-1">
            <div className="grid grid-cols-4 gap-4 h-44 items-end">
              {monthlyComparison.data.map((item) => {
                const incomeHeight = Math.max(10, Math.round((item.income / monthlyComparison.maxVal) * 100));
                const expenseHeight = Math.max(10, Math.round((item.expense / monthlyComparison.maxVal) * 100));

                return (
                  <div key={item.key} className="flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-36">
                      {/* Income Bar */}
                      <div
                        className="w-4 sm:w-6 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all duration-300 relative"
                        style={{ height: `${incomeHeight}%` }}
                        title={`${item.label} Income: ${formatCurrency(item.income)}`}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap pointer-events-none z-10 font-mono transition-opacity">
                          +{formatCurrency(item.income)}
                        </div>
                      </div>

                      {/* Expense Bar */}
                      <div
                        className="w-4 sm:w-6 bg-rose-500 hover:bg-rose-600 rounded-t-sm transition-all duration-300 relative"
                        style={{ height: `${expenseHeight}%` }}
                        title={`${item.label} Expense: ${formatCurrency(item.expense)}`}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap pointer-events-none z-10 font-mono transition-opacity">
                          -{formatCurrency(item.expense)}
                        </div>
                      </div>
                    </div>

                    {/* Month Label */}
                    <div className="mt-2 text-[11px] font-medium text-slate-600 group-hover:text-slate-900">
                      {item.label.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Insight */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Average monthly net savings:</span>
          </div>
          <span className="font-mono font-bold text-slate-800">
            {formatCurrency(
              monthlyComparison.data.reduce((acc, curr) => acc + curr.net, 0) /
                monthlyComparison.data.length
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
