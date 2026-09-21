import mongoose from 'mongoose';

const ebookGenerationSchema = new mongoose.Schema({
    courseId: { type: String, required: true, index: true },
    courseObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseTitle: { type: String, default: '' },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '', index: true },
    publisherName: { type: String, default: '' },
    ebookUrl: { type: String, default: null },
    status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
    error: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, index: true }
});

const EbookGeneration = mongoose.model('EbookGeneration', ebookGenerationSchema);
export default EbookGeneration;
