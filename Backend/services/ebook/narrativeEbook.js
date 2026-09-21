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
  renderCompanionPair,
} from './blocks.js';
import { processContentWithImages } from './images.js';
export const buildEbookHtmlFromNarrative = async (course, ebookNarrative, modules = [], customPublisher = '', customEmail = '') => {
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

        ${renderCompanionPair(renderImplementationGuide(implementationGuide), renderMistakes(commonMistakes))}
        ${diagramsHtml}
        ${renderExpertInsight(expertInsight, expertAttribution)}
        ${renderFramework(framework)}
        ${renderCaseStudy(caseStudy)}
        ${renderCompanionPair(renderExercises(practicalExercises), renderChecklist(checklist))}
        ${renderMiniProject(miniProject)}
        ${renderCompanionPair(renderTakeaways(takeaways), renderTips(tips))}
        ${renderInterviewQuestions(interviewQuestions)}
        ${quizHtml}
        ${furtherHtml}
        ${renderFootnotes(footnotes, idx)}

      </section>
    `;
    }))).join('');
    const tocHtml = chapters.length <= 3 ? chapters.map((c, i) => {
        const chNum = c?.chapter_number || (i + 1);
        const modMatch = modules[i] || {};
        const topics = Array.isArray(modMatch.TeachingContent) ? modMatch.TeachingContent.map(t => t?.Topics).filter(Boolean) : [];
        const subheadings = Array.isArray(c?.subheadings) ? c.subheadings : [];
        const displaySub = subheadings.length ? subheadings : topics;
        return `
      <div class="toc-card">
        <div class="toc-card-header">
          <span class="toc-card-badge">Chapter ${chNum}</span>
          <a href="#ch-${chNum}" class="toc-card-title">${escapeHtml(c?.chapter_title || `Chapter ${chNum}`)}</a>
        </div>
        ${c?.summary ? `<p class="toc-card-summary">${escapeHtml(c.summary)}</p>` : ''}
        ${displaySub.length ? `
          <ul class="toc-card-sub">
            ${displaySub.slice(0, 4).map(sh => `<li>${escapeHtml(sh)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `;
    }).join('') : chapters.map((c, i) => {
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

    const hasBackMatter = bookFaq.length > 0 || bookGlossary.length > 0 || Boolean(bookConclusion || bookCta);
    const backMatterHtml = hasBackMatter ? `
    <section class="back-matter-section page-break">
      ${bookFaq.length ? `
        <div class="back-matter-block" id="faq">
          <h3 class="back-matter-title">Frequently Asked Questions</h3>
          ${renderFaq(bookFaq)}
        </div>
      ` : ''}

      ${bookGlossary.length ? `
        <div class="back-matter-block" id="glossary">
          <h3 class="back-matter-title">Glossary &amp; Key Terms</h3>
          ${renderGlossary(bookGlossary)}
        </div>
      ` : ''}

      ${(bookConclusion || bookCta) ? `
        <div class="back-matter-block" id="conclusion">
          <h3 class="back-matter-title">Conclusion &amp; Next Steps</h3>
          ${bookConclusion ? textToParagraphHtml(bookConclusion) : ''}
          ${bookCta ? `
            <div class="cta-box">
              <div class="cta-title">Capstone &amp; Action Plan</div>
              <p>${escapeHtml(bookCta)}</p>
            </div>
          ` : ''}
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
            --navy:    #0f172a;
            --navy-dark: #090d16;
            --accent:  #10b981;
            --accent-gold: #f59e0b;
            --accent-blue: #3b82f6;
            --red:     #ef4444;
            --bg:      #f8fafc;
            --white:   #ffffff;
            --text:    #334155;
            --text-dark: #0f172a;
            --muted:   #64748b;
            --border:  #e2e8f0;
            --font-serif: 'Lora', Georgia, serif;
            --font-display: 'Playfair Display', Georgia, serif;
            --font-sans: 'Inter', Arial, sans-serif;
          }

          html, body {
            background: var(--white);
            color: var(--text);
            font-family: var(--font-serif);
            font-size: 14px;
            line-height: 1.8;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .page-break {
            break-before: page;
            page-break-before: always;
          }
          h1, h2, h3, h4, h5, h6 { break-after: avoid; page-break-after: avoid; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }

          .cover {
            height: 250mm;
            max-height: 255mm;
            background: linear-gradient(145deg, #090d16 0%, #0f172a 50%, #1e293b 100%);
            color: #ffffff;
            padding: 55px 45px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            page-break-after: always;
            break-after: page;
            box-sizing: border-box;
          }
          .cover-top-bar {
            height: 4px;
            width: 80px;
            background: #a3e635;
            border-radius: 2px;
          }
          .cover-watermark {
            position: absolute;
            right: -20px;
            top: 20px;
            font-size: 220px;
            font-weight: 900;
            color: rgba(255, 255, 255, 0.03);
            font-family: var(--font-display);
            user-select: none;
          }
          .cover-content {
            position: relative;
            z-index: 2;
            margin-top: auto;
            margin-bottom: auto;
          }
          .cover-badge {
            display: inline-block;
            background: rgba(163, 230, 53, 0.15);
            color: #a3e635;
            border: 1px solid rgba(163, 230, 53, 0.35);
            padding: 5px 14px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-family: var(--font-sans);
            margin-bottom: 24px;
          }
          .cover-content h1 {
            font-family: var(--font-display);
            font-size: 38px;
            line-height: 1.2;
            color: #ffffff;
            margin-bottom: 16px;
            font-weight: 800;
          }
          .cover-rule {
            width: 60px;
            height: 3px;
            background: #a3e635;
            border-radius: 2px;
            margin-bottom: 18px;
          }
          .cover-content .subtitle {
            font-family: var(--font-sans);
            font-size: 15px;
            color: #94a3b8;
            line-height: 1.6;
            max-width: 90%;
            margin-bottom: 28px;
          }
          .cover-meta {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 28px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.12);
          }
          .cover-meta-item {
            font-family: var(--font-sans);
            font-size: 12px;
            color: #e2e8f0;
          }
          .cover-meta-item strong {
            display: block;
            font-size: 10px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #94a3b8;
            margin-bottom: 2px;
          }
          .cover-bottom-bar {
            height: 2px;
            width: 100%;
            background: linear-gradient(90deg, #a3e635 0%, transparent 100%);
            opacity: 0.4;
          }

          .toc-page {
            padding: 10px 0 30px;
            page-break-before: always;
            break-before: page;
          }
          .toc-page h2 {
            font-family: var(--font-display);
            font-size: 28px;
            color: var(--navy);
            border-bottom: 2px solid var(--accent);
            padding-bottom: 8px;
            margin-bottom: 24px;
          }
          .toc-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .toc-chapter-item {
            padding: 12px 0;
            border-bottom: 1px solid var(--border);
          }
          .toc-link {
            display: flex;
            align-items: baseline;
            gap: 12px;
            text-decoration: none;
            color: var(--navy);
            font-family: var(--font-sans);
            font-size: 15px;
            font-weight: 600;
          }
          .toc-num {
            color: #059669;
            font-weight: 800;
            min-width: 32px;
          }
          .toc-title {
            flex: 1;
          }
          .toc-sub {
            list-style: none;
            padding-left: 44px;
            margin-top: 6px;
          }
          .toc-sub-link {
            text-decoration: none;
            color: var(--muted);
            font-family: var(--font-sans);
            font-size: 12px;
          }

          .intro-section {
            padding: 10px 0 30px;
            page-break-before: always;
            break-before: page;
          }
          .intro-section h2 {
            font-family: var(--font-display);
            font-size: 28px;
            color: var(--navy);
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
            margin-bottom: 20px;
          }
          .intro-section p {
            margin-bottom: 16px;
            text-align: justify;
          }

          .chapter {
            padding: 10px 0 30px;
            page-break-before: always;
            break-before: page;
          }
          .running-header {
            display: flex;
            justify-content: space-between;
            font-family: var(--font-sans);
            font-size: 9px;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: var(--muted);
            border-bottom: 1px solid var(--border);
            padding-bottom: 6px;
            margin-bottom: 24px;
          }
          .chapter-header {
            position: relative;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--navy);
          }
          .chapter-num-watermark {
            position: absolute;
            right: 0;
            top: -24px;
            font-size: 80px;
            font-weight: 900;
            color: rgba(15, 23, 42, 0.04);
            font-family: var(--font-display);
            user-select: none;
          }
          .chapter-label {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
          }
          .chapter-label-text {
            font-family: var(--font-sans);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 2px;
            color: #059669;
          }
          .chapter-label-line {
            flex: 1;
            height: 1px;
            background: var(--border);
          }
          .chapter-h1 {
            font-family: var(--font-display);
            font-size: 30px;
            color: var(--navy);
            margin: 0;
            font-weight: 800;
            line-height: 1.25;
          }

          .chapter-summary-box {
            background: #f1f5f9;
            border-left: 4px solid var(--navy);
            padding: 14px 18px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 18px;
            font-family: var(--font-sans);
            font-size: 13px;
            color: #334155;
          }
          .hook-box {
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            padding: 12px 18px;
            border-radius: 8px;
            margin-bottom: 22px;
            font-style: italic;
            color: #475569;
          }

          .chapter-body {
            margin-bottom: 28px;
          }
          .chapter-body h2 {
            font-family: var(--font-sans);
            font-size: 20px;
            font-weight: 700;
            color: var(--navy);
            margin: 24px 0 10px 0;
            padding-bottom: 4px;
            border-bottom: 1px solid var(--border);
          }
          .chapter-body h3 {
            font-family: var(--font-sans);
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin: 18px 0 8px 0;
          }
          .chapter-body p {
            margin-bottom: 14px;
            text-align: justify;
          }
          .chapter-body ul, .chapter-body ol {
            padding-left: 24px;
            margin-bottom: 16px;
          }
          .chapter-body li {
            margin-bottom: 6px;
          }

          .companion-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 18px 0;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .companion-col {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .companion-col > div {
            margin: 0 !important;
            height: 100% !important;
            box-sizing: border-box !important;
          }

          .implementation-guide, .implementation-guide-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-left: 4px solid #16a34a;
            padding: 16px 18px;
            border-radius: 8px;
            margin: 18px 0;
            break-inside: avoid;
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          .guide-title, .implementation-guide-box h4 {
            font-family: var(--font-sans);
            font-size: 13px;
            color: #15803d;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .implementation-guide ol, .implementation-guide-box ol, .implementation-guide-box ul {
            padding-left: 20px;
            margin: 0;
          }
          .implementation-guide li, .implementation-guide-box li {
            margin-bottom: 5px;
            font-family: var(--font-sans);
            font-size: 12.5px;
            color: #14532d;
          }

          .common-mistakes, .mistakes-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-left: 4px solid #dc2626;
            padding: 16px 18px;
            border-radius: 8px;
            margin: 18px 0;
            break-inside: avoid;
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          .mistake-title, .mistakes-title {
            font-family: var(--font-sans);
            font-size: 13px;
            color: #b91c1c;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .common-mistakes ul, .mistakes-box ul {
            padding-left: 20px;
            margin: 0;
          }
          .common-mistakes li, .mistakes-box li {
            margin-bottom: 5px;
            font-family: var(--font-sans);
            font-size: 12.5px;
            color: #7f1d1d;
          }

          .practical-exercises {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #475569;
            padding: 16px 18px;
            border-radius: 8px;
            margin: 18px 0;
            break-inside: avoid;
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          .exercise-title {
            font-family: var(--font-sans);
            font-size: 13px;
            color: #334155;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .practical-exercises ul {
            padding-left: 20px;
            margin: 0;
          }
          .practical-exercises li {
            margin-bottom: 5px;
            font-family: var(--font-sans);
            font-size: 12.5px;
            color: #1e293b;
          }

          .checklist-box {
            background: #fdf4ff;
            border: 1px solid #f0abfc;
            border-left: 4px solid #c026d3;
            padding: 16px 18px;
            border-radius: 8px;
            margin: 18px 0;
            break-inside: avoid;
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          .checklist-title {
            font-family: var(--font-sans);
            font-size: 13px;
            color: #a21caf;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .checklist-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 6px;
            font-family: var(--font-sans);
            font-size: 12.5px;
            color: #701a75;
          }
          .checkbox {
            width: 14px;
            height: 14px;
            border: 1.5px solid #c026d3;
            border-radius: 3px;
            margin-top: 2px;
            flex-shrink: 0;
          }

          .takeaway-box {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-left: 4px solid #059669;
            padding: 16px 18px;
            border-radius: 8px;
            margin: 18px 0;
            break-inside: avoid;
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          .takeaway-title {
            font-family: var(--font-sans);
            font-size: 13px;
            color: #047857;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .takeaway-box ul {
            padding-left: 20px;
            margin: 0;
          }
          .takeaway-box li {
            margin-bottom: 5px;
            font-family: var(--font-sans);
            font-size: 12.5px;
            color: #064e3b;
          }

          .tip-box {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-left: 4px solid #d97706;
            padding: 16px 18px;
            border-radius: 8px;
            margin: 18px 0;
            break-inside: avoid;
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          .tip-title {
            font-family: var(--font-sans);
            font-size: 13px;
            color: #b45309;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .tip-box ul {
            padding-left: 20px;
            margin: 0;
          }
          .tip-box li {
            margin-bottom: 5px;
            font-family: var(--font-sans);
            font-size: 12.5px;
            color: #78350f;
          }

          .case-study-box, .case-study {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #0284c7;
            padding: 18px 20px;
            border-radius: 8px;
            margin: 18px 0;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .case-study-badge {
            font-family: var(--font-sans);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #0284c7;
            background: #e0f2fe;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 6px;
          }
          .case-study-title {
            font-family: var(--font-display);
            font-size: 16px;
            color: #0369a1;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .case-study-block {
            margin-bottom: 8px;
            font-size: 12.5px;
          }
          .case-label {
            font-family: var(--font-sans);
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            display: block;
            margin-bottom: 2px;
          }

          .mini-project {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #cbd5e1;
            border-top: 3px solid var(--navy);
            border-radius: 8px;
            padding: 18px 20px;
            margin: 18px 0;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .project-badge {
            font-family: var(--font-sans);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: var(--navy);
            background: #e2e8f0;
            padding: 2px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 6px;
          }
          .project-title {
            font-family: var(--font-display);
            font-size: 16px;
            color: var(--navy);
            font-weight: 700;
            margin: 0 0 6px 0;
          }
          .project-tasks {
            margin: 8px 0 0 0;
            padding-left: 20px;
            font-family: var(--font-sans);
            font-size: 12.5px;
            color: #334155;
          }
          .project-tasks li {
            margin-bottom: 4px;
          }

          .concept-grid {
            margin: 18px 0;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .concept-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .concept-grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
          }
          .concept-grid-4 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .concept-grid-auto {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 14px;
          }
          .concept-card {
            background: #ffffff;
            border: 1px solid var(--border);
            border-top: 3px solid var(--navy);
            border-radius: 8px;
            padding: 14px 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.03);
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .concept-card-head {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          .concept-card-badge {
            font-family: var(--font-sans);
            font-size: 10px;
            font-weight: 800;
            color: var(--accent);
            background: #fffbeb;
            padding: 1px 6px;
            border-radius: 4px;
          }
          .concept-card-title {
            font-family: var(--font-sans);
            font-size: 13.5px;
            font-weight: 700;
            color: var(--navy);
            margin: 0;
          }
          .concept-card-desc {
            font-family: var(--font-serif);
            font-size: 12.5px;
            color: #334155;
            line-height: 1.5;
            margin: 0;
          }

          .interview-section {
            margin: 20px 0;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .interview-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .interview-card {
            background: #ffffff;
            border: 1px solid var(--border);
            border-left: 3px solid #6366f1;
            border-radius: 6px;
            padding: 12px 14px;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .interview-q {
            font-family: var(--font-sans);
            font-size: 12px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 4px;
          }
          .interview-a {
            font-family: var(--font-serif);
            font-size: 11.5px;
            color: #475569;
            line-height: 1.4;
            margin: 0;
          }

          .toc-overview-box {
            padding: 12px 16px;
            background: #f8fafc;
            border-left: 4px solid var(--navy);
            border-radius: 6px;
            margin-bottom: 18px;
            font-family: var(--font-sans);
            font-size: 12.5px;
            color: #334155;
            line-height: 1.5;
          }
          .toc-overview-label {
            display: block;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 4px;
          }
          .toc-cards-container {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .toc-card {
            background: #ffffff;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 14px 18px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          }
          .toc-card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 6px;
          }
          .toc-card-badge {
            font-family: var(--font-sans);
            font-size: 10px;
            font-weight: 800;
            color: var(--accent);
            background: #fffbeb;
            padding: 2px 8px;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .toc-card-title {
            font-family: var(--font-sans);
            font-size: 14px;
            font-weight: 700;
            color: var(--navy);
            text-decoration: none;
          }
          .toc-card-summary {
            font-family: var(--font-serif);
            font-size: 12px;
            color: #64748b;
            margin: 0 0 8px 0;
            line-height: 1.4;
          }
          .toc-card-sub {
            margin: 0;
            padding-left: 18px;
            font-family: var(--font-sans);
            font-size: 11.5px;
            color: #475569;
            line-height: 1.5;
          }

          .back-matter-section {
            padding: 20px 0;
            page-break-before: always;
            break-before: page;
          }
          .back-matter-block {
            margin-bottom: 30px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .back-matter-title {
            font-family: var(--font-display);
            font-size: 22px;
            color: var(--navy);
            border-bottom: 2px solid var(--accent);
            padding-bottom: 6px;
            margin-bottom: 14px;
          }
          .faq-grid, .glossary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .faq-card, .glossary-card {
            background: #ffffff;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 12px 14px;
            box-sizing: border-box;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .faq-card .faq-q {
            font-family: var(--font-sans);
            font-weight: 700;
            font-size: 12.5px;
            color: var(--navy);
            margin: 0 0 4px 0;
          }
          .faq-card .faq-a {
            font-family: var(--font-serif);
            font-size: 12px;
            color: #334155;
            margin: 0;
            line-height: 1.4;
          }
          .glossary-term {
            font-family: var(--font-sans);
            font-weight: 700;
            font-size: 12.5px;
            color: var(--navy);
            margin-bottom: 4px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 3px;
          }
          .glossary-def {
            font-family: var(--font-serif);
            font-size: 12px;
            color: #475569;
            margin: 0;
            line-height: 1.4;
          }

          .quiz-block {
            background: #f8fafc;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 18px;
            margin: 20px 0;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .quiz-block h4 {
            font-family: var(--font-sans);
            font-size: 14px;
            color: var(--navy);
            margin-bottom: 12px;
            font-weight: 700;
          }
          .qa-item {
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px dashed var(--border);
          }
          .qa-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .qa-q {
            font-family: var(--font-sans);
            font-size: 12.5px;
            color: #1e293b;
            margin-bottom: 3px;
          }
          .qa-a {
            font-family: var(--font-sans);
            font-size: 12px;
            color: #475569;
          }

          .further-reading {
            margin-top: 20px;
            padding-top: 14px;
            border-top: 1px solid var(--border);
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .further-reading h3 {
            font-family: var(--font-sans);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--muted);
            margin-bottom: 8px;
          }
          .reference-list {
            padding-left: 20px;
            font-family: var(--font-sans);
            font-size: 11.5px;
          }
          .reference-list li {
            margin-bottom: 5px;
          }

          .cta-box {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff;
            padding: 20px 24px;
            border-radius: 10px;
            margin-top: 18px;
          }
          .cta-title {
            font-family: var(--font-sans);
            font-size: 15px;
            font-weight: 700;
            color: #a3e635;
            margin-bottom: 6px;
          }
          .cta-box p {
            color: #e2e8f0;
            font-size: 12.5px;
            line-height: 1.5;
            margin: 0;
          }

          h1, h2, h3, h4, h5, h6 {
            break-after: avoid;
            page-break-after: avoid;
          }
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
              ${(customEmail || course.ebookUserEmail) ? `<div class="cover-meta-item"><strong>Contact</strong>${escapeHtml(customEmail || course.ebookUserEmail)}</div>` : ''}
            </div>
          </div>
          <div class="cover-bottom-bar"></div>
        </section>

        <section class="toc-page page-break">
          <h2>Table of Contents</h2>
          ${course.description ? `
            <div class="toc-overview-box">
              <span class="toc-overview-label">Curriculum Scope &amp; Overview</span>
              <p>${escapeHtml(course.description)}</p>
            </div>
          ` : ''}
          ${chapters.length <= 3 ? `
            <div class="toc-cards-container">
              ${tocHtml}
            </div>
          ` : `
            <ul class="toc-list">
              ${bookIntro ? `<li class="toc-chapter-item"><a href="#intro" class="toc-link"><span class="toc-num">—</span><span class="toc-title">Introduction</span></a></li>` : ''}
              ${tocHtml}
              ${hasBackMatter ? `<li class="toc-chapter-item"><a href="#faq" class="toc-link"><span class="toc-num">—</span><span class="toc-title">Reference &amp; Capstone</span></a></li>` : ''}
            </ul>
          `}
        </section>

        ${bookIntro ? `
        <section class="intro-section page-break" id="intro">
          <h2>Introduction</h2>
          ${textToParagraphHtml(bookIntro)}
        </section>
        ` : ''}

        ${chapterSections}
        ${backMatterHtml}
      </body>
    </html>
  `;
};
