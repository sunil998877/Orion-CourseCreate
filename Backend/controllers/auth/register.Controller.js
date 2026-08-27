import User from '../../models/userModel.js';
import bcrypt from 'bcryptjs';
import { trySendVerificationOtpEmail } from '../../utils/emailService.js';

const reuseOrCreateOtp = (user) => {
    const stillValid =
        user.verificationOTP &&
        user.verificationOTPExpires &&
        Date.now() < new Date(user.verificationOTPExpires).getTime();
    if (stillValid) return String(user.verificationOTP);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.verificationOTPExpires = Date.now() + 600000;
    return otp;
};

const buildOtpPayload = async (email, otp, status) => {
    const emailSent = await trySendVerificationOtpEmail(email, otp);
    if (!emailSent) {
        return {
            status: 503,
            body: {
                message:
                    'Could not send the verification email. On Vercel set RESEND_API_KEY on the backend. Then tap Resend.',
                email,
                emailSent: false,
            },
        };
    }
    return {
        status,
        body: {
            message: 'Verification code sent to your email',
            email,
            emailSent: true,
        },
    };
};

export const register = async (req, res) => {
    const { username, organisation, password } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!username || !organisation || !email || !password)
        return res.status(400).json({ message: 'All the information are required' });

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.isVerified) {
            return res.status(409).json({ message: 'User already exists in the Database' });
        }

        const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
        if (adminEmail && email === adminEmail) {
            return res.status(403).json({ message: 'This email is reserved for admin access' });
        }

        if (existingUser && !existingUser.isVerified) {
            const hashedPassword = await bcrypt.hash(password, 10);
            let avatar = existingUser.avatar;
            if (req.file && req.file.buffer) {
                const mime = req.file.mimetype || 'image/png';
                const base64 = req.file.buffer.toString('base64');
                avatar = `data:${mime};base64,${base64}`;
            }

            existingUser.username = username;
            existingUser.organisation = organisation;
            existingUser.password = hashedPassword;
            existingUser.avatar = avatar;

            const otp = reuseOrCreateOtp(existingUser);
            await existingUser.save();

            const delivered = await buildOtpPayload(email, otp, 200);
            return res.status(delivered.status).json(delivered.body);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let avatar = '';
        if (req.file && req.file.buffer) {
            const mime = req.file.mimetype || 'image/png';
            const base64 = req.file.buffer.toString('base64');
            avatar = `data:${mime};base64,${base64}`;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const newUser = new User({
            email,
            password: hashedPassword,
            organisation,
            username,
            avatar,
            isVerified: false,
            verificationOTP: otp,
            verificationOTPExpires: Date.now() + 600000,
        });
        await newUser.save();

        const delivered = await buildOtpPayload(email, otp, 201);
        return res.status(delivered.status).json(delivered.body);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
};
