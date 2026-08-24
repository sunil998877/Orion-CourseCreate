import PricingRule from "../../models/credits/pricingRule.js";
import { invalidateAdminCache } from "./admin.cache.js";

export const updateAdminPricingRule = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = {};
        if (req.body.creditCost !== undefined) {
            const cost = Math.round(Number(req.body.creditCost));
            if (!Number.isInteger(cost) || cost < 0) {
                return res.status(400).json({ success: false, message: "creditCost must be a non-negative integer" });
            }
            payload.creditCost = cost;
        }
        if (req.body.isActive !== undefined) payload.isActive = Boolean(req.body.isActive);
        if (req.body.displayName) payload.displayName = String(req.body.displayName);

        const updated = await PricingRule.findByIdAndUpdate(id, payload, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: "Rule not found" });
        invalidateAdminCache();
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error("[Admin] updateAdminPricingRule error:", error);
        return res.status(500).json({ success: false, message: "Failed to update pricing rule" });
    }
};
