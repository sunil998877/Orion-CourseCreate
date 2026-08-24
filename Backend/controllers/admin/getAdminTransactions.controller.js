import CreditTransaction from "../../models/credits/creditTransaction.js";
import { formatTransaction } from "./admin.helpers.js";

export const getAdminTransactions = async (req, res) => {
    try {
        const { type, search = "", page = 1, limit = 50 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        const skip = (pageNum - 1) * limitNum;

        const query = {};
        if (type && type !== "ALL") query.type = type;
        if (search) {
            query.$or = [
                { referenceId: { $regex: search, $options: "i" } },
                { reason: { $regex: search, $options: "i" } },
            ];
        }

        const [transactions, total] = await Promise.all([
            CreditTransaction.find(query)
                .populate({ path: "wallet", populate: { path: "user", select: "username email" } })
                .populate("action", "actionKey displayName provider creditCost")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            CreditTransaction.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            data: { transactions: transactions.map(formatTransaction), total, page: pageNum, limit: limitNum },
        });
    } catch (error) {
        console.error("[Admin] getAdminTransactions error:", error);
        return res.status(500).json({ success: false, message: "Failed to load transactions" });
    }
};
