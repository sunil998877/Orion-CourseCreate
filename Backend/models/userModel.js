import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,

    },
    avatar: {
        type: String, // data URL (e.g., data:image/png;base64,...)
        default: ''
    },
    organisation: {
        type: String,

    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    hasCourse: {
        type: Boolean,
        default: false
    },
    courseData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    resetPasswordToken: {
        type: String,
        default: ''
    },
    resetPasswordExpires: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationOTP: {
        type: String,
        default: ''
    },
    verificationOTPExpires: {
        type: Date
    },
    notifications: [{
        title: { type: String, required: true },
        message: { type: String, required: false },
        type: { type: String, enum: ['success', 'info', 'warning', 'error'], default: 'info' },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    activeSessionId: {
        type: String,
        default: null
    },
    lastLoginAt: {
        type: Date
    },
    lastLoginDevice: {
        type: String
    },
    lastLoginIP: {
        type: String
    }
});

const User = mongoose.model('User', userSchema);

export default User;
