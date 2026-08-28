import Course from '../../models/courseModel.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
export const generatePodcast = async (req, res) => {
    console.log("Controller Hit - generatePodcast");
    try {
        const param = String(req.params.courseId || '').trim();
        let criteria = { userId: req.user.id, courseId: param };
        if (mongoose.isValidObjectId(param)) {
            criteria = {
                userId: req.user.id,
                $or: [
                    { courseId: param },
                    { _id: new mongoose.Types.ObjectId(param) }
                ]
            };
        }
        const course = await Course.findOne(criteria);
        if (!course)
            return res.status(404).json({ message: 'Course not found' });
        if (course.podcastUrl && course.podcastScript && course.podcastScript.length > 0) {
            console.log("Podcast already exists. Returning cached version to save credits.");
            return res.json({
                podcastUrl: course.podcastUrl,
                podcastScript: course.podcastScript,
                podcastTranscript: course.podcastTranscript
            });
        }
        course.podcastStatus = 'generating';
        await course.save();
        let rawContent = `Course: "${course.title}"\nDescription: ${course.description}\n\n`;
        if (course.modules && course.modules.length > 0) {
            const sortedModules = [...course.modules].sort((a, b) => a.moduleNumber - b.moduleNumber);
            sortedModules.forEach(mod => {
                const slidesArr = Array.isArray(mod.slides?.Slides)
                    ? mod.slides.Slides
                    : Array.isArray(mod.slides)
                        ? mod.slides
                        : [];
                const hasTranscripts = slidesArr.some(s => (s.Transcript || s.transcript)?.trim());
                if (hasTranscripts) {
                    rawContent += `=== Module ${mod.moduleNumber}: ${mod.Title || ''} ===\n`;
                    slidesArr.forEach((slide, idx) => {
                        const t = slide.Transcript || slide.transcript || '';
                        if (t.trim()) {
                            rawContent += `[Slide ${idx + 1}: ${slide.Title || ''}]\n${t.trim()}\n\n`;
                        }
                    });
                }
                else {
                    rawContent += `=== Module ${mod.moduleNumber}: ${mod.Title || ''} ===\n`;
                    if (mod.Objectives?.length)
                        rawContent += `Objectives: ${mod.Objectives.join(', ')}\n`;
                    if (mod.TeachingContent?.length) {
                        mod.TeachingContent.forEach(tc => {
                            rawContent += `Topic: ${tc.Topics}\nContent: ${Array.isArray(tc.ContentPoints) ? tc.ContentPoints.join('. ') : ''}\n`;
                        });
                    }
                    if (mod.CaseStudy?.CaseStudyDescription)
                        rawContent += `Case Study: ${mod.CaseStudy.CaseStudyDescription}\n`;
                    rawContent += '\n';
                }
            });
        }
        if (rawContent.length > 3000) {
            rawContent = rawContent.slice(0, 3000) + '\n\n[Content truncated for length]';
        }
        const courseStyleNote = course.courseStyle || 'Academic / Formal Style';
        const scriptResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a professional educational podcast production team crafting a tight, course-focused dialogue.

Hosts:
- **hostA** (Alex): The co-host. Friendly, curious, asks specific questions about the course material.
- **hostB** (Sam): The expert teacher. Gives clear, concise explanations tied directly to the course concepts.

Rules:
- Style: "${courseStyleNote}"
- IMPORTANT: The "text" field must contain ONLY the spoken words. Do NOT prefix with "Alex:" or "Sam:" — the speaker is already identified by the "speaker" field. Never include the speaker's own name.
- Every "text" value must directly reference specific concepts, terms, or examples from the course material. No generic filler.
- Every line MUST directly reference specific concepts, terms, or examples from the provided course material. No generic filler.
- Open with a quick podcast intro, close with a recap.
- STRICT LIMIT: The ENTIRE combined script must be between 400 and 600 characters total. Be ultra-concise.
- Return ONLY a valid JSON object matching this schema:
{
  "podcastTitle": "A catchy title for the episode",
  "dialogue": [
    { "speaker": "hostA", "text": "Alex's dialogue text here" },
    { "speaker": "hostB", "text": "Sam's dialogue text here" }
  ]
}`
                },
                {
                    role: "user",
                    content: `Write a podcast script (between 400 and 600 characters total) based ONLY on this course material:\n\n${rawContent}`
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });
        const parsedJson = JSON.parse(scriptResponse.choices[0].message.content);
        const dialogue = parsedJson.dialogue || [];
        if (dialogue.length === 0) {
            throw new Error("Generated script dialogue array is empty.");
        }
        const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
        const VOICE_HOST_A = process.env.PODCAST_HOST_A_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
        const VOICE_HOST_B = process.env.PODCAST_HOST_B_VOICE_ID || 'JBF2ghZ2515z92NJegw1';
        const MODEL_ID = 'eleven_turbo_v2';
        if (!ELEVEN_API_KEY) {
            return res.status(500).json({ message: 'Eleven Labs API key missing' });
        }
        console.log(`🎙️ Beginning multi-voice podcast synthesis with ${dialogue.length} dialogue turns...`);
        const buffers = [];
        for (let i = 0; i < dialogue.length; i++) {
            const turn = dialogue[i];
            const voiceId = turn.speaker === 'hostA' ? VOICE_HOST_A : VOICE_HOST_B;
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': ELEVEN_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: turn.text,
                    model_id: MODEL_ID,
                    voice_settings: {
                        stability: 0.40,
                        similarity_boost: 0.85,
                        style: 0.55,
                        use_speaker_boost: true
                    }
                })
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail?.message || err.message || `Eleven Labs API error for turn ${i}: ${response.status}`);
            }
            buffers.push(Buffer.from(await response.arrayBuffer()));
            if (i < dialogue.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        const podcastBuffer = Buffer.concat(buffers);
        const fileName = `podcast-${course.courseId}.mp3`;
        const audioDir = path.join('public', 'audio');
        const filePath = path.join(audioDir, fileName);
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }
        fs.writeFileSync(filePath, podcastBuffer);
        const podcastUrl = `/audio/${fileName}`;
        course.podcastUrl = podcastUrl;
        course.podcastScript = dialogue;
        course.podcastTranscript = dialogue.map(t => `${t.speaker === 'hostA' ? 'Alex' : 'Sam'}: ${t.text}`).join('\n\n');
        course.podcastStatus = 'completed';
        await course.save();
        console.log(`✅ Podcast generated successfully for course: ${course.courseId}`);
        res.json({ podcastUrl, podcastScript: course.podcastScript, podcastTranscript: course.podcastTranscript });
    }
    catch (error) {
        console.error('Error generating podcast:', error);
        try {
            const course = await Course.findOne({ userId: req.user.id, courseId: String(req.params.courseId || '').trim() });
            if (course) {
                course.podcastStatus = 'failed';
                await course.save();
            }
        }
        catch (saveErr) {
            console.error('Failed to set podcast status to failed:', saveErr);
        }
        const msg = error.message || 'Internal server error';
        const isQuota = /exceeds your quota|credits remaining|insufficient.?quota/i.test(msg);
        res.status(isQuota ? 402 : 500).json({
            message: msg,
            code: isQuota ? 'elevenlabs_credits_exhausted' : undefined,
        });
    }
};
