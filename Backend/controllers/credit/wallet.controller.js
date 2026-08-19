import Wallet from "../../models/credits/wallet.js";
import Plan from "../../models/credits/plain.js";

function getFirstOfNextMonth() {
    const now = new Date();
    const firstOfNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return firstOfNext;
}

export const getWallet = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        let wallet = await Wallet.findOne({ user: userId })
            .populate("plan", "name monthlyCreditAllotment priceInINR rolloverAllowed");

        if (!wallet) {
            let freePlan = await Plan.findOne({ name: "Free" });
            if (!freePlan) {
                freePlan = await Plan.create({
                    name: "Free",
                    monthlyCreditAllotment: 1450,
                    priceInINR: 0,
                    rolloverAllowed: false,
                });
            }

            wallet = await Wallet.create({
                user: userId,
                plan: freePlan._id,
                balance: freePlan.monthlyCreditAllotment || 1450,
                reserved: 0,
                lifetimeUsed: 0,
                renewsOn: getFirstOfNextMonth(),
            });

            wallet = await Wallet.findById(wallet._id)
                .populate("plan", "name monthlyCreditAllotment priceInINR rolloverAllowed");
        }

        if (!wallet.renewsOn) {
            wallet.renewsOn = getFirstOfNextMonth();
            await wallet.save();
        }

        const renewsOnFormatted = wallet.renewsOn
            ? wallet.renewsOn.toISOString().split("T")[0]
            : null;

        const balance = typeof wallet.balance === 'number' ? wallet.balance : 0;
        const lifetimeUsed = typeof wallet.lifetimeUsed === 'number' ? wallet.lifetimeUsed : 0;
        const planAllotment = wallet.plan?.monthlyCreditAllotment || 0;
        const total = Math.max(planAllotment, balance + lifetimeUsed);

        return res.status(200).json({
            success: true,
            data: {
                balance: balance,
                reserved: wallet.reserved || 0,
                lifetime_used: lifetimeUsed,
                used: lifetimeUsed,
                total: total,
                plan: wallet.plan?.name || "Free",
                monthly_allotment: total,
                renews_on: renewsOnFormatted,
                currency: "INR",
            },
        });
    } catch (error) {
        console.error("Error fetching wallet:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch wallet",
        });
    }
};

export const getPlans = async (req, res) => {
    try {
        let plans = await Plan.find({}).sort({ priceInINR: 1 });

        if (!plans || plans.length === 0) {
            const defaultPlans = [
                { name: "Free", monthlyCreditAllotment: 1000, priceInINR: 0, rolloverAllowed: false },
                { name: "Pro", monthlyCreditAllotment: 5000, priceInINR: 499, rolloverAllowed: true },
                { name: "Team", monthlyCreditAllotment: 15000, priceInINR: 1499, rolloverAllowed: true },
            ];

            plans = await Plan.insertMany(defaultPlans);
        }

        const formattedPlans = plans.map((p) => ({
            id: p._id,
            name: p.name,
            monthlyCreditAllotment: p.monthlyCreditAllotment,
            priceInr: p.priceInINR,
            priceInINR: p.priceInINR,
            rolloverAllowed: p.rolloverAllowed,
        }));

        return res.status(200).json({
            success: true,
            data: formattedPlans,
        });
    } catch (error) {
        console.error("Error fetching plans:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch plans",
        });
    }
};