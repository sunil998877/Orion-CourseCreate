import User from '../../models/userModel.js';
export const deleteNotifications = async (req, res) => {
    try {
        await User.updateOne({ _id: req.user.id }, { $set: { notifications: [] } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
