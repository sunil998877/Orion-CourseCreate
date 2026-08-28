import User from "../../models/userModel.js";
import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
import Course from "../../models/courseModel.js";
import { formatTransaction, providerSpendPipeline, ledgerProviderBreakdown, estimateProviderSpendFromCourses, mergeProviderBreakdown, } from "./admin.helpers.js";
import { withCache } from "./admin.cache.js";
const loadDashboardStats = async () => {
    const [totalUsers, totalCourses, walletAgg, transactionAgg, providerAgg, recentTransactions, estimatedProviders,] = await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Wallet.aggregate([
            {
                $group: {
                    _id: null,
                    totalBalance: { $sum: "$balance" },
                    totalReserved: { $sum: "$reserved" },
                    totalLifetimeUsed: { $sum: "$lifetimeUsed" },
                },
            },
        ]),
        CreditTransaction.aggregate([
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: { $abs: "$amount" } },
                    count: { $sum: 1 },
                },
            },
        ]),
        CreditTransaction.aggregate(providerSpendPipeline),
        CreditTransaction.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("type status amount referenceId reason approvedBy providerUsageMeta createdAt wallet action")
            .populate({ path: "wallet", populate: { path: "user", select: "username email" } })
            .populate("action", "actionKey displayName provider creditCost")
            .lean(),
        estimateProviderSpendFromCourses(),
    ]);
    const walletStats = walletAgg[0] || { totalBalance: 0, totalReserved: 0, totalLifetimeUsed: 0 };
    const txByType = {};
    for (const t of transactionAgg) {
        txByType[t._id] = { totalAmount: t.totalAmount, count: t.count };
    }
    const providerBreakdown = mergeProviderBreakdown(ledgerProviderBreakdown(providerAgg), estimatedProviders);
    const totalCreditsIssued = (txByType.RECHARGE?.totalAmount || 0) +
        (txByType.PLAN_RESET?.totalAmount || 0) +
        (txByType.ADJUSTMENT?.totalAmount || 0);
    return {
        totalUsers,
        totalCourses,
        totalCreditsIssued,
        totalCreditsSpent: walletStats.totalLifetimeUsed || 0,
        totalActiveBalance: walletStats.totalBalance || 0,
        totalReserved: walletStats.totalReserved || 0,
        totalLifetimeUsed: walletStats.totalLifetimeUsed || 0,
        gammaCreditsSpent: providerBreakdown.gamma?.totalCreditsCharged || 0,
        gammaJobsCount: providerBreakdown.gamma?.count || 0,
        transactionBreakdown: txByType,
        providerBreakdown,
        recentTransactions: recentTransactions.map(formatTransaction),
    };
};
export const getAdminDashboardStats = async (req, res) => {
    try {
        const data = await withCache("dashboard-stats", 20000, loadDashboardStats);
        return res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error("[Admin] getAdminDashboardStats error:", error);
        return res.status(500).json({ success: false, message: "Failed to load dashboard stats" });
    }
};
