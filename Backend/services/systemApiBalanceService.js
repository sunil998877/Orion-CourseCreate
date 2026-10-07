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
    heygen: {
        displayName: 'HeyGen (Avatar Video)',
        unit: 'credits',
        defaultBalance: 10,
        lowCreditThreshold: 3,
        rechargeUrl: 'https://app.heygen.com/settings?nav=Billing',
        envKey: 'HEYGEN_API_KEY',
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
        let subData = null;

        const subRes = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
            headers: { 'xi-api-key': key }
        });

        if (subRes.ok) {
            subData = await subRes.json();
        } else {
            const userRes = await fetch('https://api.elevenlabs.io/v1/user', {
                headers: { 'xi-api-key': key }
            });
            if (userRes.ok) {
                const uJson = await userRes.json();
                subData = uJson.subscription || uJson;
            }
        }

        const latency = Date.now() - start;

        if (subData && typeof subData.character_count === 'number') {
            const count = subData.character_count ?? 0;
            const limit = subData.character_limit ?? 10000;
            const remaining = Math.max(0, limit - count);

            record.balance = remaining;
            record.quotaLimit = limit;
            record.unit = 'characters';
            record.liveCheckSuccess = true;
            record.liveCheckMessage = `Live quota synced (${latency}ms). Used ${count.toLocaleString()} / ${limit.toLocaleString()} chars`;
            record.status = remaining < record.lowCreditThreshold ? (remaining === 0 ? 'exhausted' : 'low_credits') : 'healthy';
            record.meta = {
                tier: subData.tier,
                usedCharacters: count,
                characterLimit: limit,
                status: subData.status,
                voiceLimit: subData.voice_limit,
                latencyMs: latency
            };
            return record;
        }

        const voiceRes = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': key }
        });

        if (voiceRes.ok) {
            const vData = await voiceRes.json();
            record.liveCheckSuccess = true;
            record.unit = 'characters';
            if (record.balance === null || record.balance === undefined || record.balance <= 0) {
                record.balance = 10000;
                record.quotaLimit = 10000;
            }
            record.liveCheckMessage = `API key active & verified for TTS (${vData.voices?.length || 0} voices ready). Set exact quota via Edit Balance or grant 'user_read' in ElevenLabs console.`;
            record.status = record.balance < record.lowCreditThreshold ? (record.balance <= 0 ? 'exhausted' : 'low_credits') : 'healthy';
            record.meta = {
                ...record.meta,
                hasUserReadScope: false,
                keyValidForTTS: true,
                latencyMs: latency
            };
            return record;
        }

        const errJson = await subRes.json().catch(() => ({}));
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
        record.balance = 0;
        return record;
    }

    try {
        const start = Date.now();

        const testRes = await fetch('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${key}` }
        });
        const latency = Date.now() - start;

        if (!testRes.ok) {
            const errJson = await testRes.json().catch(() => ({}));
            record.liveCheckSuccess = false;
            record.liveCheckMessage = errJson.error?.message || `OpenAI HTTP ${testRes.status}`;
            record.status = 'action_required';
            record.balance = 0;
            return record;
        }

        let quotaExhausted = false;
        let quotaErrorMessage = '';
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);
            const probeRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: 'ping' }],
                    max_tokens: 1
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!probeRes.ok) {
                const probeErr = await probeRes.json().catch(() => ({}));
                const code = probeErr.error?.code || '';
                const msg = probeErr.error?.message || '';
                const isQuota = probeRes.status === 429 ||
                    code === 'insufficient_quota' ||
                    /credit|quota|billing/i.test(msg);
                if (isQuota) {
                    quotaExhausted = true;
                    quotaErrorMessage = msg || '429: You have no credits remaining. Please recharge on OpenAI billing.';
                }
            }
        } catch (probeErr) {
            console.warn('[OpenAI Probe] Warning:', probeErr.message);
        }

        record.unit = 'tokens';

        if (quotaExhausted) {
            record.balance = 0;
            record.quotaLimit = record.quotaLimit || 1000000;
            record.status = 'exhausted';
            record.liveCheckSuccess = false;
            record.liveCheckMessage = quotaErrorMessage;
            record.meta = {
                ...record.meta,
                latencyMs: latency,
                authenticated: true,
                quotaExhausted: true
            };
            return record;
        }

        record.liveCheckSuccess = true;
        record.liveCheckMessage = `OpenAI API key active & authenticated (${latency}ms)`;

        if (record.balance === null || record.balance === undefined) {
            record.balance = PROVIDER_DEFAULTS.openai.defaultBalance || 100000;
            record.quotaLimit = 1000000;
        }

        record.status = record.balance < record.lowCreditThreshold
            ? (record.balance <= 0 ? 'exhausted' : 'low_credits')
            : 'healthy';

        record.meta = {
            ...record.meta,
            latencyMs: latency,
            authenticated: true,
            quotaExhausted: false
        };
        return record;
    } catch (err) {
        record.liveCheckSuccess = false;
        record.liveCheckMessage = `Network check failed: ${err.message}`;
        record.status = 'action_required';
    }

    return record;
}

async function checkHeyGenLive(record) {
    const key = getEffectiveKey('heygen', record);
    record.keyConfigured = Boolean(key);
    record.keyMasked = maskApiKey(key);
    record.rechargeUrl = PROVIDER_DEFAULTS.heygen.rechargeUrl;

    if (!key) {
        record.status = 'not_configured';
        record.liveCheckSuccess = false;
        record.liveCheckMessage = 'HeyGen API key is not configured';
        return record;
    }

    try {
        const start = Date.now();
        let remainingCredits = null;
        let creditLimit = null;
        let authOk = false;

        try {
            const meRes = await fetch('https://api.heygen.com/v3/users/me', {
                headers: { 'X-Api-Key': key }
            });
            if (meRes.ok) {
                authOk = true;
                const meData = await meRes.json().catch(() => ({}));
                const userObj = meData.data || meData;
                if (userObj.wallet && typeof userObj.wallet.remaining_balance === 'number') {
                    remainingCredits = userObj.wallet.remaining_balance;
                } else if (userObj.subscription?.credits) {
                    const creds = userObj.subscription.credits;
                    remainingCredits = creds.premium_credits?.remaining ?? creds.remaining ?? creds.total;
                    creditLimit = creds.premium_credits?.quota ?? creds.quota ?? creds.total;
                }
            }
        } catch (_) { }

        if (remainingCredits === null) {
            try {
                const qRes = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
                    headers: { 'X-Api-Key': key }
                });
                if (qRes.ok) {
                    authOk = true;
                    const qData = await qRes.json().catch(() => ({}));
                    const val = qData.data?.remaining_quota ?? qData.remaining_quota;
                    if (typeof val === 'number') {
                        remainingCredits = val;
                    }
                }
            } catch (_) { }
        }

        if (!authOk) {
            try {
                const avRes = await fetch('https://api.heygen.com/v2/avatars', {
                    headers: { 'X-Api-Key': key }
                });
                if (avRes.ok) {
                    authOk = true;
                }
            } catch (_) { }
        }

        const latency = Date.now() - start;

        if (authOk) {
            record.liveCheckSuccess = true;
            record.unit = 'credits';

            if (typeof remainingCredits === 'number') {
                record.balance = remainingCredits;
                if (creditLimit) record.quotaLimit = creditLimit;
                record.liveCheckMessage = `Live HeyGen credits synced (${latency}ms)`;
            } else {
                if (record.balance === null || record.balance === undefined) {
                    record.balance = PROVIDER_DEFAULTS.heygen.defaultBalance;
                }
                record.liveCheckMessage = `HeyGen API key active & verified (${latency}ms)`;
            }

            record.status = record.balance < record.lowCreditThreshold
                ? (record.balance <= 0 ? 'exhausted' : 'low_credits')
                : 'healthy';

            record.meta = {
                ...record.meta,
                latencyMs: latency,
                authenticated: true
            };
            return record;
        }

        record.liveCheckSuccess = false;
        record.liveCheckMessage = 'HeyGen API key authentication failed';
        record.status = 'action_required';
    } catch (err) {
        record.liveCheckSuccess = false;
        record.liveCheckMessage = `Network check failed: ${err.message}`;
        record.status = 'action_required';
    }

    return record;
}

export async function ensureSystemApiBalances() {
    const providers = ['gamma', 'openai', 'elevenlabs', 'heygen'];
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
        } else {
            let changed = false;
            if (existing.provider === 'openai') {
                if (existing.balance === 500000 || existing.balance === null || existing.balance === undefined || existing.meta?.quotaExhausted) {
                    await checkOpenAILive(existing);
                    changed = true;
                }
                if (existing.unit !== 'tokens') {
                    existing.unit = 'tokens';
                    changed = true;
                }
                if (existing.status === 'low_credits' && existing.balance >= existing.lowCreditThreshold) {
                    existing.status = 'healthy';
                    changed = true;
                }
            } else if (existing.provider === 'elevenlabs') {
                if (existing.unit !== 'characters') {
                    existing.unit = 'characters';
                    changed = true;
                }
                if (existing.balance === null || existing.balance === undefined) {
                    existing.balance = 10000;
                    existing.quotaLimit = 10000;
                    changed = true;
                }
            } else if (existing.provider === 'gamma') {
                if (existing.unit !== 'credits') {
                    existing.unit = 'credits';
                    changed = true;
                }
                if (existing.balance === null || existing.balance === undefined) {
                    existing.balance = 400;
                    changed = true;
                }
            } else if (existing.provider === 'heygen') {
                if (existing.unit !== 'credits') {
                    existing.unit = 'credits';
                    changed = true;
                }
                if (existing.balance === null || existing.balance === undefined) {
                    existing.balance = 10;
                    existing.quotaLimit = 10;
                    changed = true;
                }
            }
            if (changed) {
                await existing.save();
            }
        }
    }
}

export async function getAllApiBalances(runLiveCheck = false) {
    await ensureSystemApiBalances();
    const records = await SystemApiBalance.find({}).lean();

    if (!runLiveCheck) {
        return records.map(r => {
            const fullKey = getEffectiveKey(r.provider, r);
            let bal = r.balance !== null && r.balance !== undefined ? r.balance : PROVIDER_DEFAULTS[r.provider]?.defaultBalance ?? 0;
            let unit = r.unit;
            let stat = r.status;

            if (r.provider === 'openai') {
                unit = 'tokens';
                if (stat === 'exhausted' || r.meta?.quotaExhausted || bal <= 0) {
                    bal = 0;
                    stat = 'exhausted';
                }
            }

            return {
                ...r,
                keyFull: fullKey,
                keyConfigured: Boolean(fullKey),
                keyMasked: maskApiKey(fullKey),
                unit,
                balance: bal,
                status: stat,
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
        } else if (doc.provider === 'heygen') {
            await checkHeyGenLive(doc);
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
    } catch (_) { }
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
    } else if (doc.provider === 'heygen') {
        await checkHeyGenLive(doc);
    }

    doc.lastCheckedAt = new Date();
    await doc.save();
    const obj = doc.toObject();
    obj.keyFull = trimmed;
    return obj;
}

export async function recordOpenAiQuotaExhausted(errorMessage = '') {
    try {
        await ensureSystemApiBalances();
        const doc = await SystemApiBalance.findOne({ provider: 'openai' });
        if (doc) {
            doc.balance = 0;
            doc.status = 'exhausted';
            doc.liveCheckSuccess = false;
            doc.liveCheckMessage = errorMessage || '429: You have no credits remaining. Please recharge on OpenAI billing.';
            doc.lastSyncSource = 'generation_hook';
            doc.lastCheckedAt = new Date();
            doc.meta = {
                ...doc.meta,
                quotaExhausted: true,
                lastQuotaExhaustedAt: new Date()
            };
            await doc.save();
        }
    } catch (err) {
        console.warn('[OpenAI Exhaustion Sync] Failed to update balance record:', err.message);
    }
}
