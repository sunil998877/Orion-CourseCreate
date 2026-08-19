import Course from '../../models/courseModel.js';
import { randomUUID } from 'crypto';
import { generateGammaSlides } from '../../services/gammaService.js';

import {
  InsufficientCreditsError,
  reserve,
  release,
  reconcile,
} from '../../services/creditService/creditService.js';

const CreditService = { reserve, release, reconcile };

const GAMMA_API_KEY = process.env.GAMMA_API_KEY;
const GAMMA_ENABLED = Boolean(GAMMA_API_KEY);

export const generateModuleSlidesGamma = async (req, res) => {
  const { courseId, moduleNumber, moduleContent, slideContent, gammaTheme } = req.body || {};
  if (!Number.isFinite(moduleNumber)) {
    return res.status(400).json({ message: 'moduleNumber is required' });
  }
  if (!GAMMA_ENABLED) {
    return res.status(503).json({ message: 'Gamma API is not configured. Set GAMMA_API_KEY in .env' });
  }

  const userId = req.user?.id || req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  let reservation = null;

  try {
    let outline = '';
    if (slideContent && typeof slideContent === 'object' && Array.isArray(slideContent.Slides) && slideContent.Slides.length) {
      const slides = slideContent.Slides;
      slides.forEach((sl, idx) => {
        const title = sl.Title || sl.title || 'Slide ' + (idx + 1);
        outline += '## ' + title + '\n';
        const bullets = Array.isArray(sl.Bullets) ? sl.Bullets : (Array.isArray(sl.BulletPoints) ? sl.BulletPoints : []);
        bullets.forEach(b => { outline += '- ' + b + '\n'; });
        if (sl.Content) outline += sl.Content + '\n';
        outline += '\n';
      });
    } else if (moduleContent && typeof moduleContent === 'object') {
      const c = moduleContent;
      const title = c.Title || c.title || `Module ${moduleNumber}`;
      const objectives = Array.isArray(c.Objectives) ? c.Objectives : (Array.isArray(c.objectives) ? c.objectives : []);
      const tc = Array.isArray(c.TeachingContent) ? c.TeachingContent : (Array.isArray(c.teachingContent) ? c.teachingContent : []);
      outline = `# ${title}\n\n`;
      if (objectives.length) outline += '## Learning objectives\n' + objectives.map(o => `- ${o}`).join('\n') + '\n\n';
      tc.forEach((item) => {
        const topic = item.Topics || item.title || '';
        const points = Array.isArray(item.ContentPoints) ? item.ContentPoints : (Array.isArray(item.points) ? item.points : []);
        const pointsStr = points.length ? points.map(p => '- ' + p).join('\n') + '\n\n' : '\n';
        outline += '## ' + topic + '\n' + pointsStr;
      });
      const caseDesc = (c.CaseStudy && c.CaseStudy.CaseStudyDescription) || (c.caseStudy && (c.caseStudy.CaseStudyDescription || c.caseStudy.description)) || '';
      if (caseDesc) outline += '## Case study\n' + caseDesc + '\n\n';
    } else if (courseId) {
      const course = await Course.findOne({ userId, courseId: String(courseId) });
      if (!course) return res.status(404).json({ message: 'Course not found' });
      const mod = (course.modules || []).find(m => Number(m.moduleNumber) === Number(moduleNumber));
      if (!mod) return res.status(404).json({ message: 'Module not found' });
      const title = mod.Title || `Module ${moduleNumber}`;
      const objectives = Array.isArray(mod.Objectives) ? mod.Objectives : [];
      const tc = Array.isArray(mod.TeachingContent) ? mod.TeachingContent : [];
      outline = `# ${title}\n\n`;
      if (objectives.length) outline += '## Learning objectives\n' + objectives.map(o => `- ${o}`).join('\n') + '\n\n';
      tc.forEach((item) => {
        const topic = item.Topics || '';
        const points = Array.isArray(item.ContentPoints) ? item.ContentPoints : [];
        const pointsStr = points.length ? points.map(p => '- ' + p).join('\n') + '\n\n' : '\n';
        outline += '## ' + topic + '\n' + pointsStr;
      });
      if (mod.CaseStudy && mod.CaseStudy.CaseStudyDescription) outline += '## Case study\n' + mod.CaseStudy.CaseStudyDescription + '\n\n';
    }

    if (!outline.trim()) {
      return res.status(400).json({ message: 'No slide or module content. Generate modules first (OpenAI fills slide card), then use Generate Slides.' });
    }

    const referenceId = courseId ? `${courseId}_mod_${moduleNumber}` : `mod_${moduleNumber}_${randomUUID()}`;

    // STEP 1: RESERVE CREDITS BEFORE CALLING AI PROVIDER
    try {
      console.log(`[Credits] Reservation started for user ${userId}, action: course_generation_gamma, ref: ${referenceId}`);
      reservation = await CreditService.reserve(userId, 'course_generation_gamma', referenceId);
      console.log(`[Credits] Reservation successful for user ${userId}, reserved ${Math.abs(reservation.amount)} credits`);
    } catch (reserveErr) {
      if (reserveErr instanceof InsufficientCreditsError || reserveErr.name === 'InsufficientCreditsError') {
        console.warn(`[Credits] Insufficient credits for user ${userId}: ${reserveErr.message}`);
        return res.status(402).json({
          success: false,
          message: reserveErr.message
        });
      }
      console.error(`[Credits] Reservation error for user ${userId}:`, reserveErr.message);
      return res.status(400).json({
        success: false,
        message: reserveErr.message || 'Credit reservation failed'
      });
    }

    // STEP 2: CALL EXISTING GAMMA PROVIDER
    const course = await Course.findOne({ userId, courseId: String(courseId) });
    console.log(`[Credits] Gamma generation started for user ${userId}`);

    let gammaOutput;
    try {
      gammaOutput = await generateGammaSlides(outline, gammaTheme || 'aurora', course?.title || 'Your Course');
    } catch (gammaErr) {
      console.error(`[Credits] Gamma generation failed for user ${userId}:`, gammaErr.message);
      if (reservation) {
        try {
          await CreditService.release(userId, reservation);
          console.log(`[Credits] Reservation released for user ${userId}`);
        } catch (relErr) {
          console.error(`[Credits] Failed to release reservation for user ${userId}:`, relErr.message);
        }
      }
      throw gammaErr;
    }

    const gammaUrl = gammaOutput?.gammaLink;
    const gammaGenerationId = gammaOutput?.generationId;

    if (!gammaUrl) {
      console.error(`[Credits] Gamma completed but no presentation URL found for user ${userId}`);
      if (reservation) {
        try {
          await CreditService.release(userId, reservation);
          console.log(`[Credits] Reservation released for user ${userId}`);
        } catch (relErr) {
          console.error(`[Credits] Failed to release reservation for user ${userId}:`, relErr.message);
        }
      }
      return res.status(502).json({
        success: false,
        message: 'Gamma completed but no presentation URL was generated'
      });
    }

    // STEP 3: SUCCESS → RECONCILE
    console.log(`[Credits] Gamma generation successful for user ${userId}, generationId: ${gammaGenerationId}`);
    try {
      const reservedCost = Math.abs(reservation.amount);
      const reportedCredits = Number(gammaOutput?.credits);
      const cardCount = Array.isArray(slideContent?.Slides) && slideContent.Slides.length ? slideContent.Slides.length : 10;
      
      const actualCost = Number.isFinite(reportedCredits) && reportedCredits > 0
        ? Math.min(reservedCost, Math.round(reportedCredits))
        : Math.min(reservedCost, cardCount * 8);

      const usageMeta = {
        provider: 'gamma',
        providerReferenceId: gammaGenerationId || null,
        cardCount,
        actualCost,
        ...(gammaOutput?.credits ? { providerCredits: gammaOutput.credits } : {})
      };

      await CreditService.reconcile(userId, reservation, actualCost, usageMeta);
      console.log(`[Credits] Reconciliation successful for user ${userId}, actualCost: ${actualCost}, refunded: ${reservedCost - actualCost}`);
    } catch (reconcileErr) {
      console.error(`[Credits] Reconciliation error for user ${userId}:`, reconcileErr.message);
    }

    // UPDATE COURSE MODULE IN DATABASE
    if (courseId) {
      try {
        const courseToUpdate = await Course.findOne({ userId, courseId: String(courseId) });
        if (courseToUpdate) {
          if (!Array.isArray(courseToUpdate.modules)) {
            courseToUpdate.modules = [];
          }
          const modIndex = courseToUpdate.modules.findIndex(m => Number(m.moduleNumber) === Number(moduleNumber));
          if (modIndex >= 0) {
            courseToUpdate.modules[modIndex].gammaUrl = gammaUrl;
            courseToUpdate.modules[modIndex].gammaGenerationId = gammaGenerationId;
          } else {
            const fallbackTitle =
              String(
                (moduleContent && (moduleContent.Title || moduleContent.title)) ||
                (slideContent && Array.isArray(slideContent.Slides) && slideContent.Slides[0] && (slideContent.Slides[0].Title || slideContent.Slides[0].title)) ||
                `Module ${moduleNumber}`
              );
            courseToUpdate.modules.push({
              moduleId: randomUUID(),
              moduleNumber: Number(moduleNumber),
              Title: fallbackTitle.trim() || `Module ${moduleNumber}`,
              Objectives: [],
              TeachingContent: [],
              CaseStudy: {},
              Quizzes: [],
              VisualDescriptions: [],
              FurtherStudy: {},
              slides: [],
              gammaUrl,
              gammaGenerationId,
              status: 'completed'
            });
            if (!Number.isFinite(courseToUpdate.moduleCount) || Number(courseToUpdate.moduleCount) < Number(moduleNumber)) {
              courseToUpdate.moduleCount = Number(moduleNumber);
            }
          }
          courseToUpdate.modules.sort((a, b) => Number(a.moduleNumber) - Number(b.moduleNumber));
          await courseToUpdate.save();
        }
      } catch (saveErr) {
        console.error('Error saving gammaUrl to database:', saveErr);
      }
    }

    res.json({ gammaUrl: gammaUrl || null, gammaGenerationId: gammaGenerationId || null });
  } catch (err) {
    console.error('generate-module-slides-gamma error:', err);
    const statusCode = err?.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Gamma slide generation failed',
      code: err?.code || 'gamma_error',
    });
  }
};



const PROPORTIONAL_BILLING_ENABLED = false;

export const generateAllSlidesGamma = async (req, res) => {
  const { courseId, modules } = req.body || {};
  if (!courseId || !Array.isArray(modules) || modules.length === 0) {
    return res.status(400).json({ message: 'courseId and an array of modules are required' });
  }
  if (!GAMMA_ENABLED) {
    return res.status(503).json({ message: 'Gamma API is not configured.' });
  }

  const userId = req.user?.id || req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  const batchReservations = [];
  const reconciledModules = [];
  try {
    const course = await Course.findOne({ userId, courseId: String(courseId) });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!Array.isArray(course.modules)) course.modules = [];

    const successfulResults = [];
    let failedModuleError = null;

    for (const modData of modules) {
      const { moduleNumber, moduleContent, slideContent, gammaTheme } = modData;
      let outline = '';

      if (slideContent && typeof slideContent === 'object' && Array.isArray(slideContent.Slides) && slideContent.Slides.length) {
        slideContent.Slides.forEach((sl, idx) => {
          outline += `## ${sl.Title || sl.title || 'Slide ' + (idx + 1)}\n`;
          const bullets = Array.isArray(sl.Bullets) ? sl.Bullets : (Array.isArray(sl.BulletPoints) ? sl.BulletPoints : []);
          bullets.forEach(b => { outline += `- ${b}\n`; });
          if (sl.Content) outline += sl.Content + '\n';
          outline += '\n';
        });
      } else if (moduleContent && typeof moduleContent === 'object') {
        const c = moduleContent;
        const title = c.Title || c.title || `Module ${moduleNumber}`;
        outline = `# ${title}\n\n`;
        const tc = Array.isArray(c.TeachingContent) ? c.TeachingContent : [];
        tc.forEach(item => {
          outline += `## ${item.Topics || ''}\n`;
          const points = Array.isArray(item.ContentPoints) ? item.ContentPoints : [];
          points.forEach(p => { outline += `- ${p}\n`; });
          outline += '\n';
        });
      }

      if (!outline.trim()) {
        failedModuleError = new Error(`No content available for module ${moduleNumber}`);
        break;
      }

      const referenceId = `${courseId}_mod_${moduleNumber}`;

      // RESERVE CREDITS
      let reservation = null;
      try {
        console.log(`[Credits] Reservation started for user ${userId}, module ${moduleNumber}, ref: ${referenceId}`);
        reservation = await CreditService.reserve(userId, 'course_generation_gamma', referenceId);
        batchReservations.push({ moduleNumber, reservation });
      } catch (resErr) {
        failedModuleError = resErr;
        break;
      }

      // CALL GAMMA PROVIDER
      let gammaOutput;
      try {
        console.log(`[Credits] Gamma generation started for user ${userId}, module: ${moduleNumber}`);
        gammaOutput = await generateGammaSlides(outline, gammaTheme || 'aurora', course.title);
      } catch (gammaErr) {
        console.error(`[Credits] Gamma generation failed for module ${moduleNumber}:`, gammaErr.message);
        failedModuleError = gammaErr;
        break;
      }

      if (!gammaOutput?.gammaLink) {
        failedModuleError = new Error(`Gamma completed but no presentation URL generated for module ${moduleNumber}`);
        break;
      }

      // RECONCILE CREDITS
      const reservedCost = Math.abs(reservation.amount);
      const reportedCredits = Number(gammaOutput?.credits);
      const cardCount = Array.isArray(slideContent?.Slides) && slideContent.Slides.length ? slideContent.Slides.length : 10;
      
      const actualCost = Number.isFinite(reportedCredits) && reportedCredits > 0
        ? Math.min(reservedCost, Math.round(reportedCredits))
        : Math.min(reservedCost, cardCount * 8);

      const usageMeta = {
        provider: 'gamma',
        providerReferenceId: gammaOutput.generationId || null,
        cardCount,
        actualCost,
        ...(gammaOutput?.credits ? { providerCredits: gammaOutput.credits } : {})
      };

      try {
        await CreditService.reconcile(userId, reservation, actualCost, usageMeta);
        reconciledModules.push({ moduleNumber, reservation, cost: actualCost });
      } catch (recErr) {
        console.error(`[Credits] Reconcile error on module ${moduleNumber}:`, recErr.message);
      }

      const modIdx = course.modules.findIndex(m => Number(m.moduleNumber) === Number(moduleNumber));
      if (modIdx >= 0) {
        course.modules[modIdx].gammaUrl = gammaOutput.gammaLink;
        course.modules[modIdx].gammaGenerationId = gammaOutput.generationId;
      } else {
        const fallbackTitle = String(
          (moduleContent && (moduleContent.Title || moduleContent.title)) ||
          (slideContent && slideContent.Slides?.[0]?.Title) ||
          `Module ${moduleNumber}`
        );
        course.modules.push({
          moduleId: randomUUID(),
          moduleNumber: Number(moduleNumber),
          Title: fallbackTitle.trim(),
          gammaUrl: gammaOutput.gammaLink,
          gammaGenerationId: gammaOutput.generationId,
          status: 'completed'
        });
      }

      successfulResults.push({
        moduleNumber,
        gammaUrl: gammaOutput.gammaLink,
        gammaGenerationId: gammaOutput.generationId,
        success: true,
      });
    }

    // CHECK FOR PARTIAL OR COMPLETE FAILURE
    if (failedModuleError || successfulResults.length < modules.length) {
      console.warn(`[Credits] Batch generation incomplete (${successfulResults.length}/${modules.length} succeeded). Initiating failure handling.`);

      if (!PROPORTIONAL_BILLING_ENABLED) {
        // FULL REFUND POLICY: Roll back all reservations & reconciled charges for this batch
        for (const item of batchReservations) {
          const isReconciled = reconciledModules.some(r => r.moduleNumber === item.moduleNumber);
          if (!isReconciled) {
            try {
              await CreditService.release(userId, item.reservation);
              console.log(`[Credits] Released un-reconciled reservation for module ${item.moduleNumber}`);
            } catch (relErr) {
              console.error(`[Credits] Failed releasing reservation for module ${item.moduleNumber}:`, relErr.message);
            }
          }
        }

        // Refund any modules that had already been reconciled before the failure occurred
        for (const rec of reconciledModules) {
          try {
            await CreditService.release(userId, {
              amount: -rec.cost,
              action: rec.reservation.action,
              referenceId: `batch_refund_${rec.reservation.referenceId}`,
            });
            console.log(`[Credits] Issued full refund for reconciled module ${rec.moduleNumber}`);
          } catch (refErr) {
            console.error(`[Credits] Failed refunding module ${rec.moduleNumber}:`, refErr.message);
          }
        }

        return res.status(502).json({
          success: false,
          retry_eligible: true,
          error: failedModuleError?.message || 'Partial batch generation failed',
          message: 'Slide generation failed before completing all course modules. Because a partial course is not usable content, all credits have been fully refunded. You can retry generating slides at any time.',
          completed_count: successfulResults.length,
          total_count: modules.length,
        });
      }
    }

    course.modules.sort((a, b) => Number(a.moduleNumber) - Number(b.moduleNumber));
    await course.save();

    res.json({
      success: true,
      results: successfulResults,
    });
  } catch (err) {
    console.error('generate-all-slides-gamma error:', err);
    const statusCode = err?.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      retry_eligible: true,
      message: err.message || 'Batch generation failed',
      code: err?.code || 'gamma_error',
    });
  }
};
