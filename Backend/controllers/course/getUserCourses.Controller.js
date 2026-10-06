import Course from '../../models/courseModel.js';
export const getUserCourses = async (req, res) => {
    console.log("Controller Hit - getUserCourses");
    try {
        const courses = await Course.find({ userId: req.user.id })
            .select('courseId title description audience type moduleCount level duration country industry standards courseStyle courseForge createdAt audioUrl ebookUrl ebookStatus podcastUrl podcastStatus heroImageUrl heroImageTitle modules.moduleNumber modules.Title modules.gammaUrl modules.gammaGenerationId modules.status')
            .sort({ createdAt: -1 })
            .lean();
        res.json(courses.map((course) => ({ ...course, module: course.moduleCount || 0 })));
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
