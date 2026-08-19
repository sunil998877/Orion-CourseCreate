import React from 'react';
import { ArrowLeft, Calendar, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { useCredits } from '../contextAPI/CreditsContext';
import AddCreditsContent from '../components/credits/AddCreditsContent';
import UsageHistory from '../components/credits/UsageHistory';
import { CREDIT_COSTS } from '../types/credits.types';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
);

const AddCreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    credits,
    transactions,
    usagePercentage,
    loading,
    error,
    refreshWallet,
  } = useCredits();

  return (
    <PageTransition>
      <div className="min-h-screen text-white selection:bg-lime-500/30">
        <div className="space-y-8 pb-20">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={refreshWallet}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40"
              title="Refresh wallet"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error} — <button onClick={refreshWallet} className="underline">Retry</button>
            </div>
          )}

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gray-900/40 p-8 md:p-12 shadow-2xl backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 via-transparent to-transparent opacity-40" />
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-lime-500/10 blur-[80px]" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-lime-500/20 bg-lime-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-lime-400">
                  <Zap className="mr-2 h-3 w-3" />
                  AI Usage Credits
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                  Add Credits
                </h1>
                <p className="max-w-2xl text-base text-gray-400 md:text-lg">
                  Top up your account to keep generating course outlines, modules, lessons, quizzes, and more with Orion AI.
                </p>

                {loading ? (
                  <div className="flex gap-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {credits.plan && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                        <Sparkles className="h-3 w-3 text-lime-400" />
                        {credits.plan} Plan
                      </span>
                    )}
                    {credits.renewsOn && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                        <Calendar className="h-3 w-3 text-blue-400" />
                        Renews {new Date(credits.renewsOn).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-md">
                <p className="text-sm text-white/40">Current Balance</p>
                {loading ? (
                  <div className="mt-2 space-y-3">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-2 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-4xl font-black text-lime-400">
                        {credits.remaining.toLocaleString()}
                      </span>
                      <span className="pb-1 text-sm text-white/40">
                        / {credits.total.toLocaleString()} mo
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-500"
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-white/40">
                      <span>{credits.used.toLocaleString()} used</span>
                      <span>
                        {usagePercentage > 0 && usagePercentage < 10 && usagePercentage % 1 !== 0
                          ? usagePercentage.toFixed(1)
                          : Math.round(usagePercentage)}% used
                      </span>
                    </div>
                    {credits.reserved !== undefined && credits.reserved > 0 && (
                      <p className="mt-2 text-[10px] text-yellow-400/70">
                        {credits.reserved.toLocaleString()} credits reserved (in-progress jobs)
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <AddCreditsContent />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 md:p-8">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <UsageHistory items={transactions} limit={8} />
              )}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 md:p-8">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-lime-400" />
                <h2 className="font-semibold text-white">Credit Usage Guide</h2>
              </div>
              <div className="space-y-2">
                {Object.entries(CREDIT_COSTS).map(([action, cost]) => (
                  <div
                    key={action}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <span className="text-sm text-white/80">{action}</span>
                    <span className="text-sm font-semibold text-lime-400">{cost} credits</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AddCreditsPage;
