import React, { useEffect, useState } from 'react';
import PlanCard from './PlanCard';
import type { PlanData } from '../../types/credits.types';
import { getPlans } from '../../services/walletService';
import { useCredits } from '../../contextAPI/CreditsContext';
import { Sparkles } from 'lucide-react';

type PlanCardsProps = {
  onSelectPlan?: (plan: PlanData) => void;
  onCancelPlan?: (plan: PlanData) => void;
};

const DEFAULT_PLANS: PlanData[] = [
  {
    name: 'Free',
    monthlyCreditAllotment: 500,
    priceInr: 0,
    rolloverAllowed: false,
  },
  {
    name: 'Pro',
    monthlyCreditAllotment: 3000,
    priceInr: 999,
    rolloverAllowed: true,
  },
  {
    name: 'Team',
    monthlyCreditAllotment: 10000,
    priceInr: 2499,
    rolloverAllowed: true,
  },
];

const PlanCards: React.FC<PlanCardsProps> = ({ onSelectPlan, onCancelPlan }) => {
  const { credits } = useCredits();
  const [plans, setPlans] = useState<PlanData[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState<boolean>(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    let isMounted = true;
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('token') || undefined;
        const apiPlans = await getPlans(token);
        if (isMounted && apiPlans && apiPlans.length > 0) {
          const ordered = [...apiPlans].sort((a, b) => {
            const order: Record<string, number> = { free: 1, pro: 2, team: 3 };
            return (order[a.name.toLowerCase()] || 99) - (order[b.name.toLowerCase()] || 99);
          });
          setPlans(ordered);
        }
      } catch (err) {
        console.warn('[PlanCards] Failed to fetch plans from API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentPlanName = credits.plan?.toLowerCase() || 'free';

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#101720]/80 p-6 md:p-8 shadow-xl backdrop-blur-xl">
      {/* Header row: Title on left, Monthly/Yearly toggle on right */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-7 md:h-8 w-1.5 rounded-full bg-[#10e760] shadow-[0_0_12px_#10e760] shrink-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Choose Your</span>
              <span className="text-[#a3e635]">Plan</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select a subscription tier that suits your course creation volume.
            </p>
          </div>
        </div>

        {/* Right: Monthly / Yearly toggle & Save up to 20% callout */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center rounded-xl border border-white/10 bg-[#0c121d] p-1 text-xs">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-lg px-3 py-1.5 font-bold transition ${
                billingCycle === 'monthly'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-lg px-3 py-1.5 font-bold transition ${
                billingCycle === 'yearly'
                  ? 'bg-lime-500/20 text-lime-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-lime-500/30 bg-lime-500/10 px-2.5 py-1 text-[11px] font-bold text-lime-400 shadow-sm">
            <Sparkles className="h-3 w-3" />
            Save up to 20%
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-[1.75rem] bg-white/5 border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              isCurrentPlan={plan.name.toLowerCase() === currentPlanName}
              onSelectPlan={onSelectPlan}
              onCancelPlan={onCancelPlan}
              billingCycle={billingCycle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanCards;
