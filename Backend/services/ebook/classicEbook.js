import { escapeHtml, renderList } from './html.js';
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
