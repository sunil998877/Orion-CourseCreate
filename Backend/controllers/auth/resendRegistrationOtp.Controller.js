import User from '../../models/userModel.js';
import { sendVerificationOtpEmail } from '../../utils/emailService.js';

export const resendRegistrationOtp = async (req, res) => {
  console.log("Controller Hit - resendRegistrationOtp");
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email, isVerified: false });

    if (!user) {
      return res.status(404).json({ message: 'No unverified account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.verificationOTPExpires = Date.now() + 600000;
    await user.save();

    try {
      await sendVerificationOtpEmail(email, otp);
      res.status(200).json({ message: 'Verification code resent to your email' });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('Error in resendRegistrationOtp:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
