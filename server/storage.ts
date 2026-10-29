import { CategoryBudget, RecurringBill, SavingsGoal, Transaction } from '../src/types/finance';
import { User } from '../src/types/auth';
import {
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_RECURRING_BILLS,
  INITIAL_TRANSACTIONS,
} from '../src/data/initialData';

interface UserRecord extends User {
  passwordHash: string;
}

class BackendStorage {
  private users: UserRecord[] = [
    {
      id: 'user_smith',
      name: 'Smith',
      email: 'smithareddy6300@gmail.com',
      passwordHash: 'password123',
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      id: 'user_demo',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      passwordHash: 'password123',
      createdAt: '2026-10-01T08:00:00Z',
    },
  ];

  private transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
  private budgets: CategoryBudget[] = [...INITIAL_BUDGETS];
  private goals: SavingsGoal[] = [...INITIAL_GOALS];
  private recurringBills: RecurringBill[] = [...INITIAL_RECURRING_BILLS];

  // Auth operations
  findUserByEmail(email: string): UserRecord | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  findUserById(id: string): UserRecord | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(name: string, email: string, passwordHash: string): UserRecord {
    const newUser: UserRecord = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Transaction operations
  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  addTransaction(tx: Omit<Transaction, 'id'>): Transaction {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    this.transactions.unshift(newTx);
    return newTx;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.transactions[index] = { ...this.transactions[index], ...updates };
    return this.transactions[index];
  }

  deleteTransaction(id: string): boolean {
    const initialLen = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    return this.transactions.length < initialLen;
  }

  batchDeleteTransactions(ids: string[]): number {
    const idSet = new Set(ids);
    const initialLen = this.transactions.length;
    this.transactions = this.transactions.filter((t) => !idSet.has(t.id));
    return initialLen - this.transactions.length;
  }

  // Budget operations
  getBudgets(): CategoryBudget[] {
    return [...this.budgets];
  }

  updateBudget(category: string, monthlyLimit: number): CategoryBudget {
    const index = this.budgets.findIndex((b) => b.category === category);
    if (index >= 0) {
      this.budgets[index] = { ...this.budgets[index], monthlyLimit };
      return this.budgets[index];
    }
    const newBudget = { category: category as any, monthlyLimit };
    this.budgets.push(newBudget);
    return newBudget;
  }

  // Goals operations
  getGoals(): SavingsGoal[] {
    return [...this.goals];
  }

  addGoal(goalData: Omit<SavingsGoal, 'id'>): SavingsGoal {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    this.goals.push(newGoal);
    return newGoal;
  }

  updateGoal(id: string, data: Partial<SavingsGoal>): SavingsGoal | null {
    const index = this.goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    this.goals[index] = { ...this.goals[index], ...data };
    return this.goals[index];
  }

  deleteGoal(id: string): boolean {
    const initialLen = this.goals.length;
    this.goals = this.goals.filter((g) => g.id !== id);
    return this.goals.length < initialLen;
  }

  // Recurring bills operations
  getRecurringBills(): RecurringBill[] {
    return [...this.recurringBills];
  }

  addRecurringBill(billData: Omit<RecurringBill, 'id'>): RecurringBill {
    const newBill: RecurringBill = {
      ...billData,
      id: `rec-${Date.now()}`,
    };
    this.recurringBills.push(newBill);
    return newBill;
  }

  toggleRecurringBill(id: string): RecurringBill | null {
    const bill = this.recurringBills.find((b) => b.id === id);
    if (!bill) return null;
    bill.isActive = !bill.isActive;
    return bill;
  }

  deleteRecurringBill(id: string): boolean {
    const initialLen = this.recurringBills.length;
    this.recurringBills = this.recurringBills.filter((b) => b.id !== id);
    return this.recurringBills.length < initialLen;
  }

  resetAll(): void {
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.budgets = [...INITIAL_BUDGETS];
    this.goals = [...INITIAL_GOALS];
    this.recurringBills = [...INITIAL_RECURRING_BILLS];
  }
}

export const backendStorage = new BackendStorage();
