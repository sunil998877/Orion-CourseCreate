import Course from "../../models/courseModel.js";
import { COURSE_ADMIN_LIST_SELECT } from "./admin.helpers.js";
export const getAdminCourses = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 50 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        const skip = (pageNum - 1) * limitNum;
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { courseId: { $regex: search, $options: "i" } },
            ];
        }
        const [courses, total] = await Promise.all([
            Course.find(query)
                .select(COURSE_ADMIN_LIST_SELECT)
                .populate("userId", "username email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Course.countDocuments(query),
        ]);
        const formatted = courses.map((c) => ({
            id: c._id,
            courseId: c.courseId,
            title: c.title || "Untitled Course",
            description: c.description || "",
            type: c.type || "",
            level: c.level || "",
            moduleCount: c.modules?.length || c.moduleCount || 0,
            podcastStatus: c.podcastStatus || "idle",
            ebookStatus: c.ebookStatus || "idle",
            audioUrl: c.audioUrl || c.podcastUrl || null,
            ebookUrl: c.ebookUrl || null,
            createdAt: c.createdAt,
            user: c.userId ? { username: c.userId.username, email: c.userId.email } : null,
            modulesOverview: (c.modules || []).map((m) => ({
                title: m.Title,
                status: m.status || (m.gammaUrl ? "completed" : "idle"),
                gammaUrl: m.gammaUrl || null,
            })),
        }));
        return res.status(200).json({
            success: true,
            data: { courses: formatted, total, page: pageNum, limit: limitNum },
        });
    }
    catch (error) {
        console.error("[Admin] getAdminCourses error:", error);
        return res.status(500).json({ success: false, message: "Failed to load courses" });
    }
};
