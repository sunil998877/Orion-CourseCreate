import Course from '../../models/courseModel.js';
import EbookGeneration from '../../models/ebookGenerationModel.js';
import User from '../../models/userModel.js';
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
    const { publisherName, userName, userEmail } = req.body || {};
    let authorName = (userName || publisherName || '').trim();
    let authorEmail = (userEmail || '').trim();

    if (!authorName || !authorEmail) {
        try {
            const currentUser = await User.findById(req.user.id).select('username email');
            if (currentUser) {
                if (!authorName) authorName = currentUser.username || '';
                if (!authorEmail) authorEmail = currentUser.email || '';
            }
        } catch (uErr) {
            console.warn('Could not fetch user details for ebook generation:', uErr?.message);
        }
    }
    if (!authorName) authorName = 'ORION by EVOKE AI';

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
        course.ebookPublisherName = authorName;
        course.ebookUserName = authorName;
        course.ebookUserEmail = authorEmail;
        course.ebookGeneratedAt = new Date();
        await course.save();

        var ebookGenRecord = null;
        try {
            ebookGenRecord = await EbookGeneration.create({
                courseId: course.courseId,
                courseObjectId: course._id,
                userId: req.user.id,
                courseTitle: course.title || 'Untitled Course',
                userName: authorName,
                userEmail: authorEmail,
                publisherName: authorName,
                status: 'generating'
            });
        } catch (recErr) {
            console.warn('Could not record EbookGeneration entry:', recErr?.message);
        }
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

        const buildStructuredFallbackNarrative = (course, modules, authorName) => {
            const courseTitle = course.title || 'Course eBook';
            return {
                title: courseTitle,
                subtitle: course.description || `A Comprehensive Guide to ${courseTitle}`,
                introduction: `Welcome to **${courseTitle}**. This publication provides a structured, rigorous, and practical examination of core concepts, real-world implementations, and essential best practices. Designed for ${course.audience || 'students and practitioners'}, every chapter breaks down complex subjects into digestible learning outcomes, actionable step-by-step guides, hands-on exercises, and self-assessment quizzes.\n\nAs you advance through these chapters, focus on applying the concepts to practical scenarios, validating your understanding against the knowledge checks, and leveraging the recommended references for continued mastery.`,
                chapters: modules.map((m, idx) => {
                    const chNum = Number(m.moduleNumber) || (idx + 1);
                    const title = m.Title || `Chapter ${chNum}`;
                    const teaching = Array.isArray(m.TeachingContent) ? m.TeachingContent : [];
                    let mdContent = `## 1. Chapter Overview\n\nIn this chapter, we delve into the core mechanisms and design principles of **${title}**. Mastering these concepts provides the essential foundation required to build resilient, production-ready solutions.\n\n`;
                    teaching.forEach(tc => {
                        mdContent += `### ${tc.Topics || 'Core Topic'}\n\n`;
                        if (Array.isArray(tc.ContentPoints) && tc.ContentPoints.length) {
                            mdContent += tc.ContentPoints.map(p => `- ${p}`).join('\n') + '\n\n';
                        }
                        if (tc.StandardsReference) {
                            mdContent += `> **Standard Reference**: *${tc.StandardsReference}*\n\n`;
                        }
                    });

                    const caseStudy = m.CaseStudy?.CaseStudyDescription ? {
                        title: `${title} Case Study`,
                        context: `Applying ${title} under production conditions.`,
                        challenge: m.CaseStudy.CaseStudyDescription,
                        solution: `Implementation of standard architectural patterns and structured verification.`,
                        outcome: `Successfully deployed with enhanced performance, resilience, and maintainability.`
                    } : null;

                    const quizzes = Array.isArray(m.Quizzes) ? m.Quizzes : [];
                    const interviewQuestions = [];
                    quizzes.forEach(q => {
                        if (Array.isArray(q.Questions)) {
                            q.Questions.forEach((ques, qi) => {
                                interviewQuestions.push({
                                    question: ques,
                                    answer: (Array.isArray(q.Answers) && q.Answers[qi]) || 'Refer to the chapter core concepts and principles.'
                                });
                            });
                        }
                    });

                    return {
                        chapter_number: chNum,
                        chapter_title: title,
                        summary: `This chapter covers the fundamental architecture, operational patterns, and key methodologies for ${title}.`,
                        hook: `Developing mastery of ${title} empowers you to construct reliable and scalable systems with efficiency.`,
                        content: mdContent,
                        implementation_guide: [
                            `Configure your development environment and verify baseline prerequisites for ${title}.`,
                            `Follow the sequential implementation workflow described in this chapter.`,
                            `Test each component against edge cases and target metrics.`,
                            `Incorporate changes into your continuous integration workflow.`
                        ],
                        common_mistakes: [
                            `Omitting boundary validation and error handling in early iterations.`,
                            `Introducing unnecessary dependencies before core logic is stabilized.`,
                            `Bypassing recommended standards and documentation.`
                        ],
                        practical_exercises: [
                            `Exercise 1: Create an isolated prototype demonstrating the core principles of ${title}.`,
                            `Exercise 2: Refactor an existing workflow to integrate the best practices highlighted in this chapter.`
                        ],
                        mini_project: {
                            title: `${title} Implementation Project`,
                            description: `Design, build, and validate a complete modular workflow using ${title}.`,
                            tasks: [
                                `Draft architectural requirements and interface contracts.`,
                                `Build and document the implementation.`,
                                `Validate against the chapter checklist and test suite.`
                            ]
                        },
                        checklist: [
                            `Understood all core definitions and architectural flows.`,
                            `Completed hands-on practical exercises.`,
                            `Verified implementation against common pitfalls.`
                        ],
                        interview_questions: interviewQuestions.length ? interviewQuestions : [
                            {
                                question: `Why is ${title} fundamental to modern systems?`,
                                answer: `It provides standardized, scalable patterns that minimize runtime errors and enhance maintainability.`
                            }
                        ],
                        takeaways: [
                            `${title} is critical for establishing resilient, scalable engineering practices.`,
                            `Consistent application of architectural patterns prevents production regressions.`,
                            `Continuous self-assessment through exercises cements long-term mastery.`
                        ],
                        tips: [
                            `Always verify your assumptions with automated tests.`,
                            `Keep implementations modular and well-documented.`
                        ],
                        case_study: caseStudy
                    };
                }),
                faq: [
                    {
                        question: `What is the recommended approach to complete this course eBook?`,
                        answer: `Study each chapter sequentially, work through the practical exercises, and review the knowledge checks before proceeding.`
                    },
                    {
                        question: `Are these patterns aligned with industry standards?`,
                        answer: `Yes, all chapters emphasize modern industry-tested conventions and production methodologies.`
                    }
                ],
                glossary: modules.map(m => ({
                    term: m.Title || 'Key Concept',
                    definition: `Core module topic focusing on ${m.Objectives?.[0] || 'essential architectural proficiencies'}.`
                })),
                conclusion: `Congratulations on finishing this comprehensive course eBook! You have built a robust theoretical and practical foundation across all curriculum topics. Continue applying these patterns in your projects, and share your insights with the community.`,
                call_to_action: `Build a complete capstone project incorporating these concepts, publish your code, and take your mastery to the next level!`
            };
        };

        let ebookNarrative = null;
        try {
            if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy')) {
                console.log('Generating structured eBook narrative using OpenAI GPT-4o JSON mode...');
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: 'You are an elite instructional designer and professional author. You generate publication-grade, beautifully structured eBooks in valid JSON following the requested schema.' },
                        { role: 'user', content: ebookPrompt }
                    ],
                    temperature: 0.4,
                    response_format: { type: 'json_object' }
                });
                const rawContent = completion?.choices?.[0]?.message?.content || '';
                if (rawContent) {
                    const parsed = JSON.parse(rawContent);
                    if (parsed && Array.isArray(parsed.chapters) && parsed.chapters.length) {
                        ebookNarrative = parsed;
                        console.log(`✅ Successfully generated AI eBook narrative with ${ebookNarrative.chapters.length} chapters.`);
                    }
                }
            }
        }
        catch (aiErr) {
            console.warn('Notice: OpenAI dynamic generation encountered an issue, using structured curriculum narrative fallback:', aiErr?.message || aiErr);
        }

        if (!ebookNarrative) {
            console.log('Synthesizing structured narrative from course modules...');
            ebookNarrative = buildStructuredFallbackNarrative(course, modules, authorName);
        }

        let html;
        try {
            html = await buildEbookHtmlFromNarrative(course, ebookNarrative, modules, authorName, authorEmail);
        } catch (narrativeErr) {
            console.warn('⚠️ buildEbookHtmlFromNarrative warning, using structured classic template:', narrativeErr?.message || narrativeErr);
            html = buildEbookHtml(course, modules, authorName, authorEmail);
        }
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
          <div style="font-size: 9px; width: 100%; display: flex; justify-content: space-between; align-items: center; font-family: 'Inter', sans-serif; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px; margin: 0 14mm;">
            <div style="display: flex; align-items: center; gap: 6px;">
              ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" style="height: 12px; width: auto; opacity: 0.8; vertical-align: middle; margin-right: 4px;" />` : ''}
              <span style="font-weight: 600; vertical-align: middle;">ORION by EVOKE AI</span>
            </div>
            <div style="font-weight: 500;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
          </div>`,
                margin: { top: '16mm', right: '14mm', bottom: '20mm', left: '14mm' }
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
            if (ebookGenRecord) {
                try {
                    ebookGenRecord.status = 'completed';
                    ebookGenRecord.ebookUrl = ebookUrl;
                    await ebookGenRecord.save();
                } catch (recErr) {
                    console.warn('Could not update EbookGeneration record status to completed:', recErr?.message);
                }
            }
            res.json({ ebookUrl, ebookStatus: course.ebookStatus });
        }
        finally {
            await browser.close();
        }
    }
    catch (error) {
        console.error('❌ Error generating ebook:', error?.message || error);
        if (typeof ebookGenRecord !== 'undefined' && ebookGenRecord) {
            try {
                ebookGenRecord.status = 'failed';
                ebookGenRecord.error = error?.message || 'Unknown generation error';
                await ebookGenRecord.save();
            } catch (recErr) {
                console.warn('Could not update EbookGeneration record status to failed:', recErr?.message);
            }
        }
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
