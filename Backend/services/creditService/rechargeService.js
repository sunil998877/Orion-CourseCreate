import mongoose from "mongoose";
import Wallet from "../../models/credits/wallet.js";
import CreditTransaction from "../../models/credits/creditTransaction.js";
export const processRecharge = async ({ userId, amount, packageId, referenceId }) => {
    const session = await mongoose.startSession();
    let result;
    try {
        await session.withTransaction(async () => {
            const wallet = await Wallet.findOne({ user: userId }).session(session);
            if (!wallet) {
                throw new Error("Wallet not found for this user");
            }
            const balanceBefore = wallet.balance;
            const credits = Number(amount);
            if (!Number.isFinite(credits) || credits <= 0 || !Number.isInteger(credits)) {
                throw new Error("amount must be a positive integer");
            }
            wallet.balance += credits;
            await wallet.save({ session });
            await CreditTransaction.create([
                {
                    wallet: wallet._id,
                    type: "RECHARGE",
                    status: "COMPLETED",
                    amount: credits,
                    action: null,
                    referenceId: referenceId || packageId || null,
                },
            ], { session });
            result = {
                recharge_type: "TOP_UP",
                balance_before: balanceBefore,
                credits_added: credits,
                balance_after: wallet.balance,
                reference_id: referenceId || packageId || null,
            };
        });
    }
    finally {
        await session.endSession();
    }
    return result;
};
export const createRechargeStripeSession = async ({ userId, amount, packageId, price, successUrl, cancelUrl }) => {
    const credits = Number(amount);
    if (!Number.isFinite(credits) || credits <= 0 || !Number.isInteger(credits)) {
        throw new Error("amount must be a positive integer");
    }
    const priceInINR = Number(price) || Math.round(credits * 0.1);
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const sessionId = `cs_recharge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
                                name: `Credit Top-Up (${credits.toLocaleString()} Credits)`,
                                description: `One-time credit recharge package: ${packageId || 'custom'}`,
                            },
                            unit_amount: priceInINR * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                client_reference_id: userId.toString(),
                metadata: {
                    type: "CREDIT_RECHARGE",
                    credits: credits.toString(),
                    packageId: packageId || null,
                },
                success_url: successUrl || `${String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/credits?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl || `${String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/credits?cancelled=true`,
            });
            return {
                sessionId: session.id,
                checkoutUrl: session.url,
                credits,
                priceInINR,
                mode: "live_stripe",
            };
        }
        catch (stripeError) {
            console.warn("[RechargeService] Stripe initialization error, falling back to simulated session:", stripeError.message);
        }
    }
    return {
        sessionId,
        checkoutUrl: `${successUrl || '/credits'}?session_id=${sessionId}&type=recharge&credits=${credits}&package_id=${packageId || ''}`,
        credits,
        priceInINR,
        mode: "simulated_stripe",
    };
};
