import User from '../../models/userModel.js';

export const markSingleNotificationRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id, "notifications._id": req.params.id },
      { $set: { "notifications.$.isRead": true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
