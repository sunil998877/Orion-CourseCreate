import mongoose from "mongoose";
import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
export class CreditService {
    static async reconcile(userId, reservation, actualCost, usageMeta = {}) {
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const wallet = await Wallet.findOne({
                    user: userId,
                }).session(session);
                if (!wallet) {
                    throw new Error("Wallet not found");
                }
                const reservedAmount = Math.round(Math.abs(Number(reservation.amount)));
                const roundedActualCost = Math.round(Number(actualCost));
                if (!Number.isInteger(roundedActualCost) || roundedActualCost < 0) {
                    throw new Error(`Invalid actual cost: ${actualCost}`);
                }
                const diff = reservedAmount - roundedActualCost;
                wallet.reserved = Math.max(0, wallet.reserved - reservedAmount);
                wallet.balance += diff;
                wallet.lifetimeUsed += roundedActualCost;
                await wallet.save({ session });
                if (reservation._id) {
                    await CreditTransaction.findByIdAndUpdate(reservation._id, { status: "RECONCILED" }, { session });
                }
                else if (reservation.referenceId) {
                    await CreditTransaction.updateMany({ referenceId: reservation.referenceId, type: "RESERVE", status: "PENDING" }, { status: "RECONCILED" }, { session });
                }
                await CreditTransaction.create([
                    {
                        wallet: wallet._id,
                        type: "RECONCILE",
                        status: "COMPLETED",
                        amount: diff,
                        action: reservation.action || null,
                        referenceId: reservation.referenceId || null,
                        providerUsageMeta: usageMeta,
                    },
                ], { session });
            });
        }
        finally {
            await session.endSession();
        }
    }
}
