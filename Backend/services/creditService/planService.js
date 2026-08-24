import mongoose from "mongoose";
import Wallet from "../../models/credits/wallet.js";
import Plan from "../../models/credits/plain.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
import { DEFAULT_CREDIT_PLANS } from "../../config/creditPlans.js";

function getFirstOfNextMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export const getPlansList = async () => {
    let plans = await Plan.find({}).sort({ priceInINR: 1 });

    if (!plans || plans.length === 0) {
        plans = await Plan.insertMany(DEFAULT_CREDIT_PLANS);
    }

    return plans.map((p) => ({
        id: p._id,
        name: p.name,
        monthlyCreditAllotment: Math.round(p.monthlyCreditAllotment),
        priceInr: Math.round(p.priceInINR),
        priceInINR: Math.round(p.priceInINR),
        rolloverAllowed: Boolean(p.rolloverAllowed),
    }));
};



export const processPlanSubscription = async ({ userId, planId, planName, referenceId }) => {
    const session = await mongoose.startSession();
    let result;

    try {
        await session.withTransaction(async () => {
            let wallet = await Wallet.findOne({ user: userId }).populate("plan").session(session);
            if (!wallet) {
                const freePlan = await Plan.findOne({ name: "Free" }).session(session);
                wallet = await Wallet.create([{
                    user: userId,
                    plan: freePlan?._id,
                    balance: freePlan?.monthlyCreditAllotment || DEFAULT_CREDIT_PLANS[0].monthlyCreditAllotment,
                    reserved: 0,
                    lifetimeUsed: 0,
                    renewsOn: getFirstOfNextMonth(),
                }], { session });
                wallet = wallet[0];
            }

            let planQuery;
            if (planId) {
                planQuery = { _id: planId };
            } else if (planName) {
                planQuery = { name: new RegExp(`^${planName}$`, "i") };
            } else {
                throw new Error("Plan ID or Plan Name must be provided");
            }

            const targetPlan = await Plan.findOne(planQuery).session(session);
            if (!targetPlan) {
                throw new Error("Selected plan not found");
            }

            const balanceBefore = Math.round(wallet.balance);
            const monthlyAllotment = Math.round(targetPlan.monthlyCreditAllotment);
            const rolloverAllowed = Boolean(targetPlan.rolloverAllowed);

            let newBalance;
            let transactionAmount;

            if (rolloverAllowed) {
                newBalance = balanceBefore + monthlyAllotment;
                transactionAmount = monthlyAllotment;
            } else {
                newBalance = monthlyAllotment;
                transactionAmount = Math.max(0, monthlyAllotment - balanceBefore);
            }

            wallet.plan = targetPlan._id;
            wallet.balance = newBalance;
            wallet.renewsOn = getFirstOfNextMonth();
            await wallet.save({ session });

            await CreditTransaction.create(
                [
                    {
                        wallet: wallet._id,
                        type: "PLAN_RESET",
                        status: "COMPLETED",
                        amount: transactionAmount,
                        action: null,
                        referenceId: referenceId || null,
                        reason: `Subscribed to ${targetPlan.name} plan (rollover: ${rolloverAllowed ? "enabled" : "disabled"})`,
                        providerUsageMeta: {
                            planName: targetPlan.name,
                            rolloverAllowed,
                            balanceBefore,
                            balanceAfter: newBalance,
                            monthlyAllotment,
                        },
                    },
                ],
                { session }
            );

            result = {
                recharge_type: "PLAN_UPGRADE",
                plan: {
                    id: targetPlan._id,
                    name: targetPlan.name,
                    monthlyCreditAllotment: monthlyAllotment,
                    priceInINR: Math.round(targetPlan.priceInINR),
                    rolloverAllowed,
                },
                balance_before: balanceBefore,
                credits_added: transactionAmount,
                balance_after: wallet.balance,
                renews_on: wallet.renewsOn ? wallet.renewsOn.toISOString().split("T")[0] : null,
                reference_id: referenceId || null,
                rollover_allowed: rolloverAllowed,
            };
        });
    } finally {
        await session.endSession();
    }

    return result;
};

export const subscribeToPlan = processPlanSubscription;


export const processPlanRenewal = async ({ userId }) => {
    const session = await mongoose.startSession();
    let result;

    try {
        await session.withTransaction(async () => {
            const wallet = await Wallet.findOne({ user: userId }).populate("plan").session(session);
            if (!wallet) {
                throw new Error("Wallet not found for this user");
            }

            const plan = wallet.plan;
            if (!plan) {
                throw new Error("No plan attached to wallet");
            }

            const balanceBefore = Math.round(wallet.balance);
            const monthlyAllotment = Math.round(plan.monthlyCreditAllotment);
            const rolloverAllowed = Boolean(plan.rolloverAllowed);

            let newBalance;
            let transactionAmount;

            if (rolloverAllowed) {
                newBalance = balanceBefore + monthlyAllotment;
                transactionAmount = monthlyAllotment;
            } else {
                newBalance = monthlyAllotment;
                transactionAmount = monthlyAllotment - balanceBefore;
            }

            wallet.balance = newBalance;
            wallet.renewsOn = getFirstOfNextMonth();
            await wallet.save({ session });

            await CreditTransaction.create(
                [
                    {
                        wallet: wallet._id,
                        type: "PLAN_RESET",
                        status: "COMPLETED",
                        amount: transactionAmount,
                        action: null,
                        referenceId: `renewal_${Date.now()}`,
                        reason: `Monthly renewal for ${plan.name} plan (rollover: ${rolloverAllowed ? "enabled" : "disabled"})`,
                        providerUsageMeta: {
                            renewalType: "MONTHLY_SCHEDULED",
                            planName: plan.name,
                            rolloverAllowed,
                            balanceBefore,
                            balanceAfter: newBalance,
                        },
                    },
                ],
                { session }
            );

            result = {
                success: true,
                userId,
                plan: plan.name,
                balanceBefore,
                balanceAfter: newBalance,
                rolloverAllowed,
                renewsOn: wallet.renewsOn.toISOString().split("T")[0],
            };
        });
    } finally {
        await session.endSession();
    }

    return result;
};

export const renewAllDueSubscriptions = async () => {
    const now = new Date();
    const dueWallets = await Wallet.find({
        renewsOn: { $lte: now },
    }).populate("plan");

    if (!dueWallets || dueWallets.length === 0) {
        return { processedCount: 0, renewed: [] };
    }

    console.log(`[Plan Renewal] Processing ${dueWallets.length} due renewals...`);
    const renewed = [];

    for (const wallet of dueWallets) {
        try {
            const res = await processPlanRenewal({ userId: wallet.user });
            renewed.push(res);
        } catch (err) {
            console.error(`[Plan Renewal] Failed renewing wallet ${wallet._id}:`, err);
        }
    }

    return { processedCount: renewed.length, renewed };
};

export const createPlanStripeSession = async ({ userId, planId, planName, successUrl, cancelUrl }) => {
    let planQuery = planId ? { _id: planId } : { name: new RegExp(`^${planName}$`, "i") };
    const targetPlan = await Plan.findOne(planQuery);
    if (!targetPlan) {
        throw new Error("Selected plan not found");
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const sessionId = `cs_plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (stripeKey) {
        try {
            const StripeModule = await import("stripe");
            const stripe = new StripeModule.default(stripeKey);

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: `Plan Subscription: ${targetPlan.name}`,
                                description: `${targetPlan.monthlyCreditAllotment.toLocaleString()} credits / month`,
                            },
                            unit_amount: Math.round(targetPlan.priceInINR * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                client_reference_id: userId.toString(),
                metadata: {
                    type: "PLAN_SUBSCRIPTION",
                    planId: targetPlan._id.toString(),
                    planName: targetPlan.name,
                },
                success_url: successUrl || "http://localhost:5173/credits?session_id={CHECKOUT_SESSION_ID}",
                cancel_url: cancelUrl || "http://localhost:5173/credits?cancelled=true",
            });

            return {
                sessionId: session.id,
                checkoutUrl: session.url,
                plan: targetPlan,
                mode: "live_stripe",
            };
        } catch (stripeError) {
            console.warn("[PlanService] Stripe initialization error, falling back to simulated session:", stripeError.message);
        }
    }

    return {
        sessionId,
        checkoutUrl: `${successUrl || '/credits'}?session_id=${sessionId}&type=plan&plan_name=${encodeURIComponent(targetPlan.name)}`,
        plan: {
            id: targetPlan._id,
            name: targetPlan.name,
            monthlyCreditAllotment: Math.round(targetPlan.monthlyCreditAllotment),
            priceInINR: Math.round(targetPlan.priceInINR),
            rolloverAllowed: Boolean(targetPlan.rolloverAllowed),
        },
        mode: "simulated_stripe",
    };
};
