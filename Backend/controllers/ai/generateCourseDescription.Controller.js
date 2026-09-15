import { OpenAI } from 'openai';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
export const generateCourseDescription = async (req, res) => {
    try {
        const { courseData } = req.body || {};
        const title = courseData?.title?.trim() || '';

        if (!title) {
            return res.status(400).json({
                error: 'Course title is required to generate a description.',
                message: 'Course title is required to generate a description.'
            });
        }

        const audienceStr = Array.isArray(courseData?.audience)
            ? courseData.audience.join(', ')
            : (typeof courseData?.audience === 'string' ? courseData.audience : '');
        const audience = audienceStr.trim();
        const type = courseData?.type?.trim?.() || courseData?.type || '';
        const standards = courseData?.standards?.trim?.() || courseData?.standards || '';
        const level = courseData?.level?.trim?.() || courseData?.level || '';
        const country = courseData?.country?.trim?.() || '';
        const industry = courseData?.industry?.trim?.() || '';
        const courseStyle = courseData?.courseStyle?.trim?.() || 'Academic / Formal Style';

        if (process.env.NODE_ENV !== 'production') {
            console.log("[DEBUG] Description Gen - Topic:", title);
            console.log("[DEBUG] Description Gen - Standards:", standards);
        }

        const detailsList = [
            `- Course title: ${title}`,
            audience ? `- Target audience: ${audience}` : '',
            type ? `- Course type: ${type}` : '',
            level ? `- Course level: ${level}` : '',
            industry ? `- Industry: ${industry}` : '',
            standards ? `- International/Industry Standard: ${standards}` : '',
            country ? `- Region/country: ${country}` : '',
            courseStyle ? `- Course Style: ${courseStyle}` : ''
        ].filter(Boolean).join('\n');

        const prompt = `You are an academic curriculum developer and educational researcher. Generate a formal, study-oriented course description (between 50 and 150 words) for a course with these details:
${detailsList}

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
            return res.status(500).json({
                error: "AI returned empty description",
                message: "AI returned empty description"
            });
        }

        // Clean any markdown headings, bold labels or prefixes returned by the model
        description = description.replace(/^(?:#{1,6}\s*)?(?:\*{1,2})?(?:Course\s+Title|Title):?(?:\*{1,2})?\s*[^\n]+\n?/gi, '');
        description = description.replace(/^(?:#{1,6}\s*)?(?:\*{1,2})?(?:Course\s+Description|Description|Course\s+Overview|Overview):?(?:\*{1,2})?\s*/gi, '');
        description = description.replace(/^["']\s*|\s*["']$/g, '');
        description = description.trim();

        return res.json({ description });
    }
    catch (err) {
        return handleOpenAIError(err, res, 'generate-course-description');
    }
};
