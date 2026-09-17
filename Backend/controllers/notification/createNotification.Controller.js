import User from '../../models/userModel.js';

export const createNotification = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const { title, message, type = 'info' } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Notification title is required' });
        }

        const validTypes = ['success', 'info', 'warning', 'error'];
        const notifType = validTypes.includes(type) ? type : 'info';

        const notification = {
            title: String(title).trim(),
            message: message ? String(message).trim() : '',
            type: notifType,
            isRead: false,
            createdAt: new Date(),
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $push: { notifications: notification } },
            { new: true }
        ).select('notifications');

        const createdItem = updatedUser?.notifications?.[updatedUser.notifications.length - 1] || notification;

        return res.status(201).json({
            success: true,
            data: createdItem,
        });
    } catch (err) {
        console.error('Failed to create notification:', err);
        return res.status(500).json({ success: false, message: 'Could not create notification' });
    }
};
