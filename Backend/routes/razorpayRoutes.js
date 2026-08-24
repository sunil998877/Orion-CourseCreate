import express from "express";
import authenticateJWT from "../middlewares/authMiddleware.js";
import {
    getRazorpayConfig,
    createRazorpayOrder,
    verifyRechargePayment,
    verifyPlanPayment,
} from "../controllers/razorpay/razorpay.controller.js";

const router = express.Router();

router.use(authenticateJWT);

router.get("/config", getRazorpayConfig);
router.post("/order", createRazorpayOrder);
router.post("/verify-payment", verifyRechargePayment);
router.post("/verify-plan", verifyPlanPayment);

export default router;
