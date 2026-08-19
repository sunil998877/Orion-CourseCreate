import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
import mongoose from "mongoose";

export class CreditService {
    static async release(userId, reservation) {
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                const wallet = await Wallet.findOne({
                    user: userId,
                }).session(session);

                if (!wallet) {
                    throw new Error("Wallet not found");
                }

                const amount = Math.round(Math.abs(Number(reservation.amount)));

                wallet.reserved = Math.max(0, wallet.reserved - amount);
                wallet.balance += amount;

                await wallet.save({ session });

                // Mark original reservation as RELEASED
                if (reservation._id) {
                    await CreditTransaction.findByIdAndUpdate(
                        reservation._id,
                        { status: "RELEASED" },
                        { session }
                    );
                } else if (reservation.referenceId) {
                    await CreditTransaction.updateMany(
                        { referenceId: reservation.referenceId, type: "RESERVE", status: "PENDING" },
                        { status: "RELEASED" },
                        { session }
                    );
                }

                await CreditTransaction.create(
                    [
                        {
                            wallet: wallet._id,
                            type: "REFUND",
                            status: "COMPLETED",
                            amount,
                            action: reservation.action || null,
                            referenceId: reservation.referenceId || null,
                        },
                    ],
                    { session }
                );
            });
        } finally {
            await session.endSession();
        }
    }
}