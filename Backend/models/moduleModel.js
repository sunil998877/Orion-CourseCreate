import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
const moduleItemSchema = new mongoose.Schema({
    moduleId: { type: String, default: () => randomUUID() },
    moduleNumber: { type: Number, required: true },
    Title: { type: String, required: true },
    Objectives: [String],
    TeachingContent: [{
            Topics: String,
            StandardsReference: String,
            ContentPoints: [String]
        }],
    CaseStudy: {
        CaseStudyDescription: String,
        Questions: [String],
        ModelAnswers: [String]
    },
    Quizzes: [{
            QuizDescription: String,
            Questions: [String],
            Answers: [String]
        }],
    VisualDescriptions: [String],
    FurtherStudy: {
        ExternalLinks: [String],
        BookReferences: [String]
    },
    slides: [mongoose.Schema.Types.Mixed],
    gammaUrl: { type: String, default: null },
    status: { type: String, enum: ['idle', 'generating', 'completed', 'failed'], default: 'idle' },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });
const moduleContentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: String, required: true },
    modules: [moduleItemSchema],
    createdAt: { type: Date, default: Date.now }
});
moduleContentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
const ModuleContent = mongoose.model('ModuleContent', moduleContentSchema);
export default ModuleContent;
