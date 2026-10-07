import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const MAX_TEXT_LEN = 2500;

export function resolveElevenVoice(requestedVoice, gender) {
    const requested = String(requestedVoice || '').trim();
    const normalizedGender = String(gender || '').toLowerCase().trim();
    const isHeyGenHexId = /^[0-9a-fA-F]{30,36}$/.test(requested);
    const defaultMale = process.env.VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
    const defaultFemale = '21m00Tcm4TlvDq8ikWAM';

    if (normalizedGender === 'female') return defaultFemale;
    if (requested && !isHeyGenHexId && requested.length >= 15 && requested.length <= 25) {
        return requested;
    }
    return defaultMale;
}

export async function ensureSlideNarrationAudio({ text, voiceId, gender, retry = false }) {
    const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
    if (!cleaned) {
        const error = new Error('Narration text is required');
        error.status = 400;
        throw error;
    }
    if (cleaned.length > MAX_TEXT_LEN) {
        const error = new Error(`Narration text too long (max ${MAX_TEXT_LEN} characters)`);
        error.status = 400;
        throw error;
    }

    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
        const error = new Error('Voice narration unavailable. ElevenLabs API key is not configured.');
        error.status = 503;
        error.code = 'elevenlabs_not_configured';
        throw error;
    }

    const resolvedVoice = resolveElevenVoice(voiceId, gender);
    const narrationId = crypto
        .createHash('sha256')
        .update(`${resolvedVoice}::${cleaned}`)
        .digest('hex')
        .slice(0, 32);
    const fileName = `slide-tts-${narrationId}.mp3`;
    const audioDir = path.join('public', 'audio', 'slides');
    const filePath = path.join(audioDir, fileName);
    const audioUrl = `/audio/slides/${fileName}`;

    if (!retry && fs.existsSync(filePath) && fs.statSync(filePath).size > 100) {
        return { narrationId, audioUrl, filePath, voiceId: resolvedVoice, cached: true };
    }

    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoice}`, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
            text: cleaned,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.4,
                similarity_boost: 0.8,
                style: 0.35,
                use_speaker_boost: true,
            },
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const message = err.detail?.message || err.message || `ElevenLabs API error: ${response.status}`;
        const isQuota = /exceeds your quota|credits remaining|insufficient.?quota/i.test(message);
        const error = new Error(message);
        error.status = isQuota ? 402 : 502;
        error.code = isQuota ? 'elevenlabs_credits_exhausted' : 'elevenlabs_error';
        throw error;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, audioBuffer);
    return { narrationId, audioUrl, filePath, voiceId: resolvedVoice, cached: false };
}

export const speakSlideNarration = async (req, res) => {
    try {
        const result = await ensureSlideNarrationAudio({
            text: req.body?.text,
            voiceId: req.body?.voiceId,
            gender: req.body?.gender,
        });
        return res.json({
            audioUrl: result.audioUrl,
            narrationId: result.narrationId,
            cached: result.cached,
        });
    } catch (error) {
        console.error('speakSlideNarration error:', error);
        return res.status(error.status || 500).json({
            message: error.message || 'Failed to generate narration audio',
            code: error.code,
        });
    }
};
