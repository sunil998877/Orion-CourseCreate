export const buildGammaOutlineFromPayload = ({ moduleNumber, moduleContent, slideContent }) => {
  let outline = '';
  if (slideContent && typeof slideContent === 'object' && Array.isArray(slideContent.Slides) && slideContent.Slides.length) {
    slideContent.Slides.forEach((sl, idx) => {
      const title = sl.Title || sl.title || 'Slide ' + (idx + 1);
      outline += '## ' + title + '\n';
      const bullets = Array.isArray(sl.Bullets) ? sl.Bullets : (Array.isArray(sl.BulletPoints) ? sl.BulletPoints : []);
      bullets.forEach((b) => {
        outline += '- ' + b + '\n';
      });
      if (sl.Content) outline += sl.Content + '\n';
      outline += '\n';
    });
    return outline;
  }
  if (moduleContent && typeof moduleContent === 'object') {
    const c = moduleContent;
    const title = c.Title || c.title || `Module ${moduleNumber}`;
    const objectives = Array.isArray(c.Objectives) ? c.Objectives : (Array.isArray(c.objectives) ? c.objectives : []);
    const tc = Array.isArray(c.TeachingContent) ? c.TeachingContent : (Array.isArray(c.teachingContent) ? c.teachingContent : []);
    outline = `# ${title}\n\n`;
    if (objectives.length) outline += '## Learning objectives\n' + objectives.map((o) => `- ${o}`).join('\n') + '\n\n';
    tc.forEach((item) => {
      const topic = item.Topics || item.title || '';
      const points = Array.isArray(item.ContentPoints) ? item.ContentPoints : (Array.isArray(item.points) ? item.points : []);
      const pointsStr = points.length ? points.map((p) => '- ' + p).join('\n') + '\n\n' : '\n';
      outline += '## ' + topic + '\n' + pointsStr;
    });
    const caseDesc =
      (c.CaseStudy && c.CaseStudy.CaseStudyDescription) ||
      (c.caseStudy && (c.caseStudy.CaseStudyDescription || c.caseStudy.description)) ||
      '';
    if (caseDesc) outline += '## Case study\n' + caseDesc + '\n\n';
    return outline;
  }
  return '';
};

export const buildGammaOutlineFromCourseModule = (mod, moduleNumber) => {
  const title = mod.Title || `Module ${moduleNumber}`;
  const objectives = Array.isArray(mod.Objectives) ? mod.Objectives : [];
  const tc = Array.isArray(mod.TeachingContent) ? mod.TeachingContent : [];
  let outline = `# ${title}\n\n`;
  if (objectives.length) outline += '## Learning objectives\n' + objectives.map((o) => `- ${o}`).join('\n') + '\n\n';
  tc.forEach((item) => {
    const topic = item.Topics || '';
    const points = Array.isArray(item.ContentPoints) ? item.ContentPoints : [];
    const pointsStr = points.length ? points.map((p) => '- ' + p).join('\n') + '\n\n' : '\n';
    outline += '## ' + topic + '\n' + pointsStr;
  });
  if (mod.CaseStudy && mod.CaseStudy.CaseStudyDescription) {
    outline += '## Case study\n' + mod.CaseStudy.CaseStudyDescription + '\n\n';
  }
  return outline;
};
