import { CURATED_AVATARS, getHeyGenConfig, getMasterAvatar, heygenFetch } from './heygen.helpers.js';

export const getHeyGenAvatars = async (_req, res) => {
    try {
        const master = await getMasterAvatar();
        const { configured } = getHeyGenConfig();

        let list = [...CURATED_AVATARS];

        if (configured) {
            try {
                const live = await heygenFetch('/v2/avatars');
                const liveAvatars = (live?.data?.avatars || [])
                    .filter((a) => a.preview_video_url && a.avatar_name)
                    .map((a) => ({
                        avatarId: a.avatar_id,
                        avatarName: a.avatar_name,
                        gender: a.gender || 'unknown',
                        previewImageUrl: a.preview_image_url,
                        previewVideoUrl: a.preview_video_url,
                        voiceId: a.default_voice_id || master?.voiceId || '1bd001e7e50f421d891986aad5158bc8',
                    }));

                // Deduplicate with curated list first
                const seen = new Set(list.map((c) => c.avatarId));
                for (const item of liveAvatars) {
                    if (!seen.has(item.avatarId)) {
                        seen.add(item.avatarId);
                        list.push(item);
                    }
                }
            } catch (err) {
                console.warn('HeyGen live avatars fetch warning:', err.message);
            }
        }

        const enriched = list.map((av) => ({
            ...av,
            isSelected: av.avatarId === master?.avatarId,
        }));

        return res.json({
            currentMaster: master,
            avatars: enriched,
        });
    } catch (error) {
        console.error('Error fetching avatars:', error);
        return res.status(500).json({ message: 'Failed to fetch avatars', error: error.message });
    }
};
