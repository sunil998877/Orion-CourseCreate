import User from '../../models/userModel.js';

export const getUserCourseData = async (req, res) => {
  console.log("Controller Hit - getUserCourseData");
  try {
    const user = await User.findById(req.user.id).select('courseData');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.courseData || {});
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
