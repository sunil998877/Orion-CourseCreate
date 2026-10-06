/**
 * Client-side pure TypeScript PDF generator for Module Assessment & MCQs.
 * Generates standard, valid PDF 1.4 binary data without external dependencies.
 */

export interface AssessmentPdfData {
  courseTitle?: string;
  moduleIndex: number;
  moduleTitle?: string;
  blueprint?: {
    item?: string;
    outcome?: string;
    cognitiveDemand?: string;
    type?: string;
    difficulty?: string;
    topic?: string;
    evidence?: string;
  } | null;
  items: Array<{
    stem: string;
    options: string[];
    answer?: string;
    topic?: string;
    difficulty?: string;
  }>;
  practicalTasks?: Array<{
    item?: string;
    prompt?: string;
    evidence?: string;
    threshold?: string;
  }>;
  legacyPracticalTask?: {
    prompt?: string;
    threshold?: string;
  } | null;
}

// Sanitize text for standard Type 1 Helvetica font (escape PDF specials & normalize unicode)
function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u25E6\u2219]/g, '*')
    .replace(/[^\x20-\x7E]/g, ' ')
    .trim();
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxCharsPerLine) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export function generateAssessmentPdfBlob(data: AssessmentPdfData): Blob {
  const PAGE_WIDTH = 595.28; // A4 pt
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 45;
  const MARGIN_RIGHT = 45;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 505.28 pt

  const pagesCommands: string[][] = [];
  let currentCmds: string[] = [];
  let currentY = PAGE_HEIGHT - 55;

  const startNewPage = () => {
    if (currentCmds.length > 0) {
      pagesCommands.push(currentCmds);
    }
    currentCmds = [];
    currentY = PAGE_HEIGHT - 55;
  };

  const ensureSpace = (neededPt: number) => {
    if (currentY - neededPt < 65) {
      startNewPage();
    }
  };

  // Start page 1
  startNewPage();

  const courseTitle = sanitizeText(data.courseTitle || 'Course Title');
  const moduleTitle = sanitizeText(data.moduleTitle || `Module ${data.moduleIndex + 1}`);

  // Header Banner
  currentCmds.push(
    // Dark background box
    `0.06 0.09 0.16 rg`,
    `${MARGIN_LEFT} ${currentY - 50} ${CONTENT_WIDTH} 55 re f`,
    // Lime bottom accent line
    `0.52 0.80 0.09 rg`,
    `${MARGIN_LEFT} ${currentY - 53} ${CONTENT_WIDTH} 3 re f`,
    // Header Text
    `BT /F2 9 Tf 0.52 0.80 0.09 rg ${MARGIN_LEFT + 15} ${currentY - 18} Td (COURSE ASSESSMENT & KNOWLEDGE CHECK) Tj ET`,
    `BT /F2 14 Tf 1 1 1 rg ${MARGIN_LEFT + 15} ${currentY - 34} Td (${courseTitle.slice(0, 50)}) Tj ET`,
    `BT /F1 10 Tf 0.8 0.85 0.9 rg ${MARGIN_LEFT + 15} ${currentY - 46} Td (Module ${data.moduleIndex + 1}: ${moduleTitle.slice(0, 60)}) Tj ET`
  );
  currentY -= 75;

  // Competency Blueprint (if present)
  if (data.blueprint && (data.blueprint.item || data.blueprint.outcome)) {
    ensureSpace(60);
    const bp = data.blueprint;
    const bpItem = sanitizeText(bp.item || 'Core Learning Competency');
    const bpMeta = [
      bp.outcome && `Outcome: ${sanitizeText(bp.outcome)}`,
      bp.difficulty && `Difficulty: ${sanitizeText(bp.difficulty)}`,
      bp.topic && `Topic: ${sanitizeText(bp.topic)}`,
    ]
      .filter(Boolean)
      .join('  |  ');

    currentCmds.push(
      `0.96 0.98 0.94 rg`,
      `${MARGIN_LEFT} ${currentY - 38} ${CONTENT_WIDTH} 42 re f`,
      `0.75 0.85 0.70 RG 0.75 w`,
      `${MARGIN_LEFT} ${currentY - 38} ${CONTENT_WIDTH} 42 re S`,
      `BT /F2 8 Tf 0.25 0.50 0.15 rg ${MARGIN_LEFT + 10} ${currentY - 12} Td (LEARNING COMPETENCY TARGET) Tj ET`,
      `BT /F2 10 Tf 0.1 0.15 0.1 rg ${MARGIN_LEFT + 10} ${currentY - 24} Td (${bpItem.slice(0, 80)}) Tj ET`,
      `BT /F1 8 Tf 0.35 0.40 0.35 rg ${MARGIN_LEFT + 10} ${currentY - 34} Td (${bpMeta.slice(0, 95)}) Tj ET`
    );
    currentY -= 55;
  }

  // MCQs Section Header
  if (data.items.length > 0) {
    ensureSpace(35);
    currentCmds.push(
      `0.52 0.80 0.09 RG 1.5 w`,
      `${MARGIN_LEFT} ${currentY - 5} ${MARGIN_LEFT + 15} ${currentY - 5} l S`,
      `BT /F2 12 Tf 0.08 0.12 0.20 rg ${MARGIN_LEFT + 22} ${currentY - 8} Td (Multiple Choice Questions \\(${data.items.length} MCQs\\)) Tj ET`
    );
    currentY -= 25;

    // Render each MCQ
    data.items.forEach((item, idx) => {
      const qNum = idx + 1;
      const stem = sanitizeText(item.stem);
      const stemLines = wrapText(stem, 75);
      const options = item.options.map(opt => sanitizeText(opt));
      const answer = sanitizeText(item.answer || '');

      const estimatedHeight = 30 + stemLines.length * 14 + options.length * 18 + 15;
      ensureSpace(estimatedHeight);

      // Card container background
      const cardY = currentY;
      const boxHeight = 22 + stemLines.length * 13 + options.length * 16 + 18;
      currentCmds.push(
        `0.98 0.98 0.99 rg`,
        `${MARGIN_LEFT} ${cardY - boxHeight} ${CONTENT_WIDTH} ${boxHeight} re f`,
        `0.88 0.90 0.93 RG 0.5 w`,
        `${MARGIN_LEFT} ${cardY - boxHeight} ${CONTENT_WIDTH} ${boxHeight} re S`,
        // Left accent bar
        `0.52 0.80 0.09 rg`,
        `${MARGIN_LEFT} ${cardY - boxHeight} 3.5 ${boxHeight} re f`
      );

      // Question metadata tag (Question Number, Difficulty, Topic)
      const meta = [
        item.difficulty ? `Difficulty: ${sanitizeText(item.difficulty)}` : '',
        item.topic ? `Topic: ${sanitizeText(item.topic)}` : '',
      ]
        .filter(Boolean)
        .join('  ·  ');

      currentCmds.push(
        `BT /F2 9 Tf 0.35 0.55 0.15 rg ${MARGIN_LEFT + 12} ${cardY - 14} Td (Question ${qNum}) Tj ET`
      );
      if (meta) {
        currentCmds.push(
          `BT /F1 8 Tf 0.50 0.55 0.60 rg ${MARGIN_LEFT + 75} ${cardY - 14} Td (${meta.slice(0, 65)}) Tj ET`
        );
      }

      let textY = cardY - 28;
      // Stem lines
      currentCmds.push(`BT /F2 9.5 Tf 0.12 0.15 0.20 rg`);
      stemLines.forEach((sLine, sIdx) => {
        if (sIdx === 0) {
          currentCmds.push(`${MARGIN_LEFT + 12} ${textY} Td (${sLine}) Tj`);
        } else {
          currentCmds.push(`0 -13 Td (${sLine}) Tj`);
        }
      });
      currentCmds.push(`ET`);
      textY -= (stemLines.length - 1) * 13 + 16;

      // Options
      options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        const isCorrect = answer && (opt.trim().toLowerCase() === answer.trim().toLowerCase() || opt.trim().startsWith(answer.trim()));
        const optLine = `${letter}.  ${opt.slice(0, 80)}`;

        if (isCorrect) {
          // Highlight correct option with light green fill
          currentCmds.push(
            `0.90 0.96 0.88 rg`,
            `${MARGIN_LEFT + 10} ${textY - 3} ${CONTENT_WIDTH - 20} 14 re f`,
            `0.60 0.80 0.50 RG 0.5 w`,
            `${MARGIN_LEFT + 10} ${textY - 3} ${CONTENT_WIDTH - 20} 14 re S`,
            `BT /F2 8.5 Tf 0.15 0.45 0.10 rg ${MARGIN_LEFT + 16} ${textY + 1} Td (${optLine}) Tj ET`,
            `BT /F2 7.5 Tf 0.20 0.55 0.10 rg ${MARGIN_LEFT + CONTENT_WIDTH - 90} ${textY + 1} Td ([CORRECT ANSWER]) Tj ET`
          );
        } else {
          currentCmds.push(
            `BT /F1 8.5 Tf 0.25 0.30 0.35 rg ${MARGIN_LEFT + 16} ${textY + 1} Td (${optLine}) Tj ET`
          );
        }
        textY -= 16;
      });

      currentY = cardY - boxHeight - 12;
    });
  }

  // Practical Tasks Section (if present)
  const practicals = data.practicalTasks || [];
  if (practicals.length > 0 || data.legacyPracticalTask) {
    ensureSpace(40);
    currentCmds.push(
      `0.10 0.65 0.55 RG 1.5 w`,
      `${MARGIN_LEFT} ${currentY - 5} ${MARGIN_LEFT + 15} ${currentY - 5} l S`,
      `BT /F2 12 Tf 0.08 0.12 0.20 rg ${MARGIN_LEFT + 22} ${currentY - 8} Td (Practical Challenges & Tasks) Tj ET`
    );
    currentY -= 25;

    practicals.forEach((task, tIdx) => {
      const taskTitle = sanitizeText(task.item || `Practical Task ${tIdx + 1}`);
      const promptLines = wrapText(sanitizeText(task.prompt || ''), 75);
      const evidence = sanitizeText(task.evidence || '');
      const threshold = sanitizeText(task.threshold || '');

      const estimatedHeight = 35 + promptLines.length * 13 + (evidence ? 14 : 0) + (threshold ? 14 : 0);
      ensureSpace(estimatedHeight);

      const pBoxY = currentY;
      const pBoxH = estimatedHeight;

      currentCmds.push(
        `0.97 0.99 0.98 rg`,
        `${MARGIN_LEFT} ${pBoxY - pBoxH} ${CONTENT_WIDTH} ${pBoxH} re f`,
        `0.80 0.90 0.88 RG 0.5 w`,
        `${MARGIN_LEFT} ${pBoxY - pBoxH} ${CONTENT_WIDTH} ${pBoxH} re S`,
        `0.10 0.65 0.55 rg`,
        `${MARGIN_LEFT} ${pBoxY - pBoxH} 3.5 ${pBoxH} re f`,
        `BT /F2 9.5 Tf 0.08 0.40 0.35 rg ${MARGIN_LEFT + 12} ${pBoxY - 14} Td (${taskTitle.slice(0, 65)}) Tj ET`
      );

      let pTextY = pBoxY - 26;
      currentCmds.push(`BT /F1 8.5 Tf 0.20 0.25 0.30 rg`);
      promptLines.forEach((line, lIdx) => {
        if (lIdx === 0) {
          currentCmds.push(`${MARGIN_LEFT + 12} ${pTextY} Td (${line}) Tj`);
        } else {
          currentCmds.push(`0 -12 Td (${line}) Tj`);
        }
      });
      currentCmds.push(`ET`);
      pTextY -= (promptLines.length - 1) * 12 + 14;

      if (evidence) {
        currentCmds.push(
          `BT /F2 7.5 Tf 0.30 0.40 0.45 rg ${MARGIN_LEFT + 12} ${pTextY} Td (Deliverable: ) Tj ET`,
          `BT /F1 7.5 Tf 0.20 0.25 0.30 rg ${MARGIN_LEFT + 65} ${pTextY} Td (${evidence.slice(0, 80)}) Tj ET`
        );
        pTextY -= 12;
      }

      if (threshold) {
        currentCmds.push(
          `BT /F2 7.5 Tf 0.15 0.45 0.15 rg ${MARGIN_LEFT + 12} ${pTextY} Td (Pass Standard: ) Tj ET`,
          `BT /F1 7.5 Tf 0.20 0.35 0.20 rg ${MARGIN_LEFT + 75} ${pTextY} Td (${threshold.slice(0, 80)}) Tj ET`
        );
      }

      currentY = pBoxY - pBoxH - 12;
    });

    if (data.legacyPracticalTask && practicals.length === 0) {
      const leg = data.legacyPracticalTask;
      const promptLines = wrapText(sanitizeText(leg.prompt || ''), 75);
      const estHeight = 35 + promptLines.length * 13 + (leg.threshold ? 14 : 0);
      ensureSpace(estHeight);

      currentCmds.push(
        `0.97 0.99 0.98 rg`,
        `${MARGIN_LEFT} ${currentY - estHeight} ${CONTENT_WIDTH} ${estHeight} re f`,
        `0.80 0.90 0.88 RG 0.5 w`,
        `${MARGIN_LEFT} ${currentY - estHeight} ${CONTENT_WIDTH} ${estHeight} re S`,
        `0.10 0.65 0.55 rg`,
        `${MARGIN_LEFT} ${currentY - estHeight} 3.5 ${estHeight} re f`,
        `BT /F2 9.5 Tf 0.08 0.40 0.35 rg ${MARGIN_LEFT + 12} ${currentY - 14} Td (Course Capstone Practical Task) Tj ET`
      );

      let lTextY = currentY - 26;
      currentCmds.push(`BT /F1 8.5 Tf 0.20 0.25 0.30 rg`);
      promptLines.forEach((line, lIdx) => {
        if (lIdx === 0) {
          currentCmds.push(`${MARGIN_LEFT + 12} ${lTextY} Td (${line}) Tj`);
        } else {
          currentCmds.push(`0 -12 Td (${line}) Tj`);
        }
      });
      currentCmds.push(`ET`);
      lTextY -= (promptLines.length - 1) * 12 + 14;

      if (leg.threshold) {
        currentCmds.push(
          `BT /F2 7.5 Tf 0.15 0.45 0.15 rg ${MARGIN_LEFT + 12} ${lTextY} Td (Pass Standard: ) Tj ET`,
          `BT /F1 7.5 Tf 0.20 0.35 0.20 rg ${MARGIN_LEFT + 75} ${lTextY} Td (${sanitizeText(leg.threshold).slice(0, 80)}) Tj ET`
        );
      }
      currentY -= estHeight + 12;
    }
  }

  // Push final page
  if (currentCmds.length > 0) {
    pagesCommands.push(currentCmds);
  }

  const totalPages = pagesCommands.length || 1;

  // Add footer to each page
  pagesCommands.forEach((pageCmds, pIdx) => {
    const pageNum = pIdx + 1;
    pageCmds.push(
      // Divider line
      `0.85 0.88 0.90 RG 0.5 w`,
      `${MARGIN_LEFT} 40 ${CONTENT_WIDTH} 0 re S`,
      // Left footer info
      `BT /F1 8 Tf 0.50 0.55 0.60 rg ${MARGIN_LEFT} 28 Td (Module ${data.moduleIndex + 1} Assessment | ${courseTitle.slice(0, 45)}) Tj ET`,
      // Right page number
      `BT /F2 8 Tf 0.40 0.45 0.50 rg ${PAGE_WIDTH - MARGIN_RIGHT - 55} 28 Td (Page ${pageNum} of ${totalPages}) Tj ET`
    );
  });

  // Assemble the PDF 1.4 file
  const encoder = new TextEncoder();
  const pdfChunks: Uint8Array[] = [];
  const objectOffsets: number[] = [];
  let byteOffset = 0;

  const writeString = (str: string) => {
    const bytes = encoder.encode(str);
    pdfChunks.push(bytes);
    byteOffset += bytes.length;
  };

  writeString('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // Object 1: Catalog
  objectOffsets[1] = byteOffset;
  writeString(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // Build page kids references
  // Page objects will be indexed at: 6 + i*2
  // Content objects will be at: 7 + i*2
  const pageObjectIds: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    pageObjectIds.push(6 + i * 2);
  }

  // Object 2: Pages
  objectOffsets[2] = byteOffset;
  writeString(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${totalPages} >>\nendobj\n`
  );

  // Object 3: Font F1 (Helvetica regular)
  objectOffsets[3] = byteOffset;
  writeString(`3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  // Object 4: Font F2 (Helvetica-Bold)
  objectOffsets[4] = byteOffset;
  writeString(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

  // Object 5: Font F3 (Helvetica-Oblique)
  objectOffsets[5] = byteOffset;
  writeString(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj\n`);

  // Objects 6... : Pages and Content Streams
  pagesCommands.forEach((cmdList, i) => {
    const pageId = 6 + i * 2;
    const contentId = 7 + i * 2;

    // Page object
    objectOffsets[pageId] = byteOffset;
    writeString(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH.toFixed(2)} ${PAGE_HEIGHT.toFixed(2)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`
    );

    // Stream content
    const streamContent = cmdList.join('\n') + '\n';
    const streamBytes = encoder.encode(streamContent);

    objectOffsets[contentId] = byteOffset;
    writeString(`${contentId} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`);
    pdfChunks.push(streamBytes);
    byteOffset += streamBytes.length;
    writeString(`\nendstream\nendobj\n`);
  });

  // Cross-reference table (xref)
  const xrefOffset = byteOffset;
  const totalObjects = 5 + totalPages * 2;
  writeString(`xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i <= totalObjects; i++) {
    const off = objectOffsets[i] || 0;
    writeString(`${String(off).padStart(10, '0')} 00000 n \n`);
  }

  // Trailer
  writeString(
    `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  return new Blob(pdfChunks, { type: 'application/pdf' });
}
