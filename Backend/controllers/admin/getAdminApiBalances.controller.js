import {
    getAllApiBalances,
    updateProviderBalanceByAdmin,
    updateProviderApiKey
} from '../../services/systemApiBalanceService.js';

export const getAdminApiBalances = async (req, res) => {
    try {
        const balances = await getAllApiBalances(false);
        return res.status(200).json({
            success: true,
            data: balances
        });
    } catch (error) {
        console.error('[Admin] getAdminApiBalances error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load API balances'
        });
    }
};

export const refreshAdminApiBalances = async (req, res) => {
    try {
        const balances = await getAllApiBalances(true);
        return res.status(200).json({
            success: true,
            message: 'API balances refreshed successfully',
            data: balances
        });
    } catch (error) {
        console.error('[Admin] refreshAdminApiBalances error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to refresh API balances'
        });
    }
};

export const updateAdminApiBalance = async (req, res) => {
    try {
        const { provider, balance, quotaLimit, lowCreditThreshold, notes } = req.body;
        if (!provider) {
            return res.status(400).json({ success: false, message: 'Provider is required' });
        }

        const updated = await updateProviderBalanceByAdmin(provider, {
            balance: typeof balance === 'number' ? balance : undefined,
            quotaLimit: typeof quotaLimit === 'number' ? quotaLimit : undefined,
            lowCreditThreshold: typeof lowCreditThreshold === 'number' ? lowCreditThreshold : undefined,
            notes
        });

        return res.status(200).json({
            success: true,
            message: `Updated balance for ${provider}`,
            data: updated
        });
    } catch (error) {
        console.error('[Admin] updateAdminApiBalance error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update API balance'
        });
    }
};

export const updateAdminApiKey = async (req, res) => {
    try {
        const { provider, apiKey } = req.body;
        if (!provider || !apiKey) {
            return res.status(400).json({ success: false, message: 'Provider and apiKey are required' });
        }

        const updated = await updateProviderApiKey(provider, apiKey);
        return res.status(200).json({
            success: true,
            message: `Updated API key for ${provider}`,
            data: updated
        });
    } catch (error) {
        console.error('[Admin] updateAdminApiKey error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update API key'
        });
    }
};
