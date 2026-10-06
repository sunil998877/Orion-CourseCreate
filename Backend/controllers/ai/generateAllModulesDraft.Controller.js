import { OpenAI } from 'openai';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';
import { buildModuleContentPrompt, buildSlidePrompt, sanitizeModuleContent, slidesNeedBlueprint } from '../../utils/courseForgePrompt.js';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });

const readJson = (raw) => {
    try {
        return JSON.parse(raw);
    }
    catch {
        const match = String(raw || '').match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (!match)
            return null;
        return JSON.parse(match[0]);
    }
};

const padSlides = (slidesObj) => {
    if (!slidesObj || typeof slidesObj !== 'object')
        slidesObj = { Slides: [] };
    if (slidesObj.Module && !slidesObj.Slides)
        slidesObj = slidesObj.Module;
    if (Array.isArray(slidesObj))
        slidesObj = { Slides: slidesObj };
    if (!Array.isArray(slidesObj.Slides))
        slidesObj.Slides = [];
    slidesObj.Slides = slidesObj.Slides.map((slide, index) => ({
        ...slide,
        SlideNumber: Number(slide.SlideNumber ?? index + 1),
        Title: String(slide.Title ?? slide.title ?? `Slide ${index + 1}`),
        Bullets: Array.isArray(slide.Bullets) ? slide.Bullets : [],
        Content: typeof slide.Content === 'string' ? slide.Content : '',
        VisualPrompt: typeof slide.VisualPrompt === 'string' ? slide.VisualPrompt : '',
        Transcript: ''
    }));
    if (slidesObj.Slides.length < 10) {
        for (let i = slidesObj.Slides.length; i < 10; i++) {
            slidesObj.Slides.push({
                SlideNumber: i + 1,
                Title: `The next decision in module ${i + 1} still needs a source`,
                Bullets: ['State the decision', 'Name the evidence', 'Mark anything unverified'],
                Content: 'This placeholder keeps the slide count until the approved outline is complete.',
                VisualPrompt: 'A simple decision card with one claim and one evidence line.',
                Transcript: ''
            });
        }
    }
    slidesObj.Slides = slidesObj.Slides.slice(0, 10);
    return slidesObj;
};

export const generateAllModulesDraft = async (req, res) => {
    const { modules } = req.body;
    if (!Array.isArray(modules) || modules.length === 0) {
        return res.status(400).json({ message: 'modules array is required' });
    }
    if (modules.some((mod) => slidesNeedBlueprint(mod.courseData))) {
        return res.status(409).json({ message: 'Approve the course blueprint before generating slides.' });
    }
    const CONCURRENCY_LIMIT = 5;
    const results = [];
    const errors = [];
    try {
        const processModule = async (modData) => {
            const { moduleNumber, courseData, previousModules, themeId } = modData;
            try {
                const courseStyle = courseData?.courseStyle || 'Academic / Formal Style';
                const previousModulesList = Array.isArray(previousModules)
                    ? previousModules.map((m) => {
                        const modNum = Number(m?.moduleNumber);
                        const modTitle = String(m?.title || '').trim();
                        const lessons = Array.isArray(m?.lessons) ? m.lessons.map((l) => String(l || '').trim()).filter(Boolean) : [];
                        const header = `Module ${Number.isFinite(modNum) ? modNum : '?'}`;
                        if (!modTitle && lessons.length === 0)
                            return '';
                        return `${header}: ${modTitle || '(no title)'}${lessons.length ? ` | Lessons: ${lessons.join(', ')}` : ''}`;
                    }).filter(Boolean)
                    : [];
                const previousModulesText = previousModulesList.length ? previousModulesList.join('\n') : 'None';
                const prompt1 = buildModuleContentPrompt({
                    title: courseData?.title || '',
                    description: courseData?.description || '',
                    audience: courseData?.audience || '',
                    level: courseData?.level || '',
                    industry: courseData?.industry || '',
                    standards: courseData?.standards || '',
                    courseStyle,
                    previousModulesText,
                    refineText: '',
                    moduleNumber,
                    courseData
                });
                const prompt2 = buildSlidePrompt({
                    title: courseData?.title || '',
                    courseStyle,
                    previousModulesText,
                    refineText: '',
                    moduleNumber,
                    level: courseData?.level || '',
                    courseData
                });
                const [resp1, resp2] = await Promise.all([
                    openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: [{ role: 'user', content: prompt1 }],
                        response_format: { type: 'json_object' }
                    }),
                    openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: [{ role: 'user', content: prompt2 }],
                        response_format: { type: 'json_object' }
                    })
                ]);
                const content = sanitizeModuleContent(readJson(resp1.choices[0].message.content));
                const slides = padSlides(readJson(resp2.choices[0].message.content));
                return {
                    moduleNumber,
                    themeId: themeId || 'aurora',
                    content: content || null,
                    slides
                };
            }
            catch (err) {
                const isAuthError = err.status === 401 || err.code === 'invalid_api_key' || err.status === 429;
                if (isAuthError)
                    throw err;
                console.error(`Error generating module ${moduleNumber}:`, err.message);
                errors.push({ moduleNumber, error: err instanceof Error ? err.message : 'Generation failed' });
                return { moduleNumber, themeId: themeId || 'aurora', content: null, slides: { Slides: [] }, error: true };
            }
        };
        for (let i = 0; i < modules.length; i += CONCURRENCY_LIMIT) {
            const batch = modules.slice(i, i + CONCURRENCY_LIMIT);
            const batchResults = await Promise.all(batch.map((mod) => processModule(mod)));
            results.push(...batchResults);
        }
        res.json({
            modules: results.filter(r => !r.error),
            errors: errors.length > 0 ? errors : undefined,
            total: modules.length,
            completed: results.filter(r => !r.error).length,
            failed: errors.length
        });
    }
    catch (err) {
        return handleOpenAIError(err, res, 'generate-all-modules-draft');
    }
};
