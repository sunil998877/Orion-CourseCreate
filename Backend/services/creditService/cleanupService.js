import mongoose from "mongoose";
import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";

/**
 * Background cleanup job that voids and restores any reservation
 * older than maxAgeMinutes with no reconciliation/release.
 *
 * @param {Object} options
 * @param {number} [options.maxAgeMinutes=15] - Maximum age in minutes before a reservation is considered stale
 * @returns {Promise<{ processedCount: number, restoredCredits: number, reservations: Array }>}
 */
export const cleanupStaleReservations = async ({ maxAgeMinutes = 15 } = {}) => {
    const ageMinutes = Math.max(1, parseInt(maxAgeMinutes) || 15);
    const cutoffDate = new Date(Date.now() - ageMinutes * 60 * 1000);

    const staleReservations = await CreditTransaction.find({
        type: "RESERVE",
        status: "PENDING",
        createdAt: { $lte: cutoffDate },
    }).populate("wallet");

    if (!staleReservations || staleReservations.length === 0) {
        return {
            processedCount: 0,
            restoredCredits: 0,
            reservations: [],
            cutoffDate,
        };
    }

    console.log(`[Credit Cleanup] Found ${staleReservations.length} stale reservations older than ${ageMinutes}m (cutoff: ${cutoffDate.toISOString()})`);

    let restoredCredits = 0;
    const processedReservations = [];

    for (const reservation of staleReservations) {
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                const amount = Math.round(Math.abs(Number(reservation.amount)));

                const wallet = await Wallet.findById(reservation.wallet?._id || reservation.wallet).session(session);

                if (wallet) {
                    wallet.reserved = Math.max(0, wallet.reserved - amount);
                    wallet.balance += amount;
                    await wallet.save({ session });
                }

                // Update reservation status to EXPIRED
                reservation.status = "EXPIRED";
                reservation.reason = `Auto-voided by cleanup job: exceeded ${ageMinutes}m timeout without reconciliation`;
                await reservation.save({ session });

                // Create a clear audit trail REFUND transaction
                await CreditTransaction.create(
                    [
                        {
                            wallet: wallet ? wallet._id : reservation.wallet,
                            type: "REFUND",
                            status: "COMPLETED",
                            amount,
                            action: reservation.action || null,
                            referenceId: reservation.referenceId || null,
                            reason: `Auto-refund for expired reservation (${reservation._id})`,
                            providerUsageMeta: {
                                cleanupReason: "STALE_RESERVATION_TIMEOUT",
                                originalReservationId: reservation._id,
                                maxAgeMinutes: ageMinutes,
                                expiredAt: new Date(),
                            },
                        },
                    ],
                    { session }
                );

                restoredCredits += amount;
                processedReservations.push({
                    reservationId: reservation._id,
                    walletId: wallet?._id,
                    amount,
                    referenceId: reservation.referenceId,
                });
            });
        } catch (err) {
            console.error(`[Credit Cleanup] Error cleaning up reservation ${reservation._id}:`, err);
        } finally {
            await session.endSession();
        }
    }

    console.log(`[Credit Cleanup] Successfully processed ${processedReservations.length} reservations, restored ${restoredCredits} credits`);

    return {
        processedCount: processedReservations.length,
        restoredCredits,
        reservations: processedReservations,
        cutoffDate,
    };
};
