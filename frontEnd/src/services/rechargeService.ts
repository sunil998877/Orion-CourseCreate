import { API_BASE } from '../utils/api';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export interface RechargePayload {
  amount?: number;
  package_id?: string;
  reference_id?: string;
}

export interface RechargeData {
  recharge_type?: 'TOP_UP' | 'PLAN_UPGRADE';
  balance_before: number;
  credits_added: number;
  balance_after: number;
  reference_id: string | null;
  renews_on?: string | null;
}

export interface StripeRechargeSessionPayload {
  amount: number;
  package_id?: string;
  price?: number;
  success_url?: string;
  cancel_url?: string;
}

export interface StripeSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  mode: 'live_stripe' | 'simulated_stripe';
}

export const rechargeWallet = async (
  token: string,
  payload: number | RechargePayload,
  reference_id?: string
): Promise<RechargeData> => {
  const body = typeof payload === 'number'
    ? { amount: payload, reference_id }
    : payload;

  const res = await fetch(`${API_BASE}/wallet/recharge/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to recharge wallet');
  return data.data as RechargeData;
};

export const createRechargeStripeSession = async (
  token: string,
  payload: StripeRechargeSessionPayload
): Promise<StripeSessionResponse> => {
  const res = await fetch(`${API_BASE}/wallet/recharge/stripe-session/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to create Stripe session for credit top-up');
  return data.data as StripeSessionResponse;
};
