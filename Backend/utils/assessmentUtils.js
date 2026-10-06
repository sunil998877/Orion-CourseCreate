const cleanText = (str) => String(str || '').trim();

/**
 * Generate 20 high-quality, domain-specific assessment questions for any course.
 */
export const generateDefault20Assessment = (courseData = {}, modules = []) => {
    const title = cleanText(courseData.title) || 'Course Topic';
    const audience = cleanText(Array.isArray(courseData.audience) ? courseData.audience.join(', ') : courseData.audience) || 'learners and practitioners';
    const level = cleanText(courseData.level) || 'Intermediate';

    const rawCount = Number(courseData?.moduleCount) ||
        Number(courseData?.module) ||
        (Array.isArray(modules) && modules.length > 0 ? modules.length : 0) ||
        (Array.isArray(courseData?.modules) && courseData.modules.length > 0 ? courseData.modules.length : 0) ||
        (Array.isArray(courseData?.previewModules) && courseData.previewModules.length > 0 ? courseData.previewModules.length : 0) ||
        1;
    const moduleCount = Math.max(1, rawCount);

    let safeModules = Array.isArray(modules) && modules.length > 0
        ? [...modules]
        : Array.isArray(courseData?.modules) && courseData.modules.length > 0
            ? [...courseData.modules]
            : (Array.isArray(courseData?.previewModules) && courseData.previewModules.length > 0 ? [...courseData.previewModules] : []);

    if (safeModules.length < moduleCount) {
        for (let m = safeModules.length + 1; m <= moduleCount; m++) {
            safeModules.push({
                moduleNumber: m,
                Title: `${title} - Module ${m}`
            });
        }
    }

    const questionTemplates = [
        {
            focus: 'Core Principles',
            stem: (modTitle, crsTitle) => `In the context of ${modTitle}, what is the foundational principle that directly governs effective implementation in ${crsTitle}?`,
            optGen: (modTitle) => [
                `Applying systematic architectural validation before executing core procedures in ${modTitle}.`,
                `Prioritizing surface-level speed over structural verification and documentation.`,
                `Relying strictly on informal ad-hoc assumptions without baseline metrics.`,
                `Deferring quality checks until final post-production evaluation.`
            ],
            correctIdx: 0,
            cognitive: 'Recall',
            difficulty: 'Easy',
            whyCorrect: `Systematic architectural validation establishes the baseline parameters necessary for reliable execution in ${title}.`,
            whyDistractors: [
                'Sacrificing verification for speed introduces preventable defects.',
                'Ad-hoc assumptions fail to maintain repeatability across workflows.',
                'Post-production verification significantly increases defect remediation costs.'
            ],
            misconception: 'Assuming that speed of delivery outweighs architectural correctness.'
        },
        {
            focus: 'Primary Objectives',
            stem: (modTitle) => `When defining the scope for ${modTitle}, which objective must take the highest priority to meet industry expectations?`,
            optGen: (modTitle) => [
                `Guaranteeing arbitrary feature quantity regardless of domain stability.`,
                `Aligning measurable outcomes with verifiable stakeholder and domain criteria.`,
                `Minimizing testing cycles by skipping intermediate peer audits.`,
                `Restricting operational transparency to avoid critical external review.`
            ],
            correctIdx: 1,
            cognitive: 'Application',
            difficulty: 'Easy',
            whyCorrect: `Outcome alignment with stakeholder criteria ensures that the deliverables directly solve targeted problems.`,
            whyDistractors: [
                'Feature quantity without stability degrades overall quality.',
                'Skipping peer audits increases regression vulnerabilities.',
                'Restricting transparency prevents vital feedback loops.'
            ],
            misconception: 'Believing that feature volume is more valuable than validated capability.'
        },
        {
            focus: 'Architecture & Structure',
            stem: (modTitle) => `Which structural pattern is considered standard best practice when organizing workflows within ${modTitle}?`,
            optGen: (modTitle) => [
                `Tightly coupling all sub-components into a monolithic, unversioned script.`,
                `Modularity with distinct boundary layers and explicit state interfaces.`,
                `Eliminating validation layers to decrease processing overhead.`,
                `Hardcoding configuration parameters directly into execution logic.`
            ],
            correctIdx: 1,
            cognitive: 'Analysis',
            difficulty: 'Medium',
            whyCorrect: `Modularity with clear boundaries ensures maintainability, isolation of failure modes, and scalable development.`,
            whyDistractors: [
                'Tight coupling makes maintenance and targeted debugging extremely difficult.',
                'Removing validation layers exposes systems to data corruption.',
                'Hardcoding values prevents dynamic deployment and environment portability.'
            ],
            misconception: 'Assuming monolithic coupling improves performance noticeably.'
        },
        {
            focus: 'Workflow Sequencing',
            stem: (modTitle) => `What is the recommended sequence of execution when applying methods taught in ${modTitle}?`,
            optGen: (modTitle) => [
                `Execution -> Deployment -> Retrospective Requirements Analysis.`,
                `Discovery & Planning -> Implementation -> Testing & Verification -> Review.`,
                `Rapid Prototyping -> Immediate Final Release -> Baseline Definition.`,
                `Testing -> Final Design -> Discovery without verification.`
            ],
            correctIdx: 1,
            cognitive: 'Application',
            difficulty: 'Medium',
            whyCorrect: `A disciplined lifecycle from discovery to verification guarantees alignment and defect containment.`,
            whyDistractors: [
                'Executing before analyzing requirements leads to costly redesigns.',
                'Releasing prototypes directly to production introduces high instability.',
                'Testing before design lacks a cohesive specification against which to evaluate.'
            ],
            misconception: 'Thinking that discovery and verification can be skipped for minor tasks.'
        },
        {
            focus: 'Standards & Compliance',
            stem: (modTitle) => `Under prevailing professional standards in ${modTitle}, how should regulatory and compliance constraints be addressed?`,
            optGen: (modTitle) => [
                `Treated as optional recommendations if project deadlines are constrained.`,
                `Embedded natively into design constraints and verified via automated audits.`,
                `Addressed solely if an external regulatory audit is formally announced.`,
                `Delegated entirely to end-users without technical safeguards.`
            ],
            correctIdx: 1,
            cognitive: 'Recall',
            difficulty: 'Medium',
            whyCorrect: `Native embedding of compliance rules ensures constant adherence without reactive remediation panics.`,
            whyDistractors: [
                'Standards are non-negotiable legal and operational commitments.',
                'Reactive compliance preparation creates catastrophic risk between audit cycles.',
                'Technical systems must enforce safety and policy programmatically.'
            ],
            misconception: 'Viewing compliance as a paperwork exercise rather than an architectural requirement.'
        },
        {
            focus: 'Anti-Pattern Identification',
            stem: (modTitle) => `Which of the following actions represents a critical anti-pattern when working with ${modTitle}?`,
            optGen: (modTitle) => [
                `Bypassing error handling and silent suppression of exception events.`,
                `Documenting edge-case boundary conditions and remediation procedures.`,
                `Establishing unit and integration test coverage for core logic paths.`,
                `Utilizing parameterized inputs and schema validations.`
            ],
            correctIdx: 0,
            cognitive: 'Analysis',
            difficulty: 'Medium',
            whyCorrect: `Silently swallowing errors conceals system failures, making root-cause analysis almost impossible.`,
            whyDistractors: [
                'Documenting edge cases is an essential engineering practice.',
                'Automated test coverage is a cornerstone of quality assurance.',
                'Parameterized inputs protect against invalid states and injections.'
            ],
            misconception: 'Assuming that hiding errors improves system uptime.'
        },
        {
            focus: 'Implementation Strategy',
            stem: (modTitle) => `When transitioning from theoretical concepts to hands-on deployment in ${modTitle}, what strategy minimizes operational disruption?`,
            optGen: (modTitle) => [
                `Phased canary or staging deployments with real-time telemetry observation.`,
                `Immediate global deployment across all operational instances without fallback.`,
                `Disabling monitoring dashboards to avoid alert saturation during launch.`,
                `Altering multiple critical subsystems simultaneously without change logs.`
            ],
            correctIdx: 0,
            cognitive: 'Application',
            difficulty: 'Medium',
            whyCorrect: `Phased deployments allow verification with minimal exposure and easy rollback if anomalies arise.`,
            whyDistractors: [
                'Global cutovers without fallbacks introduce catastrophic failure potential.',
                'Telemetry is most critical during deployment transitions.',
                'Simultaneous changes obscure the source of any newly introduced regressions.'
            ],
            misconception: 'Assuming that modern systems are resilient enough for unphased all-at-once releases.'
        },
        {
            focus: 'Performance Optimization',
            stem: (modTitle) => `What is the most effective approach to performance optimization within ${modTitle}?`,
            optGen: (modTitle) => [
                `Profiling baseline performance bottlenecks before applying targeted optimizations.`,
                `Prematurely refactoring unmeasured code paths based on subjective assumptions.`,
                `Removing all caching layers to ensure raw computation every cycle.`,
                `Increasing resource capacity unconditionally instead of diagnosing algorithmic inefficiencies.`
            ],
            correctIdx: 0,
            cognitive: 'Analysis',
            difficulty: 'Hard',
            whyCorrect: `Profiling identifies actual bottlenecks, preventing wasted effort on non-impactful micro-optimizations.`,
            whyDistractors: [
                'Premature optimization often adds unnecessary complexity without gains.',
                'Removing caching drastically degrades throughput and latency.',
                'Throwing hardware at bad algorithms scales costs exponentially.'
            ],
            misconception: 'Believing intuition is superior to empirical profiling measurements.'
        },
        {
            focus: 'Risk Mitigation',
            stem: (modTitle) => `In high-reliability environments governed by ${modTitle}, which risk mitigation mechanism is mandatory?`,
            optGen: (modTitle) => [
                `Comprehensive automated backup, recovery validation, and redundancy controls.`,
                `Single-point-of-failure reliance on individual experienced operators.`,
                `Manual snapshotting performed only during scheduled annual reviews.`,
                `Exemption of core operational pathways from disaster recovery testing.`
            ],
            correctIdx: 0,
            cognitive: 'Evaluation',
            difficulty: 'Hard',
            whyCorrect: `Automated recovery and redundancy guarantee business continuity and rapid recovery time objectives.`,
            whyDistractors: [
                'Single-point dependencies create immense operational vulnerability.',
                'Infrequent snapshots lead to massive data loss during unplanned outages.',
                'Untested disaster recovery plans consistently fail in real incidents.'
            ],
            misconception: 'Assuming that having backups is sufficient without actively validating restoration procedures.'
        },
        {
            focus: 'Diagnostic Analysis',
            stem: (modTitle) => `When diagnosing an intermittent failure in ${modTitle}, which analytical technique provides the highest diagnostic clarity?`,
            optGen: (modTitle) => [
                `Correlation of structured logs, trace IDs, and temporal telemetry data.`,
                `Restarting random services sequentially until the symptom temporarily clears.`,
                `Deleting historical event records to relieve database storage pressure.`,
                `Disregarding intermittent issues until they manifest as permanent outages.`
            ],
            correctIdx: 0,
            cognitive: 'Analysis',
            difficulty: 'Hard',
            whyCorrect: `Correlated logs and traces isolate the exact sequence and environmental factors triggering intermittent states.`,
            whyDistractors: [
                'Random restarts destroy ephemeral volatile forensic state.',
                'Deleting event records destroys the evidence necessary for diagnosis.',
                'Intermittent errors invariably escalate into severe systemic outages.'
            ],
            misconception: 'Believing intermittent issues are ignorable glitches.'
        },
        {
            focus: 'Scenario Decision Making',
            stem: (modTitle) => `A team encounter unexpected latency in ${modTitle}. Under standard troubleshooting protocol, what is step one?`,
            optGen: (modTitle) => [
                `Define the symptom specifically, isolate the affected subsystem, and check health metrics.`,
                `Immediately rewrite the entire component in a different framework.`,
                `Declare a major post-incident postmortem before gathering telemetry.`,
                `Instruct users to refrain from reporting performance problems.`
            ],
            correctIdx: 0,
            cognitive: 'Application',
            difficulty: 'Medium',
            whyCorrect: `Isolating symptoms and checking metrics confirms scope and prevents destructive misdirected actions.`,
            whyDistractors: [
                'Rewriting components blindly introduces brand-new untested failure modes.',
                'Postmortems happen after incident resolution and evidence gathering.',
                'Suppressing user reports hides the true scale of degradation.'
            ],
            misconception: 'Jumping directly to drastic solutions before verifying the problem.'
        },
        {
            focus: 'Data Integrity',
            stem: (modTitle) => `How is data consistency and transaction integrity preserved throughout ${modTitle}?`,
            optGen: (modTitle) => [
                `By enforcing atomic operations, idempotency keys, and explicit validation checks.`,
                `By assuming network packets are never dropped or corrupted.`,
                `By allowing unbounded concurrent writes without locking or conflict resolution.`,
                `By stripping schemas to permit arbitrary unvalidated data structures.`
            ],
            correctIdx: 0,
            cognitive: 'Analysis',
            difficulty: 'Hard',
            whyCorrect: `Atomicity and idempotency ensure operations either complete safely or roll back cleanly without partial corruption.`,
            whyDistractors: [
                'Networks are fundamentally unreliable and drop packets routinely.',
                'Unsynchronized concurrent writes guarantee data race conditions and corruption.',
                'Unvalidated data inputs lead to state inconsistency and injection attacks.'
            ],
            misconception: 'Assuming network layers handle application-level transaction integrity automatically.'
        },
        {
            focus: 'Quality Assurance',
            stem: (modTitle) => `What role does automated regression testing play in the continuous improvement of ${modTitle}?`,
            optGen: (modTitle) => [
                `It detects unintended behavioral shifts immediately when modifications are introduced.`,
                `It replaces the need for any human oversight, product strategy, or design.`,
                `It is only useful if executed exclusively before major annual milestones.`,
                `It guarantees 100% bug-free software in all conceivable real-world scenarios.`
            ],
            correctIdx: 0,
            cognitive: 'Recall',
            difficulty: 'Easy',
            whyCorrect: `Regression suites catch newly introduced bugs instantly, enabling fast, safe iteration.`,
            whyDistractors: [
                'Automated tests verify specifications; they do not replace human product judgment.',
                'Infrequent test runs accumulate massive backlogs of broken tests.',
                'Tests prove the presence of tested behaviors, not the universal absence of all possible bugs.'
            ],
            misconception: 'Expecting tests to eliminate the need for architecture and ongoing domain scrutiny.'
        },
        {
            focus: 'Security Governance',
            stem: (modTitle) => `Which security model represents current industry consensus for safeguarding workflows in ${modTitle}?`,
            optGen: (modTitle) => [
                `Zero Trust Architecture with continuous authentication and least-privilege access.`,
                `Perimeter-only defense with unauthenticated trust across all internal systems.`,
                `Sharing generic root administrative credentials across all team members.`,
                `Disabling audit logs to conserve encryption computation overhead.`
            ],
            correctIdx: 0,
            cognitive: 'Recall',
            difficulty: 'Medium',
            whyCorrect: `Zero Trust assumes breaches can occur anywhere and restricts access strictly to verified needs.`,
            whyDistractors: [
                'Perimeter-only models fail catastrophically once an inside node is compromised.',
                'Shared root credentials destroy accountability and violate compliance.',
                'Audit logs are critical for intrusion detection and forensic accountability.'
            ],
            misconception: 'Assuming internal network traffic is inherently safe and trustworthy.'
        },
        {
            focus: 'Metrics & Telemetry',
            stem: (modTitle) => `Which key performance indicator (KPI) best reflects the health and operational efficacy of ${modTitle}?`,
            optGen: (modTitle) => [
                `Service Level Objective (SLO) error budget burn rate and Mean Time to Recovery (MTTR).`,
                `Total number of lines of source code written per day.`,
                `Volume of raw warning messages discarded without investigation.`,
                `Number of unnecessary manual approvals required for routine tasks.`
            ],
            correctIdx: 0,
            cognitive: 'Evaluation',
            difficulty: 'Medium',
            whyCorrect: `SLO error budgets and MTTR measure real customer reliability and organizational responsiveness.`,
            whyDistractors: [
                'Lines of code is an anti-metric that rewards bloat over concise solutions.',
                'Discarded warnings indicate telemetry debt, not health.',
                'Excessive manual gatekeeping slows delivery without improving reliability.'
            ],
            misconception: 'Measuring activity rather than actual system reliability and outcome delivery.'
        },
        {
            focus: 'Scalability Design',
            stem: (modTitle) => `When scaling capacity for ${modTitle} to accommodate 10x growth, what design decision is essential?`,
            optGen: (modTitle) => [
                `Decoupling components horizontally and removing shared mutable bottlenecks.`,
                `Upgrading a single centralized database server to maximum hardware limits.`,
                `Removing backup routines to free up CPU cores for traffic bursts.`,
                `Hardcoding fixed IP addresses and static thread counts in worker configurations.`
            ],
            correctIdx: 0,
            cognitive: 'Analysis',
            difficulty: 'Hard',
            whyCorrect: `Horizontal decoupling ensures capacity can scale linearly without hitting single-machine ceiling limits.`,
            whyDistractors: [
                'Vertical scaling has hard economic and physical hardware limits.',
                'Removing backups during high-load periods invites disastrous data loss.',
                'Static thread counts cannot adapt dynamically to fluctuating load patterns.'
            ],
            misconception: 'Thinking vertical hardware scaling can sustain indefinite growth.'
        },
        {
            focus: 'Collaboration & Documentation',
            stem: (modTitle) => `How should architectural decisions regarding ${modTitle} be documented for long-term organizational maintainability?`,
            optGen: (modTitle) => [
                `Through Architectural Decision Records (ADRs) that capture context, trade-offs, and consequences.`,
                `Through undocumented oral tradition shared exclusively during casual conversations.`,
                `In temporary chat threads that expire automatically after two weeks.`,
                `By updating only source code comments while omitting overarching rationale.`
            ],
            correctIdx: 0,
            cognitive: 'Recall',
            difficulty: 'Easy',
            whyCorrect: `ADRs preserve context and rationale so future maintainers understand why decisions were made.`,
            whyDistractors: [
                'Oral tradition degrades rapidly as teams change and members depart.',
                'Ephemeral chat messages cannot be searched or audited reliably over time.',
                'Code comments explain what code does, not the broader strategic trade-offs.'
            ],
            misconception: 'Assuming clean code is completely self-documenting regarding architectural context.'
        },
        {
            focus: 'Continuous Integration & Tooling',
            stem: (modTitle) => `What is the primary benefit of embedding automated linting, security scans, and build checks into ${modTitle}?`,
            optGen: (modTitle) => [
                `Early feedback ('shifting left') before defects and vulnerabilities propagate downstream.`,
                `Eliminating the need for developers to review code or understand security principles.`,
                `Slowing down pull request merges to meet arbitrary process quotas.`,
                `Preventing changes from ever reaching production environments.`
            ],
            correctIdx: 0,
            cognitive: 'Application',
            difficulty: 'Medium',
            whyCorrect: `Shifting left catches errors at minimal cost before they ever reach staging or production.`,
            whyDistractors: [
                'Automated tooling aids developers but does not replace security awareness.',
                'Automation should accelerate velocity, not slow it down arbitrarily.',
                'The goal of CI/CD is safe, frequent delivery, not obstruction.'
            ],
            misconception: 'Believing automated security scans can replace developer security training.'
        },
        {
            focus: 'Incident Response & Postmortem',
            stem: (modTitle) => `Following an unexpected production outage related to ${modTitle}, what is the objective of a blameless postmortem?`,
            optGen: (modTitle) => [
                `Identifying systemic and environmental vulnerabilities to prevent future recurrences.`,
                `Assigning personal liability and disciplinary measures to the engineer who initiated the change.`,
                `Generating positive public relations statements to downplay the impact.`,
                `Closing the incident ticket immediately without documenting corrective action items.`
            ],
            correctIdx: 0,
            cognitive: 'Evaluation',
            difficulty: 'Medium',
            whyCorrect: `Blameless postmortems foster honest disclosure and lead to resilient systemic safeguards.`,
            whyDistractors: [
                'Blaming individuals discourages transparency and leaves root systemic flaws intact.',
                'PR spin obscures technical reality from engineering teams.',
                'Failing to document corrective actions ensures the incident will happen again.'
            ],
            misconception: 'Thinking that finding a scapegoat solves the underlying technical vulnerability.'
        },
        {
            focus: 'Comprehensive Synthesis',
            stem: (modTitle, crsTitle) => `In synthesizing the full scope of ${crsTitle}, what final criterion proves a learner has mastered ${modTitle}?`,
            optGen: (modTitle) => [
                `The ability to independently diagnose, design, implement, and validate reliable solutions under realistic constraints.`,
                `Memorization of syntax definitions without the ability to troubleshoot errors.`,
                `Strict adherence to boilerplate code without understanding underlying mechanics.`,
                `Passing multiple-choice quizzes while unable to execute practical deployment tasks.`
            ],
            correctIdx: 0,
            cognitive: 'Evaluation',
            difficulty: 'Hard',
            whyCorrect: `True mastery is demonstrated through independent end-to-end execution, problem solving, and validation in real conditions.`,
            whyDistractors: [
                'Syntax memorization without problem-solving is superficial and fragile.',
                'Boilerplate copying fails as soon as requirements diverge from the template.',
                'Theoretical test performance does not equate to practical applied competence.'
            ],
            misconception: 'Confusing passive memorization with active operational mastery.'
        }
    ];

    const items = [];
    const blueprint = [];

    for (let i = 0; i < 20; i++) {
        const modIdx = Math.min(moduleCount - 1, Math.floor((i * moduleCount) / 20));
        const mod = safeModules[modIdx] || {};
        const modNum = Number(mod.moduleNumber) || modIdx + 1;
        const modTitle = cleanText(mod.Title || mod.title || mod.Module) || `Module ${modNum}`;
        const template = questionTemplates[i % questionTemplates.length];

        const stem = template.stem(modTitle, title);
        const options = template.optGen(modTitle);
        const answer = options[template.correctIdx] || options[0];

        items.push({
            itemNumber: i + 1,
            moduleIndex: modIdx,
            moduleNumber: modNum,
            topic: `${modTitle}: ${template.focus}`,
            stem,
            options,
            answer,
            outcome: `Demonstrate mastery of ${template.focus.toLowerCase()} in ${modTitle}`,
            cognitiveDemand: template.cognitive,
            difficulty: template.difficulty,
            whyCorrect: template.whyCorrect,
            whyDistractors: template.whyDistractors,
            misconception: template.misconception,
            remediation: `Review ${modTitle} material on ${template.focus.toLowerCase()} and foundational implementation guidelines.`,
            source: `${title} - ${modTitle}`
        });

        blueprint.push({
            item: `Item ${i + 1}`,
            moduleIndex: modIdx,
            moduleNumber: modNum,
            topic: `${modTitle}: ${template.focus}`,
            outcome: `Demonstrate mastery of ${template.focus.toLowerCase()} in ${modTitle}`,
            cognitiveDemand: template.cognitive,
            type: 'Multiple Choice',
            difficulty: template.difficulty,
            evidence: `Correct selection of ${template.focus.toLowerCase()} best practices in scenario prompt`,
            source: `${title} - ${modTitle}`
        });
    }

    const practicalTasks = safeModules.map((mod, idx) => {
        const modNum = Number(mod.moduleNumber) || idx + 1;
        const modTitle = cleanText(mod.Title || mod.title || mod.Module) || `Module ${modNum}`;
        return {
            itemNumber: modNum,
            moduleIndex: idx,
            moduleNumber: modNum,
            item: `${modTitle} Practical Task`,
            prompt: `Apply the core methodologies learned in ${modTitle}. Construct, document, and validate a working implementation of ${modTitle} aligned with ${title} standards.`,
            evidence: `Verified deployment repository, architecture documentation, or execution artifact demonstrating mastery of ${modTitle}.`,
            threshold: '80% accuracy or complete verified practical deployment'
        };
    });

    const practicalTask = {
        item: `${title} Practical Capstone Assessment`,
        prompt: `Develop, document, and execute an end-to-end deployment plan for ${title} that incorporates all core principles, security controls, and operational workflows taught across the modules.`,
        rubric: [
            { criterion: 'Architecture & Design', level: 'Exemplary', description: 'Complete structural decoupling with documented ADRs and boundary validation.' },
            { criterion: 'Operational Implementation', level: 'Proficient', description: 'Zero unhandled errors, automated logging, and comprehensive configuration management.' },
            { criterion: 'Verification & Safety', level: 'Mastery', description: 'Automated test suite passing with full edge-case coverage and recovery verification.' }
        ],
        threshold: '85% aggregate score on MCQ assessment plus complete verified practical deployment submission.',
        modelResponse: `A complete, auditable production package containing modular architecture, parameterized config, automated test suite, and operational runbook.`,
        commonErrors: [
            'Hardcoding operational parameters instead of using dynamic config.',
            'Omitting automated error handling and telemetry checkpoints.',
            'Failing to document disaster recovery and rollback procedures.'
        ],
        remediation: `Review the capstone instructions and relevant module reference implementations before resubmitting.`
    };

    return {
        blueprint,
        items,
        practicalTasks,
        practicalTask
    };
};

/**
 * Ensures that any assessment object has EXACTLY 20 questions in items and 20 blueprint rows,
 * and that questions and practical tasks are evenly distributed across all course modules.
 */
export const ensure20AssessmentQuestions = (assessment, courseData = {}, modules = []) => {
    const title = cleanText(courseData?.title) || 'Course Topic';
    const detectedCount = Number(courseData?.moduleCount) ||
        Number(courseData?.module) ||
        (Array.isArray(modules) && modules.length > 0 ? modules.length : 0) ||
        (Array.isArray(courseData?.modules) && courseData.modules.length > 0 ? courseData.modules.length : 0) ||
        (Array.isArray(courseData?.previewModules) && courseData.previewModules.length > 0 ? courseData.previewModules.length : 0) ||
        1;
    const moduleCount = Math.max(1, detectedCount);

    let safeModules = Array.isArray(modules) && modules.length > 0
        ? [...modules]
        : Array.isArray(courseData?.modules) && courseData.modules.length > 0
            ? [...courseData.modules]
            : (Array.isArray(courseData?.previewModules) && courseData.previewModules.length > 0 ? [...courseData.previewModules] : []);

    if (safeModules.length < moduleCount) {
        for (let m = safeModules.length + 1; m <= moduleCount; m++) {
            safeModules.push({
                moduleNumber: m,
                Title: `${title} - Module ${m}`
            });
        }
    }

    const defaultAssessment = generateDefault20Assessment(courseData, safeModules);

    if (!assessment || typeof assessment !== 'object') {
        return defaultAssessment;
    }

    let rawItems = Array.isArray(assessment.items) ? assessment.items : [];
    // Detect if items are collapsed entirely onto 1 module (e.g. moduleIndex 0) when moduleCount > 1
    const isCollapsed = moduleCount > 1 && rawItems.length > 0 &&
        rawItems.every(it => Number(it?.moduleIndex ?? 0) === 0 && Number(it?.moduleNumber ?? 1) === 1);

    let cleanItems = rawItems
        .filter(item => item && typeof item === 'object' && cleanText(item.stem))
        .map((item, idx) => {
            const rawOpts = Array.isArray(item.options) ? item.options.map(cleanText).filter(Boolean) : [];
            let options = [...rawOpts];
            while (options.length < 4) {
                options.push(`Standard operational alternative ${options.length + 1}`);
            }
            if (options.length > 4) {
                options = options.slice(0, 4);
            }

            const rawAnswer = cleanText(item.answer);
            const answer = options.includes(rawAnswer) ? rawAnswer : options[0];

            let modIdx;
            if (!isCollapsed && item.moduleIndex !== undefined && Number.isFinite(Number(item.moduleIndex))) {
                modIdx = Number(item.moduleIndex) % moduleCount;
            } else if (!isCollapsed && item.moduleNumber !== undefined && Number.isFinite(Number(item.moduleNumber))) {
                modIdx = (Number(item.moduleNumber) - 1) % moduleCount;
            } else {
                modIdx = Math.min(moduleCount - 1, Math.floor((idx * moduleCount) / 20));
            }
            const modNum = modIdx + 1;
            const targetMod = safeModules[modIdx] || {};
            const modTitle = cleanText(targetMod.Title || targetMod.title || targetMod.Module) || `Module ${modNum}`;

            return {
                itemNumber: idx + 1,
                moduleIndex: modIdx,
                moduleNumber: modNum,
                stem: cleanText(item.stem),
                options,
                answer,
                outcome: cleanText(item.outcome) || `Demonstrate mastery in ${modTitle}`,
                cognitiveDemand: cleanText(item.cognitiveDemand) || 'Application',
                difficulty: cleanText(item.difficulty) || 'Medium',
                topic: cleanText(item.topic) || `${modTitle}: Core Practice`,
                whyCorrect: cleanText(item.whyCorrect) || `Option "${answer}" directly meets the required standard.`,
                whyDistractors: Array.isArray(item.whyDistractors) && item.whyDistractors.length
                    ? item.whyDistractors.map(cleanText)
                    : ['Incorrect alternative.', 'Does not satisfy domain criteria.', 'Violates best-practice recommendations.'],
                misconception: cleanText(item.misconception) || 'Common operational misconception.',
                remediation: cleanText(item.remediation) || `Review the ${modTitle} materials.`,
                source: cleanText(item.source) || `${courseData?.title || 'Course'} Curriculum`
            };
        });

    // If fewer than 20 items, pad with items from defaultAssessment
    if (cleanItems.length < 20) {
        const needed = 20 - cleanItems.length;
        const defaultItems = defaultAssessment.items;
        for (let i = 0; i < needed; i++) {
            const fallbackItem = defaultItems[(cleanItems.length + i) % defaultItems.length];
            const modIdx = Math.min(moduleCount - 1, Math.floor((cleanItems.length * moduleCount) / 20));
            cleanItems.push({
                ...fallbackItem,
                itemNumber: cleanItems.length + 1,
                moduleIndex: modIdx,
                moduleNumber: modIdx + 1
            });
        }
    } else if (cleanItems.length > 20) {
        cleanItems = cleanItems.slice(0, 20);
    }

    // Re-index itemNumbers 1..20 and guarantee proper distribution across modules
    cleanItems = cleanItems.map((item, idx) => {
        let modIdx = item.moduleIndex;
        if (isCollapsed || modIdx === undefined || !Number.isFinite(Number(modIdx))) {
            modIdx = Math.min(moduleCount - 1, Math.floor((idx * moduleCount) / 20));
        } else {
            modIdx = Number(modIdx) % moduleCount;
        }
        return {
            ...item,
            itemNumber: idx + 1,
            moduleIndex: modIdx,
            moduleNumber: modIdx + 1
        };
    });

    // Ensure blueprint has exactly 20 corresponding items
    const rawBlueprint = Array.isArray(assessment.blueprint) ? assessment.blueprint : [];
    let cleanBlueprint = [];
    for (let i = 0; i < 20; i++) {
        const matchingItem = cleanItems[i];
        const existingBp = rawBlueprint[i] || {};
        cleanBlueprint.push({
            item: `Item ${i + 1}`,
            moduleIndex: matchingItem.moduleIndex,
            moduleNumber: matchingItem.moduleNumber,
            outcome: cleanText(existingBp.outcome) || matchingItem.outcome,
            cognitiveDemand: cleanText(existingBp.cognitiveDemand) || matchingItem.cognitiveDemand,
            topic: cleanText(existingBp.topic) || matchingItem.topic,
            type: 'Multiple Choice',
            difficulty: cleanText(existingBp.difficulty) || matchingItem.difficulty,
            evidence: cleanText(existingBp.evidence) || `Select correct option for question: ${matchingItem.stem.slice(0, 60)}...`,
            source: cleanText(existingBp.source) || matchingItem.source
        });
    }

    const practicalTask = assessment.practicalTask && typeof assessment.practicalTask === 'object' && cleanText(assessment.practicalTask.prompt)
        ? assessment.practicalTask
        : defaultAssessment.practicalTask;

    let practicalTasks = Array.isArray(assessment.practicalTasks) ? [...assessment.practicalTasks] : [];
    if (practicalTasks.length < moduleCount) {
        const defaultTasks = defaultAssessment.practicalTasks || [];
        practicalTasks = safeModules.map((mod, idx) => {
            const existing = practicalTasks.find(t => Number(t?.moduleIndex) === idx || Number(t?.moduleNumber) === idx + 1);
            if (existing) return existing;
            const defTask = defaultTasks[idx];
            if (defTask) return defTask;
            const modTitle = cleanText(mod.Title || mod.title || mod.Module) || `Module ${idx + 1}`;
            return {
                itemNumber: idx + 1,
                moduleIndex: idx,
                moduleNumber: idx + 1,
                item: `${modTitle} Practical Task`,
                prompt: `Apply the core methodologies learned in ${modTitle}. Construct, document, and validate a working implementation of ${modTitle} aligned with ${title} standards.`,
                evidence: `Verified deployment repository, architecture documentation, or execution artifact demonstrating mastery of ${modTitle}.`,
                threshold: '80% accuracy or complete verified practical deployment'
            };
        });
    }

    return {
        ...assessment,
        blueprint: cleanBlueprint,
        items: cleanItems,
        practicalTasks,
        practicalTask
    };
};
