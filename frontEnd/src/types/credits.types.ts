export type CreditAction =
  | 'Generate Course Outline'
  | 'Generate Module'
  | 'Generate Lesson'
  | 'Generate Quiz'
  | 'Generate Questions'
  | 'Rewrite Content'
  | 'Generate Summary'
  | string;

export type CreditsBalance = {
  total: number;
  used: number;
  remaining: number;
  reserved?: number;
  lifetimeUsed?: number;
  plan?: string;
  monthlyAllotment?: number;
  renewsOn?: string | null;
  currency?: string;
};

export type WalletTransaction = {
  id: string;
  _id?: string;
  type: 'RESERVE' | 'RECONCILE' | 'REFUND' | 'RECHARGE' | 'PLAN_RESET' | 'ADJUSTMENT';
  status?: 'PENDING' | 'RECONCILED' | 'RELEASED' | 'EXPIRED' | 'COMPLETED';
  amount: number;
  action_key?: string | null;
  action_name?: string | null;
  provider?: string | null;
  reference_id?: string | null;
  referenceId?: string | null;
  approved_by?: string | null;
  approvedBy?: string | null;
  reason?: string | null;
  notes?: string | null;
  action?: {
    actionKey?: string;
    displayName?: string;
    provider?: string;
  } | null;
  created_at?: string;
  createdAt?: string;
};

export type UsageHistoryItem = {
  id: string;
  action: CreditAction;
  cost: number;
  createdAt: string;
};

export type CreditPackage = {
  id: string;
  credits: number;
  price: number;
  label: string;
  popular?: boolean;
};

export type PlanName = 'Free' | 'Pro' | 'Team';

export interface PlanData {
  id?: string;
  name: PlanName;
  monthlyCreditAllotment: number;
  priceInr: number;
  rolloverAllowed: boolean;
}

export const CREDIT_COSTS: Record<string, number | string> = {
  'Generate Course': 250,
  'Generate Course Outline': 10,
  'Generate Workbook / Worksheet': 20,
  'Generate Quiz / Assessment': 8,
  'Generate Podcast / Voiceover': '15 / min',
  'Regenerate / Edit Section': 5,
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'pkg-100', credits: 100, price: 9, label: '100 Credits' },
  { id: 'pkg-500', credits: 500, price: 39, label: '500 Credits', popular: true },
  { id: 'pkg-1000', credits: 1000, price: 69, label: '1,000 Credits' },
  { id: 'pkg-5000', credits: 5000, price: 249, label: '5,000 Credits' },
];
