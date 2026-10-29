import { CategoryBudget, RecurringBill, SavingsGoal, Transaction } from '../types/finance';
import { User } from '../types/auth';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const authApi = {
  login: async (email: string, password: string): Promise<{ success: boolean; user: User }> => {
    return fetchJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name: string, email: string, password: string): Promise<{ success: boolean; user: User }> => {
    return fetchJson(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
};

export const transactionApi = {
  getAll: async (): Promise<Transaction[]> => {
    const data = await fetchJson<{ transactions: Transaction[] }>(`${API_BASE}/transactions`);
    return data.transactions;
  },

  create: async (tx: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const data = await fetchJson<{ transaction: Transaction }>(`${API_BASE}/transactions`, {
      method: 'POST',
      body: JSON.stringify(tx),
    });
    return data.transaction;
  },

  update: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    const data = await fetchJson<{ transaction: Transaction }>(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.transaction;
  },

  delete: async (id: string): Promise<void> => {
    await fetchJson(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  batchDelete: async (ids: string[]): Promise<number> => {
    const data = await fetchJson<{ success: boolean; deletedCount: number }>(
      `${API_BASE}/transactions/batch-delete`,
      {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }
    );
    return data.deletedCount;
  },
};

export const budgetApi = {
  getAll: async (): Promise<CategoryBudget[]> => {
    const data = await fetchJson<{ budgets: CategoryBudget[] }>(`${API_BASE}/budgets`);
    return data.budgets;
  },

  update: async (category: string, monthlyLimit: number): Promise<CategoryBudget> => {
    const data = await fetchJson<{ budget: CategoryBudget }>(
      `${API_BASE}/budgets/${encodeURIComponent(category)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ monthlyLimit }),
      }
    );
    return data.budget;
  },
};

export const goalApi = {
  getAll: async (): Promise<SavingsGoal[]> => {
    const data = await fetchJson<{ goals: SavingsGoal[] }>(`${API_BASE}/goals`);
    return data.goals;
  },

  create: async (goal: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> => {
    const data = await fetchJson<{ goal: SavingsGoal }>(`${API_BASE}/goals`, {
      method: 'POST',
      body: JSON.stringify(goal),
    });
    return data.goal;
  },

  update: async (id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    const data = await fetchJson<{ goal: SavingsGoal }>(`${API_BASE}/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.goal;
  },

  delete: async (id: string): Promise<void> => {
    await fetchJson(`${API_BASE}/goals/${id}`, {
      method: 'DELETE',
    });
  },
};

export const recurringApi = {
  getAll: async (): Promise<RecurringBill[]> => {
    const data = await fetchJson<{ recurringBills: RecurringBill[] }>(`${API_BASE}/recurring`);
    return data.recurringBills;
  },

  create: async (bill: Omit<RecurringBill, 'id'>): Promise<RecurringBill> => {
    const data = await fetchJson<{ recurringBill: RecurringBill }>(`${API_BASE}/recurring`, {
      method: 'POST',
      body: JSON.stringify(bill),
    });
    return data.recurringBill;
  },

  toggle: async (id: string): Promise<RecurringBill> => {
    const data = await fetchJson<{ recurringBill: RecurringBill }>(
      `${API_BASE}/recurring/${id}/toggle`,
      {
        method: 'PATCH',
      }
    );
    return data.recurringBill;
  },

  delete: async (id: string): Promise<void> => {
    await fetchJson(`${API_BASE}/recurring/${id}`, {
      method: 'DELETE',
    });
  },
};
