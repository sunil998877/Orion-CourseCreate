import Course from '../../models/courseModel.js';

export const getUserCourses = async (req, res) => {
  console.log("Controller Hit - getUserCourses");
  try {
    const courses = await Course.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
