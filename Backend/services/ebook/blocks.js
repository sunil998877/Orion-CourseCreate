import { escapeHtml } from './html.js';
import { renderMarkdown } from './markdown.js';
export const textToParagraphHtml = renderMarkdown;
export const renderTakeaways = (items = []) => {
    if (!Array.isArray(items) || !items.length)
        return '';
    return `
    <div class="takeaway-box">
      <div class="takeaway-title">Key Takeaways</div>
      <ul>
        ${items.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
      </ul>
    </div>
  `;
};
export const renderTips = (items = []) => {
    if (!Array.isArray(items) || !items.length)
        return '';
    return `
    <div class="tip-box">
      <div class="tip-title">Pro Tips</div>
      <ul>
        ${items.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
      </ul>
    </div>
  `;
};
export const renderFaq = (items = []) => {
    if (!Array.isArray(items) || !items.length)
        return '';
    return `
    <section class="faq-section page-break" id="faq">
      <h3>Frequently Asked Questions</h3>
      ${items.map((faq) => `
        <div class="faq-item">
          <p class="faq-q">Q: ${escapeHtml(faq?.question || '')}</p>
          <p class="faq-a">A: ${escapeHtml(faq?.answer || '')}</p>
        </div>
      `).join('')}
    </section>
  `;
};
export const renderGlossary = (items = []) => {
    if (!Array.isArray(items) || !items.length)
        return '';
    return `
    <section class="glossary-section page-break" id="glossary">
      <h3>Glossary</h3>
      <dl>
        ${items.map((g) => `
          <dt><strong>${escapeHtml(g?.term || '')}</strong></dt>
          <dd>${escapeHtml(g?.definition || '')}</dd>
        `).join('')}
      </dl>
    </section>
  `;
};
export const renderQuizBlock = (quizzes = []) => {
    if (!Array.isArray(quizzes) || !quizzes.length)
        return '';
    const qHtml = quizzes.map((quiz) => {
        const questions = Array.isArray(quiz?.Questions) ? quiz.Questions : [];
        const answers = Array.isArray(quiz?.Answers) ? quiz.Answers : [];
        const qaHtml = questions.map((q, i) => `
      <div class="qa-item">
        <p class="qa-q"><strong>Q${i + 1}:</strong> ${escapeHtml(q)}</p>
        <p class="qa-a"><em>Answer:</em> ${escapeHtml(answers[i] || '—')}</p>
      </div>
    `).join('');
        return `<div class="quiz-block"><h4>${escapeHtml(quiz?.QuizDescription || 'Knowledge Check')}</h4>${qaHtml}</div>`;
    }).join('');
    return `<div class="knowledge-check"><h3>Knowledge Check</h3>${qHtml}</div>`;
};
export const renderFramework = (framework) => {
    if (!framework || !framework.name)
        return '';
    const components = Array.isArray(framework.components) ? framework.components : [];
    return `
    <div class="framework-box">
      <div class="framework-badge">Original Framework</div>
      <h3 class="framework-name">${escapeHtml(framework.name)}</h3>
      <p class="framework-desc">${escapeHtml(framework.description || '')}</p>
      ${components.length ? `
        <div class="framework-components">
          ${components.map((c, i) => `
            <div class="framework-node">
              <span class="framework-node-num">${i + 1}</span>
              <span>${escapeHtml(c)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
};
export const renderCaseStudy = (cs) => {
    if (!cs || !cs.title)
        return '';
    return `
    <div class="case-study">
      <div class="case-study-badge">Case Study</div>
      <h3 class="case-study-title">${escapeHtml(cs.title)}</h3>
      ${cs.context ? `<div class="case-study-block"><span class="case-label">Context</span><p>${escapeHtml(cs.context)}</p></div>` : ''}
      ${cs.challenge ? `<div class="case-study-block"><span class="case-label">Challenge</span><p>${escapeHtml(cs.challenge)}</p></div>` : ''}
      ${cs.solution ? `<div class="case-study-block"><span class="case-label">Solution</span><p>${escapeHtml(cs.solution)}</p></div>` : ''}
      ${cs.outcome ? `<div class="case-study-block case-outcome"><span class="case-label">Outcome</span><p>${escapeHtml(cs.outcome)}</p></div>` : ''}
    </div>
  `;
};
export const renderExpertInsight = (insight, attribution = '') => {
    if (!insight)
        return '';
    return `
    <div class="expert-insight">
      <div class="insight-icon">&#x201C;</div>
      <blockquote class="insight-quote">${escapeHtml(insight)}</blockquote>
      ${attribution ? `<cite class="insight-attribution">&mdash; ${escapeHtml(attribution)}</cite>` : ''}
    </div>
  `;
};
export const renderInteractiveMarkers = (markers = []) => {
    if (!Array.isArray(markers) || !markers.length)
        return '';
    return markers.map((m) => {
        const isAudio = String(m).toLowerCase().includes('audio');
        const isSlide = String(m).toLowerCase().includes('slide');
        const icon = isAudio ? '&#x1F3A7;' : isSlide ? '&#x1F4CA;' : '&#x25B6;';
        const label = isAudio ? 'Audio Player' : isSlide ? 'Interactive Slides' : 'Interactive Media';
        return `
      <div class="interactive-marker">
        <span class="interactive-icon">${icon}</span>
        <div class="interactive-text">
          <span class="interactive-label">${label}</span>
          <span class="interactive-desc">${escapeHtml(String(m))}</span>
        </div>
      </div>
    `;
    }).join('');
};
export const renderChapterSummary = (summary) => {
    if (!summary)
        return '';
    return `
    <div class="chapter-summary">
      <div class="summary-label">Chapter Summary</div>
      <p>${escapeHtml(summary)}</p>
    </div>
  `;
};
export const renderFootnotes = (footnotes = [], chapterIdx = 0) => {
    if (!Array.isArray(footnotes) || !footnotes.length)
        return '';
    return `
    <div class="footnotes-section">
      <div class="footnotes-divider"></div>
      <h4 class="footnotes-title">Notes</h4>
      <ol class="footnotes-list">
        ${footnotes.map((fn, i) => `
          <li id="fn-${chapterIdx}-${i + 1}" class="footnote-item">
            <a href="#fnref-${chapterIdx}-${i + 1}" class="fn-back-link">&#x21A9;</a>
            <strong>${escapeHtml(fn.term || '')}</strong>: ${escapeHtml(fn.definition || '')}
          </li>
        `).join('')}
      </ol>
    </div>
  `;
};
export const injectFootnoteRefs = (html, chapterIdx) => {
    return html.replace(/\[\^(\d+)\]/g, (_, num) => `<a href="#fn-${chapterIdx}-${num}" id="fnref-${chapterIdx}-${num}" class="fn-ref">${num}</a>`);
};
export const renderImplementationGuide = (steps = []) => {
    if (!Array.isArray(steps) || !steps.length)
        return '';
    return `
    <div class="implementation-guide">
      <div class="guide-title">Implementation Blueprint</div>
      <ol>${steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
    </div>
  `;
};
export const renderMistakes = (mistakes = []) => {
    if (!Array.isArray(mistakes) || !mistakes.length)
        return '';
    return `
    <div class="common-mistakes">
      <div class="mistake-title">Common Pitfalls to Avoid</div>
      <ul>${mistakes.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
    </div>
  `;
};
export const renderExercises = (exercises = []) => {
    if (!Array.isArray(exercises) || !exercises.length)
        return '';
    return `
    <div class="practical-exercises">
      <div class="exercise-title">Chapter Lab: Hands-on Practice</div>
      <ul>${exercises.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
    </div>
  `;
};
export const renderMiniProject = (project) => {
    if (!project || !project.title)
        return '';
    return `
    <div class="mini-project">
      <div class="project-badge">CHAPTER PROJECT</div>
      <h3 class="project-title">${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.description || '')}</p>
      <ul class="project-tasks">
        ${Array.isArray(project.tasks) ? project.tasks.map(t => `<li>${escapeHtml(t)}</li>`).join('') : ''}
      </ul>
    </div>
  `;
};
export const renderChecklist = (items = []) => {
    if (!Array.isArray(items) || !items.length)
        return '';
    return `
    <div class="checklist-box">
      <div class="checklist-title">Success Checklist</div>
      ${items.map(i => `<div class="checklist-item"><div class="checkbox"></div><span>${escapeHtml(i)}</span></div>`).join('')}
    </div>
  `;
};
export const renderInterviewQuestions = (questions = []) => {
    if (!Array.isArray(questions) || !questions.length)
        return '';
    return `
    <div class="interview-section">
      <h3 style="font-family: var(--font-sans); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--navy); margin-bottom: 20px;">Industry Interview Prep</h3>
      ${questions.map(q => `
        <div class="interview-item">
          <p class="interview-q">Q: ${escapeHtml(q.question)}</p>
          <p class="interview-a"><strong>Expert Answer:</strong> ${escapeHtml(q.answer)}</p>
        </div>
      `).join('')}
    </div>
  `;
};
