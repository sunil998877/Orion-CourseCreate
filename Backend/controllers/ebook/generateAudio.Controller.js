import Course from '../../models/courseModel.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });

export const generateAudio = async (req, res) => {
  console.log("Controller Hit - generateAudio");
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
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.audioUrl && course.audioTranscript) {
      console.log("Audio already exists. Returning cached version to save credits.");
      return res.json({ audioUrl: course.audioUrl, audioTranscript: course.audioTranscript });
    }

    let rawContent = `Course: "${course.title}"\nDescription: ${course.description}\n\n`;
    let hasSlideTranscripts = false;

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
            mod.TeachingContent.forEach(tc => {
              rawContent += `Topic: ${tc.Topics}\nContent: ${Array.isArray(tc.ContentPoints) ? tc.ContentPoints.join('. ') : ''}\n`;
            });
          }
          if (mod.CaseStudy?.CaseStudyDescription) rawContent += `Case Study: ${mod.CaseStudy.CaseStudyDescription}\n`;
          rawContent += '\n';
        }
      });
    }

    const courseStyleNote = course.courseStyle || 'Academic / Formal Style';
    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional voicebook director and scriptwriter hired to produce a CONCISE, punchy summary audio course.

Course Style: "${courseStyleNote}"

Your job:
- Read the provided slide narrations and write a HIGH-LEVEL SUMMARY.
- DO NOT expand on the content. Compress the core ideas into a short, impactful script.
- Write NATURAL SPOKEN PROSE — no bullet points, no headers, no labels like [Slide 1].
- Open with a compelling course introduction and close with a quick call-to-action.
- CRITICAL: The entire generated script MUST be less than 2,000 characters. Keep it brief.
- Output PLAIN TEXT ONLY — no markdown, no JSON. This text goes directly to a professional TTS engine.`
        },
        {
          role: "user",
          content: `Here is the course data. Write a concise, seamless summary script (under 2,000 characters):\n\n${rawContent}`
        }
      ],
      temperature: 0.7
    });

    const engagingScript = scriptResponse.choices[0].message.content;
    course.audioTranscript = engagingScript;
    console.log("voiceover Generated");

    const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
    const VOICE_ID = process.env.VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

    if (!ELEVEN_API_KEY) {
      return res.status(503).json({ message: 'Audio generation is temporarily unavailable. ElevenLabs API key is not configured.' });
    }

    const chunkSize = 4000;
    const textChunks = [];
    let currentChunk = '';

    const sentences = engagingScript.match(/[^.!?]+[.!?]+/g) || [engagingScript];
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize) {
        if (currentChunk) textChunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += " " + sentence;
      }
    }
    if (currentChunk.trim()) textChunks.push(currentChunk.trim());

    const fetchPromises = textChunks.map(async (chunk, index) => {
      await new Promise(resolve => setTimeout(resolve, index * 200));

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: chunk,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.85,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail?.message || err.message || `Eleven Labs API error: ${response.status}`);
      }

      return Buffer.from(await response.arrayBuffer());
    });

    const buffers = await Promise.all(fetchPromises);
    const audioBuffer = Buffer.concat(buffers);
    const fileName = `audio-${course.courseId}.mp3`;
    const audioDir = path.join('public', 'audio');
    const filePath = path.join(audioDir, fileName);

    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    fs.writeFileSync(filePath, audioBuffer);

    const audioUrl = `/audio/${fileName}`;
    course.audioUrl = audioUrl;
    await course.save();

    res.json({ audioUrl, audioTranscript: course.audioTranscript });
  } catch (error) {
    console.error('Error generating audio:', error);
    const msg = error.message || 'Internal server error';
    const isQuota = /exceeds your quota|credits remaining|insufficient.?quota/i.test(msg);
    return res.status(isQuota ? 402 : 500).json({
      message: msg,
      code: isQuota ? 'elevenlabs_credits_exhausted' : undefined,
    });
  }
};
