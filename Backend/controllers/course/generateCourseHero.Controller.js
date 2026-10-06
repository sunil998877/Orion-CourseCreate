import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Course from '../../models/courseModel.js';
import { getOpenAIClient, isOpenAIConfigured } from '../../utils/openaiClient.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const heroDir = path.join(__dirname, '../../public/course-heroes');
const inflight = new Map();

const coverPrompt = (title, description) => {
    const context = String(description || '').replace(/\s+/g, ' ').trim().slice(0, 280);
    return [
        'Wide cinematic course cover photograph. No text, no letters, no numbers, no watermark, no logo, no interface.',
        `The scene must visually represent this course and nothing else: "${title}".`,
        context ? `Context: ${context}` : '',
        'Deep black background, emerald and lime light, soft green bokeh, photoreal, high detail.',
        'Place the subject on the right half. The left half fades to pure black.',
    ].filter(Boolean).join(' ');
};

const renderCover = async (title, description) => {
    const openai = getOpenAIClient();
    const prompt = coverPrompt(title, description);
    const attempts = [
        { model: 'gpt-image-1', size: '1536x1024', quality: 'medium' },
        { model: 'dall-e-3', size: '1792x1024', response_format: 'b64_json', quality: 'standard' },
        { model: 'dall-e-2', size: '1024x1024', response_format: 'b64_json' },
    ];
    let lastError = null;
    for (const attempt of attempts) {
        try {
            const response = await openai.images.generate({
                model: attempt.model,
                prompt,
                n: 1,
                size: attempt.size,
                ...(attempt.quality ? { quality: attempt.quality } : {}),
                ...(attempt.response_format ? { response_format: attempt.response_format } : {}),
            });
            const item = response.data?.[0];
            if (item?.b64_json) return Buffer.from(item.b64_json, 'base64');
            if (item?.url) {
                const file = await fetch(item.url);
                if (!file.ok) throw new Error('Could not download the cover');
                return Buffer.from(await file.arrayBuffer());
            }
        } catch (err) {
            lastError = err;
            console.error(`Cover model ${attempt.model} failed:`, err?.message || err);
        }
    }
    throw lastError || new Error('Could not create the cover');
};

const saveCover = async (course) => {
    const buffer = await renderCover(course.title, course.description);
    await fs.mkdir(heroDir, { recursive: true });
    const name = `${String(course.courseId || course._id).replace(/[^a-zA-Z0-9_-]/g, '')}.png`;
    await fs.writeFile(path.join(heroDir, name), buffer);
    const heroImageUrl = `/course-heroes/${name}?v=${Date.now()}`;
    course.heroImageUrl = heroImageUrl;
    course.heroImageTitle = course.title;
    await course.save();
    return { heroImageUrl, heroImageTitle: course.title };
};

const findOwnedCourse = (userId, courseId) => {
    const id = String(courseId || '').trim();
    if (!id) return null;
    if (mongoose.isValidObjectId(id)) {
        return Course.findOne({ userId, $or: [{ courseId: id }, { _id: id }] });
    }
    return Course.findOne({ userId, courseId: id });
};

export const generateCourseHero = async (req, res) => {
    try {
        if (!isOpenAIConfigured()) {
            return res.status(503).json({ message: 'Image generation is not configured' });
        }
        const course = await findOwnedCourse(req.user.id, req.body?.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const title = String(course.title || '').trim();
        if (!title) return res.status(400).json({ message: 'Course title is required' });
        if (course.heroImageUrl && course.heroImageTitle === title) {
            return res.json({ heroImageUrl: course.heroImageUrl, heroImageTitle: title });
        }
        const key = String(course._id);
        if (!inflight.has(key)) {
            const job = saveCover(course).finally(() => inflight.delete(key));
            inflight.set(key, job);
        }
        const saved = await inflight.get(key);
        res.json(saved);
    } catch (error) {
        console.error('Course cover error:', error?.message || error);
        res.status(500).json({ message: 'Could not create the course cover' });
    }
};
