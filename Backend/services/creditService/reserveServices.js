import mongoose from "mongoose";
import Wallet from "../../models/credits/wallet.js";
import PricingRule from "../../models/credits/pricingRule.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
import { InsufficientCreditsError } from "./errors.js";

export class CreditService {
    /**
     * Atomically reserves credits for an action.
     * Prevents race conditions and double-spending on concurrent requests.
     */
    static async reserve(userId, actionKey, referenceId) {
        const session = await mongoose.startSession();

        try {
            let transaction;

            await session.withTransaction(async () => {
                const rule = await PricingRule.findOne({
                    actionKey,
                    isActive: true,
                }).session(session);

                if (!rule) {
                    throw new Error(`Pricing rule not found: ${actionKey}`);
                }

                const cost = Math.round(Number(rule.creditCost));
                if (!Number.isInteger(cost) || cost < 0) {
                    throw new Error(`Invalid pricing rule cost: ${rule.creditCost}`);
                }

                // Atomic conditional decrement: guarantees concurrent requests cannot both pass balance check (select_for_update equivalent)
                const updatedWallet = await Wallet.findOneAndUpdate(
                    {
                        user: userId,
                        balance: { $gte: cost }
                    },
                    {
                        $inc: {
                            balance: -cost,
                            reserved: cost
                        }
                    },
                    {
                        new: true,
                        session
                    }
                );

                if (!updatedWallet) {
                    const existingWallet = await Wallet.findOne({ user: userId }).session(session);
                    if (!existingWallet) {
                        throw new Error("Wallet not found");
                    }
                    throw new InsufficientCreditsError(
                        `Need ${cost} credits, only ${existingWallet.balance} available`
                    );
                }

                const result = await CreditTransaction.create(
                    [
                        {
                            wallet: updatedWallet._id,
                            type: "RESERVE",
                            status: "PENDING",
                            amount: -cost,
                            action: rule._id,
                            referenceId: referenceId || null,
                        },
                    ],
                    { session }
                );

                transaction = result[0];
            });

            return transaction;
        } finally {
            await session.endSession();
        }
    }
}