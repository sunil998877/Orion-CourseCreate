import express from 'express';
import authenticateJWT from '../middlewares/authMiddleware.js';
import {
    generateHeyGenVideo,
    generateModuleHeyGenVideo,
    getHeyGenConfigStatus,
    getHeyGenVideoStatus,
    getModuleHeyGenVideoStatus,
} from '../controllers/heygenController.js';

const router = express.Router();

router.get('/heygen/config', authenticateJWT, getHeyGenConfigStatus);
router.post('/heygen/courses/:courseId/generate', authenticateJWT, generateHeyGenVideo);
router.get('/heygen/courses/:courseId/status', authenticateJWT, getHeyGenVideoStatus);
router.post(
    '/heygen/courses/:courseId/modules/:moduleNumber/generate',
    authenticateJWT,
    generateModuleHeyGenVideo
);
router.get(
    '/heygen/courses/:courseId/modules/:moduleNumber/status',
    authenticateJWT,
    getModuleHeyGenVideoStatus
);

export default router;
