/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  PiggyBank,
  Plus,
  Receipt,
  Repeat,
  Sliders,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SummaryCards } from './components/SummaryCards';
import { BudgetAlertBanner } from './components/BudgetAlertBanner';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { BudgetManager } from './components/BudgetManager';
import { SavingsGoalsManager } from './components/SavingsGoalsManager';
import { RecurringManager } from './components/RecurringManager';
import { TransactionModal } from './components/TransactionModal';
import { ExportImportModal } from './components/ExportImportModal';
import { Transaction } from './types/finance';

type ActiveTab = 'overview' | 'transactions' | 'budgets' | 'goals' | 'recurring';

function ExpenseTrackerContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // If not logged in, render the Login / Sign Up portal
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation Bar with User Profile & Logout */}
      <Header
        onOpenNewTransaction={handleOpenNewTransaction}
        onOpenExportImport={() => setIsExportImportOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto pb-1 gap-2 no-scrollbar">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview & Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>All Transactions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('budgets')}
              className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'budgets'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Category Budgets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'goals'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              <span>Savings Targets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recurring')}
              className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'recurring'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>Subscriptions & Bills</span>
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>October 2026 Fiscal Cycle</span>
          </div>
        </div>

        {/* Dynamic View Sections */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <SummaryCards />

            {/* Budget Alert Notice if over 80% */}
            <BudgetAlertBanner onNavigateToBudgets={() => setActiveTab('budgets')} />

            {/* Analytics Visualizations */}
            <AnalyticsCharts />

            {/* Recent Transactions Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Recent Transactions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Latest expenditures and deposits in your account
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
                >
                  View All & Filter
                </button>
              </div>

              <TransactionList
                onEditTransaction={handleEditTransaction}
                onOpenNewTransaction={handleOpenNewTransaction}
              />
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Transaction Ledger
                </h2>
                <p className="text-xs text-slate-500">
                  Search, classify, batch delete, and review your financial transactions
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewTransaction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Transaction</span>
              </button>
            </div>

            <TransactionList
              onEditTransaction={handleEditTransaction}
              onOpenNewTransaction={handleOpenNewTransaction}
            />
          </div>
        )}

        {activeTab === 'budgets' && <BudgetManager />}

        {activeTab === 'goals' && <SavingsGoalsManager />}

        {activeTab === 'recurring' && <RecurringManager />}
      </main>

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        editingTransaction={editingTransaction}
      />

      {/* Export / Import & Backup Modal */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <ExpenseTrackerContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
