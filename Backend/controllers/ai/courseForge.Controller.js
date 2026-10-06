import { OpenAI } from 'openai';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import XLSX from 'xlsx';
import { randomUUID } from 'crypto';
import { handleOpenAIError } from '../../utils/openaiErrorHandler.js';
import {
    buildAssessmentPrompt,
    buildAuditPrompt,
    buildBlueprintPrompt,
    buildDossierPrompt,
    buildNarrationPrompt,
    buildWorkbookPrompt,
    usesCourseForge
} from '../../utils/courseForgePrompt.js';
import { ensure20AssessmentQuestions } from '../../utils/assessmentUtils.js';
import { InsufficientCreditsError, reserve, release, reconcile } from '../../services/creditService/creditService.js';
import PricingRule from '../../models/credits/pricingRule.js';

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

const completeJson = async (prompt) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
    });
    return readJson(response.choices[0].message.content);
};

const forgeOf = (courseData) => courseData?.courseForge && typeof courseData.courseForge === 'object'
    ? courseData.courseForge
    : null;

export const generateResearchDossier = async (req, res) => {
    try {
        const { courseData } = req.body || {};
        if (!courseData?.title)
            return res.status(400).json({ message: 'Course title is required' });
        const dossier = await completeJson(buildDossierPrompt(courseData));
        if (!dossier)
            return res.status(502).json({ message: 'Research dossier could not be read' });
        return res.json({ dossier });
    }
    catch (error) {
        return handleOpenAIError(error, res, 'generate-research-dossier');
    }
};

export const generateCourseBlueprint = async (req, res) => {
    try {
        const { courseData } = req.body || {};
        const forge = forgeOf(courseData);
        if (!courseData?.title)
            return res.status(400).json({ message: 'Course title is required' });
        if (!forge?.researchApproved || !forge?.researchDossier)
            return res.status(409).json({ message: 'Approve the research dossier before the blueprint' });
        const blueprint = await completeJson(buildBlueprintPrompt(courseData));
        if (!blueprint)
            return res.status(502).json({ message: 'Blueprint could not be read' });
        return res.json({ blueprint });
    }
    catch (error) {
        return handleOpenAIError(error, res, 'generate-course-blueprint');
    }
};

export const generateNarration = async (req, res) => {
    try {
        const { courseData, moduleNumber, slides, allowDirect } = req.body || {};
        const forge = forgeOf(courseData);
        if (!Number.isFinite(Number(moduleNumber)) || !Array.isArray(slides) || slides.length === 0)
            return res.status(400).json({ message: 'moduleNumber and slides are required' });
        if (usesCourseForge(courseData) && forge.blueprintApproved !== true && !allowDirect)
            return res.status(409).json({ message: 'Approve the blueprint before narration' });
        const cleanSlides = slides.map((slide) => ({
            SlideNumber: slide.SlideNumber,
            Title: slide.Title,
            Bullets: slide.Bullets,
            Content: slide.Content,
            Purpose: slide.Purpose,
            LearningOutcome: slide.LearningOutcome,
            LearnerAction: slide.LearnerAction
        }));
        const narration = await completeJson(buildNarrationPrompt({
            courseData,
            moduleNumber: Number(moduleNumber),
            slides: cleanSlides
        }));
        if (!narration?.Slides)
            return res.status(502).json({ message: 'Narration could not be read' });
        return res.json({ moduleNumber: Number(moduleNumber), slides: narration.Slides });
    }
    catch (error) {
        return handleOpenAIError(error, res, 'generate-narration');
    }
};

export const generateAssessment = async (req, res) => {
    try {
        const { courseData, modules } = req.body || {};
        const forge = forgeOf(courseData);
        if (!courseData?.title)
            return res.status(400).json({ message: 'Course title is required' });
        if (usesCourseForge(courseData) && forge.blueprintApproved !== true)
            return res.status(409).json({ message: 'Approve the blueprint before assessment' });
        if (usesCourseForge(courseData) && !forge.workbook && forge.workbookApproved !== true)
            return res.status(409).json({ message: 'Create the e-workbook before the assessment' });
        let assessment = await completeJson(buildAssessmentPrompt(courseData, modules));
        assessment = ensure20AssessmentQuestions(assessment, courseData, modules);
        return res.json({ assessment });
    }
    catch (error) {
        return handleOpenAIError(error, res, 'generate-assessment');
    }
};

export const generateWorkbook = async (req, res) => {
    try {
        const { courseData, moduleNumber, moduleContent } = req.body || {};
        const forge = forgeOf(courseData);
        if (!Number.isFinite(Number(moduleNumber)))
            return res.status(400).json({ message: 'moduleNumber is required' });
        if (usesCourseForge(courseData) && forge.blueprintApproved !== true)
            return res.status(409).json({ message: 'Approve the blueprint before the workbook' });
        const workbook = await completeJson(buildWorkbookPrompt(courseData, Number(moduleNumber), moduleContent));
        if (!workbook)
            return res.status(502).json({ message: 'Workbook could not be read' });
        return res.json({ moduleNumber: Number(moduleNumber), workbook });
    }
    catch (error) {
        return handleOpenAIError(error, res, 'generate-workbook');
    }
};

export const auditCourse = async (req, res) => {
    try {
        const { courseData, modules, slides, assessment, workbook } = req.body || {};
        if (!courseData?.title)
            return res.status(400).json({ message: 'Course title is required' });
        const audit = await completeJson(buildAuditPrompt({
            courseData,
            modules,
            slides,
            assessment,
            workbook
        }));
        if (!audit)
            return res.status(502).json({ message: 'Audit could not be read' });
        const decision = ['APPROVE', 'APPROVE AFTER CORRECTION', 'DO NOT APPROVE'].includes(audit.decision)
            ? audit.decision
            : 'DO NOT APPROVE';
        return res.json({ audit: { ...audit, decision } });
    }
    catch (error) {
        return handleOpenAIError(error, res, 'audit-course');
    }
};

const blockedHost = (hostname) => {
    const host = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
    if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || host === '0.0.0.0' || host === '::1' || host === '::')
        return true;
    if (/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|0\.)/.test(host))
        return true;
    return host.includes(':') && (host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80'));
};

const cleanText = (value) => String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

const readPdf = async (buffer) => {
    const parser = new PDFParse({ data: buffer });
    try {
        const parsed = await parser.getText();
        return parsed?.text || '';
    }
    finally {
        if (typeof parser.destroy === 'function')
            await parser.destroy();
    }
};

const readDocx = async (buffer) => {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed?.value || '';
};

const readPptx = async (buffer) => {
    const zip = await JSZip.loadAsync(buffer);
    const names = Object.keys(zip.files)
        .filter((name) => /ppt\/slides\/slide\d+\.xml$/i.test(name))
        .sort((a, b) => {
            const left = Number(a.match(/slide(\d+)/i)?.[1] || 0);
            const right = Number(b.match(/slide(\d+)/i)?.[1] || 0);
            return left - right;
        });
    const slides = [];
    for (const name of names) {
        const xml = await zip.files[name].async('string');
        const bits = [...xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)].map((match) => cleanText(match[1])).filter(Boolean);
        if (bits.length)
            slides.push(bits.join(' '));
    }
    return slides.join('\n');
};

const readSheet = (buffer) => {
    const book = XLSX.read(buffer, { type: 'buffer' });
    return book.SheetNames.map((name) => XLSX.utils.sheet_to_csv(book.Sheets[name])).join('\n');
};

const readUpload = async (file) => {
    const name = String(file.originalname || '').toLowerCase();
    if (name.endsWith('.pdf'))
        return readPdf(file.buffer);
    if (name.endsWith('.docx'))
        return readDocx(file.buffer);
    if (name.endsWith('.pptx'))
        return readPptx(file.buffer);
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv'))
        return readSheet(file.buffer);
    if (name.endsWith('.txt') || name.endsWith('.md'))
        return file.buffer.toString('utf8');
    if (name.endsWith('.ppt') || name.endsWith('.doc')) {
        const raw = file.buffer.toString('latin1');
        return (raw.match(/[A-Za-z0-9][A-Za-z0-9 ,.'’:/()\-]{3,}/g) || []).join(' ');
    }
    const error = new Error('Use a PDF, DOCX, PPTX, XLSX, CSV, or TXT file');
    error.status = 400;
    throw error;
};

const readPublicLink = async (sourceUrl) => {
    let current;
    try {
        current = new URL(sourceUrl);
    }
    catch {
        const error = new Error('Enter a valid http or https link');
        error.status = 400;
        throw error;
    }
    if (!['http:', 'https:'].includes(current.protocol) || current.username || current.password) {
        const error = new Error('Enter a valid public http or https link');
        error.status = 400;
        throw error;
    }
    for (let hop = 0; hop < 4; hop += 1) {
        if (blockedHost(current.hostname)) {
            const error = new Error('That link cannot be imported');
            error.status = 400;
            throw error;
        }
        const page = await fetch(current, {
            redirect: 'manual',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/pdf,text/plain;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en'
            },
            signal: AbortSignal.timeout(15000)
        });
        if (page.status >= 300 && page.status < 400) {
            const location = page.headers.get('location');
            if (!location) {
                const error = new Error('Could not open that link');
                error.status = 400;
                throw error;
            }
            current = new URL(location, current);
            continue;
        }
        if (!page.ok) {
            const error = new Error('Could not open that link');
            error.status = 400;
            throw error;
        }
        const length = Number(page.headers.get('content-length') || 0);
        if (length > 15 * 1024 * 1024) {
            const error = new Error('That link is larger than 15MB');
            error.status = 400;
            throw error;
        }
        const type = String(page.headers.get('content-type') || '').toLowerCase();
        const pathName = current.pathname.toLowerCase();
        if (type.includes('pdf') || pathName.endsWith('.pdf')) {
            const buffer = Buffer.from(await page.arrayBuffer());
            return { text: await readPdf(buffer), pageTitle: '' };
        }
        if (type.includes('wordprocessingml') || pathName.endsWith('.docx')) {
            const buffer = Buffer.from(await page.arrayBuffer());
            return { text: await readDocx(buffer), pageTitle: '' };
        }
        const html = await page.text();
        const pageTitle = cleanText((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
        const metaBits = [...html.matchAll(/<meta[^>]+(?:name|property)=["'](?:description|og:title|og:description|twitter:title|twitter:description)["'][^>]*>/gi)]
            .map((match) => cleanText((match[0].match(/content=["']([\s\S]*?)["']/i) || [])[1] || ''))
            .filter(Boolean);
        const visible = cleanText(html);
        const text = [pageTitle, ...metaBits, visible].filter(Boolean).join('\n');
        return { text, pageTitle };
    }
    const error = new Error('Could not open that link');
    error.status = 400;
    throw error;
};

const oneOf = (value, options) => options.find((option) => option.toLowerCase() === String(value || '').trim().toLowerCase()) || '';

const asList = (value, limit = 12) => Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean).slice(0, limit)
    : [];

const buildImportedCourse = (raw, text, hintTitle) => {
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
    const standards = ['Global (ISO/IEC)', 'Regional', 'Industry Specific'];
    const styles = ['Academic / Formal Style', 'Storytelling Style', 'Interactive Coaching Style', 'Humanized Teaching Style', 'Modern Edutainment Style', 'Scenario-Based Style'];
    const archetypes = ['Let AI select', 'Awareness', 'Standard-compliance', 'Auditor-verifier', 'Procedural', 'Conceptual', 'Software', 'Leadership', 'Exam-preparation'];
    const delivery = ['Self-paced', 'Live virtual', 'Classroom', 'Blended'];
    const modules = Array.isArray(raw?.modules)
        ? raw.modules.slice(0, 12).map((item) => ({
            title: String(item?.title || '').trim(),
            lessons: asList(item?.lessons, 8)
        })).filter((item) => item.title)
        : [];
    const firstLine = text.split(/(?<=[.!?])\s+/).map((part) => part.trim()).find((part) => part.length > 8 && !/^https?:/i.test(part)) || '';
    const title = String(raw?.title || '').trim() || (hintTitle && !/^https?:/i.test(hintTitle) ? hintTitle : firstLine).slice(0, 140);
    const moduleCount = Math.min(20, Math.max(modules.length, Number(raw?.moduleCount) || 0));
    const hours = Number(raw?.durationHours);
    return {
        title,
        description: String(raw?.description || text).trim().slice(0, 4000),
        audience: asList(raw?.audience, 8),
        level: oneOf(raw?.level, levels),
        moduleCount,
        industry: String(raw?.industry || '').trim().slice(0, 80),
        country: String(raw?.country || '').trim().slice(0, 80),
        standards: oneOf(raw?.standards, standards),
        courseStyle: oneOf(raw?.courseStyle, styles),
        purpose: String(raw?.purpose || '').trim().slice(0, 800),
        approvedOutcomes: String(raw?.approvedOutcomes || '').trim().slice(0, 800),
        language: String(raw?.language || '').trim().slice(0, 80),
        archetype: oneOf(raw?.archetype, archetypes),
        deliveryMode: oneOf(raw?.deliveryMode, delivery),
        topics: asList(raw?.topics, 12),
        modules,
        summary: String(raw?.summary || text).trim().slice(0, 1200),
        durationHours: Number.isFinite(hours) && hours > 0 ? Math.min(hours, 200) : 0
    };
};

const readCourseProfile = async (text, hintTitle) => {
    const prompt = `Read this course source and return only JSON. Use the source. Do not invent standards, laws, statistics, or citations that are not in the text. Leave a field as an empty string or empty array when the source does not support it.
{
  "title": "professional course title",
  "description": "70 to 120 word course description a learner would read",
  "audience": ["who this is for"],
  "level": "Beginner or Intermediate or Advanced or Professional",
  "moduleCount": 0,
  "industry": "",
  "country": "",
  "standards": "Global (ISO/IEC) or Regional or Industry Specific or empty",
  "courseStyle": "Academic / Formal Style or Storytelling Style or Interactive Coaching Style or Humanized Teaching Style or Modern Edutainment Style or Scenario-Based Style or empty",
  "purpose": "the professional job this course must do",
  "approvedOutcomes": "what a professional must be able to do after the course",
  "language": "",
  "archetype": "Let AI select or Awareness or Standard-compliance or Auditor-verifier or Procedural or Conceptual or Software or Leadership or Exam-preparation",
  "deliveryMode": "Self-paced or Live virtual or Classroom or Blended or empty",
  "durationHours": 0,
  "topics": ["main topic"],
  "modules": [{ "title": "module title", "lessons": ["lesson title"] }],
  "summary": "short factual summary of what was imported"
}
Hint title: ${hintTitle || 'none'}
Source:
${text.slice(0, 12000)}`;
    try {
        const profile = await completeJson(prompt);
        return buildImportedCourse(profile, text, hintTitle);
    }
    catch (error) {
        console.error('readCourseProfile', error?.message || error);
        return buildImportedCourse(null, text, hintTitle);
    }
};

export const extractCourseSource = async (req, res) => {
    try {
        const level = String(req.body?.level || 'Level 1').trim();
        const date = String(req.body?.date || '').trim();
        const forbidden = String(req.body?.forbidden || '') === 'true';
        const sourceUrl = String(req.body?.url || '').trim();
        let text = String(req.body?.text || '');
        let hintTitle = String(req.body?.title || '').trim();
        let kind = text.trim() ? 'text' : 'file';
        if (req.file?.buffer) {
            kind = 'file';
            hintTitle = hintTitle || String(req.file.originalname || 'Uploaded file').replace(/\.[^.]+$/, '');
            text = await readUpload(req.file);
        }
        else if (!text.trim() && sourceUrl) {
            kind = 'url';
            const page = await readPublicLink(sourceUrl);
            text = page.text;
            if (page.pageTitle)
                hintTitle = page.pageTitle;
        }
        text = cleanText(text).slice(0, 20000);
        if (!text)
            return res.status(400).json({ message: kind === 'url' ? 'That page did not include readable course text. Paste the syllabus instead.' : 'No source text could be read' });
        const course = await readCourseProfile(text, hintTitle);
        const title = course.title || hintTitle || 'Imported course';
        return res.json({
            source: { title, level, date, forbidden, text, url: sourceUrl, kind },
            course: { ...course, title }
        });
    }
    catch (error) {
        console.error('extractCourseSource', error);
        const status = error.status || (error.name === 'TimeoutError' ? 400 : 500);
        const message = status === 400
            ? (error.message || 'Could not read that source')
            : (kindMessage(error) || 'Could not read that source');
        return res.status(status).json({ message });
    }
};

const kindMessage = (error) => {
    const text = String(error?.message || '');
    if (/password|encrypted/i.test(text))
        return 'That file is protected and could not be read';
    if (/invalid pdf|pdf/i.test(text))
        return 'That PDF could not be read';
    return '';
};

export const generateBriefField = async (req, res) => {
    try {
        const field = String(req.body?.field || '');
        const courseData = req.body?.courseData || {};
        const title = String(courseData.title || '').trim();
        if (!title)
            return res.status(400).json({ message: 'Add a course title first' });
        if (field !== 'purpose' && field !== 'outcome')
            return res.status(400).json({ message: 'Choose a brief field to write' });
        const audience = Array.isArray(courseData.audience) ? courseData.audience.join(', ') : String(courseData.audience || '');
        const ask = field === 'purpose'
            ? 'Write the primary purpose of this course: the professional job it must do. Two or three sentences.'
            : 'Write the professional outcome: what a professional must be able to do after this course. Two or three sentences.';
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0.4,
            max_tokens: 220,
            messages: [{
                role: 'user',
                content: `${ask} Use only the course details below. Plain sentences. No title, bullets, or quotes.\nTitle: ${title}\nLevel: ${courseData.level || ''}\nAudience: ${audience}\nIndustry: ${courseData.industry || ''}\nStandards: ${courseData.standards || ''}`
            }]
        });
        const text = String(completion.choices?.[0]?.message?.content || '').replace(/^["']|["']$/g, '').trim();
        if (!text)
            return res.status(502).json({ message: 'Orion could not write that field' });
        return res.json({ text });
    }
    catch (error) {
        return handleOpenAIError(error, res, 'generate-brief-field');
    }
};

export const fixScopeWithAudit = async (req, res) => {
    try {
        const { currentScope, findings, courseData } = req.body || {};
        const title = String(courseData?.title || 'Course').trim();
        const description = String(courseData?.description || '').trim();
        const level = String(courseData?.level || '').trim();
        const audience = Array.isArray(courseData?.audience)
            ? courseData.audience.join(', ')
            : String(courseData?.audience || '');

        const findingsText = Array.isArray(findings) && findings.length > 0
            ? findings.map((f, i) => `${i + 1}. [${f.severity || 'Issue'}] ${f.location || 'Observation'}: ${f.problem || ''}`).join('\n')
            : 'Resolve general quality and alignment issues.';

        const prompt = `You are CourseForge, an expert educational curriculum architect and technical editor.
A course scope has been evaluated by a quality auditor and flagged with the following problems:

AUDIT PROBLEMS & FINDINGS:
${findingsText}

COURSE CONTEXT:
- Title: ${title}
- Level: ${level}
- Target Audience: ${audience}
- Description: ${description}

CURRENT SCOPE:
"${currentScope || ''}"

YOUR GOAL:
1. Thoroughly understand the auditor's problems, especially Critical and Major issues (e.g. inappropriate ISO/IEC standards referenced for general physics education, unverified claims, wording mismatches like "Newton's Law" vs "Newton's Laws", overly simple reminders, curriculum alignment).
2. Rewrite the course Scope to completely resolve and fix every flagged problem.
3. Keep the scope clear, practical, professional, academically sound, and aligned with standard curriculum and practical real-world applications.
4. Provide a 1-2 sentence explanation of what problems you fixed.

Return your answer strictly in JSON:
{
  "correctedScope": "The fully corrected, problem-free scope text...",
  "explanation": "Clear explanation of the corrections made to fix the auditor's findings."
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0.3,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        });

        const result = readJson(response.choices?.[0]?.message?.content);
        if (!result?.correctedScope) {
            return res.status(502).json({ message: 'Could not generate corrected scope' });
        }

        return res.json({
            correctedScope: String(result.correctedScope).trim(),
            explanation: String(result.explanation || 'Scope corrected based on audit findings.').trim()
        });
    } catch (error) {
        return handleOpenAIError(error, res, 'fix-scope-with-audit');
    }
};

export const generateModuleTask = async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let reservation = null;
    const actionKey = 'quiz_openai';
    const referenceId = `quiz_task_${randomUUID()}`;

    try {
        const { moduleTitle, moduleContent, taskType, courseData } = req.body || {};
        const title = String(moduleTitle || courseData?.title || 'Module').trim();
        const contentStr = typeof moduleContent === 'object'
            ? JSON.stringify(moduleContent).slice(0, 4000)
            : String(moduleContent || '').slice(0, 4000);

        const isPractical = taskType === 'practical';

        // Ensure the pricing rule exists in DB with default 8 credits if not present
        await PricingRule.findOneAndUpdate(
            { actionKey },
            {
                $setOnInsert: {
                    actionKey,
                    displayName: 'Generate Quiz',
                    provider: 'openai',
                    creditCost: 8,
                    isActive: true,
                },
            },
            { upsert: true, new: true }
        ).catch(() => {});

        // Reserve credits from user wallet
        try {
            console.log(`[Credits] Reserving credits for user ${userId}, action: ${actionKey}`);
            reservation = await reserve(userId, actionKey, referenceId);
            console.log(`[Credits] Reserved ${Math.abs(reservation?.amount || 8)} credits for user ${userId}`);
        } catch (reserveErr) {
            if (reserveErr instanceof InsufficientCreditsError || reserveErr.name === 'InsufficientCreditsError') {
                console.warn(`[Credits] Insufficient credits for user ${userId}: ${reserveErr.message}`);
                return res.status(402).json({
                    success: false,
                    message: reserveErr.message || 'Insufficient credits to generate quiz task',
                    code: 'insufficient_credits',
                });
            }
            console.error(`[Credits] Credit reservation failed for user ${userId}:`, reserveErr);
            return res.status(400).json({
                success: false,
                message: reserveErr.message || 'Credit reservation failed',
            });
        }

        const prompt = isPractical
            ? `You are an expert instructional designer. Generate a realistic, hands-on practical assignment task for this course module.
Course: ${courseData?.title || ''}
Module: ${title}
Content: ${contentStr}

Return JSON strictly in this structure:
{
  "item": "Practical task title (e.g. Hands-on deployment challenge)",
  "prompt": "Detailed step-by-step instructions on what the learner must do...",
  "evidence": "What the learner must submit to demonstrate completion...",
  "threshold": "80% accuracy or complete functional deployment"
}`
            : `You are an expert instructional designer. Generate a high-quality, practical multiple-choice quiz question for this course module.
Course: ${courseData?.title || ''}
Module: ${title}
Content: ${contentStr}

Return JSON strictly in this structure:
{
  "stem": "Clear, practical question testing core knowledge from the module...",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "answer": "Exact matching string from options array that is correct",
  "topic": "${title}",
  "difficulty": "Medium"
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0.4,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        });

        const result = readJson(response.choices?.[0]?.message?.content);
        if (!result) {
            if (reservation) {
                await release(userId, reservation).catch((e) => console.error('[Credits] Release error:', e?.message));
            }
            return res.status(502).json({ message: 'Could not generate module task' });
        }

        // Deduct actual cost from wallet via reconcile
        const actualCost = Math.abs(Number(reservation?.amount || 8));
        const usageMeta = {
            provider: 'openai',
            model: 'gpt-4o',
            taskType: isPractical ? 'practical' : 'quiz',
            moduleTitle: title,
            actualCost,
        };

        try {
            await reconcile(userId, reservation, actualCost, usageMeta);
            console.log(`[Credits] Successfully deducted ${actualCost} credits for user ${userId}`);
        } catch (reconcileErr) {
            console.error(`[Credits] Reconcile error for user ${userId}:`, reconcileErr?.message || reconcileErr);
        }

        return res.json({
            task: result,
            creditsDeducted: actualCost,
        });
    } catch (error) {
        if (reservation) {
            await release(userId, reservation).catch((e) => console.error('[Credits] Release error on catch:', e?.message));
        }
        return handleOpenAIError(error, res, 'generate-module-task');
    }
};
