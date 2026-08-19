import Course from '../../models/courseModel.js';
import { OpenAI } from 'openai';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';

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
          if (!modTitle && lessons.length === 0) return '';
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

    const prompt1 = `
You are an expert curriculum designer.

Course Title: ${title}
Course Description: ${description}
Target Audience: ${audience}
Course Level: ${level}
Industry Context: ${industry}
Country/Standards Context: ${standards}
Course Style / Tone: ${courseStyle} (Ensure the module output, teaching context, case studies, and quiz questions deeply reflect this specific style. e.g. for storytelling use narrative flow, for scenario-based use fictional characters/scenarios throughout the content)
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
- The "Title" field MUST ONLY contain the topic name. Do NOT include "Module X:" or "Chapter X:" in the title (the system already handles module numbering).
- Module ${moduleNumber} should logically follow previous modules
- This module MUST focus on a distinct sub-topic that is NOT already covered in previous modules.
- Title, Objectives, TeachingContent topics, case study, quiz and visuals MUST be different from previous modules.
- For Digital Marketing specifically, progression should be from fundamentals -> channel strategy -> execution -> analytics -> optimization (or equivalent non-overlapping sequence).
- Each module MUST be designed for exactly 10-15 minutes of direct instructional content. Ensure the depth of teaching points and case studies reflects this duration.
- Do NOT include text outside JSON
`;

    const prompt2 = `
Create slides for Module ${moduleNumber} of the course "${title}".
Course Style / Tone: ${courseStyle} (Ensure the slides and their voiceover transcript text rigidly adhere to this style. If scenario-based, introduce characters in the visuals/transcript. If storytelling, write a narrative transcript. If academic, remain formal.)
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
    • Tone MUST match the Course Style: ${courseStyle}.
      - Academic/Formal: authoritative yet conversational advisor, evidence-grounded, no slang.
      - Storytelling: immersive narrative, vivid language, emotional beats, character-led.
      - Scenario-based: a named character drives the narration — every concept is a plot moment in their journey.
    • No slide numbers, no labels like "In this slide" or "As shown here" in the Transcript text.

- Use professional, educational language appropriate for ${level} learners.
- Stay strictly on the topic of Module ${moduleNumber}.
- Every slide title and bullet set MUST be different from previous modules.
- Avoid generic repeated structures like "Introduction/Fundamentals/Overview" if already used in prior modules.
- Do NOT include any text outside the JSON object.
`;

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
    try { parsedContent = JSON.parse(content); } catch (e) {
      const match = (content || '').match(/(\[.*\]|\{.*\})/s);
      if (match) parsedContent = JSON.parse(match[0]);
    }
    if (parsedContent && parsedContent.Module && !parsedContent.Title) parsedContent = parsedContent.Module;
    if (Array.isArray(parsedContent)) parsedContent = parsedContent[0] || null;

    let quizInstructions = "";
    if (parsedContent && parsedContent.Quizzes && Array.isArray(parsedContent.Quizzes) && parsedContent.Quizzes.length > 0) {
      quizInstructions = "\n\nCRITICAL QUIZ REQUIREMENT FOR SLIDE 10:\nSlide 10 MUST be a 'Knowledge Check' based EXACTLY on this module quiz:\n" + JSON.stringify(parsedContent.Quizzes[0]) + "\n- 'Title' MUST be the Quiz Question.\n- 'Bullets' MUST be exactly 4 multiple-choice options (the real answer + 3 plausible wrong options).\n- 'Content' MUST state the real answer and a brief explanation.\n- 'Transcript' MUST read the question, the options, and then reveal the answer.";
    }

    const resp2 = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt2 + quizInstructions + '\n' + instructions2 }],
      response_format: { type: 'json_object' }
    });

    content = parsedContent;
    let slides = resp2.choices[0].message.content;

    try { slides = JSON.parse(slides); } catch (e) {
      const match = (slides || '').match(/(\[.*\]|\{.*\})/s);
      if (match) slides = JSON.parse(match[0]);
    }
    if (Array.isArray(slides)) slides = { Slides: slides };

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
            Title: `Slide ${i + 1} - Key Concept`,
            Bullets: ["In-depth topic analysis", "Practical implementation guide", "Core learning takeaway"],
            Content: "This slide explores critical aspects of the module topic to ensure a comprehensive understanding of the subject matter.",
            VisualPrompt: "Educational graphic illustrating the key concepts discussed in this section.",
            Transcript: "This slide explores critical aspects of the module topic to ensure a comprehensive understanding of the subject matter."
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
          Transcript: "Summarizing the module content to reinforce learning and provide clear next steps for the course progression."
        });
      }
    }
    slidesOut.Slides = slidesOut.Slides.slice(0, 10);

    res.json({ content: content || null, slides: slidesOut });
  } catch (err) {
    return handleOpenAIError(err, res, 'generate-module-draft');
  }
};
