import React from 'react';
import { ArrowLeft, Calendar, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageTransition from '../components/PageTransition';
import { useCredits } from '../contextAPI/CreditsContext';
import AddCreditsContent from '../components/credits/AddCreditsContent';
import UsageHistory from '../components/credits/UsageHistory';
import CreditUsageGuide from '../components/credits/CreditUsageGuide';
import { createNotification, triggerNotificationsRefresh } from '../services/notificationService';

const Skeleton: React.FC<{
  className?: string;
}> = ({ className = '' }) => (<div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />);
const AddCreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { credits, transactions, usagePercentage, loading, error, refreshWallet, } = useCredits();
  const historyCardRef = React.useRef<HTMLElement>(null);
  const [historyCardHeight, setHistoryCardHeight] = React.useState<number>();
  const [sideBySide, setSideBySide] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const sync = () => setSideBySide(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  React.useEffect(() => {
    const card = historyCardRef.current;
    if (!card) return;
    const update = () => setHistoryCardHeight(card.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(card);
    return () => observer.disconnect();
  }, [loading, transactions]);

  React.useEffect(() => {
    if (searchParams.get('cancelled') === 'true') {
      const type = searchParams.get('type') || 'payment';
      const isPlan = type.toLowerCase().includes('plan');
      const isRecharge = type.toLowerCase().includes('recharge');
      const title = isPlan ? 'Plan Subscription Cancelled' : isRecharge ? 'Recharge Cancelled' : 'Payment Cancelled';
      const message = isPlan
        ? 'Plan subscription checkout was cancelled.'
        : isRecharge
          ? 'Credit recharge checkout was cancelled.'
          : 'The payment process was cancelled.';

      toast.warning(`${title}: ${message}`);
      const token = localStorage.getItem('token');
      if (token) {
        createNotification(token, { title, message, type: 'warning' }).catch(console.error);
        triggerNotificationsRefresh();
      }
      searchParams.delete('cancelled');
      searchParams.delete('type');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  return (<PageTransition>
    <div className="min-h-screen text-white selection:bg-lime-500/30">
      <div className="space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button type="button" onClick={refreshWallet} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40" title="Refresh wallet">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error} — <button onClick={refreshWallet} className="underline">Retry</button>
        </div>)}

        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#101720]/80 p-6 md:p-10 shadow-xl backdrop-blur-xl">

          <div className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-lime-500/5 blur-[60px] pointer-events-none" />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

          <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-20" preserveAspectRatio="none" viewBox="0 0 1200 400" fill="none">
            <path
              d="M-50 400 C 350 360, 520 180, 800 320 C 980 410, 1120 160, 1250 90"
              stroke="url(#hero-aurora)"
              strokeWidth="2"
            />
            <defs>
              <linearGradient id="hero-aurora" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="40%" stopColor="#22c55e" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#4ade80" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#86efac" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#4ade80] shadow-sm">
                <Zap className="h-3 w-3 fill-current" />
                <span>AI USAGE CREDITS</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 md:h-10 w-1.5 rounded-full bg-[#10e760] shadow-[0_0_14px_#10e760] shrink-0" />
                <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl max-md:text-2xl leading-none">
                  Add <span className="text-[#38ef7d]">Credits</span>
                </h1>
              </div>

              <p className="text-sm md:text-base text-slate-300/80 leading-relaxed max-w-lg">
                Top up your account to keep generating course outlines, modules, lessons, quizzes, and more with Orion AI.
              </p>

              {loading ? (
                <div className="flex gap-3">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-7 w-36" />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/90 shadow-sm backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5 text-lime-400" />
                    <span>{credits.plan || 'Free'} Plan</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/90 shadow-sm backdrop-blur-sm">
                    <Calendar className="h-3.5 w-3.5 text-[#38bdf8]" />
                    <span>
                      Renews {credits.renewsOn ? new Date(credits.renewsOn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 31, 2026'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full lg:w-[460px] xl:w-[480px] shrink-0 rounded-2xl border border-white/10 bg-[#0c121d]/90 p-6 shadow-xl backdrop-blur-xl relative">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[#4ade80] shadow-[0_0_15px_rgba(34,197,94,0.2)] shrink-0">
                        <svg className="h-6 w-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <ellipse cx="14" cy="7" rx="8.5" ry="3" fill="#4ade80" />
                          <path d="M5.5 7v2.5C5.5 11.2 9.3 12.5 14 12.5s8.5-1.3 8.5-3V7" fill="#22c55e" />
                          <ellipse cx="14" cy="12" rx="8.5" ry="2.8" fill="#4ade80" />
                          <path d="M5.5 12v2.5C5.5 16.2 9.3 17.5 14 17.5s8.5-1.3 8.5-3V12" fill="#22c55e" />
                          <ellipse cx="14" cy="17" rx="8.5" ry="2.8" fill="#4ade80" />
                          <path d="M5.5 17v2.5C5.5 21.2 9.3 22.5 14 22.5s8.5-1.3 8.5-3V17" fill="#16a34a" />
                        </svg>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">Current Balance</p>
                        <div className="mt-0.5 flex items-baseline gap-1.5">
                          <span className="text-3xl sm:text-4xl font-black text-[#10e760] tracking-tight">
                            {credits.remaining.toLocaleString()}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-slate-400">
                            / {credits.total.toLocaleString()} credits
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('usage-history-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition shadow-sm shrink-0 cursor-pointer"
                    >
                      <span>View Usage Details</span>
                      <span className="text-xs">→</span>
                    </button>
                  </div>

                  <div className="mt-5">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FACC15] via-[#84CC16] to-[#10B981] transition-all duration-500 shadow-[0_0_12px_rgba(74,222,128,0.35)]"
                        style={{ width: `${Math.min(100, Math.max(0, usagePercentage))}%` }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                      <span>{credits.used.toLocaleString()} credits used</span>
                      <span className="font-bold text-slate-300">
                        {usagePercentage > 0 && usagePercentage < 10 && usagePercentage % 1 !== 0
                          ? usagePercentage.toFixed(1)
                          : Math.round(usagePercentage)}% used
                      </span>
                    </div>

                    {credits.reserved !== undefined && credits.reserved > 0 && (
                      <p className="mt-2 text-[10px] text-amber-400/90 font-medium">
                        {credits.reserved.toLocaleString()} credits reserved (in-progress jobs)
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <AddCreditsContent />

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
          <section
            id="usage-history-section"
            ref={historyCardRef}
            className="rounded-[28px] border border-white/10 bg-[#101720]/80 p-6 shadow-xl backdrop-blur-xl max-md:rounded-2xl max-md:p-4 md:p-8"
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <UsageHistory items={transactions} maxHeight="max-h-[420px]" />
            )}
          </section>

          <section
            className="overflow-y-auto rounded-[28px] border border-white/10 bg-[#101720]/80 p-6 shadow-xl backdrop-blur-xl max-md:rounded-2xl max-md:p-4 md:p-8"
            style={sideBySide && historyCardHeight ? { height: historyCardHeight } : undefined}
          >
            <CreditUsageGuide />
          </section>
        </div>
      </div>
    </div>
  </PageTransition>);
};
export default AddCreditsPage;
