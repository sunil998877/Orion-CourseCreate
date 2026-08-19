import {
    getPlansList,
    processPlanSubscription,
    createPlanStripeSession as createPlanStripeSessionService,
} from "../../services/creditService/planService.js";

export const getPlans = async (req, res) => {
    try {
        const plans = await getPlansList();
        return res.status(200).json({
            success: true,
            data: plans,
        });
    } catch (error) {
        console.error("Error fetching plans:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch plans",
        });
    }
};

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
    } catch (error) {
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

export const createPlanStripeSession = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { plan_id, plan_name, success_url, cancel_url } = req.body;

        const sessionData = await createPlanStripeSessionService({
            userId,
            planId: plan_id,
            planName: plan_name,
            successUrl: success_url,
            cancelUrl: cancel_url,
        });

        return res.status(200).json({
            success: true,
            message: "Stripe checkout session created for plan subscription",
            data: sessionData,
        });
    } catch (error) {
        console.error("Error creating Stripe session for plan:", error);
        if (error.message === "Selected plan not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to create Stripe session" });
    }
};
