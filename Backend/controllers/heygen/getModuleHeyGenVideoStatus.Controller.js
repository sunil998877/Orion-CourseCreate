import {
    findCourseModule,
    findUserCourse,
    heygenFetch,
    mapHeyGenStatus,
} from './heygen.helpers.js';
import { serializeModuleHeyGen } from './generateModuleHeyGenVideo.Controller.js';

function extractVideoFields(payload) {
    const data = payload?.data || payload || {};
    const status = mapHeyGenStatus(data.status);
    const videoUrl =
        data.video_url ||
        data.url ||
        data.download_url ||
        data.video_url_caption ||
        null;
    const errorMessage =
        data.error?.message ||
        data.error ||
        data.failure_message ||
        data.failure_reason ||
        null;
    const duration = data.duration ?? data.video_duration ?? null;
    return { status, videoUrl, errorMessage, duration, data };
}

export const getModuleHeyGenVideoStatus = async (req, res) => {
    try {
        const course = await findUserCourse(req.user.id, req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const mod = findCourseModule(course, req.params.moduleNumber);
        if (!mod) {
            return res.status(404).json({ message: 'Module not found' });
        }

        if (!mod.heygenModuleVideoId) {
            return res.json(serializeModuleHeyGen(mod));
        }

        if (mod.heygenModuleStatus === 'completed' && mod.heygenModuleVideoUrl) {
            return res.json(serializeModuleHeyGen(mod));
        }

        let payload;
        try {
            payload = await heygenFetch(`/v3/videos/${encodeURIComponent(mod.heygenModuleVideoId)}`);
        } catch (v3Err) {
            // Fallback for older video ids created via legacy endpoints
            payload = await heygenFetch(
                `/v1/video_status.get?video_id=${encodeURIComponent(mod.heygenModuleVideoId)}`
            );
        }

        const { status, videoUrl, errorMessage, duration } = extractVideoFields(payload);
        let changed = false;

        if (mod.heygenModuleStatus !== status) {
            mod.heygenModuleStatus = status;
            changed = true;
        }

        if (status === 'completed' && videoUrl) {
            mod.heygenModuleVideoUrl = videoUrl;
            mod.heygenModuleError = null;
            mod.heygenModuleGeneratedAt = new Date();
            (mod.heygenSlideVideos || []).forEach((slide) => {
                slide.status = 'completed';
                slide.videoUrl = videoUrl;
                slide.videoId = mod.heygenModuleVideoId;
                slide.error = null;
            });
            // Scale estimated slide durations to real video length when available
            if (duration && Number(duration) > 0 && mod.heygenSlideVideos?.length) {
                const estimates = mod.heygenSlideVideos.map((s) => Number(s.duration) || 3);
                const sum = estimates.reduce((a, b) => a + b, 0) || 1;
                const total = Number(duration);
                mod.heygenSlideVideos.forEach((slide, i) => {
                    slide.duration = (estimates[i] / sum) * total;
                });
            }
            changed = true;
        }

        if (status === 'failed') {
            mod.heygenModuleError = String(errorMessage || 'HeyGen video generation failed');
            (mod.heygenSlideVideos || []).forEach((slide) => {
                slide.status = 'failed';
                slide.error = mod.heygenModuleError;
            });
            changed = true;
        }

        if (changed) {
            await course.save();
        }

        return res.json(serializeModuleHeyGen(mod));
    } catch (error) {
        console.error('Error polling module HeyGen status:', error);
        return res.status(error.status || 500).json({
            message: error.message || 'Failed to fetch module avatar video status',
            code: 'heygen_module_status_failed',
        });
    }
};
