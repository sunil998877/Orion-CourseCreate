import { renewAllDueSubscriptions, processPlanRenewal } from "../../services/creditService/planService.js";
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
    }
    catch (error) {
        console.error("Error triggering plan renewals:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process plan renewals",
        });
    }
};
