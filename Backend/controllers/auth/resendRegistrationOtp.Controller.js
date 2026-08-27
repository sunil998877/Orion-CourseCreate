import User from '../../models/userModel.js';
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

export const resendRegistrationOtp = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email, isVerified: false });

    if (!user) {
      return res.status(404).json({ message: 'No unverified account found with this email' });
    }

    const otp = reuseOrCreateOtp(user);
    await user.save();

    const emailSent = await trySendVerificationOtpEmail(email, otp);
    if (!emailSent.ok) {
      return res.status(503).json({
        message: emailSent.reason
          ? `Could not send the verification email: ${emailSent.reason}`
          : 'Could not send the verification email.',
        emailSent: false,
      });
    }
    return res.status(200).json({
      message: 'Verification code resent to your email',
      emailSent: true,
    });
  } catch (error) {
    console.error('Error in resendRegistrationOtp:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
