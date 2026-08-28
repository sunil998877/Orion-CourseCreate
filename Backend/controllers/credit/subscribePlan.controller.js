import { processPlanSubscription } from "../../services/creditService/planService.js";
export const subscribePlan = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const { plan_id, plan_name, reference_id } = req.body;
        const result = await processPlanSubscription({
            userId,
            planId: plan_id,
            planName: plan_name,
            referenceId: reference_id,
        });
        return res.status(200).json({
            success: true,
            message: `Successfully subscribed/upgraded to ${result.plan.name} plan.`,
            data: result,
        });
    }
    catch (error) {
        console.error("Error subscribing to plan:", error);
        if (error.message === "Wallet not found for this user" || error.message === "Selected plan not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes("Plan ID or Plan Name must be provided")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to subscribe to plan" });
    }
};
