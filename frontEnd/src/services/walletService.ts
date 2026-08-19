import { API_BASE } from '../utils/api';
import type { PlanData } from '../types/credits.types';

export * from './rechargeService';
export {
  getPlans,
  subscribeToPlan,
  createPlanStripeSession,
  type PlanSubscribePayload,
  type PlanSubscribeData,
  type StripePlanSessionPayload,
} from './planService';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export interface WalletData {
  balance: number;
  reserved: number;
  lifetime_used?: number;
  used?: number;
  total?: number;
  plan: string;
  monthly_allotment: number;
  renews_on: string | null;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  _id?: string;
  type: 'RESERVE' | 'RECONCILE' | 'REFUND' | 'RECHARGE' | 'PLAN_RESET' | 'ADJUSTMENT';
  amount: number;
  action_key?: string | null;
  action_name?: string | null;
  provider?: string | null;
  reference_id?: string | null;
  referenceId?: string | null;
  action?: {
    actionKey?: string;
    displayName?: string;
    provider?: string;
  } | null;
  created_at?: string;
  createdAt?: string;
}

export interface TransactionPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TransactionsData {
  transactions: WalletTransaction[];
  pagination: TransactionPagination;
}

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  type?: string;
}

export interface EstimateData {
  actionKey: string;
  actionName: string;
  creditCost: number;
  isAvailable: boolean;
}

export const getWallet = async (token: string): Promise<WalletData> => {
  const res = await fetch(`${API_BASE}/wallet/`, {
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to fetch wallet');
  return data.data as WalletData;
};

export const getTransactions = async (
  token: string,
  params?: GetTransactionsParams
): Promise<TransactionsData> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.type) query.append('type', params.type);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`${API_BASE}/wallet/transactions/${queryString}`, {
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to fetch transactions');
  return data.data as TransactionsData;
};

export const estimateCreditCost = async (
  token: string,
  actionKey: string
): Promise<EstimateData> => {
  const res = await fetch(`${API_BASE}/wallet/estimate/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ actionKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to estimate credit cost');
  return data.data as EstimateData;
};
