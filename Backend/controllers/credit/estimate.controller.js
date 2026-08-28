import PricingRule from "../../models/credits/pricingRule.js";
import Wallet from "../../models/credits/wallet.js";
export const estimateCost = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const { actionKey } = req.body;
        if (!actionKey) {
            return res.status(400).json({ success: false, message: "actionKey is required in the request body" });
        }
        const rule = await PricingRule.findOne({ actionKey: actionKey, isActive: true });
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: `No active pricing rule found for actionKey: "${actionKey}"`,
            });
        }
        const wallet = await Wallet.findOne({ user: userId });
        const currentBalance = wallet?.balance ?? 0;
        const canAfford = currentBalance >= rule.creditCost;
        return res.status(200).json({
            success: true,
            data: {
                actionKey: rule.actionKey,
                actionName: rule.displayName,
                provider: rule.provider,
                creditCost: rule.creditCost,
                currentBalance: currentBalance,
                canAfford: canAfford,
                balance_after: canAfford ? currentBalance - rule.creditCost : null,
                message: canAfford
                    ? `This action will use ${rule.creditCost} credits. You will have ${currentBalance - rule.creditCost} credits remaining.`
                    : `Insufficient credits. This action requires ${rule.creditCost} credits but you only have ${currentBalance}.`,
            },
        });
    }
    catch (error) {
        console.error("Error estimating cost:", error);
        return res.status(500).json({ success: false, message: "Failed to estimate credit cost" });
    }
};
