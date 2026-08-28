import { createRechargeStripeSession as createRechargeStripeSessionService, } from "../../services/creditService/rechargeService.js";
export const createRechargeStripeSession = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const { amount, package_id, price, success_url, cancel_url } = req.body;
        const sessionData = await createRechargeStripeSessionService({
            userId,
            amount,
            packageId: package_id,
            price,
            successUrl: success_url,
            cancelUrl: cancel_url,
        });
        return res.status(200).json({
            success: true,
            message: "Stripe checkout session created for credit top-up",
            data: sessionData,
        });
    }
    catch (error) {
        console.error("Error creating Stripe session for recharge:", error);
        if (error.message === "amount must be a positive integer") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to create Stripe session" });
    }
};
