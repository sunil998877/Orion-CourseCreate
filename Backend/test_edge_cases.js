import 'dotenv/config';
import mongoose from 'mongoose';
import Wallet from './models/credits/wallet.js';
import Plan from './models/credits/plain.js';
import PricingRule from './models/credits/pricingRule.js';
import CreditTransaction from './models/credits/creditTransaction.js';
import User from './models/userModel.js';
import {
    reserve,
    release,
    reconcile,
    cleanupStaleReservations,
    processSupportAdjustment,
    processPlanSubscription,
    processPlanRenewal,
    InsufficientCreditsError
} from './services/creditService/creditService.js';

async function runTests() {
    console.log("=================================================");
    console.log("RUNNING EDGE CASES & FAILURE HANDLING TESTS");
    console.log("=================================================\n");

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI missing in .env");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB for testing.\n");

    try {

        let testUser = await User.findOne({ email: "edge_case_test@example.com" });
        if (!testUser) {
            testUser = await User.create({
                name: "Edge Case Tester",
                email: "edge_case_test@example.com",
                password: "hashed_dummy_password_123",
            });
        }

        let freePlan = await Plan.findOne({ name: "Free" });
        if (!freePlan) {
            freePlan = await Plan.create({
                name: "Free",
                monthlyCreditAllotment: 1000,
                priceInINR: 0,
                rolloverAllowed: false,
            });
        }

        let proPlan = await Plan.findOne({ name: "Pro" });
        if (!proPlan) {
            proPlan = await Plan.create({
                name: "Pro",
                monthlyCreditAllotment: 5000,
                priceInINR: 499,
                rolloverAllowed: true,
            });
        }

        let testRule = await PricingRule.findOne({ actionKey: "course_generation_gamma" });
        if (!testRule) {
            testRule = await PricingRule.create({
                actionKey: "course_generation_gamma",
                displayName: "Generate Course",
                provider: "gamma",
                creditCost: 250,
                isActive: true,
            });
        }


        await CreditTransaction.deleteMany({ referenceId: { $regex: /^test_/ } });
        let wallet = await Wallet.findOne({ user: testUser._id });
        if (!wallet) {
            wallet = await Wallet.create({
                user: testUser._id,
                plan: freePlan._id,
                balance: 250,
                reserved: 0,
                lifetimeUsed: 0,
            });
        } else {
            wallet.balance = 250;
            wallet.reserved = 0;
            wallet.plan = freePlan._id;
            await wallet.save();
        }

        console.log("--- TEST 1: CONCURRENT REQUESTS (Atomic Reservation) ---");

        console.log(`Initial wallet balance: ${wallet.balance}, Cost per reserve: ${testRule.creditCost}`);
        const [res1, res2] = await Promise.allSettled([
            reserve(testUser._id, "course_generation_gamma", "test_concurrent_1"),
            reserve(testUser._id, "course_generation_gamma", "test_concurrent_2"),
        ]);

        const fulfilled = [res1, res2].filter(r => r.status === 'fulfilled');
        const rejected = [res1, res2].filter(r => r.status === 'rejected');

        console.log(`Concurrent results: ${fulfilled.length} succeeded, ${rejected.length} rejected.`);
        if (fulfilled.length === 1 && rejected.length === 1 && rejected[0].reason instanceof InsufficientCreditsError) {
            console.log("✅ PASS: Exactly 1 concurrent request succeeded, second was rejected with InsufficientCreditsError (Atomic Concurrency Protected).\n");
        } else {
            throw new Error(`TEST 1 FAILED: Expected 1 success & 1 rejection, got ${fulfilled.length} / ${rejected.length}`);
        }


        if (fulfilled[0]) {
            await release(testUser._id, fulfilled[0].value);
        }

        console.log("--- TEST 2: STALE RESERVATION CLEANUP JOB (Provider Timeout/Crash) ---");

        wallet.balance = 500;
        wallet.reserved = 0;
        await wallet.save();

        const staleRes = await reserve(testUser._id, "course_generation_gamma", "test_stale_orphan");
        console.log(`Reservation created. Wallet balance: ${wallet.balance - 250}, Reserved: 250`);


        await CreditTransaction.collection.updateOne(
            { _id: staleRes._id },
            { $set: { createdAt: new Date(Date.now() - 30 * 60 * 1000) } }
        );

        // Run cleanup job
        const cleanupResult = await cleanupStaleReservations({ maxAgeMinutes: 15 });
        console.log(`Cleanup job result: voided ${cleanupResult.processedCount} stale reservation(s), restored ${cleanupResult.restoredCredits} credits.`);

        const refreshedWallet = await Wallet.findOne({ user: testUser._id });
        const updatedStaleTx = await CreditTransaction.findById(staleRes._id);

        if (updatedStaleTx.status === "EXPIRED" && refreshedWallet.reserved === 0 && refreshedWallet.balance === 500) {
            console.log("✅ PASS: Stale reservation automatically voided, marked EXPIRED, and credits restored to balance.\n");
        } else {
            throw new Error(`TEST 2 FAILED: Expected balance 500 & reserved 0, got bal=${refreshedWallet.balance} res=${refreshedWallet.reserved}`);
        }

        console.log("--- TEST 3: MANUAL SUPPORT ADJUSTMENTS (Audit Trail) ---");
        const adjResult = await processSupportAdjustment({
            userId: testUser._id,
            amount: 150,
            approvedBy: "support_lead@orion.ai",
            reason: "Compensation for upstream Gamma timeout on Ticket #4928",
            notes: "Approved per SLA policy",
            referenceId: "test_ticket_4928",
        });

        const adjWallet = await Wallet.findOne({ user: testUser._id });
        const adjTx = await CreditTransaction.findById(adjResult.transactionId);

        console.log(`Adjusted +150 credits. New balance: ${adjWallet.balance}`);
        if (adjWallet.balance === 650 && adjTx.type === "ADJUSTMENT" && adjTx.approvedBy === "support_lead@orion.ai") {
            console.log("✅ PASS: Support adjustment succeeded with complete audit trail (approvedBy, reason, notes).\n");
        } else {
            throw new Error("TEST 3 FAILED: Support adjustment did not update balance or record audit fields.");
        }

        console.log("--- TEST 4: PLAN ROLLOVER VS RESET POLICY ---");

        const subPro = await processPlanSubscription({
            userId: testUser._id,
            planId: proPlan._id,
            referenceId: "test_sub_pro",
        });
        console.log(`Pro subscription (rolloverAllowed=true): Balance before=${subPro.balance_before}, Added=${subPro.credits_added}, After=${subPro.balance_after}`);
        if (subPro.balance_after === 650 + 5000) {
            console.log("✅ Rollover allowed properly accumulated previous balance + new allotment.");
        } else {
            throw new Error("Rollover allowed failed to accumulate balance.");
        }


        const subFree = await processPlanSubscription({
            userId: testUser._id,
            planId: freePlan._id,
            referenceId: "test_sub_free",
        });
        console.log(`Free subscription (rolloverAllowed=false): Balance before=${subFree.balance_before}, Added=${subFree.credits_added}, After=${subFree.balance_after} (Expected: ${freePlan.monthlyCreditAllotment})`);
        if (subFree.balance_after === freePlan.monthlyCreditAllotment) {
            console.log(`✅ Rollover disallowed properly reset unused balance to Free allotment (${freePlan.monthlyCreditAllotment}).`);
            console.log("✅ PASS: Plan rollover/reset strictly honors rolloverAllowed policy.\n");
        } else {
            throw new Error(`Rollover disallowed failed to reset balance to plan allotment. Expected ${freePlan.monthlyCreditAllotment}, got ${subFree.balance_after}`);
        }

        console.log("--- TEST 5: STRICT INTEGER PRECISION ---");

        await processSupportAdjustment({
            userId: testUser._id,
            amount: 12.5,
            approvedBy: "admin",
            reason: "testing float",
            referenceId: "test_float",
        });
        const floatWallet = await Wallet.findOne({ user: testUser._id });
        if (Number.isInteger(floatWallet.balance)) {
            console.log(`✅ Balance remains strict integer after float input (${floatWallet.balance}).`);
        } else {
            throw new Error("Float created drift in balance!");
        }
        console.log("✅ PASS: Orion Credit ledger maintains 100% integer precision without rounding drift.\n");

        console.log("--- TEST 6: ZERO-BALANCE SERVER-SIDE GATING ---");
        // Drain balance to 0 and attempt generation
        const drainWallet = await Wallet.findOne({ user: testUser._id });
        await processSupportAdjustment({
            userId: testUser._id,
            amount: -drainWallet.balance,
            approvedBy: "admin",
            reason: "Draining balance to 0 for test",
            referenceId: "test_drain",
        });

        let zeroBalanceRejected = false;
        try {
            await reserve(testUser._id, "course_generation_gamma", "test_zero_bal");
        } catch (err) {
            if (err instanceof InsufficientCreditsError) {
                zeroBalanceRejected = true;
                console.log(`✅ Zero balance server-side rejection message: "${err.message}"`);
            }
        }

        if (zeroBalanceRejected) {
            console.log("✅ PASS: Server-side source of truth hard-blocks generation when balance is 0.\n");
        } else {
            throw new Error("TEST 6 FAILED: Zero balance was not rejected server-side!");
        }

        // Clean up test data
        await CreditTransaction.deleteMany({ referenceId: { $regex: /^test_/ } });
        await User.deleteOne({ email: "edge_case_test@example.com" });
        await Wallet.deleteOne({ user: testUser._id });

        console.log("=================================================");
        console.log("🎉 ALL EDGE CASE & FAILURE TESTS PASSED CLEANLY!");
        console.log("=================================================");

    } finally {
        await mongoose.disconnect();
    }
}

runTests().catch(err => {
    console.error("❌ Test suite failed:", err);
    process.exit(1);
});
