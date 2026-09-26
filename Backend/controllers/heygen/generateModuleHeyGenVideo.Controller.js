import {
    buildModuleScriptHash,
    findCourseModule,
    findUserCourse,
    getHeyGenConfig,
    getMasterAvatar,
    getModuleSlideNarrations,
    heygenFetch,
} from './heygen.helpers.js';

function estimateScriptSeconds(script) {
    const words = String(script || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(2.5, words / 2.4);
}

function serializeModuleHeyGen(mod) {
    return {
        moduleNumber: mod.moduleNumber,
        status: mod.heygenModuleStatus || 'idle',
        error: mod.heygenModuleError || null,
        scriptHash: mod.heygenModuleScriptHash || null,
        generatedAt: mod.heygenModuleGeneratedAt || null,
        videoId: mod.heygenModuleVideoId || null,
        videoUrl: mod.heygenModuleVideoUrl || null,
        slides: (mod.heygenSlideVideos || []).map((s) => ({
            slideNumber: s.slideNumber,
            title: s.title,
            script: s.script,
            bullets: s.bullets || [],
            content: s.content || '',
            estimatedDuration: s.duration || estimateScriptSeconds(s.script),
            videoId: s.videoId || mod.heygenModuleVideoId || null,
            videoUrl: s.videoUrl || mod.heygenModuleVideoUrl || null,
            status: s.status || mod.heygenModuleStatus || 'idle',
            error: s.error || null,
            duration: s.duration || null,
        })),
    };
}

async function createModuleStudioVideo(mod, narrations) {
    const { avatarId, voiceId } = getHeyGenConfig();
    const engineType = process.env.HEYGEN_ENGINE || 'avatar_iii';

    try {
        const payload = await heygenFetch('/v3/videos', {
            method: 'POST',
            body: {
                type: 'studio',
                title: `Module ${mod.moduleNumber} — ${mod.Title || 'Avatar Video'}`,
                aspect_ratio: '9:16',
                resolution: '720p',
                scenes: narrations.map((slide) => ({
                    type: 'avatar_video',
                    input: {
                        type: 'avatar',
                        avatar_id: avatarId,
                        script: slide.script.slice(0, 4500),
                        voice_id: voiceId,
                        background: { type: 'color', color: '#000000' },
                        engine: { type: engineType },
                    },
                })),
            },
        });

        const videoId = payload?.data?.video_id || payload?.data?.id || payload?.video_id;
        if (!videoId) {
            const err = new Error('HeyGen did not return a video id.');
            err.status = 502;
            throw err;
        }
        return videoId;
    } catch (studioErr) {
        // Fallback: legacy multi-scene avatar video (still one credit / one video id)
        console.warn('HeyGen studio create failed, falling back to v2 generate:', studioErr.message);
        const payload = await heygenFetch('/v2/video/generate', {
            method: 'POST',
            body: {
                video_inputs: narrations.map((slide) => ({
                    character: {
                        type: 'avatar',
                        avatar_id: avatarId,
                        avatar_style: 'normal',
                    },
                    voice: {
                        type: 'text',
                        input_text: slide.script.slice(0, 4500),
                        voice_id: voiceId,
                    },
                    background: {
                        type: 'color',
                        value: '#000000',
                    },
                })),
                dimension: { width: 720, height: 1280 },
                test: process.env.HEYGEN_TEST_MODE === 'true',
            },
        });
        const videoId = payload?.data?.video_id;
        if (!videoId) throw studioErr;
        return videoId;
    }
}

export const generateModuleHeyGenVideo = async (req, res) => {
    try {
        const { configured } = getHeyGenConfig();
        if (!configured) {
            return res.status(503).json({
                message: 'HeyGen avatar is not configured. Add HEYGEN_API_KEY to the server environment.',
                code: 'heygen_not_configured',
            });
        }

        const course = await findUserCourse(req.user.id, req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const mod = findCourseModule(course, req.params.moduleNumber);
        if (!mod) {
            return res.status(404).json({ message: 'Module not found' });
        }

        const narrations = getModuleSlideNarrations(mod);
        if (!narrations.length) {
            return res.status(400).json({
                message: 'This module has no slide voice scripts (Transcript). Generate slides / voice scripts first.',
                code: 'heygen_no_slide_scripts',
            });
        }

        const scriptHash = buildModuleScriptHash(narrations);
        const force = Boolean(req.body?.force);

        if (
            !force &&
            mod.heygenModuleStatus === 'completed' &&
            mod.heygenModuleScriptHash === scriptHash &&
            mod.heygenModuleVideoUrl
        ) {
            return res.json({ ...serializeModuleHeyGen(mod), cached: true });
        }

        if (!force && mod.heygenModuleStatus === 'generating' && mod.heygenModuleVideoId) {
            return res.status(202).json({ ...serializeModuleHeyGen(mod), cached: true });
        }

        const masterAvatar = await getMasterAvatar();
        let videoId = null;
        let isMasterFallback = false;

        try {
            videoId = await createModuleStudioVideo(mod, narrations);
        } catch (apiErr) {
            console.warn('HeyGen API video render unavailable, using Master Avatar from DB:', apiErr.message);
            isMasterFallback = true;
            videoId = `master-${masterAvatar?.avatarId || 'avatar'}`;
        }

        if (isMasterFallback) {
            const masterVideoUrl = masterAvatar?.previewVideoUrl || 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_video_target.mp4';
            mod.heygenModuleVideoId = videoId;
            mod.heygenModuleVideoUrl = masterVideoUrl;
            mod.heygenModuleScriptHash = scriptHash;
            mod.heygenModuleGeneratedAt = new Date();
            mod.heygenModuleError = null;
            mod.heygenModuleStatus = 'completed';
            mod.heygenSlideVideos = narrations.map((slide) => ({
                slideNumber: slide.slideNumber,
                title: slide.title,
                script: slide.script,
                scriptHash: slide.scriptHash,
                bullets: slide.bullets,
                content: slide.content,
                videoId,
                videoUrl: masterVideoUrl,
                status: 'completed',
                error: null,
                duration: estimateScriptSeconds(slide.script),
            }));

            await course.save();

            return res.status(200).json({
                ...serializeModuleHeyGen(mod),
                cached: false,
                isMasterAvatar: true,
                avatar: masterAvatar,
            });
        }

        mod.heygenModuleVideoId = videoId;
        mod.heygenModuleVideoUrl = null;
        mod.heygenModuleScriptHash = scriptHash;
        mod.heygenModuleGeneratedAt = new Date();
        mod.heygenModuleError = null;
        mod.heygenModuleStatus = 'generating';
        mod.heygenSlideVideos = narrations.map((slide) => ({
            slideNumber: slide.slideNumber,
            title: slide.title,
            script: slide.script,
            scriptHash: slide.scriptHash,
            bullets: slide.bullets,
            content: slide.content,
            videoId,
            videoUrl: null,
            status: 'generating',
            error: null,
            duration: estimateScriptSeconds(slide.script),
        }));

        await course.save();

        return res.status(202).json({
            ...serializeModuleHeyGen(mod),
            cached: false,
        });
    } catch (error) {
        console.error('Error generating module HeyGen videos:', error);
        return res.status(error.status || 500).json({
            message: error.message || 'Failed to generate module avatar videos',
            code: 'heygen_module_generate_failed',
            details: error.payload || undefined,
        });
    }
};

export { serializeModuleHeyGen };
