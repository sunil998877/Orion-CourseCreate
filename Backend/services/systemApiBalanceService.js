import SystemApiBalance from '../models/credits/systemApiBalance.js';
import CreditTransaction from '../models/credits/creditTransaction.js';

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
        lowCreditThreshold: 150, // approx 3 decks (40-50 cr each)
        rechargeUrl: 'https://gamma.app/settings/billing',
    },
    elevenlabs: {
        displayName: 'ElevenLabs (Audio)',
        unit: 'characters',
        lowCreditThreshold: 5000, // approx 2-3 audio voiceovers
        rechargeUrl: 'https://elevenlabs.io/app/subscription',
    },
    openai: {
        displayName: 'OpenAI (GPT-4o)',
        unit: 'tokens / budget',
        lowCreditThreshold: 50000,
        rechargeUrl: 'https://platform.openai.com/settings/organization/billing/overview',
    },
};

/**
 * Check live status of ElevenLabs API key and remaining characters.
 */
async function checkElevenLabsLive(record) {
    const key = process.env.ELEVEN_API_KEY;
    record.keyConfigured = Boolean(key);
    record.keyMasked = maskApiKey(key);
    record.rechargeUrl = PROVIDER_DEFAULTS.elevenlabs.rechargeUrl;

    if (!key) {
        record.status = 'not_configured';
        record.liveCheckSuccess = false;
        record.liveCheckMessage = 'ELEVEN_API_KEY is not set in environment variables';
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
            record.liveCheckMessage = "API key is active & valid for voice synthesis. (To display live character count automatically, enable 'user_read' permission on your ElevenLabs key, or set balance manually).";
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

/**
 * Check live status of Gamma API key.
 */
async function checkGammaLive(record) {
    const key = process.env.GAMMA_API_KEY;
    record.keyConfigured = Boolean(key);
    record.keyMasked = maskApiKey(key);
    record.rechargeUrl = PROVIDER_DEFAULTS.gamma.rechargeUrl;

    if (!key) {
        record.status = 'not_configured';
        record.liveCheckSuccess = false;
        record.liveCheckMessage = 'GAMMA_API_KEY is not set in environment variables';
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
            if (record.balance !== null) {
                record.status = record.balance < record.lowCreditThreshold ? (record.balance <= 0 ? 'exhausted' : 'low_credits') : 'healthy';
            } else {
                record.status = 'healthy';
            }
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

/**
 * Check live status of OpenAI API key.
 */
async function checkOpenAILive(record) {
    const key = process.env.OPENAI_API_KEY;
    record.keyConfigured = Boolean(key);
    record.keyMasked = maskApiKey(key);
    record.rechargeUrl = PROVIDER_DEFAULTS.openai.rechargeUrl;

    if (!key) {
        record.status = 'not_configured';
        record.liveCheckSuccess = false;
        record.liveCheckMessage = 'OPENAI_API_KEY is not set in environment variables';
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
            if (record.balance !== null) {
                record.status = record.balance < record.lowCreditThreshold ? (record.balance <= 0 ? 'exhausted' : 'low_credits') : 'healthy';
            } else {
                record.status = 'healthy';
            }
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

/**
 * Ensures system balance documents exist in DB.
 */
export async function ensureSystemApiBalances() {
    const providers = ['gamma', 'openai', 'elevenlabs'];
    for (const provider of providers) {
        const existing = await SystemApiBalance.findOne({ provider });
        if (!existing) {
            const def = PROVIDER_DEFAULTS[provider];
            await SystemApiBalance.create({
                provider,
                displayName: def.displayName,
                unit: def.unit,
                lowCreditThreshold: def.lowCreditThreshold,
                rechargeUrl: def.rechargeUrl,
                status: 'healthy',
                balance: null,
            });
        }
    }
}

/**
 * Get all API balances, running live checks.
 */
export async function getAllApiBalances(runLiveCheck = false) {
    await ensureSystemApiBalances();
    const records = await SystemApiBalance.find({}).lean();

    if (!runLiveCheck) {
        return records.map(r => ({
            ...r,
            keyConfigured: Boolean(process.env[r.provider === 'gamma' ? 'GAMMA_API_KEY' : r.provider === 'elevenlabs' ? 'ELEVEN_API_KEY' : 'OPENAI_API_KEY']),
            keyMasked: maskApiKey(process.env[r.provider === 'gamma' ? 'GAMMA_API_KEY' : r.provider === 'elevenlabs' ? 'ELEVEN_API_KEY' : 'OPENAI_API_KEY'])
        }));
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

        doc.lastCheckedAt = new Date();
        await doc.save();
        updated.push(doc.toObject());
    }

    return updated;
}

/**
 * Called by gammaService when a generation finishes and returns credits.remaining
 */
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
            console.log(`[API Balances] Updated Gamma live remaining credits: ${remainingCredits}`);
        }
    } catch (err) {
        console.error('[API Balances] Failed to record Gamma credits remaining:', err.message);
    }
}

/**
 * Admin manually updates a provider balance (e.g. after a recharge).
 */
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
    return doc.toObject();
}
