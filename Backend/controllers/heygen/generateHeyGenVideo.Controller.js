import { OpenAI } from 'openai';
import {
    collectCourseScriptSource,
    findUserCourse,
    getHeyGenConfig,
    getMasterAvatar,
    heygenFetch,
} from './heygen.helpers.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });

async function buildAvatarScript(course) {
    if (course.heygenScript?.trim() && course.heygenStatus === 'completed') {
        return course.heygenScript.trim();
    }

    if (course.audioTranscript?.trim() && course.audioTranscript.trim().length <= 1200) {
        return course.audioTranscript.trim();
    }

    const { rawContent } = collectCourseScriptSource(course);
    const courseStyleNote = course.courseStyle || 'Academic / Formal Style';

    const scriptResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are a professional on-camera presenter writing a SHORT spoken script for an AI avatar in the corner of a course creator app.

Course Style: "${courseStyleNote}"

Rules:
- Write NATURAL spoken prose in first person as a friendly expert guide.
- Keep the entire script under 900 characters.
- Open with a brief welcome naming the course, then cover 2–4 key takeaways, then a short closing CTA.
- No markdown, no bullet points, no stage directions, no labels.
- Output PLAIN TEXT ONLY.`,
            },
            {
                role: 'user',
                content: `Write a concise avatar narration for this course:\n\n${rawContent.slice(0, 12000)}`,
            },
        ],
        temperature: 0.7,
    });

    return (scriptResponse.choices[0]?.message?.content || '').trim();
}

export const generateHeyGenVideo = async (req, res) => {
    try {
        const { configured, avatarId, voiceId } = getHeyGenConfig();
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

        const force = Boolean(req.body?.force);
        if (!force && course.heygenVideoUrl && course.heygenStatus === 'completed') {
            return res.json({
                videoId: course.heygenVideoId,
                videoUrl: course.heygenVideoUrl,
                script: course.heygenScript,
                status: 'completed',
                cached: true,
            });
        }

        if (!force && course.heygenStatus === 'generating' && course.heygenVideoId) {
            return res.json({
                videoId: course.heygenVideoId,
                videoUrl: course.heygenVideoUrl,
                script: course.heygenScript,
                status: 'generating',
                cached: true,
            });
        }

        const script = await buildAvatarScript(course);
        if (!script) {
            return res.status(400).json({ message: 'Could not build an avatar script for this course.' });
        }

        const masterAvatar = await getMasterAvatar();
        let videoId = null;
        let isMasterFallback = false;

        try {
            const payload = await heygenFetch('/v2/video/generate', {
                method: 'POST',
                body: {
                    video_inputs: [
                        {
                            character: {
                                type: 'avatar',
                                avatar_id: masterAvatar?.avatarId || avatarId,
                                avatar_style: 'normal',
                            },
                            voice: {
                                type: 'text',
                                input_text: script.slice(0, 4500),
                                voice_id: masterAvatar?.voiceId || voiceId,
                            },
                            background: {
                                type: 'color',
                                value: '#000000',
                            },
                        },
                    ],
                    dimension: {
                        width: 720,
                        height: 1280,
                    },
                    test: process.env.HEYGEN_TEST_MODE === 'true',
                },
            });
            videoId = payload?.data?.video_id;
        } catch (apiErr) {
            console.warn('HeyGen API video render unavailable, using Master Avatar from DB:', apiErr.message);
            isMasterFallback = true;
            videoId = `master-${masterAvatar?.avatarId || 'avatar'}`;
        }

        if (isMasterFallback) {
            const masterVideoUrl = masterAvatar?.previewVideoUrl || 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_video_target.mp4';
            course.heygenVideoId = videoId;
            course.heygenVideoUrl = masterVideoUrl;
            course.heygenScript = script;
            course.heygenStatus = 'completed';
            course.heygenError = null;
            course.heygenGeneratedAt = new Date();
            await course.save();

            return res.status(200).json({
                videoId,
                videoUrl: masterVideoUrl,
                script,
                status: 'completed',
                cached: false,
                isMasterAvatar: true,
                avatar: masterAvatar,
            });
        }

        if (!videoId) {
            return res.status(502).json({ message: 'HeyGen did not return a video id.' });
        }

        course.heygenVideoId = videoId;
        course.heygenVideoUrl = null;
        course.heygenScript = script;
        course.heygenStatus = 'generating';
        course.heygenError = null;
        course.heygenGeneratedAt = new Date();
        await course.save();

        return res.status(202).json({
            videoId,
            videoUrl: null,
            script,
            status: 'generating',
            cached: false,
        });
    } catch (error) {
        console.error('Error generating HeyGen video:', error);
        return res.status(error.status || 500).json({
            message: error.message || 'Failed to generate HeyGen avatar video',
            code: 'heygen_generate_failed',
        });
    }
};
