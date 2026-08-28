import CreditTransaction from "../../models/credits/creditTransaction.js";
import { processRecharge } from "../../services/creditService/rechargeService.js";
import { verifySignature } from "./razorpay.helpers.js";
export const verifyRechargePayment = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: "User not authenticated" });
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, credits, amount, package_id, } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing Razorpay payment fields" });
        }
        if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return res.status(400).json({ success: false, message: "Invalid Razorpay signature" });
        }
        const existing = await CreditTransaction.findOne({
            referenceId: razorpay_payment_id,
            type: "RECHARGE",
        });
        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                data: { reference_id: razorpay_payment_id, alreadyProcessed: true },
            });
        }
        const creditAmount = Math.round(Number(credits || amount));
        const result = await processRecharge({
            userId,
            amount: creditAmount,
            packageId: package_id,
            referenceId: razorpay_payment_id,
        });
        return res.status(200).json({
            success: true,
            message: "Payment verified and credits added",
            data: result,
        });
    }
    catch (error) {
        console.error("[Razorpay] verifyRechargePayment error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to verify payment" });
    }
};
