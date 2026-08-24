import express from "express";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import {
    adminLogin,
    getAdminDashboardStats,
    getAdminAllUsers,
    getAdminUserDetails,
    adminAdjustCredits,
    getAdminTransactions,
    getAdminCourses,
    getAdminPricingRules,
    updateAdminPricingRule,
    getAdminAnalytics,
    getAdminRechargesAndPlans,
} from "../controllers/admin/admin.controller.js";

const router = express.Router();

router.post("/login", adminLogin);
router.use(adminAuthMiddleware);

router.get("/stats", getAdminDashboardStats);
router.get("/users", getAdminAllUsers);
router.get("/users/:userId/details", getAdminUserDetails);
router.post("/users/adjust-credits", adminAdjustCredits);
router.get("/transactions", getAdminTransactions);
router.get("/courses", getAdminCourses);
router.get("/pricing-rules", getAdminPricingRules);
router.put("/pricing-rules/:id", updateAdminPricingRule);
router.get("/analytics", getAdminAnalytics);
router.get("/recharges-and-plans", getAdminRechargesAndPlans);

export default router;
