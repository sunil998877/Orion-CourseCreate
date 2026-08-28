import { API_BASE } from "../utils/api";
const getHeaders = () => {
    const token = localStorage.getItem("adminToken") || "";
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};
export interface AdminDashboardStats {
    totalUsers: number;
    totalCourses: number;
    totalCreditsIssued: number;
    totalCreditsSpent: number;
    totalActiveBalance: number;
    totalReserved: number;
    totalLifetimeUsed: number;
    gammaCreditsSpent: number;
    gammaJobsCount: number;
    providerBreakdown?: Record<string, {
        totalCreditsCharged: number;
        count: number;
    }>;
    transactionBreakdown: Record<string, {
        totalAmount: number;
        count: number;
    }>;
    recentTransactions: Array<{
        id: string;
        type: string;
        status: string;
        amount: number;
        referenceId?: string;
        reason?: string;
        providerUsageMeta?: any;
        createdAt: string;
        user?: {
            username: string;
            email: string;
        } | null;
        action?: {
            actionKey: string;
            displayName: string;
            provider: string;
            creditCost: number;
        } | null;
    }>;
}
export interface AdminUserItem {
    id: string;
    username: string;
    email: string;
    joinedDate: string;
    isVerified: boolean;
    lastLoginAt?: string;
    courseCount?: number;
    rechargeCount?: number;
    totalRechargedINR?: number;
    planSubscriptionCount?: number;
    gammaCreditsSpent?: number;
    openaiCreditsSpent?: number;
    audioCreditsSpent?: number;
    wallet?: {
        walletId: string;
        balance: number;
        reserved: number;
        lifetimeUsed: number;
        renewsOn?: string | null;
        plan?: {
            name: string;
            monthlyCredits: number;
            priceInINR?: number;
        } | null;
    } | null;
}
export interface AdminUserCourseDetail {
    id: string;
    courseId: string;
    title: string;
    description: string;
    type: string;
    level: string;
    moduleCount: number;
    podcastStatus: string;
    ebookStatus: string;
    audioUrl?: string | null;
    ebookUrl?: string | null;
    createdAt: string;
    totalCreditsUsed: number;
    breakdown: {
        gammaCredits: number;
        gammaDecksCount: number;
        openaiCredits: number;
        audioCredits: number;
        txRecorded: boolean;
    };
    modules: Array<{
        moduleId: string;
        moduleNumber: number;
        title: string;
        status: string;
        gammaUrl?: string | null;
        quizCount: number;
    }>;
    transactions: Array<{
        id: string;
        type: string;
        status: string;
        amount: number;
        referenceId?: string;
        createdAt: string;
        action?: {
            actionKey: string;
            displayName: string;
            provider: string;
        } | null;
    }>;
}
export interface AdminRechargeItem {
    id: string;
    type: string;
    status: string;
    amount: number;
    referenceId?: string;
    reason?: string;
    providerUsageMeta?: any;
    createdAt: string;
}
export interface AdminUserDetailsResponse {
    user: AdminUserItem;
    summary: {
        totalCourses: number;
        totalCreditsUsedOnCourses: number;
        lifetimeSpent: number;
        currentBalance: number;
        reservedCredits: number;
    };
    rechargePlanSummary?: {
        totalRechargesCount: number;
        totalRechargesAmount: number;
        totalPlansSubscribed: number;
        totalPlanCreditsGranted: number;
        currentPlan: string;
        renewsOn?: string | null;
    };
    rechargeHistory?: AdminRechargeItem[];
    planHistory?: AdminRechargeItem[];
    courses: AdminUserCourseDetail[];
    recentTransactions: AdminTransactionItem[];
}
export interface AdminUserRechargeSummaryItem {
    userId: string;
    username: string;
    email: string;
    joinedDate: string;
    isVerified: boolean;
    currentPlan: string;
    currentBalance: number;
    renewsOn?: string | null;
    rechargeCount: number;
    totalRechargedINR: number;
    planCount: number;
    totalPlanCreditsGranted: number;
    lastActivityDate?: string | null;
}
export interface AdminRechargePlanHistoryResponse {
    summary: {
        totalRechargeRevenue: number;
        totalRechargesCount: number;
        totalPlanSubscriptionsCount: number;
        paidSubscribersCount: number;
        planDistribution: Record<string, number>;
    };
    history: AdminTransactionItem[];
    total: number;
    userSummaries: AdminUserRechargeSummaryItem[];
}
export interface AdminPricingRuleItem {
    _id: string;
    actionKey: string;
    displayName: string;
    provider: "gamma" | "openai" | "elevenlabs";
    creditCost: number;
    isActive: boolean;
    createdAt?: string;
}
export interface AdminCourseItem {
    id: string;
    courseId: string;
    title: string;
    description: string;
    type: string;
    level: string;
    moduleCount: number;
    podcastStatus: string;
    ebookStatus: string;
    audioUrl?: string | null;
    ebookUrl?: string | null;
    createdAt: string;
    user?: {
        username: string;
        email: string;
    } | null;
    modulesOverview: Array<{
        title: string;
        status: string;
        gammaUrl?: string | null;
    }>;
}
export interface AdminTransactionItem {
    id: string;
    type: string;
    status: string;
    amount: number;
    referenceId?: string;
    reason?: string;
    approvedBy?: string;
    providerUsageMeta?: any;
    createdAt: string;
    user?: {
        username: string;
        email: string;
    } | null;
    action?: {
        actionKey: string;
        displayName: string;
        provider: string;
    } | null;
}
export const fetchAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json.message || "Failed to fetch admin stats");
    return json.data;
};
export const fetchAdminUsers = async (search = "", page = 1, limit = 50): Promise<{
    users: AdminUserItem[];
    total: number;
}> => {
    const params = new URLSearchParams();
    if (search)
        params.append("search", search);
    params.append("page", String(page));
    params.append("limit", String(limit));
    const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json.message || "Failed to fetch users");
    return json.data;
};
export const adjustUserCreditsApi = async (payload: {
    userId: string;
    amount: number;
    reason: string;
    notes?: string;
    referenceId?: string;
}) => {
    const res = await fetch(`${API_BASE}/admin/users/adjust-credits`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json.message || "Failed to adjust credits");
    return json;
};
export const fetchAdminPricingRules = async (): Promise<AdminPricingRuleItem[]> => {
    const res = await fetch(`${API_BASE}/admin/pricing-rules`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json.message || "Failed to fetch pricing rules");
    return json.data;
};
export const updatePricingRuleApi = async (id: string, payload: {
    creditCost?: number;
    isActive?: boolean;
}) => {
    const res = await fetch(`${API_BASE}/admin/pricing-rules/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json.message || "Failed to update pricing rule");
    return json.data;
};
export const fetchAdminTransactions = async (type = "", search = "", page = 1, limit = 50): Promise<{
    transactions: AdminTransactionItem[];
    total: number;
}> => {
    const params = new URLSearchParams();
    if (type && type !== "ALL")
        params.append("type", type);
    if (search)
        params.append("search", search);
    params.append("page", String(page));
    params.append("limit", String(limit));
    const res = await fetch(`${API_BASE}/admin/transactions?${params.toString()}`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json.message || "Failed to fetch transactions");
    return json.data;
};
export const fetchAdminCourses = async (search = "", page = 1, limit = 50): Promise<{
    courses: AdminCourseItem[];
    total: number;
}> => {
    const params = new URLSearchParams();
    if (search)
        params.append("search", search);
    params.append("page", String(page));
    params.append("limit", String(limit));
    const res = await fetch(`${API_BASE}/admin/courses?${params.toString()}`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json.message || "Failed to fetch courses");
    return json.data;
};
export const fetchAdminAnalytics = async () => {
    const res = await fetch(`${API_BASE}/admin/analytics`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json.message || "Failed to fetch analytics");
    return json.data;
};
export const fetchAdminUserDetails = async (userId: string): Promise<AdminUserDetailsResponse> => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/details`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json.message || "Failed to fetch user details");
    return json.data;
};
export const fetchAdminRechargesAndPlans = async (type = "ALL", search = "", page = 1, limit = 50): Promise<AdminRechargePlanHistoryResponse> => {
    const params = new URLSearchParams();
    if (type && type !== "ALL")
        params.append("type", type);
    if (search)
        params.append("search", search);
    params.append("page", String(page));
    params.append("limit", String(limit));
    const res = await fetch(`${API_BASE}/admin/recharges-and-plans?${params.toString()}`, {
        headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json.message || "Failed to fetch recharge and plan history");
    return json.data;
};
export const getAdminDashboardStats = fetchAdminDashboardStats;
export const getAdminAllUsers = fetchAdminUsers;
export const adminAdjustCredits = adjustUserCreditsApi;
export const getAdminPricingRules = fetchAdminPricingRules;
export const updateAdminPricingRule = updatePricingRuleApi;
export const getAdminTransactions = fetchAdminTransactions;
export const getAdminCourses = fetchAdminCourses;
export const getAdminAnalytics = fetchAdminAnalytics;
export const getAdminUserDetails = fetchAdminUserDetails;
export const getAdminRechargesAndPlans = fetchAdminRechargesAndPlans;
