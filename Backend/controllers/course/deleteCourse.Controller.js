import Course from '../../models/courseModel.js';
import mongoose from 'mongoose';

export const deleteCourse = async (req, res) => {
  console.log("Controller Hit - deleteCourse");
  try {
    const param = String(req.params.courseId || '').trim();
    let criteria = { userId: req.user.id, courseId: param };
    if (mongoose.isValidObjectId(param)) {
      criteria = { userId: req.user.id, _id: new mongoose.Types.ObjectId(param) };
    }
    const course = await Course.findOne(criteria).lean();
    if (!course) {
      return res.json({ success: false });
    }
    const cid = course.courseId;
    const result = await Course.deleteOne({ userId: req.user.id, courseId: cid });

    res.json({
      success: result.deletedCount > 0
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
