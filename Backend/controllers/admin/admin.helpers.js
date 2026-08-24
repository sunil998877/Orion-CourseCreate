import PricingRule from "../../models/credits/pricingRule.js";
import Course from "../../models/courseModel.js";
import { withCache } from "./admin.cache.js";

export const COURSE_ADMIN_LIST_SELECT = [
    "courseId",
    "title",
    "description",
    "type",
    "level",
    "moduleCount",
    "podcastStatus",
    "ebookStatus",
    "audioUrl",
    "podcastUrl",
    "ebookUrl",
    "createdAt",
    "userId",
    "modules.moduleId",
    "modules.moduleNumber",
    "modules.Title",
    "modules.status",
    "modules.gammaUrl",
].join(" ");

export const formatTransaction = (tx) => {
    const user = tx.wallet?.user;
    return {
        id: tx._id,
        type: tx.type,
        status: tx.status,
        amount: tx.amount,
        referenceId: tx.referenceId,
        reason: tx.reason,
        approvedBy: tx.approvedBy,
        providerUsageMeta: tx.providerUsageMeta,
        createdAt: tx.createdAt,
        user: user ? { username: user.username, email: user.email } : null,
        action: tx.action
            ? {
                actionKey: tx.action.actionKey,
                displayName: tx.action.displayName,
                provider: tx.action.provider,
                creditCost: tx.action.creditCost,
            }
            : { displayName: tx.reason || tx.type },
    };
};

export const providerSpendPipeline = [
    { $match: { type: "RESERVE", status: "RECONCILED" } },
    { $lookup: { from: "pricingrules", localField: "action", foreignField: "_id", as: "actionInfo" } },
    { $unwind: { path: "$actionInfo", preserveNullAndEmptyArrays: true } },
    {
        $group: {
            _id: "$actionInfo.provider",
            totalCreditsCharged: { $sum: { $abs: "$amount" } },
            count: { $sum: 1 },
        },
    },
];

const emptyProvider = () => ({ totalCreditsCharged: 0, count: 0 });

export const ledgerProviderBreakdown = (providerAgg) => {
    const breakdown = {
        gamma: emptyProvider(),
        openai: emptyProvider(),
        elevenlabs: emptyProvider(),
    };
    for (const p of providerAgg) {
        breakdown[p._id || "unknown"] = {
            totalCreditsCharged: p.totalCreditsCharged,
            count: p.count,
        };
    }
    return breakdown;
};

const getPricingCostMap = () =>
    withCache("pricing-costs", 60_000, async () => {
        const pricingRules = await PricingRule.find().select("actionKey creditCost").lean();
        const ruleCostMap = {};
        for (const r of pricingRules) ruleCostMap[r.actionKey] = r.creditCost;
        return ruleCostMap;
    });

/** OpenAI / ElevenLabs jobs are not reserved on the ledger — estimate from generated courses. */
export const estimateProviderSpendFromCourses = async () => {
    const [ruleCostMap, totals] = await Promise.all([
        getPricingCostMap(),
        Course.aggregate([
            {
                $project: {
                    moduleCount: 1,
                    hasAudio: {
                        $or: [
                            { $eq: ["$podcastStatus", "completed"] },
                            { $and: [{ $ne: ["$audioUrl", null] }, { $ne: ["$audioUrl", ""] }] },
                            { $and: [{ $ne: ["$podcastUrl", null] }, { $ne: ["$podcastUrl", ""] }] },
                        ],
                    },
                    moduleLen: { $size: { $ifNull: ["$modules", []] } },
                    completedModules: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$modules", []] },
                                as: "m",
                                cond: {
                                    $or: [
                                        { $and: [{ $ne: ["$$m.gammaUrl", null] }, { $ne: ["$$m.gammaUrl", ""] }] },
                                        { $eq: ["$$m.status", "completed"] },
                                    ],
                                },
                            },
                        },
                    },
                    quizJobs: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$modules", []] },
                                as: "m",
                                cond: { $gt: [{ $size: { $ifNull: ["$$m.Quizzes", []] } }, 0] },
                            },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    completedModules: { $sum: "$completedModules" },
                    totalModules: {
                        $sum: {
                            $cond: [{ $gt: ["$moduleLen", 0] }, "$moduleLen", { $ifNull: ["$moduleCount", 0] }],
                        },
                    },
                    courseCount: { $sum: 1 },
                    quizJobs: { $sum: "$quizJobs" },
                    audioJobs: { $sum: { $cond: ["$hasAudio", 1, 0] } },
                },
            },
        ]),
    ]);

    const row = totals[0] || {
        completedModules: 0,
        totalModules: 0,
        courseCount: 0,
        quizJobs: 0,
        audioJobs: 0,
    };

    const gammaCostPerDeck = ruleCostMap.course_generation_gamma || 250;
    const outlineCost = ruleCostMap.course_outline_openai || 10;
    const workbookCost = ruleCostMap.workbook_openai || 20;
    const podcastCost = ruleCostMap.podcast_elevenlabs || 15;
    const quizCost = ruleCostMap.quiz_openai || 8;

    return {
        gamma: {
            totalCreditsCharged: row.completedModules * gammaCostPerDeck,
            count: row.completedModules,
        },
        openai: {
            totalCreditsCharged:
                row.courseCount * outlineCost + row.totalModules * workbookCost + row.quizJobs * quizCost,
            count: row.courseCount + row.totalModules + row.quizJobs,
        },
        elevenlabs: {
            totalCreditsCharged: row.audioJobs * podcastCost,
            count: row.audioJobs,
        },
    };
};

export const mergeProviderBreakdown = (ledger, estimated) => {
    const keys = ["gamma", "openai", "elevenlabs"];
    const out = {};
    for (const key of keys) {
        const fromLedger = ledger[key] || emptyProvider();
        const fromCourses = estimated[key] || emptyProvider();
        out[key] = fromLedger.count > 0 ? fromLedger : fromCourses;
    }
    return out;
};
