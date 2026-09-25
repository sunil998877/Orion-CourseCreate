import { getHeyGenConfig } from './heygen.helpers.js';

export const getHeyGenConfigStatus = async (_req, res) => {
    const { configured, avatarId } = getHeyGenConfig();
    return res.json({
        configured,
        avatarId: configured ? avatarId : null,
        feature: 'floating_avatar',
        placement: 'bottom-right',
    });
};
