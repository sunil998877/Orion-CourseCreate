import PricingRule from "../../models/credits/pricingRule.js";

export const getAdminPricingRules = async (req, res) => {
    try {
        const rules = await PricingRule.find().sort({ provider: 1, actionKey: 1 }).lean();
        return res.status(200).json({ success: true, data: rules });
    } catch (error) {
        console.error("[Admin] getAdminPricingRules error:", error);
        return res.status(500).json({ success: false, message: "Failed to load pricing rules" });
    }
};
