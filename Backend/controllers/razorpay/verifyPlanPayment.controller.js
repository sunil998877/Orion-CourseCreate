import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
import { processPlanSubscription } from "../../services/creditService/planService.js";
import { verifySignature } from "./razorpay.helpers.js";

export const verifyPlanPayment = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
        const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id;
        const razorpaySignature = req.body.razorpaySignature || req.body.razorpay_signature;
        const planId = req.body.plan_id || req.body.planId;
        const planName = req.body.plan_name || req.body.planName;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ success: false, message: "Missing payment verification fields" });
        }

        if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
            return res.status(400).json({ success: false, message: "Payment signature verification failed" });
        }

        // Idempotency: avoid double-processing
        const existing = await CreditTransaction.findOne({ referenceId: razorpayPaymentId });
        if (existing) {
            const wallet = await Wallet.findOne({ user: userId }).populate("plan");
            return res.status(200).json({
                success: true,
                message: "Plan payment already processed",
                data: {
                    alreadyProcessed: true,
                    new_balance: wallet ? wallet.balance : 0,
                    plan: wallet ? wallet.plan : null,
                    razorpayOrderId,
                    razorpayPaymentId,
                },
            });
        }

        // Process subscription logic using unified plan service
        const subscriptionResult = await processPlanSubscription({
            userId,
            planId,
            planName,
            referenceId: razorpayPaymentId,
        });

        return res.status(200).json({
            success: true,
            message: `Successfully subscribed to ${subscriptionResult?.plan?.name || "new"} plan.`,
            data: {
                ...subscriptionResult,
                razorpayOrderId,
                razorpayPaymentId,
            },
        });
    } catch (error) {
        console.error("[Razorpay] verifyPlanPayment error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to verify plan payment" });
    }
};

export default verifyPlanPayment;