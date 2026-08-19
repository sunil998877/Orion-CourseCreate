import express from "express";
import authenticateJWT from "../middlewares/authMiddleware.js";

import { getWallet } from "../controllers/credit/wallet.controller.js";
import { getTransactions } from "../controllers/credit/transactions.controller.js";
import { estimateCost } from "../controllers/credit/estimate.controller.js";
import { rechargeWallet, createRechargeStripeSession } from "../controllers/credit/recharge.controller.js";
import { getPlans, subscribePlan, createPlanStripeSession } from "../controllers/credit/plan.controller.js";
import {
    adjustWalletCredits,
    triggerCleanupReservations,
    triggerPlanRenewals,
} from "../controllers/credit/adjustment.controller.js";

const router = express.Router();

router.use(authenticateJWT);

router.get("/", getWallet);
router.get("/transactions/", getTransactions);

router.post("/estimate/", estimateCost);

router.post("/recharge/", rechargeWallet);
router.post("/recharge/stripe-session/", createRechargeStripeSession);

router.get("/plans/", getPlans);
router.post("/plans/subscribe/", subscribePlan);
router.post("/plans/stripe-session/", createPlanStripeSession);

// Support & Maintenance routes
router.post("/adjust/", adjustWalletCredits);
router.post("/cleanup-reservations/", triggerCleanupReservations);
router.post("/renew-subscriptions/", triggerPlanRenewals);

export default router;

