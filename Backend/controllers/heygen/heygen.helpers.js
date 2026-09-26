import crypto from 'crypto';
import mongoose from 'mongoose';
import Course from '../../models/courseModel.js';
import Avatar from '../../models/avatarModel.js';

const HEYGEN_API_BASE = 'https://api.heygen.com';

export const CURATED_AVATARS = [
    {
        avatarId: 'Abigail_expressive_2024112501',
        avatarName: 'Abigail (Professional Instructor)',
        gender: 'female',
        previewImageUrl: 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_target.webp',
        previewVideoUrl: 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_video_target.mp4',
        voiceId: '1bd001e7e50f421d891986aad5158bc8',
    },
    {
        avatarId: 'Albert_public_1',
        avatarName: 'Albert (Senior Lecturer)',
        gender: 'male',
        previewImageUrl: 'https://files2.heygen.ai/avatar/v3/57a701a3f0af49e6bda8cf47f1f7c7df_62550/preview_target.webp',
        previewVideoUrl: 'https://files2.heygen.ai/avatar/v3/57a701a3f0af49e6bda8cf47f1f7c7df_62550/preview_video_target.mp4',
        voiceId: '1bd001e7e50f421d891986aad5158bc8',
    },
    {
        avatarId: 'Adrian_public_2_20240312',
        avatarName: 'Adrian (Corporate Trainer)',
        gender: 'male',
        previewImageUrl: 'https://files2.heygen.ai/avatar/v3/25ef6c86b1e946969d9a684870c47dfe_14947/preview_talk_1.webp',
        previewVideoUrl: 'https://files2.heygen.ai/avatar/v3/25ef6c86b1e946969d9a684870c47dfe_14947/preview_video_talk_1.mp4',
        voiceId: '1bd001e7e50f421d891986aad5158bc8',
    },
    {
        avatarId: 'Annie_expressive_public',
        avatarName: 'Annie (Tech Speaker)',
        gender: 'female',
        previewImageUrl: 'https://files2.heygen.ai/avatar/v3/5d5a9a07c612460d882861e0e8931564_54040/preview_target.webp',
        previewVideoUrl: 'https://files2.heygen.ai/avatar/v3/5d5a9a07c612460d882861e0e8931564_54040/preview_video_target.mp4',
        voiceId: '1bd001e7e50f421d891986aad5158bc8',
    },
    {
        avatarId: 'Annie_expressive6_public',
        avatarName: 'Annie (Modern Presenter)',
        gender: 'female',
        previewImageUrl: 'https://files2.heygen.ai/avatar/v3/a643fb413d7e460ea257d0f4c15d0179_56150/preview_target.webp',
        previewVideoUrl: 'https://files2.heygen.ai/avatar/v3/a643fb413d7e460ea257d0f4c15d0179_56150/preview_video_target.mp4',
        voiceId: '1bd001e7e50f421d891986aad5158bc8',
    },
];

export async function getMasterAvatar() {
    let master = await Avatar.findOne({ isDefault: true }).lean();
    if (!master) {
        const fallback = CURATED_AVATARS[0];
        try {
            master = await Avatar.create({
                avatarId: process.env.HEYGEN_AVATAR_ID || fallback.avatarId,
                avatarName: fallback.avatarName,
                previewImageUrl: fallback.previewImageUrl,
                previewVideoUrl: fallback.previewVideoUrl,
                voiceId: process.env.HEYGEN_VOICE_ID || fallback.voiceId,
                gender: fallback.gender,
                isDefault: true,
            });
            master = master.toObject();
        } catch {
            master = fallback;
        }
    }
    return master;
}

export async function saveMasterAvatar(avatarData) {
    if (!avatarData?.avatarId) throw new Error('avatarId is required');
    await Avatar.updateMany({}, { isDefault: false });
    const saved = await Avatar.findOneAndUpdate(
        { avatarId: avatarData.avatarId },
        {
            avatarId: avatarData.avatarId,
            avatarName: avatarData.avatarName || 'Master Course Avatar',
            previewImageUrl: avatarData.previewImageUrl,
            previewVideoUrl: avatarData.previewVideoUrl,
            voiceId: avatarData.voiceId || process.env.HEYGEN_VOICE_ID || '1bd001e7e50f421d891986aad5158bc8',
            gender: avatarData.gender || 'unknown',
            isDefault: true,
            metadata: avatarData.metadata || {},
        },
        { upsert: true, new: true }
    );
    return saved;
}

export function hashText(text) {
    return crypto.createHash('sha256').update(String(text || '')).digest('hex');
}

export function normalizeModuleSlides(mod) {
    if (!mod) return [];
    if (Array.isArray(mod.slides?.Slides)) return mod.slides.Slides;
    if (Array.isArray(mod.slides)) return mod.slides;
    return [];
}

export function getModuleSlideNarrations(mod) {
    return normalizeModuleSlides(mod)
        .map((slide, idx) => {
            const script = String(slide?.Transcript || slide?.transcript || '').trim();
            const title = String(slide?.Title || slide?.title || `Slide ${idx + 1}`).trim();
            const bullets = Array.isArray(slide?.Bullets)
                ? slide.Bullets.map((b) => String(b || '').trim()).filter(Boolean)
                : Array.isArray(slide?.bullets)
                    ? slide.bullets.map((b) => String(b || '').trim()).filter(Boolean)
                    : [];
            const content = String(slide?.Content || slide?.content || '').trim();
            return {
                slideNumber: Number(slide?.SlideNumber || slide?.slideNumber || idx + 1),
                title,
                script,
                scriptHash: hashText(script),
                bullets,
                content,
            };
        })
        .filter((s) => s.script.length > 0);
}

export function findCourseModule(course, moduleNumber) {
    const num = Number(moduleNumber);
    if (!Number.isFinite(num)) return null;
    return (course.modules || []).find((m) => Number(m.moduleNumber) === num) || null;
}

export function buildModuleScriptHash(slides) {
    return hashText(slides.map((s) => `${s.slideNumber}:${s.scriptHash}`).join('|'));
}

export function getHeyGenConfig() {
    const apiKey = process.env.HEYGEN_API_KEY || '';
    return {
        apiKey,
        configured: Boolean(apiKey),
        avatarId: process.env.HEYGEN_AVATAR_ID || 'Abigail_expressive_2024112501',
        voiceId: process.env.HEYGEN_VOICE_ID || '1bd001e7e50f421d891986aad5158bc8',
    };
}

export async function findUserCourse(userId, courseIdParam) {
    const param = String(courseIdParam || '').trim();
    if (!param) return null;

    let criteria = { userId, courseId: param };
    if (mongoose.isValidObjectId(param)) {
        criteria = {
            userId,
            $or: [
                { courseId: param },
                { _id: new mongoose.Types.ObjectId(param) },
            ],
        };
    }
    return Course.findOne(criteria);
}

export function collectCourseScriptSource(course) {
    let rawContent = `Course: "${course.title}"\nDescription: ${course.description || ''}\n\n`;
    let hasSlideTranscripts = false;

    if (course.modules?.length) {
        const sortedModules = [...course.modules].sort((a, b) => a.moduleNumber - b.moduleNumber);
        sortedModules.forEach((mod) => {
            const slidesArr = Array.isArray(mod.slides?.Slides)
                ? mod.slides.Slides
                : Array.isArray(mod.slides)
                    ? mod.slides
                    : [];
            const hasTranscripts = slidesArr.some((s) => (s.Transcript || s.transcript)?.trim());
            if (hasTranscripts) {
                hasSlideTranscripts = true;
                rawContent += `=== Module ${mod.moduleNumber}: ${mod.Title || ''} ===\n`;
                slidesArr.forEach((slide, idx) => {
                    const t = slide.Transcript || slide.transcript || '';
                    if (t.trim()) {
                        rawContent += `[Slide ${idx + 1}: ${slide.Title || ''}]\n${t.trim()}\n\n`;
                    }
                });
            } else {
                rawContent += `=== Module ${mod.moduleNumber}: ${mod.Title || ''} ===\n`;
                if (mod.Objectives?.length) rawContent += `Objectives: ${mod.Objectives.join(', ')}\n`;
                if (mod.TeachingContent?.length) {
                    mod.TeachingContent.forEach((tc) => {
                        rawContent += `Topic: ${tc.Topics}\nContent: ${Array.isArray(tc.ContentPoints) ? tc.ContentPoints.join('. ') : ''}\n`;
                    });
                }
                if (mod.CaseStudy?.CaseStudyDescription) {
                    rawContent += `Case Study: ${mod.CaseStudy.CaseStudyDescription}\n`;
                }
                rawContent += '\n';
            }
        });
    }

    if (course.audioTranscript?.trim()) {
        rawContent += `\n=== Existing audiobook script ===\n${course.audioTranscript.trim()}\n`;
    }

    return { rawContent, hasSlideTranscripts };
}

export async function heygenFetch(path, { method = 'GET', body } = {}) {
    const { apiKey } = getHeyGenConfig();
    if (!apiKey) {
        const err = new Error('HeyGen API key is not configured.');
        err.status = 503;
        throw err;
    }

    const response = await fetch(`${HEYGEN_API_BASE}${path}`, {
        method,
        headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message =
            payload?.error?.message ||
            payload?.message ||
            payload?.detail ||
            `HeyGen API error (${response.status})`;
        const err = new Error(message);
        err.status = response.status >= 500 ? 502 : response.status;
        err.payload = payload;
        throw err;
    }
    return payload;
}

export function mapHeyGenStatus(rawStatus) {
    const status = String(rawStatus || '').toLowerCase();
    if (status === 'completed' || status === 'done' || status === 'success') return 'completed';
    if (status === 'failed' || status === 'error') return 'failed';
    if (status === 'processing' || status === 'pending' || status === 'waiting' || status === 'running') {
        return 'generating';
    }
    return 'generating';
}
