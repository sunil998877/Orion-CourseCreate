import { processSupportAdjustment } from "../../services/creditService/adjustmentService.js";
import { cleanupStaleReservations } from "../../services/creditService/cleanupService.js";
import { renewAllDueSubscriptions, processPlanRenewal } from "../../services/creditService/planService.js";

/**
 * POST /api/wallet/adjust/
 * Endpoint for authorized support/admin to adjust user credits with a clear audit trail.
 */
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
            message: `Successfully adjusted ${result.amountAdjusted > 0 ? '+' : ''}${result.amountAdjusted} credits for user.`,
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

/**
 * POST /api/wallet/cleanup-reservations/
 * Admin / Cron trigger to sweep and void stale reservations older than N minutes.
 */
export const triggerCleanupReservations = async (req, res) => {
    try {
        const { max_age_minutes, maxAgeMinutes } = req.body || {};
        const age = parseInt(maxAgeMinutes || max_age_minutes) || 15;

        const result = await cleanupStaleReservations({ maxAgeMinutes: age });

        return res.status(200).json({
            success: true,
            message: `Cleanup completed: ${result.processedCount} stale reservation(s) voided and refunded.`,
            data: result,
        });
    } catch (error) {
        console.error("Error triggering cleanup of reservations:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to run reservation cleanup",
        });
    }
};

/**
 * POST /api/wallet/renew-subscriptions/
 * Admin / Cron trigger to process scheduled monthly plan renewals honoring rolloverAllowed.
 */
export const triggerPlanRenewals = async (req, res) => {
    try {
        const { user_id, userId } = req.body || {};
        const targetUserId = userId || user_id;

        if (targetUserId) {
            const result = await processPlanRenewal({ userId: targetUserId });
            return res.status(200).json({
                success: true,
                message: `Plan renewal processed for user ${targetUserId}`,
                data: result,
            });
        }

        const result = await renewAllDueSubscriptions();
        return res.status(200).json({
            success: true,
            message: `Processed ${result.processedCount} due plan renewals.`,
            data: result,
        });
    } catch (error) {
        console.error("Error triggering plan renewals:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process plan renewals",
        });
    }
};
