import { processSupportAdjustment } from "../../services/creditService/adjustmentService.js";

export const adjustWalletCredits = async (req, res) => {
    try {
        const { user_id, userId, amount, reason, notes, reference_id, referenceId } = req.body || {};
        const targetUserId = userId || user_id;

        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                message: "Target user ID (userId or user_id) is required",
            });
        }

        const approvedBy =
            req.user?.email ||
            req.user?.username ||
            req.user?.name ||
            req.user?._id ||
            req.body?.approved_by ||
            req.body?.approvedBy;

        if (!approvedBy) {
            return res.status(400).json({
                success: false,
                message: "approvedBy (admin identity) is required for support adjustments",
            });
        }

        if (!reason || !String(reason).trim()) {
            return res.status(400).json({
                success: false,
                message: "reason is required for support adjustments",
            });
        }

        const result = await processSupportAdjustment({
            userId: targetUserId,
            amount,
            approvedBy,
            reason,
            notes,
            referenceId: referenceId || reference_id,
        });

        return res.status(200).json({
            success: true,
            message: `Successfully adjusted ${result.amountAdjusted > 0 ? "+" : ""}${result.amountAdjusted} credits for user.`,
            data: result,
        });
    } catch (error) {
        console.error("Error performing wallet adjustment:", error);
        const status = error.message.includes("Cannot debit") || error.message.includes("not found") ? 400 : 500;
        return res.status(status).json({
            success: false,
            message: error.message || "Failed to process adjustment",
        });
    }
};
