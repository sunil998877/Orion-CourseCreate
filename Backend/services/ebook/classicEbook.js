import { escapeHtml, renderList } from './html.js';
export const buildEbookHtml = (course, modules, customPublisher = '', customEmail = '') => {
    const publisher = customPublisher || 'ORION by EVOKE AI';
    const ebookTitle = course.title || 'Course eBook';
    const moduleSections = modules.map((mod, idx) => {
        const chNum = idx + 1;
        const topicsList = Array.isArray(mod.TeachingContent) ? mod.TeachingContent : [];
        const topicGridClass = topicsList.length === 2 ? 'grid-2' : (topicsList.length >= 3 ? 'grid-3' : 'grid-1');
        const teachingBlocks = topicsList.length
            ? `<div class="topics-grid ${topicGridClass}">${topicsList.map((topic) => `
        <div class="topic-card">
          <h4>${escapeHtml(topic?.Topics || 'Topic')}</h4>
          <p class="topic-ref">${escapeHtml(topic?.StandardsReference || 'Core Concept')}</p>
          ${renderList(topic?.ContentPoints || [])}
        </div>
      `).join('')}</div>`
            : '<p class="muted">No topic content available.</p>';
        const quizzes = Array.isArray(mod.Quizzes) ? mod.Quizzes : [];
        const quizSection = quizzes.length
            ? quizzes.map((quiz) => {
                const questions = Array.isArray(quiz?.Questions) ? quiz.Questions : [];
                const answers = Array.isArray(quiz?.Answers) ? quiz.Answers : [];
                const qa = questions.map((q, qIdx) => `
          <div class="qa">
            <p style="margin: 0 0 4px 0; font-weight: 700; color: var(--navy); font-size: 12px;">Q${qIdx + 1}: ${escapeHtml(q)}</p>
            <p style="margin: 0; color: #475569; font-size: 11.5px;">${escapeHtml(answers[qIdx] || '')}</p>
          </div>
        `).join('');
                return `
          <div class="quiz">
            <h4 style="font-family: var(--font-sans); font-size: 13px; font-weight: 800; text-transform: uppercase; color: var(--navy); letter-spacing: 0.5px; margin: 0 0 10px 0;">${escapeHtml(quiz?.QuizDescription || 'Knowledge Check')}</h4>
            <div class="quiz-grid">${qa || '<p class="muted">No quiz questions available.</p>'}</div>
          </div>
        `;
            }).join('')
            : '';
        const extLinks = mod?.FurtherStudy?.ExternalLinks || [];
        const bookRefs = mod?.FurtherStudy?.BookReferences || [];
        let furtherHtml = '';
        if (extLinks.length > 0 || bookRefs.length > 0) {
            furtherHtml = `
        <div class="further-reading" style="margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--border); break-inside: avoid;">
          <h3 style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px;">Further Reading &amp; References</h3>
          <ol class="reference-list" style="margin: 0; padding-left: 18px;">
            ${bookRefs.map(b => `<li style="font-family: var(--font-sans); font-size: 11.5px; color: var(--text); margin-bottom: 6px;"><strong>Book:</strong> ${escapeHtml(b)}</li>`).join('')}
            ${extLinks.map(link => `<li style="font-family: var(--font-sans); font-size: 11.5px; color: var(--text); margin-bottom: 6px;"><strong>Resource Link:</strong> <a href="${escapeHtml(link)}" target="_blank" style="font-weight: 700; color: var(--navy); text-decoration: underline;">${escapeHtml(link)}</a></li>`).join('')}
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
          ${mod.Objectives && mod.Objectives.length ? `
            <div class="learning-objectives">
              <h3>Learning Objectives</h3>
              ${renderList(mod.Objectives)}
            </div>
          ` : ''}
          <div class="core-content">
            <h3 style="font-family: var(--font-sans); font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--navy); letter-spacing: 1px; margin-bottom: 10px;">Core Curriculum Concepts</h3>
            ${teachingBlocks}
          </div>
          ${mod?.CaseStudy?.CaseStudyDescription ? `
            <div class="case-study-box">
              <h3>Case Study Analysis</h3>
              <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.5;">${escapeHtml(mod.CaseStudy.CaseStudyDescription)}</p>
              ${mod.CaseStudy.Questions && mod.CaseStudy.Questions.length ? `
                <h4 style="font-family: var(--font-sans); font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--muted); margin: 0 0 6px 0;">Discussion Questions</h4>
                ${renderList(mod.CaseStudy.Questions)}
              ` : ''}
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
          section { max-width: 820px; margin: 0 auto; padding: 20px 30px 40px; box-sizing: border-box; }
          .page-break { break-before: page; page-break-before: always; }

          .cover { height: 250mm; max-height: 255mm; background: linear-gradient(135deg, #090d16 0%, #162447 100%); color: var(--white); display: flex; flex-direction: column; justify-content: center; padding: 50px 40px; position: relative; overflow: hidden; box-sizing: border-box; page-break-after: always; break-after: page; }
          .cover h1 { font-family: var(--font-display); font-size: 42px; margin-bottom: 20px; position: relative; z-index: 2; line-height: 1.2; }
          .cover .meta { border-top: 1px solid rgba(255,255,255,0.2); margin-top: 30px; padding-top: 20px; position: relative; z-index: 2; }
          .cover p { font-family: var(--font-sans); opacity: 0.85; margin: 6px 0; }
          .cover-watermark { position: absolute; top: -30px; right: -30px; font-size: 200px; font-weight: 800; color: rgba(255,255,255,0.03); font-family: var(--font-display); }

          .chapter-header { position: relative; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid var(--navy); }
          .chapter-label { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
          .chapter-label-text { font-family: var(--font-sans); font-size: 10px; font-weight: 800; letter-spacing: 2px; color: var(--accent); }
          .chapter-label-line { flex: 1; height: 1px; background: var(--border); }
          .chapter-num-watermark { position: absolute; right: 0; top: -20px; font-size: 100px; font-weight: 800; color: rgba(0,0,0,0.03); font-family: var(--font-display); }
          .chapter-h1 { font-family: var(--font-display); font-size: 36px; color: var(--navy); margin: 0; }

          .topics-grid { display: grid; gap: 14px; margin-top: 10px; margin-bottom: 24px; break-inside: avoid; }
          .topics-grid.grid-1 { grid-template-columns: 1fr; }
          .topics-grid.grid-2 { grid-template-columns: 1fr 1fr; }
          .topics-grid.grid-3 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
          .topic-card { background: #ffffff; border: 1px solid var(--border); border-top: 3px solid var(--navy); border-radius: 8px; padding: 14px 16px; box-sizing: border-box; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
          .topic-card h4 { font-family: var(--font-sans); font-size: 14px; font-weight: 700; color: var(--navy); margin: 0 0 4px 0; }
          .topic-ref { font-family: var(--font-sans); font-size: 10.5px; color: var(--muted); margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .learning-objectives { background: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; break-inside: avoid; }
          .learning-objectives h3 { font-family: var(--font-sans); font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0369a1; letter-spacing: 1px; margin: 0 0 8px 0; }
          .case-study-box { background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 8px; padding: 16px 18px; margin: 20px 0; break-inside: avoid; }
          .case-study-box h3 { font-family: var(--font-sans); font-size: 13px; font-weight: 800; text-transform: uppercase; color: #b45309; letter-spacing: 1px; margin: 0 0 8px 0; }
          .quiz-section { margin-top: 20px; padding: 18px; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; break-inside: avoid; }
          .quiz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .qa { background: #ffffff; border: 1px solid var(--border); border-radius: 6px; padding: 10px 14px; break-inside: avoid; }
          ul { padding-left: 20px; margin: 6px 0; }
          li { margin-bottom: 6px; }
          h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
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
            ${(customEmail || course.ebookUserEmail) ? `<p><strong>Contact:</strong> ${escapeHtml(customEmail || course.ebookUserEmail)}</p>` : ''}
          </div>
        </section>

        <section class="page-break" style="padding-top: 30px;">
          <div style="border-bottom: 2px solid var(--navy); padding-bottom: 15px; margin-bottom: 25px;">
            <span style="font-family: var(--font-sans); font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--accent);">Course Curriculum</span>
            <h2 style="font-family: var(--font-display); font-size: 32px; color: var(--navy); margin: 6px 0 0 0;">Table of Contents</h2>
          </div>

          <div class="toc-container" style="display: flex; flex-direction: column; gap: 16px;">
            ${course.description ? `
              <div style="padding: 14px 18px; background: #f8fafc; border-left: 4px solid var(--navy); border-radius: 6px; margin-bottom: 8px;">
                <span style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase;">Overview &amp; Scope</span>
                <div style="font-family: var(--font-sans); font-size: 13px; color: var(--text); margin-top: 4px; line-height: 1.5;">${escapeHtml(course.description)}</div>
              </div>
            ` : ''}

            ${modules.map((m, idx) => {
              const chNum = idx + 1;
              const topics = Array.isArray(m.TeachingContent) ? m.TeachingContent.map(t => t?.Topics).filter(Boolean) : [];
              const objectives = Array.isArray(m.Objectives) ? m.Objectives : [];
              const hasCaseStudy = Boolean(m?.CaseStudy?.CaseStudyDescription);
              const hasQuizzes = Array.isArray(m.Quizzes) && m.Quizzes.length > 0;
              return `
              <div style="border: 1px solid var(--border); border-radius: 8px; padding: 14px 18px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
                  <span style="font-family: var(--font-sans); font-size: 14px; font-weight: 700; color: var(--navy);">
                    <span style="color: var(--accent); margin-right: 6px;">Chapter ${chNum}:</span>
                    <a href="#ch-${chNum}" style="color: inherit; text-decoration: none;">${escapeHtml(m.Title || 'Untitled Module')}</a>
                  </span>
                  <span style="font-family: var(--font-sans); font-size: 11px; font-weight: 600; color: var(--muted); background: #f1f5f9; padding: 2px 8px; border-radius: 12px;">Module ${chNum}</span>
                </div>

                ${topics.length > 0 ? `
                  <div style="margin-top: 6px;">
                    <span style="font-family: var(--font-sans); font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px;">Core Topics:</span>
                    <ul style="margin: 4px 0 0 0; padding-left: 18px; font-family: var(--font-sans); font-size: 12px; color: #475569; line-height: 1.5;">
                      ${topics.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}

                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #f1f5f9; font-family: var(--font-sans); font-size: 11px;">
                  ${objectives.length > 0 ? `<span style="color: #0369a1; background: #f0f9ff; padding: 2px 6px; border-radius: 4px;">🎯 ${objectives.length} Learning Objectives</span>` : ''}
                  ${hasCaseStudy ? `<span style="color: #b45309; background: #fffbeb; padding: 2px 6px; border-radius: 4px;">💼 Practical Case Study</span>` : ''}
                  ${hasQuizzes ? `<span style="color: #15803d; background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">📝 Knowledge Assessment</span>` : ''}
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </section>

        ${moduleSections}
      </body>
    </html>
  `;
};
