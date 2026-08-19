import Course from '../../models/courseModel.js';
import User from '../../models/userModel.js';
import { randomUUID } from 'crypto';

const addNotification = async (userId, title, message, type = 'info') => {
  try {
    const notification = { title, message, type, isRead: false, createdAt: new Date() };
    await User.findByIdAndUpdate(userId, { $push: { notifications: notification } });
  } catch (err) {
    console.error('Failed to add notification:', err);
  }
};

export const createCourse = async (req, res) => {
  console.log("Controller Hit - createCourse");
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bodyCourse = req.body?.courseData && typeof req.body.courseData === 'object'
      ? req.body.courseData
      : null;
    const draftCourse = user.courseData && typeof user.courseData === 'object'
      ? user.courseData
      : null;

    const source = bodyCourse || draftCourse;
    if (!source || !source.title || String(source.title).trim().length === 0) {
      return res.status(400).json({ message: 'Invalid course data: missing title' });
    }

    const normalized = {
      courseId: randomUUID(),
      title: String(source.title || ''),
      description: String(source.description || ''),
      audience: String(source.audience || ''),
      type: String(source.type || ''),
      moduleCount: Number.isFinite(source.module) ? Number(source.module) : 0,
      level: String(source.level || ''),
      duration: {
        value: Number.isFinite(source?.duration?.value) ? Number(source.duration.value) : 0,
        unit: String(source?.duration?.unit || 'hours'),
      },
      country: String(source.country || ''),
      industry: String(source.industry || ''),
      standards: String(source.standards || ''),
      courseStyle: String(source.courseStyle || 'Academic / Formal Style'),
      createdAt: new Date()
    };

    const courseDoc = new Course({ userId: req.user.id, ...normalized });
    await courseDoc.save();

    user.hasCourse = true;
    user.courseStatus = 'completed';

    if (user.courseData) {
      user.courseData = {};
    }

    await user.save();
    await addNotification(user._id, 'Course Created', `Your course "${normalized.title}" has been created successfully.`, 'success');

    res.json({ success: true, course: courseDoc });
  } catch (error) {
    console.error('Error saving course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
