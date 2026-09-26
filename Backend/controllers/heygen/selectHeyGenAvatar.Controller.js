import { CURATED_AVATARS, saveMasterAvatar } from './heygen.helpers.js';
import Course from '../../models/courseModel.js';

export const selectHeyGenAvatar = async (req, res) => {
    try {
        const { avatarId, avatarName, previewImageUrl, previewVideoUrl, voiceId } = req.body || {};
        if (!avatarId) {
            return res.status(400).json({ message: 'avatarId is required' });
        }

        const fallback = CURATED_AVATARS.find((a) => a.avatarId === avatarId);

        const dataToSave = {
            avatarId,
            avatarName: avatarName || fallback?.avatarName || 'Master Course Avatar',
            previewImageUrl: previewImageUrl || fallback?.previewImageUrl,
            previewVideoUrl: previewVideoUrl || fallback?.previewVideoUrl,
            voiceId: voiceId || fallback?.voiceId,
        };

        const saved = await saveMasterAvatar(dataToSave);

        // Optionally synchronize courses for this user to immediately point to this master avatar
        if (req.user?.id) {
            await Course.updateMany(
                { userId: req.user.id },
                {
                    avatarId: saved.avatarId,
                    avatarName: saved.avatarName,
                    avatarImageUrl: saved.previewImageUrl,
                    avatarVideoUrl: saved.previewVideoUrl,
                }
            );
        }

        return res.json({
            message: 'Master avatar updated successfully for all courses',
            masterAvatar: saved,
        });
    } catch (error) {
        console.error('Error selecting master avatar:', error);
        return res.status(500).json({ message: 'Failed to save master avatar', error: error.message });
    }
};
