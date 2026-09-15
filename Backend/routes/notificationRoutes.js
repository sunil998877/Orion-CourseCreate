import express from 'express';
import authenticateJWT from '../middlewares/authMiddleware.js';
import { getNotifications, markNotificationsRead, markSingleNotificationRead, deleteNotifications, getActivityAnalytics } from '../controllers/notificationController.js';
import { courseLaunchedNotification } from '../controllers/notification/courseLaunched.Controller.js';
const router = express.Router();
router.get('/notifications', authenticateJWT, getNotifications);
router.put('/notifications/read', authenticateJWT, markNotificationsRead);
router.put('/notifications/:id/read', authenticateJWT, markSingleNotificationRead);
router.delete('/notifications', authenticateJWT, deleteNotifications);
router.get('/analytics/activity', authenticateJWT, getActivityAnalytics);
// Fired by the frontend ONLY after all module contents are successfully saved
router.post('/notifications/course-launched', authenticateJWT, courseLaunchedNotification);
export default router;
