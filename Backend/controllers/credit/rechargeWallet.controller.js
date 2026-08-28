import { processRecharge, } from "../../services/creditService/rechargeService.js";
export const rechargeWallet = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const { amount, package_id, reference_id } = req.body;
        const result = await processRecharge({
            userId,
            amount,
            packageId: package_id,
            referenceId: reference_id,
        });
        return res.status(200).json({
            success: true,
            message: `${result.credits_added} credits successfully added to your wallet.`,
            data: result,
        });
    }
    catch (error) {
        console.error("Error recharging wallet:", error);
        if (error.message === "Wallet not found for this user") {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === "amount must be a positive integer") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to recharge wallet" });
    }
};
