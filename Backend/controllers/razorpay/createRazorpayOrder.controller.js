import Plan from "../../models/credits/plain.js";
import { getRazorpayClient } from "./razorpay.helpers.js";

export const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });

        const { amount, credits, package_id, plan_id, plan_name, type = "recharge" } = req.body;

        let amountInr = Math.round(Number(amount));
        let creditAmount = Math.round(Number(credits || amount));
        let notes = {
            userId: String(userId),
            type,
            packageId: package_id || "",
        };

        if (type === "plan") {
            const plan = plan_id
                ? await Plan.findById(plan_id)
                : await Plan.findOne({ name: new RegExp(`^${plan_name}$`, "i") });
            if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
            amountInr = Math.round(plan.priceInINR);
            creditAmount = Math.round(plan.monthlyCreditAllotment);
            notes.planId = String(plan._id);
            notes.planName = plan.name;
            if (amountInr === 0) {
                return res.status(400).json({ success: false, message: "Free plans do not require Razorpay checkout" });
            }
        }

        if (!Number.isInteger(amountInr) || amountInr <= 0) {
            return res.status(400).json({ success: false, message: "amount must be a positive integer (INR)" });
        }

        const razorpay = getRazorpayClient();
        const order = await razorpay.orders.create({
            amount: amountInr * 100,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`.slice(0, 40),
            notes: {
                ...notes,
                credits: String(creditAmount || ""),
            },
        });

        return res.status(200).json({
            success: true,
            data: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                credits: creditAmount,
                amountInr,
                type,
            },
        });
    } catch (error) {
        console.error("[Razorpay] createRazorpayOrder error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to create Razorpay order" });
    }
};
