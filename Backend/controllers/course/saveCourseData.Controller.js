import User from '../../models/userModel.js';
export const saveCourseData = async (req, res) => {
    console.log("Controller Hit - saveCourseData");
    try {
        const user = await User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const { courseData } = req.body;
        user.courseData = {
            title: courseData?.title || '',
            description: courseData?.description || '',
            audience: courseData?.audience || '',
            type: courseData?.type || '',
            module: Number.isFinite(courseData?.module) ? courseData.module : 0,
            level: courseData?.level || '',
            duration: {
                value: Number.isFinite(courseData?.duration?.value) ? courseData.duration.value : 0,
                unit: courseData?.duration?.unit || 'hours'
            },
            country: courseData?.country || '',
            standards: courseData?.standards || '',
            courseStyle: courseData?.courseStyle || 'Academic / Formal Style'
        };
        await user.save();
        res.json({ saved: true });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
