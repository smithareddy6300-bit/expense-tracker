import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  CategoryBudget,
  Currency,
  DateFilterRange,
  ExpenseCategory,
  RecurringBill,
  SavingsGoal,
  Transaction,
  TransactionType,
} from '../types/finance';
import {
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_RECURRING_BILLS,
  INITIAL_TRANSACTIONS,
  SUPPORTED_CURRENCIES,
} from '../data/initialData';
import {
  budgetApi,
  goalApi,
  recurringApi,
  transactionApi,
} from '../api/client';

interface FinanceContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatCurrency: (amount: number, options?: { showSign?: boolean; absolute?: boolean }) => string;

  transactions: Transaction[];
  filteredTransactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  batchDeleteTransactions: (ids: string[]) => void;

  // Filters & Sorting
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  typeFilter: 'all' | 'expense' | 'income';
  setTypeFilter: (t: 'all' | 'expense' | 'income') => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (p: string) => void;
  dateRange: DateFilterRange;
  setDateRange: (r: DateFilterRange) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'title';
  setSortBy: (s: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'title') => void;
  clearFilters: () => void;

  // Budgets
  budgets: CategoryBudget[];
  updateBudget: (category: ExpenseCategory, monthlyLimit: number) => void;

  // Savings Goals
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  adjustGoalFunds: (id: string, delta: number) => void;
  deleteGoal: (id: string) => void;

  // Recurring bills
  recurringBills: RecurringBill[];
  addRecurringBill: (bill: Omit<RecurringBill, 'id'>) => void;
  toggleRecurringBill: (id: string) => void;
  deleteRecurringBill: (id: string) => void;

  // Calculated Stats
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  savingsRate: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  currentMonthNet: number;
  categorySpendingCurrentMonth: Record<string, number>;
  budgetAlerts: { category: string; spent: number; limit: number; percent: number }[];

  // Data management
  exportCSV: () => void;
  exportJSON: () => void;
  importCSV: (csvString: string) => { success: boolean; count: number; error?: string };
  importJSON: (jsonString: string) => { success: boolean; count: number; error?: string };
  resetData: () => void;
}

const STORAGE_KEYS = {
  TRANSACTIONS: 'pet_transactions_v2',
  BUDGETS: 'pet_budgets_v2',
  GOALS: 'pet_goals_v2',
  BILLS: 'pet_bills_v2',
  CURRENCY: 'pet_currency_v2',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Currency
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = SUPPORTED_CURRENCIES.find((c) => c.code === parsed.code);
        if (match) return match;
      } catch {
        // fallback
      }
    }
    return SUPPORTED_CURRENCIES[0];
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(c));
  };

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Budgets
  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_BUDGETS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  // Savings Goals
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_GOALS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  // Recurring Bills
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_RECURRING_BILLS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(recurringBills));
  }, [recurringBills]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateFilterRange>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'title'>('date-desc');

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentMethodFilter('all');
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortBy('date-desc');
  };

  // Currency Formatter
  const formatCurrency = (
    amountInUSD: number,
    options?: { showSign?: boolean; absolute?: boolean }
  ) => {
    const converted = amountInUSD * currency.rate;
    const finalVal = options?.absolute ? Math.abs(converted) : converted;
    const sign = options?.showSign && converted > 0 ? '+' : '';
    
    // Currency precision
    const fractionDigits = currency.code === 'JPY' ? 0 : 2;
    const formattedNum = finalVal.toLocaleString(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });

    if (currency.code === 'INR') {
      return `${sign}₹${formattedNum}`;
    }
    if (currency.code === 'EUR') {
      return `${sign}${formattedNum} €`;
    }
    return `${sign}${currency.symbol}${formattedNum}`;
  };

  // Current month reference (using 2026-10 or latest transaction month)
  const currentMonthKey = '2026-10';

  // Computed Stats for entire dataset and current month
  const {
    totalIncome,
    totalExpense,
    netCashFlow,
    savingsRate,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthNet,
    categorySpendingCurrentMonth,
  } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let curInc = 0;
    let curExp = 0;
    const curCatSpend: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        inc += tx.amount;
        if (tx.date.startsWith(currentMonthKey)) {
          curInc += tx.amount;
        }
      } else {
        exp += tx.amount;
        if (tx.date.startsWith(currentMonthKey)) {
          curExp += tx.amount;
          curCatSpend[tx.category] = (curCatSpend[tx.category] || 0) + tx.amount;
        }
      }
    });

    const net = inc - exp;
    const rate = inc > 0 ? Math.max(0, Math.round(((inc - exp) / inc) * 100)) : 0;
    const curNet = curInc - curExp;

    return {
      totalIncome: inc,
      totalExpense: exp,
      netCashFlow: net,
      savingsRate: rate,
      currentMonthIncome: curInc,
      currentMonthExpense: curExp,
      currentMonthNet: curNet,
      categorySpendingCurrentMonth: curCatSpend,
    };
  }, [transactions]);

  // Budget Alerts
  const budgetAlerts = useMemo(() => {
    const alerts: { category: string; spent: number; limit: number; percent: number }[] = [];
    budgets.forEach((b) => {
      const spent = categorySpendingCurrentMonth[b.category] || 0;
      const percent = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
      if (percent >= 80) {
        alerts.push({
          category: b.category,
          spent,
          limit: b.monthlyLimit,
          percent,
        });
      }
    });
    return alerts.sort((a, b) => b.percent - a.percent);
  }, [budgets, categorySpendingCurrentMonth]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search Term
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(query);
          const matchCategory = tx.category.toLowerCase().includes(query);
          const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
          const matchMethod = tx.paymentMethod.toLowerCase().includes(query);
          if (!matchTitle && !matchCategory && !matchNotes && !matchMethod) {
            return false;
          }
        }

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
          return false;
        }

        // Payment Method filter
        if (paymentMethodFilter !== 'all' && tx.paymentMethod !== paymentMethodFilter) {
          return false;
        }

        // Date Range
        if (dateRange === 'this_month') {
          if (!tx.date.startsWith('2026-10')) return false;
        } else if (dateRange === 'last_month') {
          if (!tx.date.startsWith('2026-09')) return false;
        } else if (dateRange === 'last_30_days') {
          const txTime = new Date(tx.date).getTime();
          const nowTime = new Date('2026-10-29').getTime();
          const thirtyDaysAgo = nowTime - 30 * 24 * 60 * 60 * 1000;
          if (txTime < thirtyDaysAgo || txTime > nowTime) return false;
        } else if (dateRange === 'year_to_date') {
          if (!tx.date.startsWith('2026')) return false;
        } else if (dateRange === 'custom') {
          if (customStartDate && tx.date < customStartDate) return false;
          if (customEndDate && tx.date > customEndDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return b.date.localeCompare(a.date);
        }
        if (sortBy === 'date-asc') {
          return a.date.localeCompare(b.date);
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [
    transactions,
    searchTerm,
    typeFilter,
    categoryFilter,
    paymentMethodFilter,
    dateRange,
    customStartDate,
    customEndDate,
    sortBy,
  ]);

  // Actions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    transactionApi.create(tx).catch(() => {});
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updatedFields } : tx))
    );
    transactionApi.update(id, updatedFields).catch(() => {});
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    transactionApi.delete(id).catch(() => {});
  };

  const batchDeleteTransactions = (ids: string[]) => {
    const idSet = new Set(ids);
    setTransactions((prev) => prev.filter((tx) => !idSet.has(tx.id)));
    transactionApi.batchDelete(ids).catch(() => {});
  };

  const updateBudget = (category: ExpenseCategory, monthlyLimit: number) => {
    setBudgets((prev) => {
      const exists = prev.find((b) => b.category === category);
      if (exists) {
        return prev.map((b) =>
          b.category === category ? { ...b, monthlyLimit } : b
        );
      }
      return [...prev, { category, monthlyLimit }];
    });
    budgetApi.update(category, monthlyLimit).catch(() => {});
  };

  const addGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
    goalApi.create(goalData).catch(() => {});
  };

  const updateGoal = (id: string, goalData: Partial<SavingsGoal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...goalData } : g))
    );
    goalApi.update(id, goalData).catch(() => {});
  };

  const adjustGoalFunds = (id: string, delta: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updatedAmount = Math.max(0, g.currentAmount + delta);
        goalApi.update(id, { currentAmount: updatedAmount }).catch(() => {});
        return { ...g, currentAmount: updatedAmount };
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    goalApi.delete(id).catch(() => {});
  };

  const addRecurringBill = (billData: Omit<RecurringBill, 'id'>) => {
    const newBill: RecurringBill = {
      ...billData,
      id: `rec-${Date.now()}`,
    };
    setRecurringBills((prev) => [...prev, newBill]);
    recurringApi.create(billData).catch(() => {});
  };

  const toggleRecurringBill = (id: string) => {
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    recurringApi.toggle(id).catch(() => {});
  };

  const deleteRecurringBill = (id: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== id));
    recurringApi.delete(id).catch(() => {});
  };

  // Data Export & Import
  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Title', 'Type', 'Category', 'Amount (USD)', 'Payment Method', 'Notes', 'Is Recurring'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category}"`,
      t.amount.toFixed(2),
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.isRecurring ? 'Yes' : 'No',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expense_tracker_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const backupData = {
      version: 2,
      exportDate: new Date().toISOString(),
      transactions,
      budgets,
      goals,
      recurringBills,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importJSON = (jsonString: string): { success: boolean; count: number; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        if (Array.isArray(data.budgets)) setBudgets(data.budgets);
        if (Array.isArray(data.goals)) setGoals(data.goals);
        if (Array.isArray(data.recurringBills)) setRecurringBills(data.recurringBills);
        return { success: true, count: data.transactions.length };
      } else if (Array.isArray(data)) {
        // Plain array of transactions
        setTransactions(data);
        return { success: true, count: data.length };
      }
      return { success: false, count: 0, error: 'JSON format does not contain valid transactions array.' };
    } catch (err: unknown) {
      return { success: false, count: 0, error: err instanceof Error ? err.message : 'Invalid JSON file.' };
    }
  };

  const importCSV = (csvString: string): { success: boolean; count: number; error?: string } => {
    try {
      const lines = csvString.trim().split(/\r\n|\n/);
      if (lines.length < 2) {
        return { success: false, count: 0, error: 'CSV file is empty or missing headers.' };
      }

      const imported: Transaction[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple regex to split comma separated with quoted values
        const tokens: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            tokens.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        tokens.push(cur.trim());

        // We expect columns: Date, Title, Type, Category, Amount, PaymentMethod (or with ID prefix)
        let date = '';
        let title = '';
        let type: TransactionType = 'expense';
        let category: any = 'Other Expense';
        let amount = 0;
        let paymentMethod: any = 'Credit Card';
        let notes = '';

        if (tokens.length >= 6) {
          const hasId = tokens[0].startsWith('tx-');
          const offset = hasId ? 1 : 0;

          date = tokens[offset] || new Date().toISOString().slice(0, 10);
          title = (tokens[offset + 1] || 'Imported Expense').replace(/^"|"$/g, '');
          const rawType = (tokens[offset + 2] || '').toLowerCase();
          type = rawType.includes('inc') ? 'income' : 'expense';
          category = (tokens[offset + 3] || (type === 'income' ? 'Salary & Wages' : 'Other Expense')).replace(/^"|"$/g, '');
          amount = parseFloat(tokens[offset + 4].replace(/[^0-9.]/g, '')) || 0;
          paymentMethod = (tokens[offset + 5] || 'Credit Card').replace(/^"|"$/g, '');
          notes = tokens[offset + 6] ? tokens[offset + 6].replace(/^"|"$/g, '') : '';

          imported.push({
            id: `tx-imp-${Date.now()}-${i}`,
            title,
            amount: Math.abs(amount),
            type,
            category,
            date,
            paymentMethod,
            notes,
          });
        }
      }

      if (imported.length === 0) {
        return { success: false, count: 0, error: 'Could not parse any valid transaction rows.' };
      }

      setTransactions((prev) => [...imported, ...prev]);
      return { success: true, count: imported.length };
    } catch (err: unknown) {
      return { success: false, count: 0, error: err instanceof Error ? err.message : 'Failed to parse CSV.' };
    }
  };

  const resetData = () => {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.BILLS);
    localStorage.removeItem(STORAGE_KEYS.CURRENCY);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS);
    setRecurringBills(INITIAL_RECURRING_BILLS);
    setCurrencyState(SUPPORTED_CURRENCIES[0]);
    clearFilters();
  };

  return (
    <FinanceContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency,
        transactions,
        filteredTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        batchDeleteTransactions,
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
        budgets,
        updateBudget,
        goals,
        addGoal,
        updateGoal,
        adjustGoalFunds,
        deleteGoal,
        recurringBills,
        addRecurringBill,
        toggleRecurringBill,
        deleteRecurringBill,
        totalIncome,
        totalExpense,
        netCashFlow,
        savingsRate,
        currentMonthIncome,
        currentMonthExpense,
        currentMonthNet,
        categorySpendingCurrentMonth,
        budgetAlerts,
        exportCSV,
        exportJSON,
        importCSV,
        importJSON,
        resetData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
