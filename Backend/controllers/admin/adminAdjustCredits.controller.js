import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
import { invalidateAdminCache } from "./admin.cache.js";
export const adminAdjustCredits = async (req, res) => {
    try {
        const adminId = req.user?._id || req.user?.id;
        const { userId, amount, reason, notes, referenceId } = req.body;
        if (!userId || amount === undefined || amount === null) {
            return res.status(400).json({ success: false, message: "userId and amount are required" });
        }
        const credits = Math.round(Number(amount));
        if (!Number.isInteger(credits) || credits === 0) {
            return res.status(400).json({ success: false, message: "amount must be a non-zero integer" });
        }
        let wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            wallet = await Wallet.create({ user: userId, balance: 0, reserved: 0, lifetimeUsed: 0 });
        }
        const nextBalance = wallet.balance + credits;
        if (nextBalance < 0) {
            return res.status(400).json({ success: false, message: "Insufficient wallet balance for this deduction" });
        }
        wallet.balance = nextBalance;
        if (credits < 0)
            wallet.lifetimeUsed = Math.max(0, (wallet.lifetimeUsed || 0) + Math.abs(credits));
        await wallet.save();
        const tx = await CreditTransaction.create({
            wallet: wallet._id,
            type: "ADJUSTMENT",
            status: "COMPLETED",
            amount: credits,
            action: null,
            referenceId: referenceId || null,
            approvedBy: String(adminId || ""),
            reason: notes || reason || "Support adjustment",
        });
        invalidateAdminCache();
        return res.status(200).json({
            success: true,
            message: `Adjusted ${credits} credits successfully`,
            data: { balance: wallet.balance, transaction: tx },
        });
    }
    catch (error) {
        console.error("[Admin] adminAdjustCredits error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to adjust credits" });
    }
};
