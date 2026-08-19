import User from '../../models/userModel.js';
import bcrypt from 'bcryptjs';

export const resetPassword = async (req, res) => {
  console.log("Controller Hit - resetPassword");
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'Email, token, and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = '';
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log(`✅ Password successfully reset for user: ${email}`);
    res.status(200).json({ message: 'Password has been successfully reset. You can now log in.' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
