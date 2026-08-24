import mongoose from "mongoose";
import User from "../../models/userModel.js";
import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
import PricingRule from "../../models/credits/pricingRule.js";
import Course from "../../models/courseModel.js";
import { formatTransaction } from "./admin.helpers.js";

export const getAdminUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }

        const userOid = new mongoose.Types.ObjectId(userId);

        const [user, wallet, courses, pricingRules] = await Promise.all([
            User.findById(userId).select("username email createdAt isVerified lastLoginAt").lean(),
            Wallet.findOne({ user: userId }).populate("plan", "name monthlyCreditAllotment priceInINR").lean(),
            Course.aggregate([
                { $match: { userId: userOid } },
                { $sort: { createdAt: -1 } },
                {
                    $project: {
                        courseId: 1,
                        title: 1,
                        description: 1,
                        type: 1,
                        level: 1,
                        moduleCount: 1,
                        podcastStatus: 1,
                        ebookStatus: 1,
                        audioUrl: 1,
                        podcastUrl: 1,
                        ebookUrl: 1,
                        createdAt: 1,
                        modules: {
                            $map: {
                                input: { $ifNull: ["$modules", []] },
                                as: "m",
                                in: {
                                    moduleId: "$$m.moduleId",
                                    moduleNumber: "$$m.moduleNumber",
                                    Title: "$$m.Title",
                                    status: "$$m.status",
                                    gammaUrl: "$$m.gammaUrl",
                                    quizCount: { $size: { $ifNull: ["$$m.Quizzes", []] } },
                                },
                            },
                        },
                    },
                },
            ]),
            PricingRule.find().select("actionKey creditCost").lean(),
        ]);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const transactions = wallet
            ? await CreditTransaction.find({ wallet: wallet._id })
                .sort({ createdAt: -1 })
                .limit(200)
                .populate("action", "actionKey displayName provider creditCost")
                .lean()
            : [];

        const ruleCostMap = {};
        for (const r of pricingRules) ruleCostMap[r.actionKey] = r.creditCost;

        const gammaCostPerDeck = ruleCostMap.course_generation_gamma || 250;
        const outlineCost = ruleCostMap.course_outline_openai || 10;
        const workbookCost = ruleCostMap.workbook_openai || 20;
        const podcastCost = ruleCostMap.podcast_elevenlabs || 15;
        const quizCost = ruleCostMap.quiz_openai || 8;

        const enrichedCourses = courses.map((course) => {
            const courseIdStr = course.courseId || String(course._id);
            const courseTx = transactions.filter(
                (tx) => tx.referenceId && (String(tx.referenceId).includes(courseIdStr) || (course.courseId && String(tx.referenceId).includes(course.courseId)))
            );
            const txCreditsSum = courseTx
                .filter((tx) => tx.type === "RECONCILE" || (tx.type === "RESERVE" && tx.status === "RECONCILED"))
                .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);

            const completedModules = (course.modules || []).filter((m) => m.gammaUrl || m.status === "completed").length;
            const totalModules = course.modules?.length || course.moduleCount || 0;
            const gammaCredits = completedModules * gammaCostPerDeck;
            const textCredits = outlineCost + totalModules * workbookCost;
            const audioCredits = course.podcastStatus === "completed" || course.audioUrl || course.podcastUrl ? podcastCost : 0;
            const quizCredits = (course.modules || []).reduce((sum, m) => sum + (m.quizCount ? quizCost : 0), 0);
            const estimatedCredits = gammaCredits + textCredits + audioCredits + quizCredits;
            const finalCredits = txCreditsSum > 0 ? txCreditsSum : estimatedCredits;

            return {
                id: course._id,
                courseId: course.courseId,
                title: course.title || "Untitled Course",
                description: course.description || "",
                type: course.type || "Standard",
                level: course.level || "Beginner",
                moduleCount: totalModules,
                podcastStatus: course.podcastStatus || "idle",
                ebookStatus: course.ebookStatus || "idle",
                audioUrl: course.audioUrl || course.podcastUrl || null,
                ebookUrl: course.ebookUrl || null,
                createdAt: course.createdAt,
                totalCreditsUsed: finalCredits,
                breakdown: {
                    gammaCredits,
                    gammaDecksCount: completedModules,
                    openaiCredits: textCredits + quizCredits,
                    audioCredits,
                    txRecorded: txCreditsSum > 0,
                },
                modules: (course.modules || []).map((m) => ({
                    moduleId: m.moduleId,
                    moduleNumber: m.moduleNumber,
                    title: m.Title,
                    status: m.status || (m.gammaUrl ? "completed" : "idle"),
                    gammaUrl: m.gammaUrl,
                    quizCount: m.quizCount || 0,
                })),
                transactions: courseTx.map(formatTransaction),
            };
        });

        const rechargeHistory = transactions.filter((tx) => tx.type === "RECHARGE").map(formatTransaction);
        const planHistory = transactions.filter((tx) => tx.type === "PLAN_RESET").map(formatTransaction);

        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    joinedDate: user.createdAt,
                    isVerified: user.isVerified || false,
                    lastLoginAt: user.lastLoginAt,
                    courseCount: enrichedCourses.length,
                    wallet: wallet
                        ? {
                            walletId: wallet._id,
                            balance: wallet.balance || 0,
                            reserved: wallet.reserved || 0,
                            lifetimeUsed: wallet.lifetimeUsed || 0,
                            renewsOn: wallet.renewsOn,
                            plan: wallet.plan
                                ? { name: wallet.plan.name, monthlyCredits: wallet.plan.monthlyCreditAllotment, priceInINR: wallet.plan.priceInINR }
                                : { name: "Free" },
                        }
                        : null,
                },
                summary: {
                    totalCourses: enrichedCourses.length,
                    totalCreditsUsedOnCourses: enrichedCourses.reduce((sum, c) => sum + c.totalCreditsUsed, 0),
                    lifetimeSpent: wallet?.lifetimeUsed || 0,
                    currentBalance: wallet?.balance || 0,
                    reservedCredits: wallet?.reserved || 0,
                },
                rechargePlanSummary: {
                    totalRechargesCount: rechargeHistory.length,
                    totalRechargesAmount: rechargeHistory.reduce((sum, tx) => sum + (tx.amount || 0), 0),
                    totalPlansSubscribed: planHistory.length,
                    totalPlanCreditsGranted: planHistory.reduce((sum, tx) => sum + (tx.amount || 0), 0),
                    currentPlan: wallet?.plan?.name || "Free",
                    renewsOn: wallet?.renewsOn || null,
                },
                rechargeHistory,
                planHistory,
                courses: enrichedCourses,
                recentTransactions: transactions.slice(0, 50).map(formatTransaction),
            },
        });
    } catch (error) {
        console.error("[Admin] getAdminUserDetails error:", error);
        return res.status(500).json({ success: false, message: "Failed to load user details" });
    }
};
