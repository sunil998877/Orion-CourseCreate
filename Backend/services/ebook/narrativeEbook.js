import { escapeHtml } from './html.js';
import { renderMarkdown } from './markdown.js';
import {
  textToParagraphHtml,
  renderTakeaways,
  renderTips,
  renderFaq,
  renderGlossary,
  renderQuizBlock,
  renderFramework,
  renderCaseStudy,
  renderExpertInsight,
  renderInteractiveMarkers,
  renderChapterSummary,
  renderFootnotes,
  injectFootnoteRefs,
  renderImplementationGuide,
  renderMistakes,
  renderExercises,
  renderMiniProject,
  renderChecklist,
  renderInterviewQuestions,
} from './blocks.js';
import { processContentWithImages } from './images.js';
export const buildEbookHtmlFromNarrative = async (course, ebookNarrative, modules = [], customPublisher = '') => {
    const ebookTitle = ebookNarrative?.title || course.title || 'Course eBook';
    const ebookSubtitle = ebookNarrative?.subtitle || course.description || '';
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
