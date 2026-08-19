import React, { useEffect, useState } from 'react';
import PlanCard from './PlanCard';
import type { PlanData } from '../../types/credits.types';
import { getPlans } from '../../services/walletService';
import { useCredits } from '../../contextAPI/CreditsContext';

type PlanCardsProps = {
  onSelectPlan?: (plan: PlanData) => void;
};

const DEFAULT_PLANS: PlanData[] = [
  {
    name: 'Free',
    monthlyCreditAllotment: 1000,
    priceInr: 0,
    rolloverAllowed: false,
  },
  {
    name: 'Pro',
    monthlyCreditAllotment: 5000,
    priceInr: 499,
    rolloverAllowed: true,
  },
  {
    name: 'Team',
    monthlyCreditAllotment: 15000,
    priceInr: 1499,
    rolloverAllowed: true,
  },
];

const PlanCards: React.FC<PlanCardsProps> = ({ onSelectPlan }) => {
  const { credits } = useCredits();
  const [plans, setPlans] = useState<PlanData[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState<boolean>(true);

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
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
        <p className="text-sm text-white/40">
          Select a monthly subscription plan that suits your course creation demands.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-white/5 border border-white/10" />
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanCards;
