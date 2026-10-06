import Course from '../../models/courseModel.js';
import User from '../../models/userModel.js';
import { randomUUID } from 'crypto';
import { ensure20AssessmentQuestions } from '../../utils/assessmentUtils.js';
export const createCourse = async (req, res) => {
    console.log("Controller Hit - createCourse");
    try {
        const user = await User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
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
        const forge = source.courseForge && typeof source.courseForge === 'object' ? { ...source.courseForge } : {};
        const mCount = Number(source.module) || Number(source.moduleCount) || (Array.isArray(source.modules) ? source.modules.length : 0) || 5;
        let safeModules = Array.isArray(source.modules) && source.modules.length > 0
            ? source.modules
            : [];
        if (safeModules.length < mCount) {
            safeModules = Array.from({ length: mCount }, (_, idx) => ({
                moduleNumber: idx + 1,
                Title: `${source.title || 'Course'} - Module ${idx + 1}`
            }));
        }
        forge.assessment = ensure20AssessmentQuestions(forge.assessment, { ...source, moduleCount: mCount, module: mCount }, safeModules);

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
            courseForge: forge,
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
        res.json({ success: true, course: courseDoc });
    }
    catch (error) {
        console.error('Error saving course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
