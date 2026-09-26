import express from 'express';
import authenticateJWT from '../middlewares/authMiddleware.js';
import {
    generateHeyGenVideo,
    generateModuleHeyGenVideo,
    getHeyGenAvatars,
    getHeyGenConfigStatus,
    getHeyGenVideoStatus,
    getModuleHeyGenVideoStatus,
    selectHeyGenAvatar,
    proxyHeyGenMedia,
    speakSlideNarration,
} from '../controllers/heygenController.js';

const router = express.Router();

router.get('/heygen/proxy-media', proxyHeyGenMedia);

router.get('/heygen/config', authenticateJWT, getHeyGenConfigStatus);
router.get('/heygen/avatars', authenticateJWT, getHeyGenAvatars);
router.post('/heygen/avatar/select', authenticateJWT, selectHeyGenAvatar);
router.post('/heygen/speak', authenticateJWT, speakSlideNarration);
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
