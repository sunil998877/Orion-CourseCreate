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

export const deleteSingleNotification = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Notification ID is required' });
        }
        await User.updateOne(
            { _id: req.user.id },
            { $pull: { notifications: { _id: id } } }
        );
        res.json({ success: true, message: 'Notification removed successfully' });
    }
    catch (error) {
        console.error('Error removing single notification:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

