import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contextAPI/ThemeContext';
import { cn } from '../lib/utils';

export default function AdminSettingsPage() {
  const { isDark, setTheme } = useTheme();
  const [exchangeRate, setExchangeRate] = useState(1);
  const [minRecharge, setMinRecharge] = useState(100);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8 transition-colors duration-200">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400">
            <Settings className="h-3.5 w-3.5" />
            SYSTEM CONFIGURATION
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Orion Global Engine Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-white/60">
          Configure financial models, automated credit cleanup timeouts, and AI provider API fallbacks.
        </p>
      </div>

      {saved && (
        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in">
          <ShieldCheck className="h-4 w-4" />
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance</h2>
          <p className="text-xs text-slate-500 dark:text-white/60">Admin dashboard color mode. Saved in this browser.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer",
                !isDark
                  ? "border-lime-500 bg-lime-500/10"
                  : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
              )}
            >
              <Sun className="h-5 w-5 text-amber-500" />
              <span>
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">Light</span>
                <span className="block text-[11px] text-slate-500">White panels, dark text</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer",
                isDark
                  ? "border-lime-400 bg-lime-400/10"
                  : "border-slate-200 bg-slate-50"
              )}
            >
              <Moon className="h-5 w-5 text-indigo-400" />
              <span>
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">Dark</span>
                <span className="block text-[11px] text-slate-500 dark:text-white/50">Navy panels, light text</span>
              </span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Credit & Currency Base</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/60 mb-1">
                Credit Valuation Ratio (INR per Credit)
              </label>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-mono text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Default: 1 Credit = ₹1.00 INR</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/60 mb-1">
                Minimum Top-Up Amount (INR)
              </label>
              <input
                type="number"
                value={minRecharge}
                onChange={(e) => setMinRecharge(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-mono text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Minimum package: ₹100 for 100 Credits</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Automated Cleanup & Timeout Jobs</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/60 mb-1">
                Stale Reservation Timeout (Minutes)
              </label>
              <input
                type="number"
                defaultValue={15}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-mono text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Unfulfilled holds automatically released after 15m</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/60 mb-1">
                Cleanup Cron Frequency
              </label>
              <input
                type="text"
                defaultValue="Every 5 Minutes"
                disabled
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.02]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl border border-lime-500/30 bg-lime-500/10 px-5 py-2.5 text-xs font-bold text-lime-700 hover:bg-lime-500/20 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          Save System Configuration
        </button>
      </form>
    </div>
  );
}
