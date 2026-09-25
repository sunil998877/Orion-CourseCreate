import {
    findUserCourse,
    heygenFetch,
    mapHeyGenStatus,
} from './heygen.helpers.js';

export const getHeyGenVideoStatus = async (req, res) => {
    try {
        const course = await findUserCourse(req.user.id, req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!course.heygenVideoId) {
            return res.json({
                videoId: null,
                videoUrl: course.heygenVideoUrl,
                script: course.heygenScript,
                status: course.heygenStatus || 'idle',
                error: course.heygenError || null,
            });
        }

        if (course.heygenStatus === 'completed' && course.heygenVideoUrl) {
            return res.json({
                videoId: course.heygenVideoId,
                videoUrl: course.heygenVideoUrl,
                script: course.heygenScript,
                status: 'completed',
                error: null,
            });
        }

        const payload = await heygenFetch(
            `/v1/video_status.get?video_id=${encodeURIComponent(course.heygenVideoId)}`
        );

        const data = payload?.data || {};
        const status = mapHeyGenStatus(data.status);
        const videoUrl = data.video_url || data.video_url_caption || null;
        const errorMessage = data.error?.message || data.error || null;

        course.heygenStatus = status;
        if (status === 'completed' && videoUrl) {
            course.heygenVideoUrl = videoUrl;
            course.heygenError = null;
            course.heygenGeneratedAt = new Date();
        }
        if (status === 'failed') {
            course.heygenError = String(errorMessage || 'HeyGen video generation failed');
        }
        await course.save();

        return res.json({
            videoId: course.heygenVideoId,
            videoUrl: course.heygenVideoUrl,
            script: course.heygenScript,
            status,
            error: course.heygenError,
            duration: data.duration || null,
        });
    } catch (error) {
        console.error('Error polling HeyGen video status:', error);
        return res.status(error.status || 500).json({
            message: error.message || 'Failed to fetch HeyGen video status',
            code: 'heygen_status_failed',
        });
    }
};
