import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
import { formatTransaction, providerSpendPipeline, ledgerProviderBreakdown, estimateProviderSpendFromCourses, mergeProviderBreakdown, } from "./admin.helpers.js";
import { withCache } from "./admin.cache.js";
const loadAnalytics = async () => {
    const [walletAgg, txAgg, providerAgg, recentReconciled, estimatedProviders] = await Promise.all([
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
            { $group: { _id: "$type", totalAmount: { $sum: { $abs: "$amount" } }, count: { $sum: 1 } } },
        ]),
        CreditTransaction.aggregate(providerSpendPipeline),
        CreditTransaction.find({ type: "RESERVE", status: "RECONCILED" })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("type status amount referenceId reason approvedBy providerUsageMeta createdAt wallet action")
            .populate({ path: "wallet", populate: { path: "user", select: "username email" } })
            .populate("action", "actionKey displayName provider creditCost")
            .lean(),
        estimateProviderSpendFromCourses(),
    ]);
    const walletStats = walletAgg[0] || { totalBalance: 0, totalReserved: 0, totalLifetimeUsed: 0 };
    const txByType = {};
    for (const t of txAgg)
        txByType[t._id] = t;
    const providerBreakdown = mergeProviderBreakdown(ledgerProviderBreakdown(providerAgg), estimatedProviders);
    const totalCreditsIssued = (txByType.RECHARGE?.totalAmount || 0) +
        (txByType.PLAN_RESET?.totalAmount || 0) +
        (txByType.ADJUSTMENT?.totalAmount || 0);
    return {
        totalCreditsIssued,
        totalCreditsSpent: walletStats.totalLifetimeUsed || 0,
        totalActiveBalance: walletStats.totalBalance || 0,
        totalReserved: walletStats.totalReserved || 0,
        totalLifetimeUsed: walletStats.totalLifetimeUsed || 0,
        gammaCreditsSpent: providerBreakdown.gamma?.totalCreditsCharged || 0,
        providerBreakdown,
        transactionBreakdown: txByType,
        recentReconciled: recentReconciled.map(formatTransaction),
    };
};
export const getAdminAnalytics = async (req, res) => {
    try {
        const data = await withCache("analytics", 20000, loadAnalytics);
        return res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error("[Admin] getAdminAnalytics error:", error);
        return res.status(500).json({ success: false, message: "Failed to load analytics" });
    }
};
