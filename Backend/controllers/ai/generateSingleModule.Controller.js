import Course from '../../models/courseModel.js';
import User from '../../models/userModel.js';
import { OpenAI } from 'openai';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });

const addNotification = async (userId, title, message, type = 'info') => {
  try {
    const notification = { title, message, type, isRead: false, createdAt: new Date() };
    await User.findByIdAndUpdate(userId, { $push: { notifications: notification } });
  } catch (err) {
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

    if (!course.modules) course.modules = [];

    const idx = course.modules.findIndex(m => Number(m.moduleNumber) === Number(moduleNumber));
    if (idx >= 0) {
      course.modules[idx].status = 'generating';
    } else {
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

        const prompt1 = `
You are an expert curriculum designer.

Course Title: ${course.title}
Course Description: ${course.description}
Target Audience: ${course.audience}
Course Level: ${course.level}
Country/Standards Context: ${course.standards || course.country}
Course Style / Tone: ${course.courseStyle || 'Academic / Formal Style'} (Ensure the module output, teaching context, case studies, and quiz questions deeply reflect this specific style. e.g. for storytelling use narrative flow, for scenario-based use fictional characters/scenarios throughout the content)
Previously generated modules (must not be repeated):
${previousModulesText}
${refineText}

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
- Module ${moduleNumber} should logically follow previous modules
- This module MUST focus on a distinct sub-topic that is NOT already covered in previous modules.
- Title/Objectives/Teaching topics MUST be non-overlapping with prior modules.
- Do NOT include text outside JSON
`;

        const prompt2 = `
Create slides for Module ${moduleNumber} of the course "${course.title}".
Course Style / Tone: ${course.courseStyle || 'Academic / Formal Style'} (Ensure the slides and their voiceover transcript text rigidly adhere to this style. If scenario-based, introduce characters in the visuals/transcript. If storytelling, write a narrative transcript. If academic, remain formal.)
Previously generated modules (must not be repeated):
${previousModulesText}
${refineText}
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
    • Tone MUST match the Course Style: ${course.courseStyle || 'Academic / Formal Style'}.
      - Academic/Formal: authoritative yet conversational advisor, evidence-grounded, no slang.
      - Storytelling: immersive narrative, vivid language, emotional beats, character-led.
      - Scenario-based: a named character drives the narration — every concept is a plot moment in their journey.
    • No slide numbers, no labels like "In this slide" or "As shown here" in the Transcript text.

- Use professional, educational language appropriate for ${course.level} learners.
- Stay strictly on the topic of Module ${moduleNumber}.
- Every slide title and bullet set MUST be different from previous modules.
- Do NOT include any text outside the JSON object.
`;

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

        try { content = JSON.parse(content); } catch (e) {
          const match = content.match(/(\[.*\]|\{.*\})/s);
          if (match) content = JSON.parse(match[0]);
        }

        if (content && content.Module && !content.Title) {
          content = content.Module;
        }

        try { slides = JSON.parse(slides); } catch (e) {
          const match = slides.match(/(\[.*\]|\{.*\})/s);
          if (match) slides = JSON.parse(match[0]);
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
            Transcript: typeof sl.Transcript === 'string' ? sl.Transcript : ''
          }));
          if (s.length < 10) {
            for (let i = s.length; i < 10; i++) {
              s.push({
                SlideNumber: i + 1,
                Title: `Slide ${i + 1} - Topic Deep Dive`,
                Bullets: ["Key concept reinforcement", "Detailed analysis point", "Practical application example"],
                Content: "This slide provides further detail and practical context for the module topics, ensuring a comprehensive understanding of the core learning objectives.",
                VisualPrompt: "Educational infographic or diagram showing the relationship between module concepts.",
                Transcript: "This slide provides further detail and practical context for the module topics, ensuring a comprehensive understanding of the core learning objectives."
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
        if (!finalCourse) return;

        const finalIdx = finalCourse.modules.findIndex(m => Number(m.moduleNumber) === Number(moduleNumber));
        if (finalIdx === -1) return;

        const mod = finalCourse.modules[finalIdx];
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
              Transcript: "Reviewing the critical components of this module section to solidify the learner's understanding and prepare for the next phase of the course."
            });
          }
        }
        slidesObj.Slides = slidesObj.Slides.slice(0, 10);

        await Course.updateOne(
          {
            userId: req.user.id,
            courseId: String(courseId),
            "modules.moduleNumber": Number(moduleNumber)
          },
          {
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
          }
        );

        await addNotification(req.user.id, 'Module Ready', `Module ${moduleNumber} content has been generated.`, 'success');

      } catch (err) {
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

  } catch (error) {
    return handleOpenAIError(error, res, 'generate-single-module');
  }
};
