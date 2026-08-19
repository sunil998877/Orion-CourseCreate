import { getOpenAIClient, isOpenAIConfigured } from '../utils/openaiClient.js';

export const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const renderList = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return '<p class="muted">Not provided.</p>';
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
};

export const buildEbookHtml = (course, modules, customPublisher = '') => {
  const publisher = customPublisher || 'ORION by EVOKE AI';
  const ebookTitle = course.title || 'Course eBook';
  const moduleSections = modules.map((mod, idx) => {
    const chNum = idx + 1;
    const teachingBlocks = Array.isArray(mod.TeachingContent) && mod.TeachingContent.length
      ? mod.TeachingContent.map((topic) => `
        <div class="topic">
          <h4>${escapeHtml(topic?.Topics || 'Topic')}</h4>
          <p class="muted">${escapeHtml(topic?.StandardsReference || 'AI Generated')}</p>
          ${renderList(topic?.ContentPoints || [])}
        </div>
      `).join('')
      : '<p class="muted">No topic content available.</p>';
    const quizzes = Array.isArray(mod.Quizzes) ? mod.Quizzes : [];
    const quizSection = quizzes.length
      ? quizzes.map((quiz) => {
        const questions = Array.isArray(quiz?.Questions) ? quiz.Questions : [];
        const answers = Array.isArray(quiz?.Answers) ? quiz.Answers : [];
        const qa = questions.map((q, idx) => `
          <div class="qa">
            <p><strong>Q${idx + 1}:</strong> ${escapeHtml(q)}</p>
            <p><strong>Answer:</strong> ${escapeHtml(answers[idx] || '')}</p>
          </div>
        `).join('');
        return `
          <div class="quiz">
            <h4>${escapeHtml(quiz?.QuizDescription || 'Knowledge Check')}</h4>
            ${qa || '<p class="muted">No quiz questions available.</p>'}
          </div>
        `;
      }).join('')
      : '<p class="muted">No quizzes available.</p>';

    const extLinks = mod?.FurtherStudy?.ExternalLinks || [];
    const bookRefs = mod?.FurtherStudy?.BookReferences || [];
    let furtherHtml = '';
    if (extLinks.length > 0 || bookRefs.length > 0) {
      furtherHtml = `
        <div class="further-reading" style="margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--border);">
          <h3 style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 14px;">Further Reading &amp; References</h3>
          <ol class="reference-list" style="margin: 0; padding-left: 18px;">
            ${bookRefs.map(b => `<li style="font-family: var(--font-sans); font-size: 12px; color: var(--text); margin-bottom: 8px;"><strong>Book:</strong> ${escapeHtml(b)}</li>`).join('')}
            ${extLinks.map(link => `<li style="font-family: var(--font-sans); font-size: 12px; color: var(--text); margin-bottom: 8px;"><strong>Resource Link:</strong> <a href="${escapeHtml(link)}" target="_blank" style="font-weight: 700; color: var(--navy); text-decoration: underline;">${escapeHtml(link)}</a></li>`).join('')}
          </ol>
        </div>
      `;
    }

    return `
      <section class="chapter page-break" id="ch-${chNum}">
        <div class="chapter-header">
          <div class="chapter-num-watermark">${chNum.toString().padStart(2, '0')}</div>
          <div class="chapter-label">
            <span class="chapter-label-text">CHAPTER ${chNum}</span>
            <div class="chapter-label-line"></div>
          </div>
          <h1 class="chapter-h1">${escapeHtml(mod.Title || `Module ${chNum}`)}</h1>
        </div>
        <div class="chapter-body">
          <div class="learning-objectives">
            <h3>Learning Objectives</h3>
            ${renderList(mod.Objectives || [])}
          </div>
          <div class="core-content">
            <h3>Core Teaching Content</h3>
            ${teachingBlocks}
          </div>
          ${mod?.CaseStudy?.CaseStudyDescription ? `
            <div class="case-study-box">
              <h3>Case Study</h3>
              <p>${escapeHtml(mod.CaseStudy.CaseStudyDescription)}</p>
              <h4>Discussion Questions</h4>
              ${renderList(mod.CaseStudy.Questions || [])}
            </div>
          ` : ''}
          ${quizSection}
          ${furtherHtml}
        </div>
      </section>
    `;
  }).join('');

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(ebookTitle)}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700;800&family=Lora:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <style>
          :root {
            --navy: #162447;
            --accent: #e8a000;
            --white: #ffffff;
            --text: #1e293b;
            --muted: #64748b;
            --border: #e2e8f0;
            --font-serif: 'Lora', Georgia, serif;
            --font-display: 'Playfair Display', Georgia, serif;
            --font-sans: 'Inter', Arial, sans-serif;
          }
          body { font-family: var(--font-serif); color: var(--text); background: var(--white); margin: 0; padding: 0; font-size: 14px; -webkit-print-color-adjust: exact; }
          section { max-width: 820px; margin: 0 auto; padding: 60px; break-inside: auto; }
          .page-break { break-before: page; }
          
          /* Cover Styles */
          .cover { min-height: 100vh; background: var(--navy); color: var(--white); display: flex; flex-direction: column; justify-content: center; padding: 80px; position: relative; overflow: hidden; }
          .cover h1 { font-family: var(--font-display); font-size: 52px; margin-bottom: 20px; position: relative; z-index: 2; }
          .cover .meta { border-top: 1px solid rgba(255,255,255,0.2); pt-20; margin-top: 40px; position: relative; z-index: 2; }
          .cover p { font-family: var(--font-sans); opacity: 0.8; margin: 5px 0; }
          .cover-watermark { position: absolute; top: -50px; right: -50px; font-size: 300px; font-weight: 800; color: rgba(255,255,255,0.03); font-family: var(--font-display); }

          /* Chapter Styles */
          .chapter-header { position: relative; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid var(--navy); }
          .chapter-label { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
          .chapter-label-text { font-family: var(--font-sans); font-size: 10px; font-weight: 800; letter-spacing: 2px; color: var(--accent); }
          .chapter-label-line { flex: 1; height: 1px; background: var(--border); }
          .chapter-num-watermark { position: absolute; right: 0; top: -20px; font-size: 100px; font-weight: 800; color: rgba(0,0,0,0.03); font-family: var(--font-display); }
          .chapter-h1 { font-family: var(--font-display); font-size: 36px; color: var(--navy); margin: 0; }

          .topic { margin-bottom: 30px; break-inside: avoid; }
          .topic h4 { font-family: var(--font-sans); font-size: 18px; color: var(--navy); margin-bottom: 5px; }
          .quiz-section { margin-top: 40px; padding: 30px; background: #f8fafc; border-radius: 12px; }
          .quiz { margin-bottom: 20px; break-inside: avoid; }
          ul { padding-left: 20px; }
          li { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <section class="cover">
          <div class="cover-watermark">00</div>
          <h1>${escapeHtml(course.title || 'Untitled Course')}</h1>
          <div class="meta">
            <p><strong>Audience:</strong> ${escapeHtml(course.audience || 'General')}</p>
            <p><strong>Level:</strong> ${escapeHtml(course.level || 'Intermediate')}</p>
            <p><strong>Publisher:</strong> ${escapeHtml(publisher)}</p>
          </div>
        </section>
        
        <section class="page-break">
          <h2 style="font-family: var(--font-display); font-size: 32px; color: var(--navy);">Table of Contents</h2>
          <ul style="list-style: none; padding: 0; margin-top: 30px;">
            ${modules.map((m, idx) => `
              <li style="padding: 10px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;">
                <span style="font-weight: 600;">Chapter ${idx + 1}: ${escapeHtml(m.Title || 'Untitled')}</span>
              </li>
            `).join('')}
          </ul>
        </section>

        ${moduleSections}
      </body>
    </html>
  `;
};

/**
 * Lightweight Markdown → HTML renderer.
 */
export const renderMarkdown = (text = '') => {
  if (!text) return '';
  const lines = String(text)
    .split('\n')
    .map(l => l.trimEnd());

  const html = [];
  let i = 0;

  const inlineFormat = (s) =>
    s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+?)`/g, '<code>$1</code>');

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (/^-{3,}$/.test(trimmed) || /^={3,}$/.test(trimmed)) {
      html.push('<hr class="section-divider" />');
      i++; continue;
    }

    if (/^## /.test(trimmed)) {
      html.push(`<h3 class="md-h3">${inlineFormat(trimmed.replace(/^## /, ''))}</h3>`);
      i++; continue;
    }

    if (/^### /.test(trimmed)) {
      html.push(`<h4 class="md-h4">${inlineFormat(trimmed.replace(/^### /, ''))}</h4>`);
      i++; continue;
    }

    if (/^\|/.test(trimmed)) {
      const tableRows = [];
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        tableRows.push(lines[i].trim());
        i++;
      }
      const dataRows = tableRows.filter(r => !/^\|[-:\s|]+\|?$/.test(r));
      if (dataRows.length >= 2) {
        const headerCells = dataRows[0].split('|').filter((_, ci) => ci > 0 && ci < dataRows[0].split('|').length - 1);
        const bodyRows = dataRows.slice(1);
        html.push('<div class="table-wrapper"><table class="md-table">');
        html.push('<thead><tr>');
        headerCells.forEach(cell => html.push(`<th>${inlineFormat(cell.trim())}</th>`));
        html.push('</tr></thead><tbody>');
        bodyRows.forEach(row => {
          const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1);
          html.push('<tr>');
          cells.forEach(cell => html.push(`<td>${inlineFormat(cell.trim())}</td>`));
          html.push('</tr>');
        });
        html.push('</tbody></table></div>');
      } else if (dataRows.length === 1) {
        html.push(`<p class="md-p">${inlineFormat(dataRows[0].replace(/\|/g, ' | '))}</p>`);
      }
      continue;
    }

    if (/^[*\-] /.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[*\-] /.test(lines[i].trim())) {
        items.push(`<li>${inlineFormat(lines[i].trim().replace(/^[*\-] /, ''))}</li>`);
        i++;
      }
      html.push(`<ul class="md-ul">${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(`<li>${inlineFormat(lines[i].trim().replace(/^\d+\.\s/, ''))}</li>`);
        i++;
      }
      html.push(`<ol class="md-ol">${items.join('')}</ol>`);
      continue;
    }

    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^[*\-] /.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !/^#+\s/.test(lines[i].trim()) &&
      !/^\|/.test(lines[i].trim()) &&
      !/^-{3,}$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length) {
      html.push(`<p class="md-p">${inlineFormat(paraLines.join(' '))}</p>`);
    }
  }

  return html.join('');
};

export const textToParagraphHtml = renderMarkdown;

export const renderTakeaways = (items = []) => {
  if (!Array.isArray(items) || !items.length) return '';
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
  if (!Array.isArray(items) || !items.length) return '';
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
  if (!Array.isArray(items) || !items.length) return '';
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
  if (!Array.isArray(items) || !items.length) return '';
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
  if (!Array.isArray(quizzes) || !quizzes.length) return '';
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
  if (!framework || !framework.name) return '';
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
  if (!cs || !cs.title) return '';
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
  if (!insight) return '';
  return `
    <div class="expert-insight">
      <div class="insight-icon">&#x201C;</div>
      <blockquote class="insight-quote">${escapeHtml(insight)}</blockquote>
      ${attribution ? `<cite class="insight-attribution">&mdash; ${escapeHtml(attribution)}</cite>` : ''}
    </div>
  `;
};

export const renderInteractiveMarkers = (markers = []) => {
  if (!Array.isArray(markers) || !markers.length) return '';
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
  if (!summary) return '';
  return `
    <div class="chapter-summary">
      <div class="summary-label">Chapter Summary</div>
      <p>${escapeHtml(summary)}</p>
    </div>
  `;
};

export const renderFootnotes = (footnotes = [], chapterIdx = 0) => {
  if (!Array.isArray(footnotes) || !footnotes.length) return '';
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
  return html.replace(/\[\^(\d+)\]/g, (_, num) =>
    `<a href="#fn-${chapterIdx}-${num}" id="fnref-${chapterIdx}-${num}" class="fn-ref">${num}</a>`
  );
};

export const renderImplementationGuide = (steps = []) => {
  if (!Array.isArray(steps) || !steps.length) return '';
  return `
    <div class="implementation-guide">
      <div class="guide-title">Implementation Blueprint</div>
      <ol>${steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
    </div>
  `;
};

export const renderMistakes = (mistakes = []) => {
  if (!Array.isArray(mistakes) || !mistakes.length) return '';
  return `
    <div class="common-mistakes">
      <div class="mistake-title">Common Pitfalls to Avoid</div>
      <ul>${mistakes.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
    </div>
  `;
};

export const renderExercises = (exercises = []) => {
  if (!Array.isArray(exercises) || !exercises.length) return '';
  return `
    <div class="practical-exercises">
      <div class="exercise-title">Chapter Lab: Hands-on Practice</div>
      <ul>${exercises.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
    </div>
  `;
};

export const renderMiniProject = (project) => {
  if (!project || !project.title) return '';
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
  if (!Array.isArray(items) || !items.length) return '';
  return `
    <div class="checklist-box">
      <div class="checklist-title">Success Checklist</div>
      ${items.map(i => `<div class="checklist-item"><div class="checkbox"></div><span>${escapeHtml(i)}</span></div>`).join('')}
    </div>
  `;
};

export const renderInterviewQuestions = (questions = []) => {
  if (!Array.isArray(questions) || !questions.length) return '';
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

export const processContentWithImages = async (html) => {
  const imageTagRegex = /\[GENERATE_IMAGE:\s*(.+?)\]/g;
  const matches = [...html.matchAll(imageTagRegex)];
  if (matches.length === 0) return html;

  if (!isOpenAIConfigured()) {
    return html.replace(imageTagRegex, '');
  }

  const openai = getOpenAIClient();
  let result = html;
  for (const match of matches) {
    const [fullTag, description] = match;
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: description,
        n: 1,
        size: '1024x1024',
      });
      const imageUrl = response.data[0]?.url;
      if (imageUrl) {
        const imgHtml = `<figure class="generated-image"><img src="${imageUrl}" alt="${escapeHtml(description)}" style="max-width:100%;height:auto;border-radius:8px;" /><figcaption style="text-align:center;font-style:italic;color:#64748b;margin-top:8px;">${escapeHtml(description)}</figcaption></figure>`;
        result = result.replace(fullTag, imgHtml);
      } else {
        result = result.replace(fullTag, '');
      }
    } catch (err) {
      console.error('Failed to generate image:', err?.message || err);
      result = result.replace(fullTag, '');
    }
  }
  return result;
};

export const buildEbookHtmlFromNarrative = async (course, ebookNarrative, modules = [], customPublisher = '') => {
  const ebookTitle = ebookNarrative?.title || course.title || 'Course eBook';
  const ebookSubtitle = ebookNarrative?.subtitle || course.description || '';
  const authorBio = ebookNarrative?.author_bio || '';
  const language = ebookNarrative?.language || 'en-US';
  const isbn = ebookNarrative?.isbn || `urn:uuid:${course.courseId || 'cc-ebook'}`;
  const publisher = customPublisher || ebookNarrative?.metadata?.publisher || 'ORION by EVOKE AI';
  const chapters = Array.isArray(ebookNarrative?.chapters) ? ebookNarrative.chapters : [];
  const bookIntro = ebookNarrative?.introduction || '';
  const bookConclusion = ebookNarrative?.conclusion || '';
  const bookFaq = Array.isArray(ebookNarrative?.faq) ? ebookNarrative.faq : [];
  const bookGlossary = Array.isArray(ebookNarrative?.glossary) ? ebookNarrative.glossary : [];
  const bookCta = ebookNarrative?.call_to_action || '';
  const keywords = Array.isArray(ebookNarrative?.metadata?.keywords) ? ebookNarrative.metadata.keywords : [];

  const chapterSections = (await Promise.all(chapters.map(async (c, idx) => {
    const chNum = c?.chapter_number || (idx + 1);
    const chapterTitle = c?.chapter_title || `Chapter ${chNum}`;
    const summary = c?.summary || '';
    const hook = c?.hook || '';
    const content = c?.content || '';
    const takeaways = Array.isArray(c?.takeaways) ? c.takeaways : [];
    const tips = Array.isArray(c?.tips) ? c.tips : [];
    const furtherReading = Array.isArray(c?.further_reading) ? c.further_reading : [];
    const diagrams = Array.isArray(c?.diagrams) ? c.diagrams : [];
    const framework = c?.original_framework || null;
    const caseStudy = c?.case_study || null;
    const expertInsight = c?.expert_insight || '';
    const expertAttribution = c?.expert_attribution || '';
    const interactiveMarkers = Array.isArray(c?.interactive_markers) ? c.interactive_markers : [];
    const footnotes = Array.isArray(c?.footnotes) ? c.footnotes : [];
    const subheadings = Array.isArray(c?.subheadings) ? c.subheadings : [];

    const implementationGuide = Array.isArray(c?.implementation_guide) ? c.implementation_guide : [];
    const commonMistakes = Array.isArray(c?.common_mistakes) ? c.common_mistakes : [];
    const practicalExercises = Array.isArray(c?.practical_exercises) ? c.practical_exercises : [];
    const miniProject = c?.mini_project || null;
    const checklist = Array.isArray(c?.checklist) ? c.checklist : [];
    const interviewQuestions = Array.isArray(c?.interview_questions) ? c.interview_questions : [];

    let processedContent = injectFootnoteRefs(renderMarkdown(content), idx);
    processedContent = await processContentWithImages(processedContent);

    const diagramsHtml = diagrams.map((d) => {
      if (d?.mermaid_code) {
        return `
          <figure class="diagram-figure">
            <div class="mermaid-container"><pre class="mermaid">${d.mermaid_code}</pre></div>
            ${d.caption ? `<figcaption>${escapeHtml(d.caption)}</figcaption>` : ''}
          </figure>
        `;
      }
      return '';
    }).join('');

    const modMatch = modules[idx] || null;
    const quizHtml = modMatch ? renderQuizBlock(Array.isArray(modMatch.Quizzes) ? modMatch.Quizzes : []) : '';

    const extLinks = modMatch?.FurtherStudy?.ExternalLinks || [];
    const bookRefs = modMatch?.FurtherStudy?.BookReferences || [];

    const formatReferenceItem = (r) => {
      const trimmed = String(r || '').trim();
      if (/^https?:\/\/[^\s]+$/i.test(trimmed)) {
        return `<strong>Resource Link:</strong> <a href="${escapeHtml(trimmed)}" target="_blank" style="font-weight: 700; color: var(--navy); text-decoration: underline;">${escapeHtml(trimmed)}</a>`;
      }
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      if (urlRegex.test(trimmed)) {
        return trimmed.replace(urlRegex, (url) => `<a href="${escapeHtml(url)}" target="_blank" style="font-weight: 700; color: var(--navy); text-decoration: underline;">${escapeHtml(url)}</a>`);
      }
      return escapeHtml(trimmed);
    };

    const combinedRefs = [...furtherReading];
    bookRefs.forEach(b => {
      if (b && !combinedRefs.some(ref => ref.toLowerCase().includes(b.toLowerCase()))) {
        combinedRefs.push(`Book: ${b}`);
      }
    });
    extLinks.forEach(link => {
      if (link && !combinedRefs.some(ref => ref.toLowerCase().includes(link.toLowerCase()))) {
        combinedRefs.push(link);
      }
    });

    const furtherHtml = combinedRefs.length
      ? `<div class="further-reading"><h3>Further Reading &amp; References</h3><ol class="reference-list">${combinedRefs.map((r, ri) => `<li id="ref-${idx}-${ri + 1}" style="margin-bottom: 8px;">${formatReferenceItem(r)}</li>`).join('')}</ol></div>`
      : '';

    return `
      <section class="chapter page-break" id="ch-${chNum}">
        
        <div class="running-header">
          <span class="rh-book">${escapeHtml(ebookTitle)}</span>
          <span class="rh-chapter">Chapter ${chNum}</span>
        </div>

        <div class="chapter-header">
          <div class="chapter-num-watermark">${(chNum).toString().padStart(2, '0')}</div>
          <div class="chapter-label">
            <span class="chapter-label-text">CHAPTER ${chNum}</span>
            <div class="chapter-label-line"></div>
          </div>
          <h1 class="chapter-h1">${escapeHtml(chapterTitle)}</h1>
        </div>

        ${renderChapterSummary(summary)}
        ${hook ? `<div class="hook-box"><p><em>${escapeHtml(hook)}</em></p></div>` : ''}
        ${renderInteractiveMarkers(interactiveMarkers)}

        <div class="chapter-body">
          ${processedContent}
        </div>

        ${renderImplementationGuide(implementationGuide)}
        ${renderMistakes(commonMistakes)}
        ${diagramsHtml}
        ${renderExpertInsight(expertInsight, expertAttribution)}
        ${renderExercises(practicalExercises)}
        ${renderMiniProject(miniProject)}
        ${renderChecklist(checklist)}
        ${renderFramework(framework)}
        ${renderCaseStudy(caseStudy)}
        ${renderTakeaways(takeaways)}
        ${renderInterviewQuestions(interviewQuestions)}
        ${renderTips(tips)}
        ${quizHtml}
        ${furtherHtml}
        ${renderFootnotes(footnotes, idx)}

      </section>
    `;
  }))).join('');

  const tocHtml = chapters.map((c, i) => {
    const chNum = c?.chapter_number || (i + 1);
    const subheadings = Array.isArray(c?.subheadings) ? c.subheadings : [];
    return `
      <li class="toc-chapter-item">
        <a href="#ch-${chNum}" class="toc-link">
          <span class="toc-num">${chNum}.</span>
          <span class="toc-title">${escapeHtml(c?.chapter_title || `Chapter ${chNum}`)}</span>
        </a>
        ${subheadings.length ? `
          <ul class="toc-sub">
            ${subheadings.map(sh => `<li><a href="#" class="toc-sub-link">${escapeHtml(sh)}</a></li>`).join('')}
          </ul>
        ` : ''}
      </li>
    `;
  }).join('');

  const faqHtml = bookFaq.length ? `
    <section class="faq-section-page page-break">
      ${renderFaq(bookFaq)}
    </section>
  ` : '';

  const glossaryHtml = bookGlossary.length ? `
    <section class="glossary-page page-break">
      ${renderGlossary(bookGlossary)}
    </section>
  ` : '';

  const conclusionHtml = (bookConclusion || bookCta) ? `
    <section class="conclusion page-break">
      <h2>Conclusion</h2>
      ${textToParagraphHtml(bookConclusion)}
      ${bookCta ? `
        <div class="cta-box">
          <div class="cta-title">Your Next Steps</div>
          <p>${escapeHtml(bookCta)}</p>
        </div>
      ` : ''}
    </section>
  ` : '';

  return `
    <!doctype html>
    <html lang="${escapeHtml(language)}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(ebookTitle)}</title>
        <meta name="language" content="${escapeHtml(language)}" />
        <meta name="identifier" content="${escapeHtml(isbn)}" />
        <meta name="publisher" content="${escapeHtml(publisher)}" />
        ${keywords.length ? `<meta name="keywords" content="${keywords.map(k => escapeHtml(k)).join(', ')}" />` : ''}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&family=Source+Serif+4:wght@400;600&display=swap" rel="stylesheet" />
        <script type="module">
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
          mermaid.initialize({
            theme: 'base',
            themeVariables: {
              primaryColor: '#dbeafe',
              primaryTextColor: '#1e293b',
              primaryBorderColor: '#3b82f6',
              lineColor: '#334155',
              secondaryColor: '#f1f5f9',
              tertiaryColor: '#ffffff',
              fontFamily: 'Inter, sans-serif'
            }
          });
          try {
            await mermaid.run({ querySelector: '.mermaid' });
          } catch (_e) {
            document.querySelectorAll('.mermaid:not([data-processed])').forEach(el => {
              el.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-family:Inter,sans-serif;font-size:13px;border:1px dashed #cbd5e1;border-radius:8px;">Diagram could not be rendered</div>';
            });
          }
        </script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,800;1,600&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --navy:    #162447;
            --navy2:   #1f3c72;
            --accent:  #e8a000;
            --accent2: #0ea5e9;
            --green:   #16a34a;
            --purple:  #7c3aed;
            --red:     #dc2626;
            --bg:      #f7f9fc;
            --white:   #ffffff;
            --text:    #1e293b;
            --muted:   #64748b;
            --border:  #e2e8f0;
            --font-serif: 'Lora', Georgia, serif;
            --font-display: 'Playfair Display', Georgia, serif;
            --font-sans: 'Inter', Arial, sans-serif;
          }
          html { background: var(--bg); }
          body {
            font-family: var(--font-serif);
            color: var(--text);
            line-height: 1.7;
            background: var(--white);
          }
          .page-break { 
            break-before: page; 
            page-break-before: always; 
          }
          h1, h2, h3, h4, h5, h6 { break-after: avoid; }
        </style>
      </head>
      <body>
        <section class="cover">
          <div class="cover-top-bar"></div>
          <div class="cover-watermark">01</div>
          <div class="cover-content">
            <span class="cover-badge">eBook Edition</span>
            <h1>${escapeHtml(ebookTitle)}</h1>
            <div class="cover-rule"></div>
            ${ebookSubtitle ? `<p class="subtitle">${escapeHtml(ebookSubtitle)}</p>` : ''}
            <div class="cover-meta">
              <div class="cover-meta-item"><strong>Audience</strong>${escapeHtml(course.audience || 'General Learners')}</div>
              <div class="cover-meta-item"><strong>Level</strong>${escapeHtml(course.level || 'Not specified')}</div>
              <div class="cover-meta-item"><strong>Duration</strong>${escapeHtml(`${course?.duration?.value || 0} ${course?.duration?.unit || 'hours'}`)}</div>
              ${course.standards || course.country ? `<div class="cover-meta-item"><strong>Standards</strong>${escapeHtml(course.standards || course.country)}</div>` : ''}
              <div class="cover-meta-item"><strong>Publisher</strong>${escapeHtml(publisher)}</div>
            </div>
          </div>
          <div class="cover-bottom-bar"></div>
        </section>
        
        <section class="toc-page page-break">
          <h2>Table of Contents</h2>
          <ul class="toc-list">
            ${bookIntro ? `<li class="toc-chapter-item"><a href="#intro" class="toc-link"><span class="toc-num">—</span><span class="toc-title">Introduction</span></a></li>` : ''}
            ${tocHtml}
            ${bookFaq.length ? `<li class="toc-chapter-item"><a href="#faq" class="toc-link"><span class="toc-num">—</span><span class="toc-title">Frequently Asked Questions</span></a></li>` : ''}
            ${bookGlossary.length ? `<li class="toc-chapter-item"><a href="#glossary" class="toc-link"><span class="toc-num">—</span><span class="toc-title">Glossary</span></a></li>` : ''}
            ${(bookConclusion || bookCta) ? `<li class="toc-chapter-item"><a href="#conclusion" class="toc-link"><span class="toc-num">—</span><span class="toc-title">Conclusion &amp; Next Steps</span></a></li>` : ''}
          </ul>
        </section>

        ${bookIntro ? `
        <section class="intro-section page-break" id="intro">
          <h2>Introduction</h2>
          ${textToParagraphHtml(bookIntro)}
        </section>
        ` : ''}

        ${chapterSections}
        ${faqHtml}
        ${glossaryHtml}
        ${conclusionHtml}
      </body>
    </html>
  `;
};
