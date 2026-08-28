import Course from '../../models/courseModel.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { buildEbookHtml, buildEbookHtmlFromNarrative } from '../../services/ebookService.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
export const generateEbook = async (req, res) => {
    const { publisherName } = req.body || {};
    let logoBase64 = '';
    try {
        const logoPath = path.join(__dirname, '..', '..', '..', 'frontEnd', 'src', 'assets', 'logo5.png');
        if (fs.existsSync(logoPath)) {
            logoBase64 = fs.readFileSync(logoPath).toString('base64');
        }
    }
    catch (err) {
        console.error('Error reading logo5.png for ebook footer:', err);
    }
    try {
        const param = String(req.params.courseId || '').trim();
        let criteria = { userId: req.user.id, courseId: param };
        if (mongoose.isValidObjectId(param)) {
            criteria = {
                userId: req.user.id,
                $or: [
                    { courseId: param },
                    { _id: new mongoose.Types.ObjectId(param) }
                ]
            };
        }
        const course = await Course.findOne(criteria);
        if (!course)
            return res.status(404).json({ message: 'Course not found' });
        const modules = Array.isArray(course.modules)
            ? [...course.modules].sort((a, b) => Number(a.moduleNumber) - Number(b.moduleNumber))
            : [];
        if (!modules.length) {
            return res.status(400).json({ message: 'No modules found for this course. Generate modules first.' });
        }
        course.ebookStatus = 'generating';
        await course.save();
        const modulesForPrompt = modules.map((m) => ({
            moduleNumber: m.moduleNumber,
            Title: m.Title,
            Objectives: m.Objectives,
            TeachingContent: m.TeachingContent,
            CaseStudy: m.CaseStudy,
            Quizzes: m.Quizzes,
            VisualDescriptions: m.VisualDescriptions,
            FurtherStudy: m.FurtherStudy
        }));
        const ebookContext = {
            topic: course.title,
            audience: course.audience || "Beginner",
            level: course.level || "Beginner",
            description: course.description,
            goal: "Generate a clean, structured, and publication-ready eBook that helps students understand the topic clearly."
        };
        const ebookPrompt = `
You are an elite instructional designer, professional technical author, subject matter expert, and modern course creator.
Your task is to generate a PREMIUM QUALITY EBOOK for the following topic: ${ebookContext.topic}.

### COURSE CONTEXT:
- **Topic**: ${ebookContext.topic}
- **Audience**: ${ebookContext.audience}
- **Level**: ${ebookContext.level}
- **Goal**: ${ebookContext.goal}
- **Description**: ${ebookContext.description}

### 1. PRACTICAL-FIRST LEARNING (MANDATORY)
Do NOT generate theory-only content. Every chapter must be highly practical and implementation-focused.
Every chapter MUST include:
- **Real-World Applications**: Where this is used today.
- **Step-by-Step Practical Guide**: Clear, numbered implementation steps.
- **Common Mistakes**: A "Warning Box" of what to avoid.
- **Practical Exercises**: Hands-on tasks for the reader.
- **Mini Project**: A small project or complex task to apply the chapter's knowledge.
- **Quick Checklist**: A "Definition of Done" for the chapter.
- **Interview Questions**: 3-5 high-value questions related to the topic.

### 2. VISUAL & IMAGE STRATEGY
The ebook must be visually rich. Frequently insert image placeholders in this EXACT format:
[GENERATE_IMAGE: Detailed description of the visual, e.g., "Architecture of a microservices backend"]
Place these where they help explain complex concepts or break up long text blocks.

### 3. DYNAMIC STYLE ADAPTATION
Adapt the tone to the domain:
- Technical/Code → Implementation, debugging, and architecture focus.
- Business/Marketing → Strategy, campaigns, and ROI focus.
- Lifestyle/Soft Skills → Psychological insights, habits, and scenarios.

### 4. ARCHITECTURAL MANDATES
- **One Chapter Per Module**: Generate exactly ${modules.length} chapters.
- **Chapter Titles**: Must match the module titles provided.
- **Strict Format**: Use clean Markdown (## and ###). No ASCII art. Use high-density paragraphs (4-7 sentences).

### 5. OUTPUT SCHEMA (Strict JSON)
Return ONLY a valid JSON object following this structure:
{
  "title": "${ebookContext.topic}",
  "subtitle": "<Premium, engaging subtitle>",
  "introduction": "<Deep 5-6 paragraph opening using clean Markdown>",
  "chapters": [
    {
      "chapter_title": "<Match Module Title>",
      "summary": "<Executive summary>",
      "hook": "<Power opening sentence>",
      "content": "<High-depth Markdown body. Use ## for subsections. Include [GENERATE_IMAGE: ...] tags here.>",
      "implementation_guide": ["Step 1...", "Step 2..."],
      "common_mistakes": ["Mistake 1...", "Mistake 2..."],
      "practical_exercises": ["Exercise 1...", "Exercise 2..."],
      "mini_project": { "title": "...", "description": "...", "tasks": ["Task 1", "Task 2"] },
      "checklist": ["Item 1", "Item 2"],
      "interview_questions": [ { "question": "...", "answer": "..." } ],
      "takeaways": ["..."],
      "tips": ["..."],
      "diagrams": [{ "mermaid_code": "...", "caption": "..." }],
      "case_study": { "title": "...", "context": "...", "challenge": "...", "solution": "...", "outcome": "..." },
      "expert_insight": "...",
      "expert_attribution": "..."
    }
  ],
  "faq": [ { "question": "...", "answer": "..." } ],
  "glossary": [ { "term": "...", "definition": "..." } ],
  "conclusion": "<Deep summation>",
  "call_to_action": "<Clear next steps>"
}

### INPUT DATA (${modules.length} Modules):
${JSON.stringify(modulesForPrompt)}
`;
        let ebookNarrative = null;
        try {
            if (!process.env.OPENAI_API_KEY) {
                throw new Error('OPENAI_API_KEY missing');
            }
            const assistantId = process.env.OPENAI_EBOOK_ASSISTANT_ID;
            if (assistantId) {
                const thread = await openai.beta.threads.create();
                await openai.beta.threads.messages.create(thread.id, {
                    role: 'user',
                    content: ebookPrompt
                });
                const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
                    assistant_id: assistantId
                });
                if (run.status === 'completed') {
                    const messages = await openai.beta.threads.messages.list(thread.id);
                    const lastMessage = messages.data[0];
                    if (lastMessage.role === 'assistant') {
                        const content = lastMessage.content[0].text.value;
                        const jsonStr = content.replace(/```json\n?|```/g, '').trim();
                        ebookNarrative = JSON.parse(jsonStr);
                    }
                }
                else {
                    throw new Error(`Assistant run failed with status: ${run.status}`);
                }
            }
            else {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: 'You are an expert instructional designer and professional ebook author.' },
                        { role: 'user', content: ebookPrompt }
                    ],
                    temperature: 0.5,
                    response_format: { type: 'json_object' }
                });
                ebookNarrative = completion?.choices?.[0]?.message?.content
                    ? JSON.parse(completion.choices[0].message.content)
                    : null;
            }
        }
        catch (aiErr) {
            console.error('Ebook AI generation failed, falling back to static HTML:', aiErr?.message || aiErr);
        }
        const html = ebookNarrative
            ? await buildEbookHtmlFromNarrative(course, ebookNarrative, modules, publisherName)
            : buildEbookHtml(course, modules, publisherName);
        const getBrowserLaunchOptions = async () => {
            const customExecutablePath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
            if (customExecutablePath && fs.existsSync(customExecutablePath)) {
                return {
                    executablePath: customExecutablePath,
                    args: chromium.args || ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                    headless: true,
                };
            }
            if (process.platform === 'win32' || process.platform === 'darwin') {
                const winPaths = [
                    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
                    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
                    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
                    'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
                ];
                const macPaths = [
                    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
                    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
                ];
                const candidatePaths = process.platform === 'win32' ? winPaths : macPaths;
                for (const browserPath of candidatePaths) {
                    if (browserPath && fs.existsSync(browserPath)) {
                        console.log(`📌 Using local browser at: ${browserPath}`);
                        return {
                            executablePath: browserPath,
                            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                            headless: true,
                        };
                    }
                }
            }
            try {
                const sparticuzPath = await chromium.executablePath();
                if (sparticuzPath && fs.existsSync(sparticuzPath)) {
                    return {
                        args: chromium.args,
                        executablePath: sparticuzPath,
                        headless: 'shell',
                    };
                }
            }
            catch (err) {
                console.warn(' @sparticuz/chromium could not provide valid executable path:', err?.message || err);
            }
            if (process.platform === 'linux') {
                const linuxPaths = [
                    '/usr/bin/google-chrome',
                    '/usr/bin/chromium',
                    '/usr/bin/chromium-browser',
                    '/snap/bin/chromium'
                ];
                for (const browserPath of linuxPaths) {
                    if (fs.existsSync(browserPath)) {
                        return {
                            executablePath: browserPath,
                            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                            headless: true,
                        };
                    }
                }
            }
            return {
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                headless: true,
            };
        };
        console.log(' Launching Puppeteer for ebook PDF generation...');
        const puppeteerOpts = await getBrowserLaunchOptions();
        const browser = await puppeteer.launch(puppeteerOpts).catch(err => {
            console.error('CRITICAL: Puppeteer launch failed:', err?.message || err);
            throw new Error(`Puppeteer failed to launch: ${err?.message || err}`);
        });
        try {
            console.log('Puppeteer browser launched successfully.');
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'load', timeout: 120000 });
            await page.evaluate(async () => {
                await new Promise(resolve => setTimeout(resolve, 4000));
            });
            const fileName = `ebook-${course.courseId}.pdf`;
            console.log(`📄 Generating ebook PDF: ${fileName}`);
            const rawPdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: '<span></span>',
                footerTemplate: `
          <div style="font-size: 10px; width: 100%; display: flex; justify-content: space-between; align-items: center; font-family: 'Inter', sans-serif; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 5px; margin: 0 14mm;">
            <div style="display: flex; align-items: center; gap: 6px;">
              ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" style="height: 14px; width: auto; opacity: 0.8; vertical-align: middle; margin-right: 4px;" />` : ''}
              <span style="font-weight: 500; vertical-align: middle;">ORION by EVOKE AI</span>
            </div>
            <div style="font-weight: 500;">Page No. <span class="pageNumber"></span></div>
          </div>`,
                margin: { top: '20mm', right: '14mm', bottom: '25mm', left: '14mm' }
            });
            const pdfBuffer = Buffer.from(rawPdf);
            if (!pdfBuffer || pdfBuffer.length === 0) {
                throw new Error('Generated PDF buffer is empty');
            }
            if (pdfBuffer.slice(0, 4).toString() !== '%PDF') {
                throw new Error('Generated PDF buffer has invalid header');
            }
            const ebookData = pdfBuffer.toString('base64');
            const ebookUrl = `/api/ebooks/${course.courseId}/download`;
            course.ebookData = ebookData;
            course.ebookUrl = ebookUrl;
            course.ebookStatus = 'completed';
            if (ebookNarrative) {
                const narrativeTranscript = [
                    ebookNarrative.title ? `Title: ${ebookNarrative.title}` : null,
                    ...(Array.isArray(ebookNarrative.chapters)
                        ? ebookNarrative.chapters.map((c) => `\n${c?.chapter_title || ''}\n${c?.content || ''}`)
                        : [])
                ].filter(Boolean).join('\n');
                course.ebookTranscript = narrativeTranscript;
            }
            else {
                course.ebookTranscript = modules.map((mod) => {
                    const parts = [
                        `Module ${Number(mod.moduleNumber)}: ${mod.Title || ''}`,
                        Array.isArray(mod.Objectives) ? `Objectives: ${mod.Objectives.join(', ')}` : '',
                        Array.isArray(mod.TeachingContent)
                            ? mod.TeachingContent
                                .map((tc) => `Topic: ${tc.Topics || ''}\nPoints: ${Array.isArray(tc.ContentPoints) ? tc.ContentPoints.join('. ') : ''}`)
                                .join('\n')
                            : '',
                        mod?.CaseStudy?.CaseStudyDescription ? `Case Study: ${mod.CaseStudy.CaseStudyDescription}` : ''
                    ].filter(Boolean);
                    return parts.join('\n');
                }).join('\n\n');
            }
            await course.save();
            res.json({ ebookUrl, ebookStatus: course.ebookStatus });
        }
        finally {
            await browser.close();
        }
    }
    catch (error) {
        console.error('❌ Error generating ebook:', error?.message || error);
        try {
            const course = await Course.findOne({ userId: req.user.id, courseId: String(req.params.courseId || '').trim() });
            if (course) {
                course.ebookStatus = 'failed';
                await course.save();
            }
        }
        catch {
            void 0;
        }
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
export const downloadEbook = async (req, res) => {
    try {
        const course = await Course.findOne({ courseId: req.params.courseId });
        if (!course || !course.ebookData) {
            return res.status(404).json({ message: 'Ebook not found' });
        }
        const pdfBuffer = Buffer.from(course.ebookData, 'base64');
        const fileName = `${(course.title || 'course-ebook').replace(/\s+/g, '-').toLowerCase()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error downloading ebook:', error?.message || error);
        res.status(500).json({ message: 'Failed to download ebook' });
    }
};
