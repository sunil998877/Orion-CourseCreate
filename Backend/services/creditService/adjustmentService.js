import mongoose from "mongoose";
import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
export const processSupportAdjustment = async ({ userId, amount, approvedBy, reason, notes = null, referenceId = null, }) => {
    if (!userId) {
        throw new Error("userId is required for manual support adjustment");
    }
    const intAmount = Math.round(Number(amount));
    if (!Number.isInteger(intAmount) || intAmount === 0) {
        throw new Error("Adjustment amount must be a non-zero integer");
    }
    if (!approvedBy || !String(approvedBy).trim()) {
        throw new Error("approvedBy is required for audit trail");
    }
    if (!reason || !String(reason).trim()) {
        throw new Error("reason is required for support adjustments");
    }
    const session = await mongoose.startSession();
    let result;
    try {
        await session.withTransaction(async () => {
            const wallet = await Wallet.findOne({ user: userId }).session(session);
            if (!wallet) {
                throw new Error("Wallet not found for target user");
            }
            const balanceBefore = wallet.balance;
            const newBalance = balanceBefore + intAmount;
            if (newBalance < 0) {
                throw new Error(`Cannot debit ${Math.abs(intAmount)} credits. User only has ${balanceBefore} credits available.`);
            }
            wallet.balance = newBalance;
            await wallet.save({ session });
            const refId = referenceId || `adj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const txResult = await CreditTransaction.create([
                {
                    wallet: wallet._id,
                    type: "ADJUSTMENT",
                    status: "COMPLETED",
                    amount: intAmount,
                    action: null,
                    referenceId: refId,
                    approvedBy: String(approvedBy).trim(),
                    reason: String(reason).trim(),
                    providerUsageMeta: {
                        notes: notes ? String(notes).trim() : null,
                        adjustmentType: intAmount > 0 ? "SUPPORT_CREDIT" : "SUPPORT_DEBIT",
                        balanceBefore,
                        balanceAfter: newBalance,
                        timestamp: new Date(),
                    },
                },
            ], { session });
            result = {
                success: true,
                transactionId: txResult[0]._id,
                userId,
                walletId: wallet._id,
                amountAdjusted: intAmount,
                balanceBefore,
                balanceAfter: newBalance,
                approvedBy: String(approvedBy).trim(),
                reason: String(reason).trim(),
                referenceId: refId,
            };
        });
    }
    finally {
        await session.endSession();
    }
    return result;
};
