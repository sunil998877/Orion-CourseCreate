import { getHeyGenConfig, getMasterAvatar } from './heygen.helpers.js';

export const getHeyGenConfigStatus = async (_req, res) => {
    try {
        const { configured, avatarId, voiceId } = getHeyGenConfig();
        const masterAvatar = await getMasterAvatar();
        return res.json({
            configured: true,
            apiKeyConfigured: configured,
            avatarId: masterAvatar?.avatarId || avatarId,
            voiceId: masterAvatar?.voiceId || voiceId,
            avatar: masterAvatar,
            feature: 'floating_avatar',
            placement: 'top-right',
        });
    } catch (error) {
        console.error('Error fetching heygen config:', error);
        return res.status(500).json({ message: 'Failed to fetch avatar config' });
    }
};
