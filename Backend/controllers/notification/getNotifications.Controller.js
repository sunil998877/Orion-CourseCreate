import User from '../../models/userModel.js';

export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const sorted = (user.notifications || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
