import Course from '../../models/courseModel.js';

export const searchCourses = async (req, res) => {
  console.log("Controller Hit - searchCourses");
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json([]);
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    const criteria = {
      userId: req.user.id,
      $or: [
        { title: regex },
        { description: regex },
        { type: regex },
        { standards: regex },
        { level: regex }
      ]
    };
    const courses = await Course.find(criteria).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
