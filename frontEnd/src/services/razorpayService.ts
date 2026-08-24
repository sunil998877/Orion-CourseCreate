import { API_BASE } from "../utils/api";

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export interface RazorpayConfig {
  keyId: string;
  currency: string;
  provider: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  credits: number;
  amountInr: number;
  type: string;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const getRazorpayConfig = async (token: string): Promise<RazorpayConfig> => {
  const res = await fetch(`${API_BASE}/razorpay/config`, { headers: authHeaders(token) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load Razorpay config");
  return data.data as RazorpayConfig;
};

export const createRazorpayOrder = async (
  token: string,
  payload: {
    amount: number;
    credits?: number;
    package_id?: string;
    plan_id?: string;
    plan_name?: string;
    type?: "recharge" | "plan";
  }
): Promise<RazorpayOrder> => {
  const res = await fetch(`${API_BASE}/razorpay/order`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to create Razorpay order");
  return data.data as RazorpayOrder;
};

export const verifyRazorpayRecharge = async (
  token: string,
  payload: Record<string, unknown>
) => {
  const res = await fetch(`${API_BASE}/razorpay/verify-payment`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to verify Razorpay payment");
  return data.data;
};

export const verifyRazorpayPlan = async (
  token: string,
  payload: Record<string, unknown>
) => {
  const res = await fetch(`${API_BASE}/razorpay/verify-plan`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to verify Razorpay plan payment");
  return data.data;
};
