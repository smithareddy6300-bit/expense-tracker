export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'Housing & Rent'
  | 'Food & Groceries'
  | 'Dining & Cafes'
  | 'Transportation'
  | 'Utilities & Bills'
  | 'Shopping & Retail'
  | 'Entertainment & Fun'
  | 'Health & Fitness'
  | 'Education & Books'
  | 'Travel & Vacation'
  | 'Personal Care'
  | 'Other Expense';

export type IncomeCategory =
  | 'Salary & Wages'
  | 'Freelance & Consulting'
  | 'Investments & Dividends'
  | 'Rental Income'
  | 'Bonuses & Gifts'
  | 'Side Business'
  | 'Other Income';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export type PaymentMethod =
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Cash'
  | 'UPI / Mobile Pay'
  | 'Digital Wallet';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
  tags?: string[];
}

export interface CategoryBudget {
  category: ExpenseCategory;
  monthlyLimit: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  color: string;
  notes?: string;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  nextDueDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  isActive: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  label: string;
  rate: number; // multiplier relative to USD
}

export type DateFilterRange = 'all' | 'this_month' | 'last_month' | 'last_30_days' | 'year_to_date' | 'custom';
