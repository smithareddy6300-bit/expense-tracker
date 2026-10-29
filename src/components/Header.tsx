import React, { useState } from 'react';
import {
  ArrowDownToLine,
  ChevronDown,
  Coins,
  LogOut,
  Plus,
  RefreshCw,
  Shield,
  User as UserIcon,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { SUPPORTED_CURRENCIES } from '../data/initialData';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenExportImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTransaction,
  onOpenExportImport,
}) => {
  const { user, logout } = useAuth();
  const { currency, setCurrency, resetData } = useFinance();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Personal Expense Tracker
                </h1>
                <span className="hidden sm:inline-block text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Live Ledger
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Budgeting, cash flow analytics & savings tracker
              </p>
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                title="Change display currency"
              >
                <Coins className="w-3.5 h-3.5 text-slate-500" />
                <span>{currency.code} ({currency.symbol})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showCurrencyDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCurrencyDropdown(false)}
                  />
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Select Currency
                    </div>
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => {
                          setCurrency(curr);
                          setShowCurrencyDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          currency.code === curr.code
                            ? 'font-semibold text-emerald-600 bg-emerald-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        <span>{curr.label}</span>
                        <span className="font-mono text-slate-400">{curr.symbol}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Export & Data Tools */}
            <button
              type="button"
              onClick={onOpenExportImport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Import, Export CSV or Backup"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Data & Backup</span>
            </button>

            {/* Quick Reset Sample Data */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset sample data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* User Profile & Logout Dropdown */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1 sm:px-2 sm:py-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {initial}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-semibold text-slate-800 block leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight truncate max-w-[110px]">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {/* User Info header */}
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                          <Shield className="w-3 h-3" />
                          <span>Logged in session</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserDropdown(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* New Transaction Button */}
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-black rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Reset to Demo Data?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              This will restore the original demo transactions, budgets, savings goals, and subscriptions. Any custom entries will be replaced.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to log out of your personal expense tracker? Your session and records will remain safely saved in this browser.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
