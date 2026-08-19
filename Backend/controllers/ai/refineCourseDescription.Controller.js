import { OpenAI } from 'openai';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });

export const refineCourseDescription = async (req, res) => {
  try {
    const { currentDescription, prompt } = req.body || {};
    if (!currentDescription || !prompt) {
      return res.status(400).json({ error: "currentDescription and prompt are required" });
    }

    const aiPrompt = `You are an academic curriculum developer and educational researcher. Here is the current course description:
"${currentDescription}"

The user has provided the following specific instruction to refine or modify the description:
"${prompt}"

Please rewrite the course description strictly adhering to the user's instruction, while keeping the tone educational, objective, and syllabus-oriented. If the user asks for a specific format, length, tone, or focus, you MUST prioritize that instruction above all else. Do not ignore any part of the user's request.

CRITICAL CONSTRAINTS:
- DO NOT use marketing buzzwords, promotional hooks, or hype (e.g., avoid "unlock your potential", "master this crucial skill", "accelerate your career", "transform your life", "high-impact", or similar sales language).
- Keep the tone strictly educational, informative, objective, and syllabus-oriented.

IMPORTANT: Output ONLY the refined description text. Do NOT include any labels, headers, or prefixes such as "Course Title:", "Course Description:", "Description:", or similar. No JSON, no quotes, no bullet points - just the description paragraph(s) only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "You are a helpful assistant that strictly follows instructions." }, { role: "user", content: aiPrompt }],
      temperature: 0.5,
      max_tokens: 400
    });

    let refinedDescription = completion.choices?.[0]?.message?.content?.trim() || '';
    if (!refinedDescription) {
      return res.status(500).json({ error: "AI returned empty description" });
    }

    refinedDescription = refinedDescription.replace(/^Course\s+Title:\s*[^\n]+\n?/gi, '');
    refinedDescription = refinedDescription.replace(/^(Course\s+Description|Description):\s*/gi, '');
    refinedDescription = refinedDescription.trim();

    res.json({ refinedDescription });
  } catch (err) {
    return handleOpenAIError(err, res, 'refine-course-description');
  }
};
