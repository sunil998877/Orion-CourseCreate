import User from '../../models/userModel.js';

/**
 * POST /notifications/course-launched
 * Called by the frontend ONLY after all module contents have been
 * successfully saved, so the notification fires at the right time.
 */
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
        // Non-critical — don't fail the response
        res.status(500).json({ message: 'Could not add notification' });
    }
};
