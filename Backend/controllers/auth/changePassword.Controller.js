import User from '../../models/userModel.js';
import bcrypt from 'bcryptjs';

export const changePassword = async (req, res) => {
  console.log("Controller Hit - changePassword");
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log(`✅ Password successfully changed directly for user: ${user.email}`);
    res.status(200).json({ message: 'Password has been successfully updated!' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
