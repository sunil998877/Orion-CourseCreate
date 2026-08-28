import { OpenAI } from 'openai';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
export const generateAllModulesDraft = async (req, res) => {
    const { modules } = req.body;
    if (!Array.isArray(modules) || modules.length === 0) {
        return res.status(400).json({ message: 'modules array is required' });
    }
    const CONCURRENCY_LIMIT = 5;
    const results = [];
    const errors = [];
    try {
        if (modules.length > 0) {
            console.log("[DEBUG] Generating Modules for Topic:", modules[0].courseData?.title);
            console.log("[DEBUG] Description provided:", modules[0].courseData?.description?.substring(0, 100) + "...");
        }
        const processModule = async (modData, index) => {
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
                const prompt1 = `
You are an expert curriculum designer.

Course Title: ${courseData?.title || ''}
Course Description: ${courseData?.description || ''}
Target Audience: ${courseData?.audience || ''}
Course Level: ${courseData?.level || ''}
Industry Context: ${courseData?.industry || ''}
Country/Standards Context: ${courseData?.standards || ''} (MANDATORY: If a specific standard like DPDP, GDPR, or HIPAA is provided, you MUST focus exclusively on that standard. Ignore all other generic standards like ISO/IEC unless explicitly requested.)
Course Style / Tone: ${courseStyle} (Ensure the module output, teaching context, case studies, and quiz questions deeply reflect this specific style. e.g. for storytelling use narrative flow, for scenario-based use fictional characters/scenarios throughout the content)
Previously generated modules (must not be repeated):
${previousModulesText}

Create comprehensive module content for Module ${moduleNumber}.

Return EXACTLY in this JSON format:
{
  "Title": "Module Title",
  "Objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "TeachingContent": [
    {
      "Topics": "Topic Title",
      "StandardsReference": "Relevant Standard",
      "ContentPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "CaseStudy": {
    "CaseStudyDescription": "Case study description",
    "Questions": ["Question 1", "Question 2"],
    "ModelAnswers": ["Answer 1", "Answer 2"]
  },
  "Quizzes": [
    {
      "QuizDescription": "Quiz Title",
      "Questions": ["Question 1", "Question 2"],
      "Answers": ["Answer 1", "Answer 2"]
    }
  ],
  "VisualDescriptions": ["Visual 1", "Visual 2"],
  "FurtherStudy": {
    "ExternalLinks": ["https://link1.com"],
    "BookReferences": ["Book 1"]
  }
}

Rules:
- Content MUST strictly relate to the course topic
- The "Title" field MUST ONLY contain the topic name. Do NOT include "Module X:" or "Chapter X:" in the title (the system already handles module numbering).
- Module ${moduleNumber} should logically follow previous modules
- This module MUST focus on a distinct sub-topic that is NOT already covered in previous modules.
- Title, Objectives, TeachingContent topics, case study, quiz and visuals MUST be different from previous modules.
- For Digital Marketing specifically, progression should be from fundamentals -> channel strategy -> execution -> analytics -> optimization (or equivalent non-overlapping sequence).
- Each module MUST be designed for exactly 10-15 minutes of direct instructional content. Ensure the depth of teaching points and case studies reflects this duration.
- Do NOT include text outside JSON
`;
                const prompt2 = `
Create slides for Module ${moduleNumber} of the course "${courseData?.title || 'Your Course'}".
Course Style / Tone: ${courseStyle} (Ensure the slides and their voiceover transcript text rigidly adhere to this style. If scenario-based, introduce characters in the visuals/transcript. If storytelling, write a narrative transcript. If academic, remain formal.)
Previously generated modules (must not be repeated):
${previousModulesText}
Return EXACTLY this JSON:
{
  "Slides": [
    { "SlideNumber": 1, "Title": "", "Bullets": ["", ""], "Content": "", "VisualPrompt": "", "Transcript": "" },
    { "SlideNumber": 2, "Title": "", "Bullets": ["", ""], "Content": "", "VisualPrompt": "", "Transcript": "" },
    { "SlideNumber": 3, "Title": "", "Bullets": ["", ""], "Content": "", "VisualPrompt": "", "Transcript": "" },
    { "SlideNumber": 4, "Title": "", "Bullets": ["", ""], "Content": "", "VisualPrompt": "", "Transcript": "" },
    { "SlideNumber": 5, "Title": "", "Bullets": ["", ""], "Content": "", "VisualPrompt": "", "Transcript": "" },
    { "SlideNumber": 6, "Title": "", "Bullets": ["", ""], "Content": "", "VisualPrompt": "", "Transcript": "" },
    { "SlideNumber": 7, "Title": "", "Bullets": ["", ""], "Content": "", "VisualPrompt": "", "Transcript": "" },
    { "SlideNumber": 8, "Title": "", "Bullets": ["", ""], "Content": "", "VisualPrompt": "", "Transcript": "" },
    { "SlideNumber": 9, "Title": "", "Bullets": ["", ""], "Content": "", "VisualPrompt": "", "Transcript": "" },
    { "SlideNumber": 10, "Title": "", "Bullets": ["", ""], "Content": "", "VisualPrompt": "", "Transcript": "" }
  ]
}
Requirements:
- Produce EXACTLY 10 slides numbered 1 to 10.
- Each slide MUST include Title, Bullets (3-6 items), Content (short paragraph), VisualPrompt (clear visual description), and Transcript.
- TRANSCRIPT RULES — CRITICAL (this text is fed directly to a professional TTS engine for a commercial-grade voicebook):

  CHARACTER LENGTH — transcripts MUST follow these EXACT character count targets based on the slide's topic. You MUST automatically read and evaluate the topic to determine the length. Do NOT write the same length for every slide:
    • Introductions, Conclusions, or Transitional Slides: 600–900 characters. Keep it punchy and energetic. Set the scene, build anticipation, or summarize reflectively with emotional resonance.
    • Core Concepts, Deep Dives, and Complex Topics (Slides requiring more explanation): 1800–2500+ characters EACH. This is mandatory for professional educational depth. Do NOT be brief. Write as if this is the core of a best-selling audiobook. Fully explain the concept, provide multiple layered examples, walk through complex implications, and use analogies that simplify the abstract.
    • Case Studies or Scenarios: 1500–2000 characters. Present the scenario in detail, introduce characters, walk through it step-by-step, and draw the lesson clearly.
    • Quiz / Knowledge Check: 500–800 characters. Read the question, list options with a pause cue ("..."), reveal and provide a deep explanation for the answer.

  CHARACTER-DRIVEN NARRATION (CRITICAL):
    • Every script MUST feature a character or persona (e.g., an expert mentor, a relatable learner like 'Alex', or a professional advisor).
    • The narration must feel like a "journey" or a "consultancy session", not a textbook reading.
    • Even for formal styles, use a "Professional Advisor" persona who shares insights and real-world wisdom.
    • Incorporate the character's perspective into every slide's transcript to maintain engagement and continuity.

  STYLE:
    • Write NATURAL SPOKEN PROSE only — no bullet reading, no numbered lists, no headers, no markdown.
    • Vary sentence length deliberately: short punchy sentences for emphasis, longer flowing ones for explanation.
    • Use smooth spoken transitions BETWEEN sentences: (e.g. "Think about it this way...", "Here's what makes this so powerful...", "Let's bring this to life with a real example...", "Building on that idea...", "Now, this is where most people miss the point...").
    • Never start two consecutive slides with the same opening word or phrase.
    • Tone MUST match the Course Style: ${courseStyle}.
      - Academic/Formal: authoritative yet conversational advisor, evidence-grounded, no slang.
      - Storytelling: immersive narrative, vivid language, emotional beats, character-led.
      - Scenario-based: a named character drives the narration — every concept is a plot moment in their journey.
    • No slide numbers, no labels like "In this slide" or "As shown here" in the Transcript text.

- Use professional, educational language appropriate for ${courseData?.level || 'intermediate'} learners.
- Stay strictly on the topic of Module ${moduleNumber}.
- Every slide title and bullet set MUST be different from previous modules.
- Avoid generic repeated structures like "Introduction/Fundamentals/Overview" if already used in prior modules.
- Do NOT include any text outside the JSON object.
`;
                const [resp1, resp2] = await Promise.all([
                    openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: [{ role: 'user', content: prompt1 + '\nReturn a JSON object with the specified structure.' }],
                        response_format: { type: 'json_object' }
                    }),
                    openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: [{ role: 'user', content: prompt2 + '\nReturn a JSON object with the specified structure.' }],
                        response_format: { type: 'json_object' }
                    })
                ]);
                let content = resp1.choices[0].message.content;
                let slides = resp2.choices[0].message.content;
                try {
                    content = JSON.parse(content);
                }
                catch (e) {
                    const match = (content || '').match(/(\[.*\]|\{.*\})/s);
                    if (match)
                        content = JSON.parse(match[0]);
                }
                try {
                    slides = JSON.parse(slides);
                }
                catch (e) {
                    const match = (slides || '').match(/(\[.*\]|\{.*\})/s);
                    if (match)
                        slides = JSON.parse(match[0]);
                }
                if (slides && slides.Module && !slides.Slides)
                    slides = slides.Module;
                if (Array.isArray(slides))
                    slides = { Slides: slides };
                let slidesObj = slides || { Slides: [] };
                if (!slidesObj.Slides)
                    slidesObj.Slides = [];
                if (slidesObj.Slides.length < 10) {
                    for (let i = slidesObj.Slides.length; i < 10; i++) {
                        slidesObj.Slides.push({
                            SlideNumber: i + 1,
                            Title: `Slide ${i + 1} - Key Takeaway`,
                            Bullets: ["Important module concept", "Practical implementation step", "Final review point"],
                            Content: "Reviewing the critical components of this module section.",
                            VisualPrompt: "A summary graphic representing the module's key learning outcomes.",
                            Transcript: "Reviewing the critical components of this module section to solidify the learner's understanding."
                        });
                    }
                }
                slidesObj.Slides = slidesObj.Slides.slice(0, 10);
                return {
                    moduleNumber,
                    themeId: themeId || 'aurora',
                    content: content || null,
                    slides: slidesObj
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
            const batchResults = await Promise.all(batch.map((mod, idx) => processModule(mod, i + idx)));
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
