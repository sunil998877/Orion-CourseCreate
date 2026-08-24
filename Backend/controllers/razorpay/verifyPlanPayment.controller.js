import CreditTransaction from "../../models/credits/creditTransaction.js";
import { processPlanSubscription } from "../../services/creditService/planService.js";
import { verifySignature } from "./razorpay.helpers.js";

export const verifyPlanPayment = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan_id,
            plan_name,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing Razorpay payment fields" });
        }

        if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return res.status(400).json({ success: false, message: "Invalid Razorpay signature" });
        }

        const existing = await CreditTransaction.findOne({
            referenceId: razorpay_payment_id,
            type: "PLAN_RESET",
        });
        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Plan payment already verified",
                data: { reference_id: razorpay_payment_id, alreadyProcessed: true },
            });
        }

        const result = await processPlanSubscription({
            userId,
            planId: plan_id,
            planName: plan_name,
            referenceId: razorpay_payment_id,
        });

        return res.status(200).json({
            success: true,
            message: "Plan activated successfully",
            data: result,
        });
    } catch (error) {
        console.error("[Razorpay] verifyPlanPayment error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to verify plan payment" });
    }
};
