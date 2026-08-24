import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const moduleSchema = new mongoose.Schema({
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
  gammaGenerationId: { type: String, default: null },
  status: { type: String, enum: ['idle', 'generating', 'completed', 'failed'], default: 'idle' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  audience: { type: String, default: '' },
  type: { type: String, default: '' },
  moduleCount: { type: Number, default: 0 },
  level: { type: String, default: '' },
  duration: {
    value: { type: Number, default: 0 },
    unit: { type: String, default: 'hours' }
  },
  country: { type: String, default: '' },
  industry: { type: String, default: '' },
  standards: { type: String, default: '' },
  courseStyle: { type: String, default: 'Academic / Formal Style' },
  audioUrl: { type: String, default: null },
  audioTranscript: { type: String, default: null },
  ebookUrl: { type: String, default: null },
  ebookTranscript: { type: String, default: null },
  ebookData: { type: String, default: null },
  ebookStatus: { type: String, enum: ['idle', 'generating', 'completed', 'failed'], default: 'idle' },

  podcastUrl: { type: String, default: null },
  podcastTranscript: { type: String, default: null },
  podcastScript: [mongoose.Schema.Types.Mixed],
  podcastStatus: { type: String, enum: ['idle', 'generating', 'completed', 'failed'], default: 'idle' },
  modules: [moduleSchema],
  createdAt: { type: Date, default: Date.now }
});

courseSchema.index({ userId: 1, courseId: 1 }, { unique: true });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ userId: 1, createdAt: -1 });

courseSchema.set('toJSON', { virtuals: true });
courseSchema.virtual('module')
  .get(function () { return this.moduleCount; })
  .set(function (v) { this.moduleCount = v; });

const Course = mongoose.model('Course', courseSchema);

export default Course;
