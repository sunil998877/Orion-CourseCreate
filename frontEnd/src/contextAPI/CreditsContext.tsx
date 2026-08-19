import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import type { CreditAction, CreditsBalance, WalletTransaction } from '../types/credits.types';
import {
  getWallet,
  getTransactions,
  rechargeWallet,
  subscribeToPlan as subscribeToPlanApi,
} from '../services/walletService';



type DeductResult = { success: true } | { success: false; reason: 'insufficient' };

type CreditsContextValue = {
  credits: CreditsBalance;
  transactions: WalletTransaction[];
  usagePercentage: number;
  loading: boolean;
  error: string | null;
  isZeroBalance: boolean;
  deductCredits: (amount: number, action: CreditAction) => DeductResult;
  addCredits: (amount: number, packageId?: string) => Promise<void>;
  subscribeToPlan: (planName: string, planId?: string, referenceId?: string) => Promise<void>;
  hasEnoughCredits: (amount: number) => boolean;
  refreshWallet: () => Promise<void>;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

export const CreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credits, setCredits] = useState<CreditsBalance>({
    total: 0,
    used: 0,
    remaining: 0,
    reserved: 0,
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const walletData = await getWallet(token);

      const remaining = Math.round(Number(walletData.balance ?? 0));
      const lifetimeUsed = Math.round(Number(walletData.lifetime_used ?? (walletData.used ?? 0)));
      const planAllotment = Math.round(Number(walletData.monthly_allotment ?? 0));
      const total = Math.round(Number(walletData.total ?? Math.max(planAllotment, remaining + lifetimeUsed)));
      const used = lifetimeUsed > 0 ? lifetimeUsed : Math.max(0, total - remaining);

      setCredits({
        total: total > 0 ? total : (remaining + used),
        used,
        remaining,
        reserved: Math.round(Number(walletData.reserved ?? 0)),
        lifetimeUsed,
        plan: walletData.plan,
        monthlyAllotment: walletData.monthly_allotment,
        renewsOn: walletData.renews_on,
        currency: walletData.currency,
      });

      try {
        const txData = await getTransactions(token, { limit: 50 });
        setTransactions(txData.transactions ?? []);
      } catch (txErr: any) {
        console.warn('[CreditsContext] Could not load transactions:', txErr?.message);
        setTransactions([]);
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to load wallet';
      setError(msg);
      console.error('[CreditsContext] fetchWalletData error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const isZeroBalance = useMemo(() => credits.remaining <= 0, [credits.remaining]);

  const usagePercentage = useMemo(() => {
    if (credits.total <= 0) return 0;
    const pct = (credits.used / credits.total) * 100;
    return Math.min(Math.max(Number(pct.toFixed(1)), 0), 100);
  }, [credits.total, credits.used]);

  const hasEnoughCredits = useCallback(
    (amount: number) => credits.remaining >= Math.round(amount),
    [credits.remaining],
  );

  const deductCredits = useCallback(
    (amount: number, action: CreditAction): DeductResult => {
      if (amount <= 0) return { success: true };

      if (credits.remaining < amount) {
        toast.error(`Not enough credits. You need ${amount} credits for "${action}".`);
        return { success: false, reason: 'insufficient' };
      }

      setCredits((prev) => ({
        ...prev,
        used: prev.used + amount,
        remaining: prev.remaining - amount,
      }));

      return { success: true };
    },
    [credits.remaining],
  );

  const addCredits = useCallback(async (amount: number, packageId?: string) => {
    if (amount <= 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to add credits.');
      return;
    }

    try {
      const result = await rechargeWallet(token, { amount, package_id: packageId, reference_id: packageId });
      toast.success(`${result.credits_added.toLocaleString()} credits added! New balance: ${result.balance_after.toLocaleString()}`);
      await fetchWalletData();
    } catch (err: any) {
      const msg = err?.message || 'Failed to add credits';
      toast.error(msg);
      throw err;
    }
  }, [fetchWalletData]);

  const subscribeToPlan = useCallback(async (planName: string, planId?: string, referenceId?: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to change your plan.');
      return;
    }

    try {
      const result = await subscribeToPlanApi(token, {
        plan_name: planName,
        plan_id: planId,
        reference_id: referenceId,
      });
      toast.success(`Plan updated to ${planName}! New balance: ${result.balance_after.toLocaleString()}`);
      await fetchWalletData();
    } catch (err: any) {
      const msg = err?.message || 'Failed to update plan';
      toast.error(msg);
      throw err;
    }
  }, [fetchWalletData]);

  const refreshWallet = useCallback(async () => {
    setLoading(true);
    await fetchWalletData();
  }, [fetchWalletData]);

  const value = useMemo(
    () => ({
      credits,
      transactions,
      usagePercentage,
      loading,
      error,
      isZeroBalance,
      deductCredits,
      addCredits,
      subscribeToPlan,
      hasEnoughCredits,
      refreshWallet,
    }),
    [
      credits,
      transactions,
      usagePercentage,
      loading,
      error,
      isZeroBalance,
      deductCredits,
      addCredits,
      subscribeToPlan,
      hasEnoughCredits,
      refreshWallet,
    ],
  );

  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>;
};


export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
};
