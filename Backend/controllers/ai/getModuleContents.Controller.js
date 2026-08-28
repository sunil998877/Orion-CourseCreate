import Course from '../../models/courseModel.js';
export const getModuleContents = async (req, res) => {
    try {
        const courseId = String(req.query.courseId || '').trim();
        const moduleNumber = req.query.moduleNumber !== undefined ? Number(req.query.moduleNumber) : undefined;
        if (!courseId)
            return res.status(400).json({ message: 'courseId required' });
        const course = await Course.findOne({ userId: req.user?.id, courseId }).select('modules');
        if (!course)
            return res.status(404).json({ message: 'Content not found' });
        let mods = Array.isArray(course.modules) ? course.modules : [];
        if (Number.isFinite(moduleNumber)) {
            mods = mods.filter(m => Number(m.moduleNumber) === Number(moduleNumber));
        }
        mods.sort((a, b) => Number(a.moduleNumber) - Number(b.moduleNumber));
        res.json(mods);
    }
    catch (error) {
        console.error('Error fetching module contents:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
