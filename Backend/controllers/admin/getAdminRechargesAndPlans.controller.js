import CreditTransaction from "../../models/credits/creditTransaction.js";
import { formatTransaction } from "./admin.helpers.js";
export const getAdminRechargesAndPlans = async (req, res) => {
    try {
        const { type = "ALL", search = "", page = 1, limit = 50 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        const skip = (pageNum - 1) * limitNum;
        const query = { type: { $in: ["RECHARGE", "PLAN_RESET"] } };
        if (type === "RECHARGE" || type === "PLAN_RESET")
            query.type = type;
        if (search) {
            query.$or = [
                { referenceId: { $regex: search, $options: "i" } },
                { reason: { $regex: search, $options: "i" } },
            ];
        }
        const [history, total, summaryAgg] = await Promise.all([
            CreditTransaction.find(query)
                .populate({ path: "wallet", populate: { path: "user", select: "username email" } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            CreditTransaction.countDocuments(query),
            CreditTransaction.aggregate([
                { $match: { type: { $in: ["RECHARGE", "PLAN_RESET"] } } },
                { $group: { _id: "$type", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
        ]);
        const recharge = summaryAgg.find((s) => s._id === "RECHARGE") || { totalAmount: 0, count: 0 };
        const plans = summaryAgg.find((s) => s._id === "PLAN_RESET") || { totalAmount: 0, count: 0 };
        const formatted = history.map((tx) => ({
            ...formatTransaction(tx),
            wallet: tx.wallet,
        }));
        return res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRechargeRevenue: recharge.totalAmount || 0,
                    totalRechargesCount: recharge.count || 0,
                    totalPlanSubscriptionsCount: plans.count || 0,
                    totalPlanCreditsGranted: plans.totalAmount || 0,
                },
                history: formatted,
                total,
                page: pageNum,
                limit: limitNum,
            },
        });
    }
    catch (error) {
        console.error("[Admin] getAdminRechargesAndPlans error:", error);
        return res.status(500).json({ success: false, message: "Failed to load recharge and plan history" });
    }
};
