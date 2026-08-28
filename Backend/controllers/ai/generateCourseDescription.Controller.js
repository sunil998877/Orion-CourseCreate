import { OpenAI } from 'openai';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
export const generateCourseDescription = async (req, res) => {
    try {
        const { courseData } = req.body || {};
        const title = courseData?.title?.trim() || '';
        const audienceStr = Array.isArray(courseData?.audience) ? courseData.audience.join(', ') : (courseData?.audience || '');
        const audience = audienceStr.trim();
        const type = courseData?.type || '';
        const standards = courseData?.standards || '';
        const level = courseData?.level || '';
        const country = courseData?.country?.trim() || '';
        const industry = courseData?.industry?.trim() || '';
        const courseStyle = courseData?.courseStyle?.trim() || 'Academic / Formal Style';
        console.log("[DEBUG] Description Gen - Topic:", title);
        console.log("[DEBUG] Description Gen - Standards:", standards);
        const prompt = `You are an academic curriculum developer and educational researcher. Generate a formal, study-oriented course description (between 50 and 150 words) for a course with these details:
- Course title: ${title}
- Target audience: ${audience}
- Course type: ${type}
- Course level: ${level}
- Industry: ${industry}
- International/Industry Standard: ${standards}${country ? `\n- Region/country: ${country}` : ''}
- Course Style: ${courseStyle}

Write an objective, academic overview focusing on: primary conceptual frameworks, theoretical and practical topics covered, and specific academic skills/methodologies developed. Frame the description around study, inquiry, and learning outcomes rather than selling the course.

Instead of promotional language, use formal, syllabus-style prose. Indicate that each module is structured as a 10-15 minute focused study unit designed to manage cognitive load and enhance retention.

CRITICAL CONSTRAINTS:
- DO NOT use marketing buzzwords, promotional hooks, or hype (e.g., avoid "unlock your potential", "master this crucial skill", "accelerate your career", "transform your life", "high-impact", or similar sales language).
- Keep the tone strictly educational, informative, objective, and syllabus-oriented.

IMPORTANT: Output ONLY the description text. Do NOT include any labels, headers, or prefixes such as "Course Title:", "Course Description:", "Description:", or similar. No JSON, no quotes, no bullet points - just the description paragraph(s) only. Each module in the course must be structured to fit within a 10-15 minute delivery window.`;
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 400
        });
        let description = completion.choices?.[0]?.message?.content?.trim() || '';
        if (!description) {
            return res.status(500).json({ error: "AI returned empty description" });
        }
        description = description.replace(/^Course\s+Title:\s*[^\n]+\n?/gi, '');
        description = description.replace(/^(Course\s+Description|Description):\s*/gi, '');
        description = description.trim();
        res.json({ description });
    }
    catch (err) {
        return handleOpenAIError(err, res, 'generate-course-description');
    }
};
