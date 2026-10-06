import Course from '../../models/courseModel.js';
import User from '../../models/userModel.js';
import { OpenAI } from 'openai';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';
import { buildModuleContentPrompt, buildSlidePrompt, sanitizeModuleContent, slidesNeedBlueprint } from '../../utils/courseForgePrompt.js';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
const addNotification = async (userId, title, message, type = 'info') => {
    try {
        const notification = { title, message, type, isRead: false, createdAt: new Date() };
        await User.findByIdAndUpdate(userId, { $push: { notifications: notification } });
    }
    catch (err) {
        console.error('Failed to add notification:', err);
    }
};
export const generateSingleModule = async (req, res) => {
    const { courseId, moduleNumber, refinePrompt } = req.body;
    if (!courseId || !Number.isFinite(moduleNumber)) {
        return res.status(400).json({ message: 'courseId and moduleNumber are required' });
    }
    try {
        const course = await Course.findOne({ userId: req.user.id, courseId: String(courseId) });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (slidesNeedBlueprint(course)) {
            return res.status(409).json({ message: 'Approve the course blueprint before generating slides.' });
        }
        if (!course.modules)
            course.modules = [];
        const idx = course.modules.findIndex(m => Number(m.moduleNumber) === Number(moduleNumber));
        if (idx >= 0) {
            course.modules[idx].status = 'generating';
        }
        else {
            course.modules.push({
                moduleNumber: Number(moduleNumber),
                Title: `Module ${moduleNumber}`,
                status: 'generating'
            });
        }
        course.modules.sort((a, b) => Number(a.moduleNumber) - Number(b.moduleNumber));
        await course.save();
        res.json({ message: 'Generation started', status: 'generating' });
        (async () => {
            try {
                console.log(`Starting background generation for Course ${courseId} Module ${moduleNumber}`);
                const existingModules = Array.isArray(course.modules) ? course.modules : [];
                const previousModulesText = existingModules
                    .filter(m => Number(m.moduleNumber) !== Number(moduleNumber))
                    .map(m => {
                    const topics = Array.isArray(m.TeachingContent)
                        ? m.TeachingContent.map(t => String(t?.Topics || '').trim()).filter(Boolean)
                        : [];
                    return `Module ${m.moduleNumber}: ${String(m.Title || '').trim()}${topics.length ? ` | Topics: ${topics.join(', ')}` : ''}`;
                })
                    .filter(Boolean)
                    .join('\n') || 'None';
                const refineText = refinePrompt
                    ? `\nUSER REFINEMENT REQUEST: ${refinePrompt}\nPLEASE INCORPORATE THESE CHANGES INTO THE MODULE GENERATION.`
                    : '';
                const prompt1 = buildModuleContentPrompt({
                    title: course.title,
                    description: course.description,
                    audience: course.audience,
                    level: course.level,
                    industry: course.industry,
                    standards: course.standards || course.country,
                    courseStyle: course.courseStyle || 'Academic / Formal Style',
                    previousModulesText,
                    refineText,
                    moduleNumber,
                    courseData: course
                });
                const prompt2 = buildSlidePrompt({
                    title: course.title,
                    courseStyle: course.courseStyle || 'Academic / Formal Style',
                    previousModulesText,
                    refineText,
                    moduleNumber,
                    level: course.level,
                    courseData: course
                });
                const instructions1 = refinePrompt
                    ? `Update the module content according to this request: "${refinePrompt}". Return the full module object in the specified JSON format.`
                    : 'Return a JSON object with the specified structure.';
                const instructions2 = refinePrompt
                    ? `Update the slide content according to this request: "${refinePrompt}". Return the full Slides object in the specified JSON format.`
                    : 'Return a JSON object with the specified structure.';
                const [resp1, resp2] = await Promise.all([
                    openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: [{ role: 'user', content: prompt1 + '\n' + instructions1 }],
                        response_format: { type: "json_object" }
                    }),
                    openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: [{ role: 'user', content: prompt2 + '\n' + instructions2 }],
                        response_format: { type: "json_object" }
                    })
                ]);
                let content = resp1.choices[0].message.content;
                let slides = resp2.choices[0].message.content;
                try {
                    content = JSON.parse(content);
                }
                catch (e) {
                    const match = content.match(/(\[.*\]|\{.*\})/s);
                    if (match)
                        content = JSON.parse(match[0]);
                }
                if (content && content.Module && !content.Title) {
                    content = content.Module;
                }
                try {
                    slides = JSON.parse(slides);
                }
                catch (e) {
                    const match = slides.match(/(\[.*\]|\{.*\})/s);
                    if (match)
                        slides = JSON.parse(match[0]);
                }
                if (Array.isArray(slides)) {
                    slides = { Slides: slides };
                }
                if (slides && Array.isArray(slides.Slides)) {
                    let s = slides.Slides.map((sl, idx) => ({
                        SlideNumber: Number(sl.SlideNumber ?? idx + 1),
                        Title: String(sl.Title ?? sl.title ?? `Slide ${idx + 1}`),
                        Bullets: Array.isArray(sl.Bullets) ? sl.Bullets : Array.isArray(sl.BulletPoints) ? sl.BulletPoints : [],
                        Content: typeof sl.Content === 'string' ? sl.Content : '',
                        VisualPrompt: typeof sl.VisualPrompt === 'string' ? sl.VisualPrompt : '',
                        Transcript: ''
                    }));
                    if (s.length < 10) {
                        for (let i = s.length; i < 10; i++) {
                            s.push({
                                SlideNumber: i + 1,
                                Title: `Slide ${i + 1} - Topic Deep Dive`,
                                Bullets: ["Key concept reinforcement", "Detailed analysis point", "Practical application example"],
                                Content: "This slide provides further detail and practical context for the module topics, ensuring a comprehensive understanding of the core learning objectives.",
                                VisualPrompt: "Educational infographic or diagram showing the relationship between module concepts.",
                                Transcript: ''
                            });
                        }
                    }
                    slides.Slides = s.slice(0, 10);
                }
                if (Array.isArray(content)) {
                    content = content[0] || null;
                }
                if (!content || typeof content !== 'object') {
                    content = {
                        Title: `Module ${moduleNumber}`,
                        Objectives: [],
                        TeachingContent: [],
                        CaseStudy: { CaseStudyDescription: "", Questions: [], ModelAnswers: [] },
                        Quizzes: [],
                        VisualDescriptions: [],
                        FurtherStudy: { ExternalLinks: [], BookReferences: [] }
                    };
                }
                const finalCourse = await Course.findOne({ userId: req.user.id, courseId: String(courseId) });
                if (!finalCourse)
                    return;
                const finalIdx = finalCourse.modules.findIndex(m => Number(m.moduleNumber) === Number(moduleNumber));
                if (finalIdx === -1)
                    return;
                const mod = finalCourse.modules[finalIdx];
                content = sanitizeModuleContent(content);
                if (content) {
                    mod.Title = content.Title || content.title || `Module ${moduleNumber}`;
                    mod.Objectives = content.Objectives || content.objectives || [];
                    mod.TeachingContent = content.TeachingContent || content.teachingContent || [];
                    mod.CaseStudy = content.CaseStudy || content.caseStudy || { CaseStudyDescription: "", Questions: [], ModelAnswers: [] };
                    mod.Quizzes = content.Quizzes || content.quizzes || [];
                    mod.VisualDescriptions = content.VisualDescriptions || content.visualDescriptions || [];
                    mod.FurtherStudy = content.FurtherStudy || content.furtherStudy || { ExternalLinks: [], BookReferences: [] };
                }
                const slidesObj = {
                    Module: `Module ${moduleNumber}`,
                    Slides: Array.isArray(slides?.Slides) ? slides.Slides : []
                };
                if (!Array.isArray(slidesObj.Slides)) {
                    slidesObj.Slides = [];
                }
                if (slidesObj.Slides.length < 10) {
                    for (let i = slidesObj.Slides.length; i < 10; i++) {
                        slidesObj.Slides.push({
                            SlideNumber: i + 1,
                            Title: `Slide ${i + 1} - Key Takeaway`,
                            Bullets: ["Important module concept", "Practical implementation step", "Final review point"],
                            Content: "Reviewing the critical components of this module section to solidify the learner's understanding and prepare for the next phase of the course.",
                            VisualPrompt: "A summary graphic or conceptual illustration representing the module's key learning outcomes.",
                            Transcript: ''
                        });
                    }
                }
                slidesObj.Slides = slidesObj.Slides.slice(0, 10);
                await Course.updateOne({
                    userId: req.user.id,
                    courseId: String(courseId),
                    "modules.moduleNumber": Number(moduleNumber)
                }, {
                    $set: {
                        "modules.$.Title": mod.Title,
                        "modules.$.Objectives": mod.Objectives,
                        "modules.$.TeachingContent": mod.TeachingContent,
                        "modules.$.CaseStudy": mod.CaseStudy,
                        "modules.$.Quizzes": mod.Quizzes,
                        "modules.$.VisualDescriptions": mod.VisualDescriptions,
                        "modules.$.FurtherStudy": mod.FurtherStudy,
                        "modules.$.slides": slidesObj,
                        "modules.$.status": "completed"
                    }
                });
                await addNotification(req.user.id, 'Module Ready', `Module ${moduleNumber} content has been generated.`, 'success');
            }
            catch (err) {
                console.error(`Background generation failed for Course ${courseId} Module ${moduleNumber}:`, err);
                const failCourse = await Course.findOne({ userId: req.user.id, courseId: String(courseId) });
                if (failCourse) {
                    const failIdx = failCourse.modules.findIndex(m => Number(m.moduleNumber) === Number(moduleNumber));
                    if (failIdx >= 0) {
                        failCourse.modules[failIdx].status = 'failed';
                        await failCourse.save();
                    }
                }
                await addNotification(req.user.id, 'Generation Failed', `Failed to generate Module ${moduleNumber}. Please try again.`, 'error');
            }
        })();
    }
    catch (error) {
        return handleOpenAIError(error, res, 'generate-single-module');
    }
};
