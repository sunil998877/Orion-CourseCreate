export const COURSEFORGE_RULES = `
You are CourseForge, a senior instructional designer, subject-matter research analyst, presentation strategist, trainer-script writer, assessment architect, and technical editor.
Operating rules:
- Design learner capability before slides. Accuracy and source integrity come before aesthetics.
- Use authoritative sources first. Never invent requirements, clause numbers, statistics, citations, papers, page numbers, or examples presented as real.
- Separate mandatory requirements, official guidance, industry practice, and trainer recommendations.
- Use simple professional language without diluting technical meaning.
- One main idea per slide. Titles must state a claim.
- Slides are for the learner's eyes. Narration is for the learner's ears. Do not read slide text aloud.
- Use one realistic running case. Label fictional facts.
- Sequence practice as worked example, guided practice, independent practice, then transfer.
- Use retrieval, contrast, examples and non-examples, cycling of the main idea, and misconception correction.
- Every learning outcome must have matching practice and assessment evidence.
- If a standard, law, safety, medical, tax, GHG, audit, or certification claim is not in the supplied sources, mark it verification required or put it on the do-not-claim list.
- Do not cite a source you were not given. When sources disagree, the higher-authority source controls and the disagreement is stated.
- Source levels: 1 controlling authority, 2 strong support, 3 explanatory support, 4 general explanation. Level 4 never overrides a higher level.
- If exact legal or standards wording was not supplied, paraphrase and label the statement as a paraphrase.
- Internal policy is an organizational requirement unless an external source confirms it.
- Do not open with a generic greeting or "Today I will talk about". Start from a decision, problem, or scenario. End on what the learner can now do.
`.trim();

const text = (value) => String(value ?? '').trim();

export const usesCourseForge = (courseData) => {
    const forge = courseData?.courseForge;
    if (!forge || typeof forge !== 'object')
        return false;
    return Boolean(String(forge.purpose || '').trim() || forge.researchDossier || forge.blueprint || (Array.isArray(forge.sources) && forge.sources.length > 0));
};

export const slidesNeedBlueprint = (courseData) => {
    if (!usesCourseForge(courseData))
        return false;
    return courseData.courseForge.blueprintApproved !== true;
};

export const formatCourseInput = (courseData = {}) => {
    const forge = courseData.courseForge && typeof courseData.courseForge === 'object' ? courseData.courseForge : {};
    const lines = [
        `Course title: ${text(courseData.title)}`,
        `Course subtitle: ${text(forge.subtitle)}`,
        `Archetype: ${text(forge.archetype) || 'Let AI select'}`,
        `Primary purpose: ${text(forge.purpose)}`,
        `Description: ${text(courseData.description)}`,
        `Level: ${text(courseData.level)}`,
        `Audience: ${Array.isArray(courseData.audience) ? courseData.audience.join(', ') : text(courseData.audience)}`,
        `Entry knowledge: ${text(forge.prerequisites)}`,
        `Workplace context: ${text(forge.workplaceContext)}`,
        `Learner problems: ${text(forge.learnerProblems)}`,
        `Delivery mode: ${text(forge.deliveryMode)}`,
        `Duration: ${courseData.duration?.value ?? ''} ${courseData.duration?.unit ?? ''}`,
        `Module count: ${courseData.module ?? ''}`,
        `Approved module plan: ${text(forge.approvedModulePlan)}`,
        `Slide count constraint: ${text(forge.slideCount)}`,
        `Language: ${text(forge.language) || 'English'}`,
        `Reading level: ${text(forge.readingLevel)}`,
        `Trainer tone: ${text(forge.trainerTone) || text(courseData.courseStyle)}`,
        `Presenter style: ${text(forge.presenterStyle) || 'Full script'}`,
        `Jurisdiction: ${text(forge.jurisdiction) || text(courseData.country)}`,
        `Standards already selected: ${text(courseData.standards)}`,
        `Industry: ${text(courseData.industry)}`,
        `Applicable standards, laws, schemes, editions: ${text(forge.applicableStandards)}`,
        `Accreditation or examination requirements: ${text(forge.accreditation)}`,
        `Sources that must not be used: ${text(forge.forbiddenSources)}`,
        `Known factual risks: ${text(forge.factualRisks)}`,
        `Approved learning outcomes: ${text(forge.approvedOutcomes)}`,
        `Skills to demonstrate: ${text(forge.skillsToDemonstrate)}`,
        `Case-study context: ${text(forge.caseContext)}`,
        `Assessment requirements: ${text(forge.assessmentRequirements)}`,
        `Passing score: ${text(forge.passingScore)}`,
        `Retake rules: ${text(forge.retakeRules)}`,
        `Practical competence requirement: ${text(forge.practicalRequirement)}`,
        `Workbook depth: ${text(forge.workbookDepth)}`,
        `Workbook requirements: ${text(forge.workbookRequirements)}`,
        `Storytelling requirement: ${text(forge.storytellingRequirement)}`,
        `Research or white-paper requirement: ${text(forge.researchRequirement)}`,
        `Visual tool: ${text(forge.visualTool) || 'Gamma'}`,
        `Brand style: ${text(forge.brandStyle)}`,
        `Opening format: ${text(forge.openingFormat)}`,
        `Ending format: ${text(forge.endingFormat)}`,
        `Other constraints: ${text(forge.otherConstraints)}`
    ];
    return lines.join('\n');
};

export const formatSources = (courseData = {}) => {
    const sources = Array.isArray(courseData.courseForge?.sources) ? courseData.courseForge.sources : [];
    if (!sources.length)
        return 'No source documents were supplied. Do not invent citations. Mark unsupported technical claims as verification required.';
    return sources.map((source, index) => {
        const body = text(source.text).slice(0, 12000);
        return `SOURCE ${index + 1}\nTitle: ${text(source.title) || 'Untitled'}\nLevel: ${text(source.level) || 'unspecified'}\nDate: ${text(source.date)}\nForbidden: ${source.forbidden ? 'yes' : 'no'}\nText:\n${body}`;
    }).join('\n\n');
};

export const sanitizeModuleContent = (content) => {
    if (!content || typeof content !== 'object')
        return content;
    content.FurtherStudy = {
        ExternalLinks: [],
        BookReferences: Array.isArray(content.FurtherStudy?.BookReferences)
            ? content.FurtherStudy.BookReferences.filter((item) => text(item)).slice(0, 5)
            : []
    };
    return content;
};

export const buildModuleContentPrompt = ({ title, description, audience, level, industry, standards, courseStyle, previousModulesText, refineText, moduleNumber, courseData }) => {
    const data = courseData || { title, description, audience, level, industry, standards, courseStyle };
    return `${COURSEFORGE_RULES}

${formatCourseInput(data)}

Approved research dossier:
${JSON.stringify(data.courseForge?.researchDossier || {}).slice(0, 12000)}

Approved blueprint:
${JSON.stringify(data.courseForge?.blueprint || {}).slice(0, 12000)}

Previous modules:
${previousModulesText || 'None'}
${refineText || ''}

Create teaching content for module ${moduleNumber} only. Do not write slides or narration.
Return JSON:
{
  "Title": "",
  "Objectives": [],
  "TeachingContent": [{ "Topics": "", "StandardsReference": "", "ContentPoints": [] }],
  "CaseStudy": { "CaseStudyDescription": "", "Questions": [], "ModelAnswers": [] },
  "Quizzes": [],
  "VisualDescriptions": [],
  "FurtherStudy": { "ExternalLinks": [], "BookReferences": [] }
}
Rules:
- Title is the topic name only, without a module number.
- Stay inside the approved blueprint and dossier.
- Do not invent links, books, clause numbers, or papers.
- ExternalLinks must be an empty array.
- BookReferences may name only supplied sources.
- Quizzes must be an empty array. Scored assessment is a later stage.
- Keep one running case consistent with the blueprint.
- Return JSON only.`;
};

export const buildSlidePrompt = ({ title, courseStyle, previousModulesText, refineText, moduleNumber, level, courseData }) => {
    const data = courseData || { title, courseStyle, level };
    const slideCount = text(data.courseForge?.slideCount) || '10';
    return `${COURSEFORGE_RULES}

${formatCourseInput(data)}

Approved dossier:
${JSON.stringify(data.courseForge?.researchDossier || {}).slice(0, 8000)}

Approved blueprint:
${JSON.stringify(data.courseForge?.blueprint || {}).slice(0, 8000)}

Create ONLY the presentation for module ${moduleNumber} of "${title || data.title || 'the course'}".
Do not write the trainer script. Every Transcript value must be an empty string.
Previous modules:
${previousModulesText || 'None'}
${refineText || ''}
Return JSON:
{
  "Slides": [
    {
      "SlideNumber": 1,
      "Title": "",
      "Purpose": "",
      "LearningOutcome": "",
      "Bullets": [],
      "Content": "",
      "VisualPrompt": "",
      "VisualType": "",
      "LearnerAction": "",
      "AccessibilityNote": "",
      "Transition": "",
      "EstimatedTime": "",
      "Sources": [],
      "Transcript": ""
    }
  ]
}
Rules:
- Produce exactly ${slideCount} slides unless that value is not a number, in which case produce 10 slides.
- One main idea per slide. Title is an assertion, not a topic label.
- On-slide Content and Bullets stay short. Put explanation in narration later, not here.
- VisualType is one of flowchart, decision tree, timeline, comparison, layered model, annotated calculation, evidence chain, or none.
- Opening slides earn attention, state the empowerment promise, the stakes, and the roadmap.
- Closing slides hold the transfer challenge, case questions, takeaways, and the learner capability.
- Include retrieval or application on a regular cadence.
- Fence easily confused concepts.
- Technical claims cite only supplied sources.
- Tone follows ${courseStyle || data.courseStyle || 'Academic / Formal Style'} and reading level ${text(data.courseForge?.readingLevel) || 'General professional'}.
- Audience level: ${level || data.level || ''}.
- Return JSON only.`;
};

export const buildNarrationPrompt = ({ courseData, moduleNumber, slides }) => {
    const style = text(courseData?.courseForge?.presenterStyle) || 'Full script';
    return `${COURSEFORGE_RULES}

${formatCourseInput(courseData)}
Presenter style: ${style}
Approved dossier:
${JSON.stringify(courseData?.courseForge?.researchDossier || {}).slice(0, 8000)}

Write trainer narration for module ${moduleNumber} only, for these approved slides:
${JSON.stringify(slides).slice(0, 14000)}

Return JSON:
{ "Slides": [{ "SlideNumber": 1, "Transcript": "", "CueCard": [] }] }
For each slide:
- Connect from the previous slide.
- Explain in plain professional language, then state the precise technical meaning.
- Give an example and a non-example when it helps discrimination.
- Say why it matters.
- Use a short retrieval question when useful.
- Make the structure audible.
- Add a delivery cue such as [pause] only when useful.
- Do not read the on-slide text aloud.
- Do not add a technical claim that is absent from the dossier.
- Keep approved terms and case facts exact.
- After any analogy, state the formal rule.
- CueCard has at most five short cues.
- If presenter style is Cue cards, Transcript is a short spoken bridge and CueCard carries the talk track.
- If presenter style is Full script, Transcript is the full spoken script and CueCard still has at most five cues.
- If presenter style is Both, write the full Transcript and the CueCard.
- For a question slide: ask the question, read the options, say to take five seconds, include [pause 5 seconds], reveal the answer, explain why the nearest distractor is wrong, and connect back to the course rule.
- Return JSON only.`;
};

export const buildDossierPrompt = (courseData) => `${COURSEFORGE_RULES}

${formatCourseInput(courseData)}

Supplied sources:
${formatSources(courseData)}

Create ONLY the Research and Source Dossier. Do not create slides, narration, workbook chapters, or assessment questions.
Return JSON with these keys:
scope, editionCheck, sourceHierarchy, definitions, boundaries, technicalRules, misconceptions, requirementMatrix, researchNotes, doNotClaim, assumptions, unresolvedQuestions, claimMap, smeReview.
sourceHierarchy is an array of { title, level, date, use }.
requirementMatrix is an array of { statement, classification } where classification is requirement, guidance, industry practice, or trainer recommendation.
claimMap is an array of { claim, source, status }.
If you cannot verify a claim, say so. Never invent a source.
Return JSON only.`;

export const buildBlueprintPrompt = (courseData) => `${COURSEFORGE_RULES}

${formatCourseInput(courseData)}

Approved research dossier:
${JSON.stringify(courseData?.courseForge?.researchDossier || {})}

Create ONLY the backward-designed course blueprint. Do not create slides.
Return JSON with these keys:
learnerTransformation, empowermentPromise, memorableIdea, learningOutcomes, alignmentMatrix, modules, prerequisites, conceptMap, misconceptionPlan, runningCase, practiceLadder, retrievalPlan, transferTask, assessmentStrategy, slideRange.
learningOutcomes has 3 to 8 observable outcomes.
alignmentMatrix items use outcome, performance, evidence, activity, assessment, source.
modules preserves any approved module names and includes timing.
runningCase separates fictional facts from real facts.
Return JSON only.`;

export const buildAssessmentPrompt = (courseData, modules) => `${COURSEFORGE_RULES}

${formatCourseInput(courseData)}

Approved dossier:
${JSON.stringify(courseData?.courseForge?.researchDossier || {}).slice(0, 8000)}

Approved blueprint:
${JSON.stringify(courseData?.courseForge?.blueprint || {}).slice(0, 8000)}

Taught modules:
${JSON.stringify(modules || []).slice(0, 12000)}

Create ONLY the assessment system.
CRITICAL MANDATORY REQUIREMENT:
You MUST create EXACTLY 20 scored multiple-choice assessment questions in the "items" array (item 1 through item 20, exactly 20 items) and EXACTLY 20 corresponding entries in the "blueprint" array.
You MUST distribute the 20 questions evenly across ALL taught modules (e.g. for 5 modules, assign 4 questions per module: items 1-4 with moduleIndex 0 & moduleNumber 1, items 5-8 with moduleIndex 1 & moduleNumber 2, items 9-12 with moduleIndex 2 & moduleNumber 3, items 13-16 with moduleIndex 3 & moduleNumber 4, items 17-20 with moduleIndex 4 & moduleNumber 5).
Every module MUST have assessment questions and at least 1 practical task.

Return JSON:
{
  "blueprint": [
    { "item": "Item 1", "moduleIndex": 0, "moduleNumber": 1, "outcome": "", "cognitiveDemand": "Recall|Application|Analysis|Evaluation", "topic": "", "type": "Multiple Choice", "difficulty": "Easy|Medium|Hard", "evidence": "", "source": "" }
  ],
  "items": [
    { "itemNumber": 1, "moduleIndex": 0, "moduleNumber": 1, "stem": "Clear scenario or question", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Exact matching correct option text", "outcome": "", "cognitiveDemand": "Application", "difficulty": "Medium", "topic": "", "whyCorrect": "Explanation of why this is correct", "whyDistractors": ["Why A is wrong", "Why B is wrong", "Why C is wrong"], "misconception": "Common error or myth", "remediation": "Review guidance", "source": "" }
  ],
  "practicalTasks": [
    { "moduleIndex": 0, "moduleNumber": 1, "item": "Practical Task 1", "prompt": "Practical exercise description", "evidence": "Expected deliverable", "threshold": "80% accuracy or complete deployment" }
  ],
  "practicalTask": { "prompt": "", "rubric": [], "threshold": "80% accuracy or complete deployment", "modelResponse": "", "commonErrors": [], "remediation": "" }
}
Rules:
- MUST PROVIDE EXACTLY 20 QUESTIONS in the "items" array (no fewer than 20, no more than 20).
- MUST PROVIDE EXACTLY 20 CORRESPONDING ENTRIES in the "blueprint" array.
- Questions MUST be distributed across ALL modules so that NO module has 0 questions.
- Exactly four plausible options and one best answer for each question.
- No joke options. No "all of the above" or "none of the above" unless a real assessment reason is stated in remediation.
- Explain every distractor in whyDistractors (3 strings for the 3 incorrect options).
- Sample the approved outcomes across ALL modules.
- Include a practical task for each module in practicalTasks and the course capstone practical task in practicalTask.
- Return JSON only.`;

export const buildWorkbookPrompt = (courseData, moduleNumber, moduleContent) => `${COURSEFORGE_RULES}

${formatCourseInput(courseData)}

Approved dossier:
${JSON.stringify(courseData?.courseForge?.researchDossier || {}).slice(0, 6000)}

Approved blueprint:
${JSON.stringify(courseData?.courseForge?.blueprint || {}).slice(0, 6000)}

Module ${moduleNumber} content:
${JSON.stringify(moduleContent || {}).slice(0, 8000)}

Create ONLY the standalone learner e-workbook for this module. It must work without the slides.
Return JSON:
{
  "frontMatter": { "promise": "", "howToUse": "", "outcomes": [], "moduleMap": "", "preCheck": [], "caseIntroduction": "" },
  "chapter": {
    "openingScene": "",
    "ableToDo": "",
    "vocabulary": [{ "term": "", "precise": "", "simple": "", "analogy": "", "example": "", "nonExample": "", "whyItMatters": "", "source": "" }],
    "explanation": "",
    "whyItMatters": "",
    "examples": [],
    "nonExamples": [],
    "diagram": "",
    "workedExample": "",
    "guidedPractice": "",
    "independentPractice": "",
    "reflection": "",
    "knowledgeCheck": [],
    "memoryRule": "",
    "sources": []
  }
}
Use one running case. Label fictional facts. After every analogy, state the formal rule.
Do not treat a commercial white paper as equal to a law, standard, or peer-reviewed source.
Return JSON only.`;

export const buildAuditPrompt = (payload) => `${COURSEFORGE_RULES}

Act as an independent red-team course auditor. Do not praise the course before the findings.
Audit this package:
${JSON.stringify(payload).slice(0, 24000)}

Check edition, jurisdiction, invented citations, requirement versus guidance, missing exceptions, contradictions, outcome alignment, overload, slide and script duplication, weak analogies, case consistency, ambiguous questions, answer keys, calculations, accessibility, and copyright.
Return JSON:
{
  "findings": [{ "location": "", "problem": "", "severity": "Critical", "risk": "", "correction": "", "source": "" }],
  "decision": "APPROVE",
  "smeReview": []
}
severity is Critical, Major, or Minor.
decision is exactly one of APPROVE, APPROVE AFTER CORRECTION, DO NOT APPROVE.
Return JSON only.`;

export const workbookAddendum = (course) => {
    if (!course?.courseForge)
        return '';
    return `\n\nCOURSEFORGE WORKBOOK CONSTRAINTS\n${COURSEFORGE_RULES}\n\n${formatCourseInput(course)}\n\nThe book must stand alone. Include definitions, examples, non-examples, a worked example, guided practice, independent practice, a knowledge check, and chapter sources. Use the approved running case. Do not invent citations.\nApproved blueprint:\n${JSON.stringify(course.courseForge.blueprint || {}).slice(0, 4000)}\n`;
};
