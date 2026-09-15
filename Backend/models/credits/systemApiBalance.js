import mongoose from 'mongoose';

const systemApiBalanceSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
        unique: true,
        enum: ['gamma', 'openai', 'elevenlabs']
    },
    displayName: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: null
    },
    unit: {
        type: String,
        default: 'credits'
    },
    quotaLimit: {
        type: Number,
        default: null
    },
    lowCreditThreshold: {
        type: Number,
        default: 100
    },
    status: {
        type: String,
        enum: ['healthy', 'low_credits', 'exhausted', 'action_required', 'not_configured'],
        default: 'healthy'
    },
    keyMasked: {
        type: String,
        default: ''
    },
    keyConfigured: {
        type: Boolean,
        default: false
    },
    liveCheckSuccess: {
        type: Boolean,
        default: false
    },
    liveCheckMessage: {
        type: String,
        default: ''
    },
    rechargeUrl: {
        type: String,
        default: ''
    },
    lastCheckedAt: {
        type: Date,
        default: Date.now
    },
    lastRechargedAt: {
        type: Date,
        default: null
    },
    lastSyncSource: {
        type: String,
        enum: ['live_api', 'generation_hook', 'manual_admin', 'initial_seed'],
        default: 'initial_seed'
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

export default mongoose.models.SystemApiBalance || mongoose.model('SystemApiBalance', systemApiBalanceSchema);
