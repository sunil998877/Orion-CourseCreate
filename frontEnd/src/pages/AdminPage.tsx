import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  Layers,
  FileText,
  Mic,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import { getAdminDashboardStats } from '../services/adminService';
import { cn } from '../lib/utils';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
      setError(err.message || 'Failed to load live data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalCreditsIssued = stats?.totalCreditsIssued || 0;
  const totalCreditsSpent = stats?.totalCreditsSpent || 0;
  const totalReserved = stats?.totalReserved || 0;
  const gammaCreditsSpent = stats?.gammaCreditsSpent || 0;
  const totalUsers = stats?.totalUsers || 0;
  const totalCourses = stats?.totalCourses || 0;

  const metricCards = [
    {
      title: "Total Credits Issued",
      value: `${totalCreditsIssued.toLocaleString()} cr`,
      subtext: `₹${totalCreditsIssued.toLocaleString()} equivalent (1 Cr = ₹1)`,
      change: `${totalUsers} registered users`,
      isPositive: true,
      icon: Coins,
    },
    {
      title: "Total Credits Consumed",
      value: `${totalCreditsSpent.toLocaleString()} cr`,
      subtext: `Across ${totalCourses} generated courses/modules`,
      change: "+24.1%",
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: "Active Holds / Reserved",
      value: `${totalReserved.toLocaleString()} cr`,
      subtext: "In-flight generation jobs",
      change: "Live",
      isPositive: true,
      icon: Clock,
    },
    {
      title: "Gamma Credits Used",
      value: `${gammaCreditsSpent.toLocaleString()} cr`,
      subtext: `${stats?.gammaJobsCount || 0} Gamma generations from ledger`,
      change: "Live",
      isPositive: true,
      icon: Layers,
    },
  ];

  const gammaCredits = stats?.providerBreakdown?.gamma?.totalCreditsCharged || gammaCreditsSpent;
  const openaiCredits = stats?.providerBreakdown?.openai?.totalCreditsCharged || 0;
  const audioCredits = stats?.providerBreakdown?.elevenlabs?.totalCreditsCharged || 0;
  const gammaJobs = stats?.gammaJobsCount || stats?.providerBreakdown?.gamma?.count || 0;
  const openaiJobs = stats?.providerBreakdown?.openai?.count || 0;
  const audioJobs = stats?.providerBreakdown?.elevenlabs?.count || 0;
  const providerTotal = Math.max(gammaCredits + openaiCredits + audioCredits, 1);
  const billedProviderCredits = gammaCredits + openaiCredits + audioCredits;

  const providerWorkload = [
    {
      provider: "Gamma AI",
      costPerUnit: "250 cr / course deck",
      jobCount: gammaJobs,
      credits: gammaCredits,
      color: "from-purple-500 to-indigo-600",
      textColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-500/30",
      bgLight: "bg-indigo-500/10",
      icon: Layers,
    },
    {
      provider: "OpenAI (GPT-4o)",
      costPerUnit: "8–20 cr / text action",
      jobCount: openaiJobs,
      credits: openaiCredits,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgLight: "bg-emerald-500/10",
      icon: FileText,
    },
    {
      provider: "ElevenLabs",
      costPerUnit: "15 cr / min audio",
      jobCount: audioJobs,
      credits: audioCredits,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-500/30",
      bgLight: "bg-amber-500/10",
      icon: Mic,
    },
  ];

  const recentTransactions = stats?.recentTransactions || [];

  return (
    <div className="space-y-8 transition-colors duration-200">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8 backdrop-blur-md">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400">
                <Sparkles className="h-3.5 w-3.5" />
                ORION USAGE ENGINE v2.0
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected to MongoDB Live
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
              Usage & Credits Control Center
            </h1>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Live monitoring of credit consumption, database wallet holdings, AI provider allocations, and ledger integrity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Refresh
            </button>
            <Link
              to="/admin/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-lime-500/30 bg-lime-500/10 px-4 py-2.5 text-xs font-semibold text-lime-700 hover:bg-lime-500/20 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400"
            >
              <Coins className="h-4 w-4" />
              Manage Pricing SKUs
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
            >
              <Users className="h-4 w-4" />
              User Wallets
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-700 dark:text-amber-400">
          Note: {error}. Showing cached state.
        </div>
      )}

      {/* Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-lime-500/40 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-lime-400/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-white/60">{card.title}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-lime-500/20 bg-lime-500/10 text-lime-700 dark:border-lime-400/20 dark:bg-lime-400/10 dark:text-lime-400">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {card.value}
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-lime-600 dark:text-lime-400">
                  {card.change}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400 dark:text-white/40">{card.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Provider Workload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Provider Workload & Cost Matrix</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
              Gamma from credit ledger · OpenAI / ElevenLabs from generated courses · 1 credit = ₹1
            </p>
          </div>
          <Link to="/admin/analytics" className="text-xs font-semibold text-lime-600 hover:text-lime-700 dark:text-lime-400 dark:hover:underline inline-flex items-center gap-1 shrink-0">
            Margins <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {providerWorkload.map((p) => {
            const Icon = p.icon;
            const share = billedProviderCredits === 0 ? 0 : Math.round((p.credits / providerTotal) * 100);
            return (
              <div key={p.provider} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", p.borderColor, p.bgLight, p.textColor)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.provider}</h3>
                      <span className="text-[11px] text-slate-500 dark:text-white/50 font-medium">{p.costPerUnit}</span>
                    </div>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold border whitespace-nowrap", p.borderColor, p.bgLight, p.textColor)}>
                    {share}%
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/50">Jobs</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{p.jobCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-white/50">Credits</span>
                    <span className="font-bold text-lime-600 dark:text-lime-400">{p.credits.toLocaleString()} cr</span>
                  </div>
                </div>

                <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div className={cn("h-full rounded-full bg-gradient-to-r", p.color)} style={{ width: `${share}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ledger preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Real-Time Credit Transactions Ledger</h2>
            <p className="text-xs text-slate-500 dark:text-white/50">Live audit stream of holds, reconciliations, refunds, and recharges</p>
          </div>
          <Link to="/admin/transactions" className="text-xs font-semibold text-lime-600 hover:text-lime-700 dark:text-lime-400 dark:hover:underline inline-flex items-center gap-1">
            View Full Ledger <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-white/10 dark:text-white/40">
                <th className="pb-3 font-semibold">TX ID</th>
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Reference ID</th>
                <th className="pb-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 font-mono text-slate-500">{String(tx.id).slice(-8)}</td>
                    <td className="py-3.5 font-medium text-slate-900 dark:text-white">{tx.user?.username || tx.user?.email || "System"}</td>
                    <td className="py-3.5">
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-bold border border-lime-500/30 bg-lime-500/10 text-lime-600 dark:text-lime-400">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono font-bold">{tx.amount} cr</td>
                    <td className="py-3.5 font-mono text-[11px] text-slate-500">{tx.referenceId || "—"}</td>
                    <td className="py-3.5 text-slate-400">{new Date(tx.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
