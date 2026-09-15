import SystemApiBalance from '../models/credits/systemApiBalance.js';

function maskApiKey(key) {
    if (!key || typeof key !== 'string') return '';
    const trimmed = key.trim();
    if (trimmed.length <= 10) return '••••••••';
    return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
}

const PROVIDER_DEFAULTS = {
    gamma: {
        displayName: 'Gamma AI',
        unit: 'credits',
        defaultBalance: 400,
        lowCreditThreshold: 150,
        rechargeUrl: 'https://gamma.app/settings/billing',
        envKey: 'GAMMA_API_KEY',
    },
    elevenlabs: {
        displayName: 'ElevenLabs (Audio)',
        unit: 'characters',
        defaultBalance: 10000,
        lowCreditThreshold: 5000,
        rechargeUrl: 'https://elevenlabs.io/app/subscription',
        envKey: 'ELEVEN_API_KEY',
    },
    openai: {
        displayName: 'OpenAI (GPT-4o)',
        unit: 'tokens',
        defaultBalance: 100000,
        lowCreditThreshold: 50000,
        rechargeUrl: 'https://platform.openai.com/settings/organization/billing/overview',
        envKey: 'OPENAI_API_KEY',
    },
};

function getEffectiveKey(provider, doc = null) {
    if (doc?.apiKey && doc.apiKey.trim()) {
        return doc.apiKey.trim();
    }
    const envVar = PROVIDER_DEFAULTS[provider]?.envKey;
    return (envVar && process.env[envVar]) ? process.env[envVar].trim() : '';
}

async function checkElevenLabsLive(record) {
    const key = getEffectiveKey('elevenlabs', record);
    record.keyConfigured = Boolean(key);
    record.keyMasked = maskApiKey(key);
    record.rechargeUrl = PROVIDER_DEFAULTS.elevenlabs.rechargeUrl;

    if (!key) {
        record.status = 'not_configured';
        record.liveCheckSuccess = false;
        record.liveCheckMessage = 'ElevenLabs API key is not configured';
        return record;
    }

    try {
        const start = Date.now();
        const subRes = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
            headers: { 'xi-api-key': key }
        });
        const latency = Date.now() - start;

        if (subRes.ok) {
            const data = await subRes.json();
            const count = data.character_count ?? 0;
            const limit = data.character_limit ?? 0;
            const remaining = Math.max(0, limit - count);

            record.balance = remaining;
            record.quotaLimit = limit;
            record.unit = 'characters';
            record.liveCheckSuccess = true;
            record.liveCheckMessage = `Live quota synced (${latency}ms). Next reset: ${data.next_character_count_reset_unix ? new Date(data.next_character_count_reset_unix * 1000).toLocaleDateString() : 'N/A'}`;
            record.status = remaining < record.lowCreditThreshold ? (remaining === 0 ? 'exhausted' : 'low_credits') : 'healthy';
            record.meta = {
                tier: data.tier,
                usedCharacters: count,
                characterLimit: limit,
                status: data.status,
                voiceLimit: data.voice_limit,
                latencyMs: latency
            };
            return record;
        }

        const errJson = await subRes.json().catch(() => ({}));
        const isMissingPermissions = errJson.detail?.status === 'missing_permissions' ||
            String(errJson.detail?.message || '').toLowerCase().includes('user_read');

        if (isMissingPermissions) {
            record.liveCheckSuccess = true;
            record.liveCheckMessage = "API key active for TTS. Grant 'user_read' permission in ElevenLabs console for live quota counter.";
            if (record.balance === null || record.balance === undefined) {
                record.balance = PROVIDER_DEFAULTS.elevenlabs.defaultBalance;
            }
            record.status = (record.balance !== null && record.balance < record.lowCreditThreshold)
                ? (record.balance <= 0 ? 'exhausted' : 'low_credits')
                : 'healthy';
            record.meta = {
                ...record.meta,
                hasUserReadScope: false,
                keyValidForTTS: true,
                latencyMs: latency
            };
            return record;
        }

        record.liveCheckSuccess = false;
        record.liveCheckMessage = errJson.detail?.message || `ElevenLabs HTTP ${subRes.status}`;
        record.status = 'action_required';
    } catch (err) {
        record.liveCheckSuccess = false;
        record.liveCheckMessage = `Network check failed: ${err.message}`;
        record.status = 'action_required';
    }

    return record;
}

async function checkGammaLive(record) {
    const key = getEffectiveKey('gamma', record);
    record.keyConfigured = Boolean(key);
    record.keyMasked = maskApiKey(key);
    record.rechargeUrl = PROVIDER_DEFAULTS.gamma.rechargeUrl;

    if (!key) {
        record.status = 'not_configured';
        record.liveCheckSuccess = false;
        record.liveCheckMessage = 'Gamma API key is not configured';
        return record;
    }

    try {
        const start = Date.now();
        const testRes = await fetch('https://public-api.gamma.app/v1.0/themes', {
            headers: { 'X-API-KEY': key }
        });
        const latency = Date.now() - start;

        if (testRes.ok) {
            record.liveCheckSuccess = true;
            record.liveCheckMessage = `Gamma API key active & authenticated (${latency}ms)`;
            if (record.balance === null || record.balance === undefined) {
                record.balance = PROVIDER_DEFAULTS.gamma.defaultBalance;
            }
            record.status = record.balance < record.lowCreditThreshold ? (record.balance <= 0 ? 'exhausted' : 'low_credits') : 'healthy';
            record.meta = {
                ...record.meta,
                latencyMs: latency,
                authenticated: true
            };
            return record;
        }

        const errJson = await testRes.json().catch(() => ({}));
        record.liveCheckSuccess = false;
        record.liveCheckMessage = errJson.message || `Gamma HTTP ${testRes.status}`;
        record.status = testRes.status === 403 ? 'exhausted' : 'action_required';
    } catch (err) {
        record.liveCheckSuccess = false;
        record.liveCheckMessage = `Network check failed: ${err.message}`;
        record.status = 'action_required';
    }

    return record;
}

async function checkOpenAILive(record) {
    const key = getEffectiveKey('openai', record);
    record.keyConfigured = Boolean(key);
    record.keyMasked = maskApiKey(key);
    record.rechargeUrl = PROVIDER_DEFAULTS.openai.rechargeUrl;

    if (!key) {
        record.status = 'not_configured';
        record.liveCheckSuccess = false;
        record.liveCheckMessage = 'OpenAI API key is not configured';
        return record;
    }

    try {
        const start = Date.now();
        const testRes = await fetch('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${key}` }
        });
        const latency = Date.now() - start;

        if (testRes.ok) {
            record.liveCheckSuccess = true;
            record.liveCheckMessage = `OpenAI API key active & authenticated (${latency}ms)`;
            if (record.balance === null || record.balance === undefined) {
                record.balance = PROVIDER_DEFAULTS.openai.defaultBalance;
            }
            record.status = record.balance < record.lowCreditThreshold ? (record.balance <= 0 ? 'exhausted' : 'low_credits') : 'healthy';
            record.meta = {
                ...record.meta,
                latencyMs: latency,
                authenticated: true
            };
            return record;
        }

        const errJson = await testRes.json().catch(() => ({}));
        record.liveCheckSuccess = false;
        record.liveCheckMessage = errJson.error?.message || `OpenAI HTTP ${testRes.status}`;
        record.status = 'action_required';
    } catch (err) {
        record.liveCheckSuccess = false;
        record.liveCheckMessage = `Network check failed: ${err.message}`;
        record.status = 'action_required';
    }

    return record;
}

export async function ensureSystemApiBalances() {
    const providers = ['gamma', 'openai', 'elevenlabs'];
    for (const provider of providers) {
        const existing = await SystemApiBalance.findOne({ provider });
        if (!existing) {
            const def = PROVIDER_DEFAULTS[provider];
            const envVal = process.env[def.envKey] || '';
            await SystemApiBalance.create({
                provider,
                displayName: def.displayName,
                unit: def.unit,
                balance: def.defaultBalance,
                lowCreditThreshold: def.lowCreditThreshold,
                rechargeUrl: def.rechargeUrl,
                status: 'healthy',
                apiKey: envVal,
                keyMasked: maskApiKey(envVal),
                keyConfigured: Boolean(envVal),
            });
        } else if (existing.balance === null || existing.balance === undefined) {
            existing.balance = PROVIDER_DEFAULTS[provider].defaultBalance;
            await existing.save();
        }
    }
}

export async function getAllApiBalances(runLiveCheck = false) {
    await ensureSystemApiBalances();
    const records = await SystemApiBalance.find({}).lean();

    if (!runLiveCheck) {
        return records.map(r => {
            const fullKey = getEffectiveKey(r.provider, r);
            return {
                ...r,
                keyFull: fullKey,
                keyConfigured: Boolean(fullKey),
                keyMasked: maskApiKey(fullKey),
                balance: r.balance !== null && r.balance !== undefined ? r.balance : PROVIDER_DEFAULTS[r.provider]?.defaultBalance ?? 0
            };
        });
    }

    const updated = [];
    for (const raw of records) {
        const doc = await SystemApiBalance.findById(raw._id);
        if (!doc) continue;

        if (doc.provider === 'elevenlabs') {
            await checkElevenLabsLive(doc);
        } else if (doc.provider === 'gamma') {
            await checkGammaLive(doc);
        } else if (doc.provider === 'openai') {
            await checkOpenAILive(doc);
        }

        if (doc.balance === null || doc.balance === undefined) {
            doc.balance = PROVIDER_DEFAULTS[doc.provider]?.defaultBalance ?? 0;
        }

        doc.lastCheckedAt = new Date();
        await doc.save();
        const obj = doc.toObject();
        obj.keyFull = getEffectiveKey(doc.provider, doc);
        updated.push(obj);
    }

    return updated;
}

export async function recordGammaCreditsRemaining(remainingCredits, deductedCredits = null) {
    if (typeof remainingCredits !== 'number') return;
    try {
        await ensureSystemApiBalances();
        const doc = await SystemApiBalance.findOne({ provider: 'gamma' });
        if (doc) {
            doc.balance = remainingCredits;
            doc.lastSyncSource = 'generation_hook';
            doc.lastCheckedAt = new Date();
            doc.status = remainingCredits < doc.lowCreditThreshold ? (remainingCredits <= 0 ? 'exhausted' : 'low_credits') : 'healthy';
            if (deductedCredits) {
                doc.meta = {
                    ...doc.meta,
                    lastDeducted: deductedCredits,
                    lastDeductedAt: new Date()
                };
            }
            await doc.save();
        }
    } catch (_) {}
}

export async function updateProviderBalanceByAdmin(provider, { balance, quotaLimit, lowCreditThreshold, notes }) {
    await ensureSystemApiBalances();
    const doc = await SystemApiBalance.findOne({ provider });
    if (!doc) throw new Error(`Provider ${provider} not found`);

    if (typeof balance === 'number') {
        doc.balance = balance;
        doc.lastRechargedAt = new Date();
        doc.lastSyncSource = 'manual_admin';
    }
    if (typeof quotaLimit === 'number') doc.quotaLimit = quotaLimit;
    if (typeof lowCreditThreshold === 'number') doc.lowCreditThreshold = lowCreditThreshold;
    if (notes) {
        doc.meta = { ...doc.meta, adminNotes: notes, updatedByAdminAt: new Date() };
    }

    doc.status = (doc.balance !== null && doc.balance < doc.lowCreditThreshold)
        ? (doc.balance <= 0 ? 'exhausted' : 'low_credits')
        : 'healthy';

    doc.lastCheckedAt = new Date();
    await doc.save();
    const obj = doc.toObject();
    obj.keyFull = getEffectiveKey(doc.provider, doc);
    return obj;
}

export async function updateProviderApiKey(provider, apiKey) {
    await ensureSystemApiBalances();
    const doc = await SystemApiBalance.findOne({ provider });
    if (!doc) throw new Error(`Provider ${provider} not found`);

    const trimmed = (apiKey || '').trim();
    doc.apiKey = trimmed;
    doc.keyMasked = maskApiKey(trimmed);
    doc.keyConfigured = Boolean(trimmed);

    const envVar = PROVIDER_DEFAULTS[provider]?.envKey;
    if (envVar && trimmed) {
        process.env[envVar] = trimmed;
    }

    if (doc.provider === 'elevenlabs') {
        await checkElevenLabsLive(doc);
    } else if (doc.provider === 'gamma') {
        await checkGammaLive(doc);
    } else if (doc.provider === 'openai') {
        await checkOpenAILive(doc);
    }

    doc.lastCheckedAt = new Date();
    await doc.save();
    const obj = doc.toObject();
    obj.keyFull = trimmed;
    return obj;
}
