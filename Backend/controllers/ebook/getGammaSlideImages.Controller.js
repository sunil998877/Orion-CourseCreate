import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import Course from '../../models/courseModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_ROOT = path.join(__dirname, '../../public');
const GAMMA_API_KEY = process.env.GAMMA_API_KEY;
const GAMMA_BASE = 'https://public-api.gamma.app';

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function gammaFetch(pathname, { method = 'GET', body } = {}) {
    const res = await fetch(`${GAMMA_BASE}${pathname}`, {
        method,
        headers: {
            'X-API-KEY': GAMMA_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data?.message || data?.error?.message || `Gamma API error (${res.status})`);
        err.status = res.status;
        err.payload = data;
        throw err;
    }
    return data;
}

async function listCachedImages(cacheDir, publicPrefix) {
    try {
        const entries = await fs.readdir(cacheDir);
        const pngs = entries
            .filter((f) => /\.png$/i.test(f))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        if (!pngs.length) return [];
        return pngs.map((f) => `${publicPrefix}/${encodeURIComponent(f)}`);
    } catch {
        return [];
    }
}

async function resolveGammaId(generationId) {
    const status = await gammaFetch(`/v1.0/generations/${encodeURIComponent(generationId)}`);
    return {
        gammaId: status.gammaId || status.output?.gammaId || null,
        gammaUrl: status.gammaUrl || status.url || null,
        exportUrl: status.exportUrl || status.output?.exportUrl || null,
    };
}

async function exportPngZipUrl(gammaId) {
    const created = await gammaFetch(`/v1.0/gammas/${encodeURIComponent(gammaId)}/export`, {
        method: 'POST',
        body: { exportAs: 'png' },
    });
    const exportId = created.exportId || created.id;
    if (!exportId) {
        throw Object.assign(new Error('Gamma did not return an export id'), { status: 502 });
    }

    let attempt = 0;
    while (attempt < 40) {
        attempt += 1;
        const status = await gammaFetch(`/v1.0/exports/${encodeURIComponent(exportId)}`);
        if (status.status === 'completed') {
            const url = status.exportUrl || status.url || status.downloadUrl;
            if (!url) throw Object.assign(new Error('Gamma export completed without URL'), { status: 502 });
            return url;
        }
        if (status.status === 'failed') {
            throw Object.assign(new Error(status.error?.message || 'Gamma PNG export failed'), { status: 502 });
        }
        await sleep(Math.min(2000 + attempt * 500, 8000));
    }
    throw Object.assign(new Error('Gamma PNG export timed out'), { status: 504 });
}

async function unzipPngsToDir(zipUrl, cacheDir) {
    const zipRes = await fetch(zipUrl, {
        headers: { 'User-Agent': 'CourseCreator/1.0' },
    });
    if (!zipRes.ok) {
        throw Object.assign(new Error(`Failed to download Gamma PNG zip (${zipRes.status})`), { status: 502 });
    }
    const buf = Buffer.from(await zipRes.arrayBuffer());
    const zip = await JSZip.loadAsync(buf);
    await fs.mkdir(cacheDir, { recursive: true });

    const pngEntries = Object.keys(zip.files)
        .filter((name) => /\.png$/i.test(name) && !zip.files[name].dir)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (!pngEntries.length) {
        throw Object.assign(new Error('Gamma PNG zip contained no images'), { status: 502 });
    }

    const saved = [];
    for (let i = 0; i < pngEntries.length; i++) {
        const entry = pngEntries[i];
        const data = await zip.files[entry].async('nodebuffer');
        const filename = `slide-${String(i + 1).padStart(2, '0')}.png`;
        await fs.writeFile(path.join(cacheDir, filename), data);
        saved.push(filename);
    }
    return saved;
}

export const getGammaSlideImages = async (req, res) => {
    try {
        if (!GAMMA_API_KEY) {
            return res.status(503).json({ message: 'Gamma API is not configured' });
        }

        const { courseId, moduleNumber } = req.params;
        const course = await Course.findOne({ userId: req.user.id, courseId: String(courseId) });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const mod = (course.modules || []).find((m) => Number(m.moduleNumber) === Number(moduleNumber));
        if (!mod) return res.status(404).json({ message: 'Module not found' });
        if (!mod.gammaGenerationId && !mod.gammaUrl) {
            return res.status(404).json({
                message: 'No Gamma deck for this module. Generate Orion slides first.',
                code: 'gamma_missing',
            });
        }

        const cacheKey = String(mod.gammaGenerationId || `url-${moduleNumber}`);
        const cacheDir = path.join(PUBLIC_ROOT, 'gamma-slides', cacheKey);
        const publicPrefix = `/gamma-slides/${encodeURIComponent(cacheKey)}`;

        let images = await listCachedImages(cacheDir, publicPrefix);
        if (images.length) {
            return res.json({
                images,
                gammaUrl: mod.gammaUrl || null,
                cached: true,
                count: images.length,
            });
        }

        let gammaId = null;
        if (mod.gammaGenerationId) {
            const resolved = await resolveGammaId(mod.gammaGenerationId);
            gammaId = resolved.gammaId;
            // If generation already had a png export zip, use it
            if (resolved.exportUrl && /\.zip($|\?)/i.test(resolved.exportUrl)) {
                await unzipPngsToDir(resolved.exportUrl, cacheDir);
                images = await listCachedImages(cacheDir, publicPrefix);
                if (images.length) {
                    return res.json({
                        images,
                        gammaUrl: mod.gammaUrl || resolved.gammaUrl || null,
                        cached: false,
                        count: images.length,
                    });
                }
            }
        }

        if (!gammaId && mod.gammaUrl) {
            // Best-effort extract from URL (g_xxx or docs slug)
            const match = String(mod.gammaUrl).match(/\/(g_[a-z0-9]+)/i);
            if (match) gammaId = match[1];
        }

        if (!gammaId) {
            return res.status(404).json({
                message: 'Could not resolve Gamma file id for PNG export. Open View Deck instead.',
                code: 'gamma_id_missing',
                gammaUrl: mod.gammaUrl || null,
            });
        }

        const zipUrl = await exportPngZipUrl(gammaId);
        await unzipPngsToDir(zipUrl, cacheDir);
        images = await listCachedImages(cacheDir, publicPrefix);

        if (!images.length) {
            return res.status(502).json({ message: 'Gamma PNG export produced no slides' });
        }

        return res.json({
            images,
            gammaUrl: mod.gammaUrl || null,
            cached: false,
            count: images.length,
        });
    } catch (error) {
        console.error('getGammaSlideImages error:', error);
        return res.status(error.status || 500).json({
            message: error.message || 'Failed to load Gamma slide images',
            code: 'gamma_slide_images_failed',
            details: error.payload || undefined,
        });
    }
};
