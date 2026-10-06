import Course from '../../models/courseModel.js';
import { OpenAI } from 'openai';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';
import { buildModuleContentPrompt, buildSlidePrompt, sanitizeModuleContent, slidesNeedBlueprint } from '../../utils/courseForgePrompt.js';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
export const generateModuleDraft = async (req, res) => {
    const { courseId, moduleNumber, courseData: bodyCourse, previousModules, refinePrompt } = req.body;
    if (!Number.isFinite(moduleNumber)) {
        return res.status(400).json({ message: 'moduleNumber is required' });
    }
    try {
        let course = bodyCourse && typeof bodyCourse === 'object'
            ? bodyCourse
            : null;
        if (!course && courseId) {
            const found = await Course.findOne({ userId: req.user.id, courseId: String(courseId) });
            course = found ? { title: found.title, description: found.description, audience: found.audience, level: found.level, industry: found.industry, standards: found.standards || found.country } : null;
        }
        if (!course || !course.title) {
            return res.status(400).json({ message: 'Course info required. Send courseId (with saved course) or courseData (title, description, audience, level, standards).' });
        }
        if (slidesNeedBlueprint(course)) {
            return res.status(409).json({ message: 'Approve the course blueprint before generating slides.' });
        }
        const title = course.title || '';
        const description = course.description || '';
        const audience = course.audience || '';
        const level = course.level || '';
        const industry = course.industry || '';
        const standards = course.standards || course.country || '';
        const courseStyle = course.courseStyle || 'Academic / Formal Style';
        const previousModulesList = Array.isArray(previousModules)
            ? previousModules
                .map((m) => {
                const modNum = Number(m?.moduleNumber);
                const modTitle = String(m?.title || '').trim();
                const lessons = Array.isArray(m?.lessons) ? m.lessons.map((l) => String(l || '').trim()).filter(Boolean) : [];
                const header = `Module ${Number.isFinite(modNum) ? modNum : '?'}`;
                if (!modTitle && lessons.length === 0)
                    return '';
                return `${header}: ${modTitle || '(no title)'}${lessons.length ? ` | Lessons: ${lessons.join(', ')}` : ''}`;
            })
                .filter(Boolean)
            : [];
        const previousModulesText = previousModulesList.length
            ? previousModulesList.join('\n')
            : 'None';
        const refineText = refinePrompt
            ? `\nUSER REFINEMENT REQUEST: ${refinePrompt}\nPLEASE INCORPORATE THESE CHANGES INTO THE MODULE GENERATION.`
            : '';
        const prompt1 = buildModuleContentPrompt({
            title,
            description,
            audience,
            level,
            industry,
            standards,
            courseStyle,
            previousModulesText,
            refineText,
            moduleNumber,
            courseData: course
        });
        const prompt2 = buildSlidePrompt({
            title,
            courseStyle,
            previousModulesText,
            refineText,
            moduleNumber,
            level,
            courseData: course
        });
        const instructions1 = refinePrompt
            ? `Update the module content according to this request: "${refinePrompt}". Return the full module object in the specified JSON format.`
            : 'Return a JSON object with the specified structure.';
        const instructions2 = refinePrompt
            ? `Update the slide content according to this request: "${refinePrompt}". Return the full Slides object in the specified JSON format.`
            : 'Return a JSON object with the specified structure.';
        const resp1 = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt1 + '\n' + instructions1 }],
            response_format: { type: 'json_object' }
        });
        let content = resp1.choices[0].message.content;
        let parsedContent;
        try {
            parsedContent = JSON.parse(content);
        }
        catch (e) {
            const match = (content || '').match(/(\[.*\]|\{.*\})/s);
            if (match)
                parsedContent = JSON.parse(match[0]);
        }
        if (parsedContent && parsedContent.Module && !parsedContent.Title)
            parsedContent = parsedContent.Module;
        if (Array.isArray(parsedContent))
            parsedContent = parsedContent[0] || null;
        parsedContent = sanitizeModuleContent(parsedContent);
        const quizInstructions = '';
        const resp2 = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt2 + quizInstructions + '\n' + instructions2 }],
            response_format: { type: 'json_object' }
        });
        content = parsedContent;
        let slides = resp2.choices[0].message.content;
        try {
            slides = JSON.parse(slides);
        }
        catch (e) {
            const match = (slides || '').match(/(\[.*\]|\{.*\})/s);
            if (match)
                slides = JSON.parse(match[0]);
        }
        if (Array.isArray(slides))
            slides = { Slides: slides };
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
                        Title: `Slide ${i + 1} - Key Concept`,
                        Bullets: ["In-depth topic analysis", "Practical implementation guide", "Core learning takeaway"],
                        Content: "This slide explores critical aspects of the module topic to ensure a comprehensive understanding of the subject matter.",
                        VisualPrompt: "Educational graphic illustrating the key concepts discussed in this section.",
                        Transcript: ''
                    });
                }
            }
            slides.Slides = s.slice(0, 10);
        }
        const slidesOut = {
            Module: `Module ${moduleNumber}`,
            Slides: Array.isArray(slides?.Slides) ? slides.Slides : []
        };
        if (slidesOut.Slides.length < 10) {
            for (let i = slidesOut.Slides.length; i < 10; i++) {
                slidesOut.Slides.push({
                    SlideNumber: i + 1,
                    Title: `Slide ${i + 1} - Summary`,
                    Bullets: ["Key point review", "Actionable step", "Conclusion"],
                    Content: "Summarizing the module content to reinforce learning and provide clear next steps for the course progression.",
                    VisualPrompt: "A summary illustration representing the core message of this module section.",
                    Transcript: ''
                });
            }
        }
        slidesOut.Slides = slidesOut.Slides.slice(0, 10);
        res.json({ content: content || null, slides: slidesOut });
    }
    catch (err) {
        return handleOpenAIError(err, res, 'generate-module-draft');
    }
};
