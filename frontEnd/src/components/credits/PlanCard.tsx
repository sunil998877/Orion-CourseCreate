import React from 'react';
import { Check, Sparkles, Shield, Users } from 'lucide-react';
import type { PlanData } from '../../types/credits.types';

type PlanCardProps = {
  plan: PlanData;
  isCurrentPlan?: boolean;
  onSelectPlan?: (plan: PlanData) => void;
};

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrentPlan = false,
  onSelectPlan,
}) => {
  const isPro = plan.name.toLowerCase() === 'pro';
  const isTeam = plan.name.toLowerCase() === 'team';

  const Icon = isTeam ? Users : isPro ? Sparkles : Shield;

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
        isPro
          ? 'border-lime-400/50 bg-gradient-to-b from-lime-400/10 via-lime-400/[0.02] to-transparent shadow-[0_0_35px_rgba(132,204,22,0.12)]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
      }`}
    >
      {isPro && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-400 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-md">
          Recommended
        </span>
      )}

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                isPro
                  ? 'border-lime-400/30 bg-lime-400/20 text-lime-400'
                  : 'border-white/10 bg-white/5 text-white/70'
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-white/40">
                {isTeam
                  ? 'For organizations & teams'
                  : isPro
                  ? 'For power creators'
                  : 'For getting started'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">
              {plan.monthlyCreditAllotment.toLocaleString()}
            </span>
            <span className="text-sm text-white/40">Credits</span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">Monthly allocation</p>
        </div>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-lime-400">
            {plan.priceInr === 0 ? 'Free' : `₹${plan.priceInr.toLocaleString()}`}
          </span>
          {plan.priceInr > 0 && (
            <span className="text-xs text-white/40">/ month</span>
          )}
        </div>

        <div className="my-5 h-px bg-white/10" />

        <div className="space-y-2.5 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <Check className={`h-4 w-4 shrink-0 ${plan.rolloverAllowed ? 'text-lime-400' : 'text-white/30'}`} />
            <span>
              Rollover: <strong className={plan.rolloverAllowed ? 'text-lime-400' : 'text-white/50'}>
                {plan.rolloverAllowed ? 'Yes' : 'No'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-lime-400" />
            <span>All AI Generation Tools</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-lime-400" />
            <span>Standard API Support</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={isCurrentPlan}
        onClick={() => onSelectPlan?.(plan)}
        className={`mt-6 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
          isCurrentPlan
            ? 'border-white/10 bg-white/5 text-white/40 cursor-default'
            : isPro
            ? 'border-lime-400 bg-lime-400 text-black hover:bg-lime-300 shadow-[0_0_20px_rgba(132,204,22,0.2)]'
            : 'border-white/10 bg-white/5 text-white hover:border-lime-400/30 hover:bg-lime-400/10 hover:text-lime-400'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
};

export default PlanCard;
