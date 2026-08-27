import User from '../../models/userModel.js';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getJwtSecret } from '../../utils/jwtSecret.js';

export const verifyRegistrationOtp = async (req, res) => {
  console.log("Controller Hit - verifyRegistrationOtp");
  const email = String(req.body.email || '').trim().toLowerCase();
  const { otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({
      email,
      verificationOTP: otp,
      verificationOTPExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const sessionId = randomUUID();
    user.activeSessionId = sessionId;
    user.lastLoginAt = new Date();
    user.lastLoginDevice = req.headers['user-agent'] || 'Unknown';
    user.lastLoginIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
    user.isVerified = true;
    user.verificationOTP = '';
    user.verificationOTPExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, sessionId },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        organisation: user.organisation,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Error in verifyRegistrationOtp:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
