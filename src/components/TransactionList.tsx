import React, { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  CreditCard,
  Edit2,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../data/initialData';
import { DateFilterRange, Transaction } from '../types/finance';

interface TransactionListProps {
  onEditTransaction: (tx: Transaction) => void;
  onOpenNewTransaction: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onEditTransaction,
  onOpenNewTransaction,
}) => {
  const {
    filteredTransactions,
    transactions,
    deleteTransaction,
    batchDeleteTransactions,
    formatCurrency,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    dateRange,
    setDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    sortBy,
    setSortBy,
    clearFilters,
  } = useFinance();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((tx) => tx.id));
    }
  };

  const handleBatchDelete = () => {
    batchDeleteTransactions(selectedIds);
    setSelectedIds([]);
    setShowBatchConfirm(false);
  };

  // Payment method options
  const paymentMethods = [
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Cash',
    'UPI / Mobile Pay',
    'Digital Wallet',
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Controls & Filter Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by merchant, note, category..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Type Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Second Row: Detailed Filters & Sorting */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            >
              <option value="all">All Categories</option>
              <optgroup label="Expense Categories">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Income Categories">
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            >
              <option value="all">All Methods</option>
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Preset */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Timeframe
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateFilterRange)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            >
              <option value="this_month">This Month (Oct 2026)</option>
              <option value="last_month">Last Month (Sep 2026)</option>
              <option value="last_30_days">Past 30 Days</option>
              <option value="year_to_date">Year-to-Date (2026)</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="title">Description A-Z</option>
            </select>
          </div>

          {/* Reset Filters button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-lg border border-slate-200 transition-colors font-medium h-[33px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Inputs (when selected) */}
        {dateRange === 'custom' && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 text-xs">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
            />
            <span className="text-slate-500 text-xs">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
            />
          </div>
        )}
      </div>

      {/* Batch Action Bar if any selected */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs transition-all">
          <div className="flex items-center gap-3">
            <span className="font-semibold">
              {selectedIds.length} transaction{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-slate-300 hover:text-white underline"
            >
              Deselect All
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowBatchConfirm(true)}
            className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {/* Table & List View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <th className="py-3 px-4 w-10">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-slate-600 flex items-center"
                >
                  {selectedIds.length > 0 && selectedIds.length === filteredTransactions.length ? (
                    <CheckSquare className="w-4 h-4 text-slate-900" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Method</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-3">
                    <p className="text-sm font-semibold text-slate-700">
                      No matching transactions found
                    </p>
                    <p className="text-xs text-slate-400">
                      Try relaxing your search terms or date filters, or record a new transaction.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenNewTransaction}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Transaction</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isSelected = selectedIds.includes(tx.id);
                const isIncome = tx.type === 'income';
                const catMeta = CATEGORY_COLORS[tx.category] || {
                  bg: 'bg-slate-100',
                  text: 'text-slate-800',
                  hex: '#64748b',
                };

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      isSelected ? 'bg-slate-50/90' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(tx.id)}
                        className="text-slate-300 hover:text-slate-600 flex items-center"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-slate-900" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Description & Notes */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{tx.title}</span>
                        {tx.isRecurring && (
                          <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                            Recurring
                          </span>
                        )}
                      </div>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                          {tx.notes}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: catMeta.hex }}
                        />
                        <span>{tx.category}</span>
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>{tx.paymentMethod}</span>
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-xs ${
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="px-4 py-3 bg-slate-50/75 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{filteredTransactions.length}</span> of{' '}
          <span className="font-semibold text-slate-800">{transactions.length}</span> recorded entries
        </div>
        <div className="font-mono text-slate-600">
          Filtered Net:{' '}
          <span className="font-bold text-slate-900">
            {formatCurrency(
              filteredTransactions.reduce(
                (sum, tx) => (tx.type === 'income' ? sum + tx.amount : sum - tx.amount),
                0
              )
            )}
          </span>
        </div>
      </div>

      {/* Delete Single Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete Transaction?
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Batch Confirmation Dialog */}
      {showBatchConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete {selectedIds.length} Transactions?
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              You are about to permanently delete {selectedIds.length} selected records.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBatchConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
