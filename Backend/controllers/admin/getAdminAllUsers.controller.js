import User from "../../models/userModel.js";
import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
import Course from "../../models/courseModel.js";

export const getAdminAllUsers = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 50 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        const skip = (pageNum - 1) * limitNum;

        const userQuery = {};
        if (search) {
            userQuery.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(userQuery)
                .select("username email createdAt isVerified lastLoginAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            User.countDocuments(userQuery),
        ]);

        const userIds = users.map((u) => u._id);

        const [wallets, courseCounts] = await Promise.all([
            Wallet.find({ user: { $in: userIds } })
                .populate("plan", "name monthlyCredits monthlyCreditAllotment priceInINR")
                .lean(),
            Course.aggregate([
                { $match: { userId: { $in: userIds } } },
                { $group: { _id: "$userId", count: { $sum: 1 } } },
            ]),
        ]);

        const walletMap = {};
        const walletIds = [];
        const walletIdToUserId = {};
        for (const w of wallets) {
            walletMap[String(w.user)] = w;
            walletIds.push(w._id);
            walletIdToUserId[String(w._id)] = String(w.user);
        }

        const [userTxStats, providerSpend] = await Promise.all([
            CreditTransaction.aggregate([
                { $match: { wallet: { $in: walletIds }, type: { $in: ["RECHARGE", "PLAN_RESET"] } } },
                {
                    $group: {
                        _id: { wallet: "$wallet", type: "$type" },
                        count: { $sum: 1 },
                        totalAmount: { $sum: "$amount" },
                    },
                },
            ]),
            CreditTransaction.aggregate([
                { $match: { wallet: { $in: walletIds }, type: "RESERVE", status: "RECONCILED" } },
                { $lookup: { from: "pricingrules", localField: "action", foreignField: "_id", as: "actionInfo" } },
                { $unwind: { path: "$actionInfo", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: { wallet: "$wallet", provider: "$actionInfo.provider" },
                        total: { $sum: { $abs: "$amount" } },
                    },
                },
            ]),
        ]);

        const rechargeMap = {};
        const planMap = {};
        for (const s of userTxStats) {
            const uId = walletIdToUserId[String(s._id.wallet)];
            if (!uId) continue;
            if (s._id.type === "RECHARGE") rechargeMap[uId] = { count: s.count, totalAmount: s.totalAmount };
            if (s._id.type === "PLAN_RESET") planMap[uId] = { count: s.count, totalAmount: s.totalAmount };
        }

        const gammaMap = {};
        const openaiMap = {};
        const audioMap = {};
        for (const s of providerSpend) {
            const uId = walletIdToUserId[String(s._id.wallet)];
            if (!uId) continue;
            if (s._id.provider === "gamma") gammaMap[uId] = s.total;
            else if (s._id.provider === "openai") openaiMap[uId] = s.total;
            else if (s._id.provider === "elevenlabs") audioMap[uId] = s.total;
        }

        const courseCountMap = {};
        for (const c of courseCounts) courseCountMap[String(c._id)] = c.count;

        const formatted = users.map((u) => {
            const uId = String(u._id);
            const w = walletMap[uId];
            return {
                id: u._id,
                username: u.username,
                email: u.email,
                joinedDate: u.createdAt,
                isVerified: u.isVerified || false,
                lastLoginAt: u.lastLoginAt,
                courseCount: courseCountMap[uId] || 0,
                rechargeCount: rechargeMap[uId]?.count || 0,
                totalRechargedINR: rechargeMap[uId]?.totalAmount || 0,
                planSubscriptionCount: planMap[uId]?.count || 0,
                gammaCreditsSpent: gammaMap[uId] || 0,
                openaiCreditsSpent: openaiMap[uId] || 0,
                audioCreditsSpent: audioMap[uId] || 0,
                wallet: w
                    ? {
                        walletId: w._id,
                        balance: w.balance || 0,
                        reserved: w.reserved || 0,
                        lifetimeUsed: w.lifetimeUsed || 0,
                        renewsOn: w.renewsOn || null,
                        plan: w.plan
                            ? {
                                name: w.plan.name,
                                monthlyCredits: w.plan.monthlyCreditAllotment || w.plan.monthlyCredits || 0,
                                priceInINR: w.plan.priceInINR,
                            }
                            : { name: "Free" },
                    }
                    : { balance: 0, reserved: 0, lifetimeUsed: 0, plan: { name: "Free" } },
            };
        });

        return res.status(200).json({
            success: true,
            data: { users: formatted, total, page: pageNum, limit: limitNum },
        });
    } catch (error) {
        console.error("[Admin] getAdminAllUsers error:", error);
        return res.status(500).json({ success: false, message: "Failed to load users" });
    }
};
