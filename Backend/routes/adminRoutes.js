import express from "express";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import { adminLogin, getAdminDashboardStats, getAdminAllUsers, getAdminUserDetails, adminAdjustCredits, getAdminTransactions, getAdminCourses, getAdminPricingRules, updateAdminPricingRule, getAdminAnalytics, getAdminRechargesAndPlans, getAdminContacts, updateAdminContactStatus, deleteAdminContact, getAdminApiBalances, refreshAdminApiBalances, updateAdminApiBalance } from "../controllers/admin/admin.controller.js";
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
router.get("/contacts", getAdminContacts);
router.patch("/contacts/:id/status", updateAdminContactStatus);
router.delete("/contacts/:id", deleteAdminContact);

router.get("/api-balances", getAdminApiBalances);
router.post("/api-balances/refresh", refreshAdminApiBalances);
router.post("/api-balances/update", updateAdminApiBalance);

export default router;
