import Course from '../../models/courseModel.js';
import { randomUUID } from 'crypto';

export const saveModuleContents = async (req, res) => {
  try {
    const { courseId, moduleNumber, content, slides, gammaUrl, gammaGenerationId } = req.body || {};
    if (!courseId || !Number.isFinite(moduleNumber)) {
      return res.status(400).json({ message: 'courseId and valid moduleNumber are required' });
    }

    const normalizeModuleContent = (input, modNum) => {
      if (!input || typeof input !== 'object') return null;
      const Title = String(input.Title ?? input.title ?? `Module ${modNum}`).trim();
      const Objectives = Array.isArray(input.Objectives)
        ? input.Objectives
        : Array.isArray(input.objectives)
          ? input.objectives
          : [];
      const tcRaw = Array.isArray(input.TeachingContent)
        ? input.TeachingContent
        : Array.isArray(input.teachingContent)
          ? input.teachingContent
          : [];
      const TeachingContent = tcRaw.map(tc => ({
        Topics: String((tc && (tc.Topics ?? tc.title)) || '').trim(),
        StandardsReference: String((tc && (tc.StandardsReference ?? tc.standard)) || 'AI Generated').trim(),
        ContentPoints: Array.isArray(tc && tc.ContentPoints)
          ? tc.ContentPoints
          : Array.isArray(tc && tc.points)
            ? tc.points
            : tc && tc.description
              ? [String(tc.description)]
              : []
      })).filter(t => t.Topics || (t.ContentPoints && t.ContentPoints.length));
      const csSrc = input.CaseStudy ?? input.caseStudy ?? {};
      const csQs = Array.isArray(csSrc.Questions) ? csSrc.Questions : Array.isArray(csSrc.questions) ? csSrc.questions : [];
      const CaseStudy = {
        CaseStudyDescription: String(csSrc.CaseStudyDescription ?? csSrc.description ?? csSrc.title ?? '').trim(),
        Questions: csQs.map(q => (typeof q === 'string' ? q : String((q && q.question) || ''))).filter(Boolean),
        ModelAnswers: Array.isArray(csSrc.ModelAnswers)
          ? csSrc.ModelAnswers
          : csQs.map(q => (typeof q === 'string' ? '' : String((q && q.modelAnswer) || '')))
      };
      const qzRaw = Array.isArray(input.Quizzes)
        ? input.Quizzes
        : Array.isArray(input.quizzes)
          ? input.quizzes
          : [];
      const Quizzes = qzRaw.map(qz => {
        const qs = Array.isArray(qz.Questions) ? qz.Questions : Array.isArray(qz.questions) ? qz.questions : [];
        const questions = qs.map(q => (typeof q === 'string' ? q : String((q && q.question) || ''))).filter(Boolean);
        const answers = Array.isArray(qz.Answers) ? qz.Answers : qs.map(q => (typeof q === 'string' ? '' : String((q && q.answer) || '')));
        return {
          QuizDescription: String(qz.QuizDescription ?? qz.title ?? 'Module Quiz'),
          Questions: questions,
          Answers: answers
        };
      }).filter(q => q.Questions.length);
      const vdRaw = Array.isArray(input.VisualDescriptions)
        ? input.VisualDescriptions
        : Array.isArray(input.visualDescriptions)
          ? input.visualDescriptions
          : [];
      const VisualDescriptions = vdRaw
        .map(v => (typeof v === 'string' ? v : String((v && (v.description ?? v.title ?? v.link)) || '')))
        .filter(Boolean);
      const fsSrc = input.FurtherStudy ?? input.furtherStudy ?? {};
      const extRaw = Array.isArray(fsSrc.ExternalLinks) ? fsSrc.ExternalLinks : Array.isArray(fsSrc.externalLinks) ? fsSrc.externalLinks : [];
      const bookRaw = Array.isArray(fsSrc.BookReferences) ? fsSrc.BookReferences : Array.isArray(fsSrc.bookReferences) ? fsSrc.bookReferences : [];
      const FurtherStudy = {
        ExternalLinks: extRaw.map(e => (typeof e === 'string' ? e : String((e && e.url) || ''))).filter(Boolean),
        BookReferences: bookRaw.map(b => {
          if (typeof b === 'string') return b;
          const parts = [b && b.title, b && b.author, b && b.publisher, b && b.year].filter(Boolean);
          return parts.join(' - ');
        }).filter(Boolean)
      };
      return { Title, Objectives, TeachingContent, CaseStudy, Quizzes, VisualDescriptions, FurtherStudy };
    };

    let normalizedSlides =
      Array.isArray(slides?.Slides) ? slides.Slides :
        Array.isArray(slides?.slides) ? slides.slides :
          Array.isArray(slides) ? slides :
            [];

    if (normalizedSlides.length > 0 && normalizedSlides.length < 10) {
      for (let i = normalizedSlides.length; i < 10; i++) {
        normalizedSlides.push({
          SlideNumber: i + 1,
          Title: `Slide ${i + 1} - Concept Continuation`,
          Bullets: ["Additional learning point", "Contextual detail", "Practical summary"],
          Content: "Continuing the exploration of module topics to provide a thorough understanding and practical application of the concepts.",
          VisualPrompt: "Educational graphic or illustration supporting the module content."
        });
      }
    } else if (normalizedSlides.length === 0) {
      normalizedSlides = Array.from({ length: 10 }, (_, i) => ({
        SlideNumber: i + 1,
        Title: `Slide ${i + 1}`,
        Bullets: ["Key topic point"],
        Content: "Content for this slide is being prepared to support the learning objectives.",
        VisualPrompt: "Educational illustration."
      }));
    }
    normalizedSlides = normalizedSlides.slice(0, 10);

    const title = content?.Title || `Module ${moduleNumber}`;
    const normalizedContent = normalizeModuleContent(content || {}, moduleNumber);

    const newModule = {
      moduleId: randomUUID(),
      moduleNumber: Number(moduleNumber),
      Title: String((normalizedContent && normalizedContent.Title) || title),
      Objectives: (normalizedContent && normalizedContent.Objectives) || [],
      TeachingContent: (normalizedContent && normalizedContent.TeachingContent) || [],
      CaseStudy: (normalizedContent && normalizedContent.CaseStudy) || {},
      Quizzes: (normalizedContent && normalizedContent.Quizzes) || [],
      VisualDescriptions: (normalizedContent && normalizedContent.VisualDescriptions) || [],
      FurtherStudy: (normalizedContent && normalizedContent.FurtherStudy) || {},

      slides: normalizedSlides,
      gammaUrl: typeof gammaUrl === 'string' && gammaUrl.trim().length > 0 ? gammaUrl.trim() : null,
      gammaGenerationId: typeof gammaGenerationId === 'string' && gammaGenerationId.trim().length > 0 ? gammaGenerationId.trim() : null,
      status: 'completed'
    };

    const course = await Course.findOne({ userId: req.user?.id, courseId: String(courseId) });
    if (!course) {
      const created = new Course({
        userId: req.user?.id,
        courseId: String(courseId),
        title: '',
        description: '',
        audience: '',
        type: '',
        moduleCount: Number(moduleNumber) || 0,
        level: '',
        duration: { value: 0, unit: 'hours' },
        country: '',
        industry: '',
        standards: '',
        modules: []
      });
      await created.save();
    }
    const fresh = await Course.findOne({ userId: req.user?.id, courseId: String(courseId) });
    if (!fresh) return res.status(404).json({ message: 'Course not found' });
    if (!fresh.modules) fresh.modules = [];
    const idx = fresh.modules.findIndex(m => Number(m.moduleNumber) === Number(moduleNumber));
    if (idx >= 0) {
      const existing = fresh.modules[idx];
      const existingObj = existing.toObject?.() || existing;
      fresh.modules[idx] = {
        ...existingObj,
        ...newModule,
        moduleId: existing.moduleId,
        gammaUrl: newModule.gammaUrl || existingObj.gammaUrl || null,
        gammaGenerationId: newModule.gammaGenerationId || existingObj.gammaGenerationId || null
      };
      fresh.modules.sort((a, b) => Number(a.moduleNumber) - Number(b.moduleNumber));
      await fresh.save();
      return res.json({ saved: true, upsert: 'updated', module: fresh.modules.find(m => Number(m.moduleNumber) === Number(moduleNumber)) });
    } else {
      fresh.modules.push(newModule);
      fresh.modules.sort((a, b) => Number(a.moduleNumber) - Number(b.moduleNumber));
      await fresh.save();
      return res.json({ saved: true, upsert: 'created', module: newModule });
    }
  } catch (error) {
    console.error('Error saving module contents:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};
