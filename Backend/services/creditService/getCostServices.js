import mongoose from "mongoose";
import PricingRule from "../../models/credits/pricingRule.js";
export class CreditService {
    static async getCost(actionKey) {
        const rule = await PricingRule.findOne({
            actionKey,
            isActive: true,
        });
        if (!rule) {
            throw new Error(`Pricing rule not found: ${actionKey}`);
        }
        return rule.creditCost;
    }
}
