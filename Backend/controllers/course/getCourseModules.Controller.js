import Course from '../../models/courseModel.js';

export const getCourseModules = async (req, res) => {
  console.log("Controller Hit - getCourseModules");
  try {
    const courseId = String(req.params.courseId || '').trim();
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    const course = await Course.findOne({ userId: req.user?.id, courseId }).select('modules');
    if (!course) return res.status(404).json({ message: 'Content not found' });
    res.json(Array.isArray(course.modules) ? course.modules : []);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
