import User from '../../models/userModel.js';
import { sendOtpEmail } from '../../utils/emailService.js';

export const forgotPassword = async (req, res) => {
  console.log("Controller Hit - forgotPassword");
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`⚠️ Forgot password request for non-existent email: ${email}`);
      return res.status(404).json({
        message: 'No account found with this email address.'
      });
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `https://silly-puppy-66a1dd.netlify.app/login?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      await sendOtpEmail(email, token, resetUrl);

      res.status(200).json({
        message: 'If that email is registered, an OTP code has been sent to your inbox.'
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      res.status(500).json({
        message: 'Failed to send password reset email. Please try again later.',
        error: emailError.message || String(emailError)
      });
    }
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
