import { cleanupStaleReservations } from "../../services/creditService/cleanupService.js";
export const triggerCleanupReservations = async (req, res) => {
    try {
        const { max_age_minutes, maxAgeMinutes } = req.body || {};
        const age = parseInt(maxAgeMinutes || max_age_minutes) || 15;
        const result = await cleanupStaleReservations({ maxAgeMinutes: age });
        return res.status(200).json({
            success: true,
            message: `Cleanup completed: ${result.processedCount} stale reservation(s) voided and refunded.`,
            data: result,
        });
    }
    catch (error) {
        console.error("Error triggering cleanup of reservations:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to run reservation cleanup",
        });
    }
};
