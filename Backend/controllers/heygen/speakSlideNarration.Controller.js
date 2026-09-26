import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const MAX_TEXT_LEN = 2500;

/**
 * Generate (or return cached) ElevenLabs MP3 for a slide narration script.
 * POST body: { text: string, voiceId?: string }
 * Response: { audioUrl: string }
 */
export const speakSlideNarration = async (req, res) => {
    try {
        const text = String(req.body?.text || '').replace(/\s+/g, ' ').trim();
        if (!text) {
            return res.status(400).json({ message: 'Narration text is required' });
        }
        if (text.length > MAX_TEXT_LEN) {
            return res.status(400).json({
                message: `Narration text too long (max ${MAX_TEXT_LEN} characters)`,
            });
        }

        const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
        if (!ELEVEN_API_KEY) {
            return res.status(503).json({
                message: 'Voice narration unavailable. ElevenLabs API key is not configured.',
                code: 'elevenlabs_not_configured',
            });
        }

        const voiceId = String(
            req.body?.voiceId || process.env.VOICE_ID || 'pNInz6obpgDQGcFmaJgB'
        ).trim();

        const hash = crypto
            .createHash('sha256')
            .update(`${voiceId}::${text}`)
            .digest('hex')
            .slice(0, 32);
        const fileName = `slide-tts-${hash}.mp3`;
        const audioDir = path.join('public', 'audio', 'slides');
        const filePath = path.join(audioDir, fileName);
        const audioUrl = `/audio/slides/${fileName}`;

        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
            return res.json({ audioUrl, cached: true });
        }

        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': ELEVEN_API_KEY,
                    'Content-Type': 'application/json',
                    Accept: 'audio/mpeg',
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.4,
                        similarity_boost: 0.8,
                        style: 0.35,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const msg =
                err.detail?.message ||
                err.message ||
                `ElevenLabs API error: ${response.status}`;
            const isQuota = /exceeds your quota|credits remaining|insufficient.?quota/i.test(
                msg
            );
            return res.status(isQuota ? 402 : 502).json({
                message: msg,
                code: isQuota ? 'elevenlabs_credits_exhausted' : 'elevenlabs_error',
            });
        }

        const audioBuffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(filePath, audioBuffer);

        return res.json({ audioUrl, cached: false });
    } catch (error) {
        console.error('speakSlideNarration error:', error);
        return res.status(500).json({
            message: error.message || 'Failed to generate narration audio',
        });
    }
};
