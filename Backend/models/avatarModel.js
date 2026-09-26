import mongoose from 'mongoose';

const avatarSchema = new mongoose.Schema(
    {
        avatarId: {
            type: String,
            required: true,
            default: 'Abigail_expressive_2024112501',
        },
        avatarName: {
            type: String,
            required: true,
            default: 'Abigail (Professional Instructor)',
        },
        previewImageUrl: {
            type: String,
            default: 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_target.webp',
        },
        previewVideoUrl: {
            type: String,
            default: 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_video_target.mp4',
        },
        voiceId: {
            type: String,
            default: '1bd001e7e50f421d891986aad5158bc8',
        },
        gender: {
            type: String,
            default: 'female',
        },
        isDefault: {
            type: Boolean,
            default: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

avatarSchema.index({ isDefault: 1 });

const Avatar = mongoose.model('Avatar', avatarSchema);

export default Avatar;
