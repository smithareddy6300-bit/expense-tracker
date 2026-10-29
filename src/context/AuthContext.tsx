import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, 'name' | 'email'>>) => void;
  quickDemoLogin: () => void;
}

const STORAGE_KEYS = {
  ACTIVE_USER: 'pet_auth_active_user_v2',
  USERS_DB: 'pet_auth_users_db_v2',
};

const DEFAULT_USERS: Array<User & { passwordHash: string }> = [
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersDb, setUsersDb] = useState<Array<User & { passwordHash: string }>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return DEFAULT_USERS;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default to initial logged-in user so existing experience continues seamlessly, or allow them to test logout
    return DEFAULT_USERS[0];
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(usersDb));
  }, [usersDb]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    }
  }, [user]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate slight network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsLoading(false);

    const normalizedEmail = email.trim().toLowerCase();
    const existing = usersDb.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!existing) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (existing.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const { passwordHash: _, ...userProfile } = existing;
    setUser(userProfile);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsLoading(false);

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return { success: false, error: 'Please enter your full name.' };
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const existing = usersDb.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const newUserObj = {
      id: `user_${Date.now()}`,
      name: trimmedName,
      email: normalizedEmail,
      passwordHash: password,
      createdAt: new Date().toISOString(),
    };

    setUsersDb((prev) => [...prev, newUserObj]);

    const { passwordHash: _, ...profile } = newUserObj;
    setUser(profile);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  };

  const updateProfile = (data: Partial<Pick<User, 'name' | 'email'>>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    setUsersDb((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, ...data } : u))
    );
  };

  const quickDemoLogin = () => {
    const demo = DEFAULT_USERS[0];
    const { passwordHash: _, ...profile } = demo;
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
