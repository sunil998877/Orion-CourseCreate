import express from 'express';
import multer from 'multer';
import authenticateJWT from '../middlewares/authMiddleware.js';
import { register, login, verifyRegistrationOtp, resendRegistrationOtp, forgotPassword, resetPassword, changePassword, getUserProfile, updateAvatar, logout } from '../controllers/authController.js';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
});
const router = express.Router();
router.post('/register', upload.single('avatar'), register);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/resend-registration-otp', resendRegistrationOtp);
router.options('/login', (req, res) => res.sendStatus(204));
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticateJWT, changePassword);
router.get('/user', authenticateJWT, getUserProfile);
router.post('/profile/avatar', upload.single('avatar'), authenticateJWT, updateAvatar);
router.post('/logout', logout);
export default router;
