import { cancelPlanSubscription } from "../../services/creditService/planService.js";

export const cancelPlan = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const result = await cancelPlanSubscription({ userId });
        return res.status(200).json({
            success: true,
            message: `Successfully cancelled ${result.previousPlan} plan subscription. Reverted to Free plan.`,
            data: result,
        });
    } catch (error) {
        console.error("Error cancelling plan subscription:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to cancel plan subscription" });
    }
};

export default cancelPlan;
