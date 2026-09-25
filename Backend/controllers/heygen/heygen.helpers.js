import crypto from 'crypto';
import mongoose from 'mongoose';
import Course from '../../models/courseModel.js';

const HEYGEN_API_BASE = 'https://api.heygen.com';

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
