import CreditTransaction from "../../models/credits/creditTransaction.js";
import Wallet from "../../models/credits/wallet.js";
import PricingRule from "../../models/credits/pricingRule.js";

/**
 * GET /api/wallet/transactions/
 * Returns a paginated ledger history for the authenticated user.
 *
 * Query params:
 *   page     (default: 1)
 *   limit    (default: 20, max: 100)
 *   type     (optional) - filter by transaction type: RESERVE | RECONCILE | REFUND | RECHARGE | PLAN_RESET | ADJUSTMENT
 */
export const getTransactions = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            // Wallet may not be provisioned yet (new user). Return empty history gracefully.
            return res.status(200).json({
                success: true,
                data: {
                    transactions: [],
                    pagination: { page: 1, limit: 20, total: 0, total_pages: 0, has_next: false, has_prev: false },
                },
            });
        }

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const filter = { wallet: wallet._id };
        if (req.query.type) {
            const allowed = ["RESERVE", "RECONCILE", "REFUND", "RECHARGE", "PLAN_RESET", "ADJUSTMENT"];
            if (!allowed.includes(req.query.type.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid type. Must be one of: ${allowed.join(", ")}`,
                });
            }
            filter.type = req.query.type.toUpperCase();
        }

        const [transactions, total] = await Promise.all([
            CreditTransaction.find(filter)
                .populate("action", "actionKey displayName provider creditCost")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CreditTransaction.countDocuments(filter),
        ]);

        const formattedTransactions = transactions.map((tx) => ({
            _id: tx._id,
            id: tx._id,
            type: tx.type,
            status: tx.status || (tx.type === "RESERVE" ? "PENDING" : "COMPLETED"),
            amount: Math.round(Number(tx.amount)),
            referenceId: tx.referenceId || null,
            reference_id: tx.referenceId || null,
            approvedBy: tx.approvedBy || null,
            approved_by: tx.approvedBy || null,
            reason: tx.reason || null,
            notes: tx.providerUsageMeta?.notes || null,
            action: tx.action
                ? {
                    actionKey: tx.action.actionKey,
                    displayName: tx.action.displayName,
                    provider: tx.action.provider,
                }
                : null,
            action_key: tx.action?.actionKey || null,
            action_name: tx.action?.displayName || null,
            provider: tx.action?.provider || null,
            providerUsageMeta: tx.providerUsageMeta || null,
            createdAt: tx.createdAt,
            created_at: tx.createdAt,
        }));

        return res.status(200).json({
            success: true,
            data: {
                transactions: formattedTransactions,
                pagination: {
                    page,
                    limit,
                    total,
                    total_pages: Math.ceil(total / limit),
                    has_next: page < Math.ceil(total / limit),
                    has_prev: page > 1,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch transaction history" });
    }
};
