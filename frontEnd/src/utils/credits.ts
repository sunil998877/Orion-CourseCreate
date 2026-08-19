import { CREDIT_COSTS } from '../types/credits.types';
import type { CreditAction } from '../types/credits.types';

export const getCreditCost = (action: CreditAction): number => {
  return CREDIT_COSTS[action] ?? 0;
};

export const calculateUsagePercentage = (used: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.min((used / total) * 100, 100);
};
