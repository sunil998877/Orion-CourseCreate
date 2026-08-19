import User from '../../models/userModel.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
    const { username, organisation, email, password } = req.body;

    if (!username || !organisation || !email || !password)
        return res.status(400).json({ message: 'All the information are required' });

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.isVerified) {
            console.log('Verified user already exists in the database');
            return res.status(409).json({ message: 'User already exists in the Database' });
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

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            existingUser.verificationOTP = otp;
            existingUser.verificationOTPExpires = Date.now() + 600000;

            await existingUser.save();

            try {
                await sendVerificationOtpEmail(email, otp);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
            }

            return res.status(200).json({
                message: 'Verification code sent to your email',
                email
            });
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
            verificationOTPExpires: Date.now() + 600000
        });
        await newUser.save();

        try {
            await sendVerificationOtpEmail(email, otp);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }

        res.status(201).json({
            message: 'Verification code sent to your email',
            email
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
};