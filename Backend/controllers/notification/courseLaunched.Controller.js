import User from '../../models/userModel.js';

export const courseLaunchedNotification = async (req, res) => {
    try {
        const { courseTitle } = req.body;
        const title = courseTitle ? String(courseTitle).trim() : 'Your course';
        const notification = {
            title: 'Course Created',
            message: `Your course "${title}" has been launched and saved successfully.`,
            type: 'success',
            isRead: false,
            createdAt: new Date(),
        };
        await User.findByIdAndUpdate(req.user.id, { $push: { notifications: notification } });
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to add course-launched notification:', err);
        res.status(500).json({ message: 'Could not add notification' });
    }
};
