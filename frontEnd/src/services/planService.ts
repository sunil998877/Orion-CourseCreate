import { API_BASE } from '../utils/api';
import type { PlanData } from '../types/credits.types';

const authHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface PlanSubscribePayload {
  plan_id?: string;
  plan_name?: string;
  reference_id?: string;
}

export interface PlanSubscribeData {
  recharge_type: 'PLAN_UPGRADE';
  plan: {
    id: string;
    name: string;
    monthlyCreditAllotment: number;
    priceInINR: number;
  };
  balance_before: number;
  credits_added: number;
  balance_after: number;
  renews_on: string | null;
  reference_id: string | null;
}

export interface StripePlanSessionPayload {
  plan_id?: string;
  plan_name?: string;
  success_url?: string;
  cancel_url?: string;
}

export interface StripeSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  mode: 'live_stripe' | 'simulated_stripe';
}

export const getPlans = async (token?: string): Promise<PlanData[]> => {
  const res = await fetch(`${API_BASE}/wallet/plans/`, {
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to fetch plans');
  return data.data as PlanData[];
};

export const subscribeToPlan = async (
  token: string,
  payload: PlanSubscribePayload
): Promise<PlanSubscribeData> => {
  const res = await fetch(`${API_BASE}/wallet/plans/subscribe/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to subscribe to plan');
  return data.data as PlanSubscribeData;
};

export const createPlanStripeSession = async (
  token: string,
  payload: StripePlanSessionPayload
): Promise<StripeSessionResponse> => {
  const res = await fetch(`${API_BASE}/wallet/plans/stripe-session/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to create Stripe session for plan subscription');
  return data.data as StripeSessionResponse;
};
