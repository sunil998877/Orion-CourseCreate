import React from 'react';
import { Check, Crown, Flame, Shield, Sparkles, Users, ArrowRight, X } from 'lucide-react';
import type { PlanData } from '../../types/credits.types';

type PlanCardProps = {
  plan: PlanData;
  isCurrentPlan?: boolean;
  onSelectPlan?: (plan: PlanData) => void;
  onCancelPlan?: (plan: PlanData) => void;
  billingCycle?: 'monthly' | 'yearly';
};

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrentPlan = false,
  onSelectPlan,
  onCancelPlan,
  billingCycle = 'monthly',
}) => {
  const isPro = plan.name.toLowerCase() === 'pro';
  const isTeam = plan.name.toLowerCase() === 'team';
  const isFree = !isPro && !isTeam;

  const priceDisplay = isFree
    ? 'Free'
    : billingCycle === 'yearly'
    ? `₹${Math.round(plan.priceInr * 0.8).toLocaleString()}`
    : `₹${plan.priceInr.toLocaleString()}`;

  const originalPrice = !isFree && billingCycle === 'yearly' ? `₹${plan.priceInr.toLocaleString()}` : null;

  const features = isFree
    ? [
        { text: '500 AI credits monthly', included: true },
        { text: 'Course outline & structure builder', included: true },
        { text: 'Standard AI generation speed', included: true },
        { text: 'Rollover unused credits', included: false },
        { text: 'Priority server queue', included: false },
      ]
    : isPro
    ? [
        { text: '3,000 AI credits monthly', included: true },
        { text: 'Full courses, quizzes & worksheets', included: true },
        { text: 'Automatic monthly credit rollover', included: true },
        { text: 'Fast priority generation speed', included: true },
        { text: 'AI neural audio voiceovers', included: true },
      ]
    : [
        { text: '10,000 AI credits monthly', included: true },
        { text: 'Unlimited parallel generations', included: true },
        { text: 'Team sharing & collaborative workspaces', included: true },
        { text: 'Permanent credit rollover guarantee', included: true },
        { text: '24/7 dedicated support assistance', included: true },
      ];

  const Icon = isTeam ? Users : isPro ? Sparkles : Shield;

  return (
    <div
      className={`relative flex flex-col justify-between rounded-[1.75rem] p-6 transition-all duration-300 hover:-translate-y-1 ${
        isPro
          ? 'border-2 border-[#84cc16] bg-gradient-to-b from-[#0a1a0e]/95 via-[#06120a]/90 to-[#030905]/95 shadow-[0_0_30px_rgba(132,204,22,0.2)]'
          : isTeam
          ? 'border border-purple-500/30 bg-gradient-to-b from-[#130722]/95 via-[#0d0417]/90 to-[#06020c]/95 hover:border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.12)]'
          : 'border border-sky-500/25 bg-gradient-to-b from-[#06111e]/95 via-[#040c15]/90 to-[#02060b]/95 hover:border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.1)]'
      }`}
    >

      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#b5f33f] to-[#7ee217] px-3.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0a2003] shadow-[0_0_18px_rgba(132,204,22,0.6)]">
          <Crown className="h-3 w-3 fill-current" />
          <span>RECOMMENDED</span>
        </div>
      )}

      <div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                isPro
                  ? 'border-lime-500/35 bg-lime-500/15 text-lime-400 shadow-sm'
                  : isTeam
                  ? 'border-purple-500/35 bg-purple-500/15 text-purple-400 shadow-sm'
                  : 'border-sky-500/35 bg-sky-500/15 text-sky-400 shadow-sm'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">{plan.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTeam
                  ? 'For organizations & teams'
                  : isPro
                  ? 'For power creators'
                  : 'For getting started'}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isPro
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 flex items-center gap-1'
                : isTeam
                ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                : 'border-sky-500/40 bg-sky-500/10 text-sky-300'
            }`}
          >
            {isPro && <Flame className="h-3 w-3 fill-current" />}
            {isPro ? 'MOST POPULAR' : isTeam ? 'BEST FOR TEAMS' : 'BASIC'}
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white tracking-tight">
              {plan.monthlyCreditAllotment.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Credits
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Monthly allocation</p>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span
            className={`text-2xl font-black tracking-tight ${
              isPro ? 'text-lime-400' : isTeam ? 'text-purple-400' : 'text-sky-400'
            }`}
          >
            {priceDisplay}
          </span>
          {plan.priceInr > 0 && (
            <span className="text-xs text-slate-400 font-medium">/ month</span>
          )}
          {originalPrice && (
            <span className="text-xs text-slate-500 line-through font-normal">
              {originalPrice}
            </span>
          )}
        </div>

        <div className="my-5 h-px bg-white/10" />

        <ul className="space-y-2.5 mb-6">
          {features.map((feat, idx) => (
            <li
              key={idx}
              className={`flex items-center gap-2.5 text-xs ${
                feat.included ? 'text-slate-300 font-medium' : 'text-slate-500 line-through'
              }`}
            >
              {feat.included ? (
                <Check
                  className={`h-4 w-4 shrink-0 stroke-[2.5] ${
                    isPro ? 'text-lime-400' : isTeam ? 'text-purple-400' : 'text-sky-400'
                  }`}
                />
              ) : (
                <X className="h-4 w-4 shrink-0 text-slate-600" />
              )}
              <span>{feat.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {isCurrentPlan ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-400 cursor-default"
          >
            Current Plan
          </button>
          {!isFree && onCancelPlan && (
            <button
              type="button"
              onClick={() => onCancelPlan(plan)}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition"
              title="Cancel Subscription"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSelectPlan?.(plan)}
          className={`group flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition-all active:scale-[0.98] ${
            isPro
              ? 'bg-gradient-to-r from-[#98f42d] to-[#6ed815] text-[#0a2003] font-bold shadow-[0_0_20px_rgba(110,216,21,0.35)] hover:brightness-110 hover:shadow-[0_0_28px_rgba(110,216,21,0.5)]'
              : isTeam
              ? 'border border-purple-500/40 bg-[#1e0e35]/60 text-white hover:bg-purple-500/20 hover:border-purple-400 shadow-sm'
              : 'border border-sky-500/40 bg-[#081d32]/60 text-white hover:bg-sky-500/20 hover:border-sky-400 shadow-sm'
          }`}
        >
          <span>{isFree ? 'Choose Free' : `Upgrade to ${plan.name}`}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
};

export default PlanCard;
