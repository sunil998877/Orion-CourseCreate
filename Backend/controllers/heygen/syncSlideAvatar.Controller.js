import fs from 'fs';
import path from 'path';
import { getHeyGenConfig, heygenFetch, mapHeyGenStatus } from './heygen.helpers.js';
import { ensureSlideNarrationAudio } from './speakSlideNarration.Controller.js';

const inflight = new Map();

function jobPath(narrationId, avatarId) {
    const safeAvatar = String(avatarId || 'avatar').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    return path.join('public', 'audio', 'slides', 'jobs', `${safeAvatar}-${narrationId}.json`);
}

function readJob(file) {
    try {
        if (!fs.existsSync(file)) return null;
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return null;
    }
}

function writeJob(file, job) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(job, null, 2));
}

function publicJob(audio, job) {
    return {
        narrationId: audio.narrationId,
        audioUrl: audio.audioUrl,
        avatarVideoId: job?.avatarVideoId || null,
        avatarVideoUrl: job?.avatarVideoUrl || null,
        status: job?.status || 'generating',
        error: job?.error || null,
        cached: Boolean(audio.cached),
    };
}

async function createHeyGenVideo(avatarId, audioAssetUrl) {
    const isTestMode = process.env.HEYGEN_TEST_MODE === 'true';
    const bodyFor = (avatarStyle, dimension) => ({
        video_inputs: [
            {
                character: {
                    type: 'avatar',
                    avatar_id: avatarId,
                    avatar_style: avatarStyle,
                },
                voice: {
                    type: 'audio',
                    audio_url: audioAssetUrl,
                },
                background: { type: 'color', value: '#000000' },
            },
        ],
        dimension,
        ...(isTestMode ? { test: true } : {}),
    });

    try {
        return await heygenFetch('/v2/video/generate', {
            method: 'POST',
            body: bodyFor('closeUp', { width: 720, height: 720 }),
        });
    } catch (closeUpError) {
        console.warn('[slide-sync] closeUp render failed, retrying normal:', closeUpError.message);
        return heygenFetch('/v2/video/generate', {
            method: 'POST',
            body: bodyFor('normal', { width: 720, height: 1280 }),
        });
    }
}

async function ensureAvatarJob(audio, avatarId, forceRetry = false) {
    const file = jobPath(audio.narrationId, avatarId);
    const existing = readJob(file);
    if (!forceRetry) {
        if (existing?.status === 'ready' && existing.avatarVideoUrl) return existing;
        if (existing?.status === 'generating' && existing.avatarVideoId) return existing;
        if (existing?.status === 'audio_only' && !existing.error) return existing;
    }

    const key = `${avatarId}::${audio.narrationId}`;
    if (inflight.has(key)) return inflight.get(key);

    const work = (async () => {
        const base = {
            narrationId: audio.narrationId,
            avatarId,
            audioUrl: audio.audioUrl,
            avatarVideoId: null,
            avatarVideoUrl: null,
            status: 'audio_only',
            error: null,
        };
        const { configured, apiKey } = getHeyGenConfig();
        if (!configured) {
            base.error = 'heygen_not_configured';
            writeJob(file, base);
            console.log('[slide-sync] avatar unavailable', { narrationId: audio.narrationId, status: base.status });
            return base;
        }

        try {
            const audioBuffer = fs.readFileSync(audio.filePath);
            const uploadRes = await fetch('https://upload.heygen.com/v1/asset', {
                method: 'POST',
                headers: {
                    'X-Api-Key': apiKey,
                    'Content-Type': 'audio/mpeg',
                },
                body: audioBuffer,
            });
            const uploadPayload = await uploadRes.json().catch(() => ({}));
            if (!uploadRes.ok) {
                throw new Error(uploadPayload?.message || uploadPayload?.error?.message || 'HeyGen audio upload failed');
            }
            const audioAssetUrl = uploadPayload?.data?.url;
            if (!audioAssetUrl) throw new Error('HeyGen did not return an audio asset url');

            const payload = await createHeyGenVideo(avatarId, audioAssetUrl);
            const videoId = payload?.data?.video_id;
            if (!videoId) throw new Error('HeyGen did not return a video id');

            const job = {
                ...base,
                avatarVideoId: videoId,
                status: 'generating',
                error: null,
            };
            writeJob(file, job);
            console.log('[slide-sync] generating', {
                narrationId: audio.narrationId,
                avatarVideoId: videoId,
                avatarId,
            });
            return job;
        } catch (error) {
            const job = {
                ...base,
                status: 'audio_only',
                error: error.message || 'avatar_generation_failed',
            };
            writeJob(file, job);
            console.error('[slide-sync] avatar generation failed', {
                narrationId: audio.narrationId,
                avatarId,
                error: job.error,
            });
            return job;
        } finally {
            inflight.delete(key);
        }
    })();

    inflight.set(key, work);
    return work;
}

async function refreshJob(audio, avatarId) {
    const file = jobPath(audio.narrationId, avatarId);
    let job = readJob(file);
    if (!job || (job.status !== 'ready' && job.status !== 'audio_only' && !job.avatarVideoId)) {
        job = await ensureAvatarJob(audio, avatarId);
    }
    if (job?.status === 'generating' && job.avatarVideoId) {
        let payload;
        try {
            payload = await heygenFetch(`/v1/video_status.get?video_id=${encodeURIComponent(job.avatarVideoId)}`);
        } catch (statusError) {
            console.warn('[slide-sync] status poll failed', statusError.message);
            return job;
        }
        const data = payload?.data || payload || {};
        const status = mapHeyGenStatus(data.status);
        const videoUrl = data.video_url || data.url || data.download_url || null;
        if (status === 'completed' && videoUrl) {
            job = {
                ...job,
                status: 'ready',
                avatarVideoUrl: videoUrl,
                error: null,
            };
            writeJob(file, job);
            console.log('[slide-sync] ready', {
                narrationId: audio.narrationId,
                avatarVideoId: job.avatarVideoId,
            });
        } else if (status === 'failed') {
            job = {
                ...job,
                status: 'audio_only',
                error: String(data.error?.message || data.error || data.failure_message || 'avatar_generation_failed'),
            };
            writeJob(file, job);
            console.error('[slide-sync] failed', {
                narrationId: audio.narrationId,
                avatarVideoId: job.avatarVideoId,
                error: job.error,
            });
        }
    }
    return job;
}

export const syncSlideAvatar = async (req, res) => {
    try {
        const avatarId = String(req.body?.avatarId || getHeyGenConfig().avatarId || '').trim();
        const forceRetry = Boolean(req.body?.retry || req.query?.retry);
        const audio = await ensureSlideNarrationAudio({
            text: req.body?.text,
            voiceId: req.body?.voiceId,
            gender: req.body?.gender,
        });
        const file = jobPath(audio.narrationId, avatarId);
        let existing = readJob(file);

        if (forceRetry && existing?.status !== 'ready') {
            existing = null;
        }

        if (existing?.status === 'ready' && existing.avatarVideoUrl) {
            return res.json(publicJob(audio, existing));
        }

        if (existing?.status === 'generating' && existing.avatarVideoId) {
            const refreshed = await refreshJob(audio, avatarId);
            return res.json(publicJob(audio, refreshed));
        }

        if (existing?.status === 'audio_only' && !existing.error && !forceRetry) {
            return res.json(publicJob(audio, existing));
        }

        void ensureAvatarJob(audio, avatarId, forceRetry).catch((error) => {
            console.error('[slide-sync] background start failed', error);
        });
        return res.json(publicJob(audio, { status: 'generating' }));
    } catch (error) {
        console.error('[slide-sync] narration failed', error);
        return res.status(error.status || 500).json({
            message: error.message || 'Failed to prepare slide narration',
            code: error.code || 'narration_failed',
        });
    }
};

export const getSlideAvatarStatus = async (req, res) => {
    try {
        const narrationId = String(req.params.narrationId || '').trim();
        const avatarId = String(req.query.avatarId || getHeyGenConfig().avatarId || '').trim();
        if (!narrationId) {
            return res.status(400).json({ message: 'Narration id is required' });
        }
        const audioUrl = `/audio/slides/slide-tts-${narrationId}.mp3`;
        const filePath = path.join('public', 'audio', 'slides', `slide-tts-${narrationId}.mp3`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Narration audio was not found', code: 'narration_missing' });
        }
        const audio = { narrationId, audioUrl, filePath, cached: true };
        const job = await refreshJob(audio, avatarId);
        return res.json(publicJob(audio, job));
    } catch (error) {
        console.error('[slide-sync] status failed', error);
        return res.status(error.status || 500).json({
            message: error.message || 'Failed to read avatar video status',
            code: 'avatar_status_failed',
        });
    }
};
