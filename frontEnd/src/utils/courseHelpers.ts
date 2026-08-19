export const hasAudience = (audience?: string | string[]) => {
  if (Array.isArray(audience)) return audience.length > 0;
  return !!audience?.trim();
};

export const formatAudience = (audience?: string | string[]) => {
  if (Array.isArray(audience)) return audience.join(', ');
  return audience || '';
};

export const AUDIENCE_OPTIONS: Record<string, string[]> = {
  Beginner: ['Students', 'Fresh Graduates', 'Entry-level employees', 'Working Professionals', 'Engineers', 'HR Staff', 'Senior Professionals', 'Consultants', 'Specialists', 'C-Level Executives (CEO, CFO, CTO, COO)', 'Senior Executives', 'Lead Implementers', 'Industry Experts'],
  Intermediate: ['Students', 'Fresh Graduates', 'Entry-level employees', 'Working Professionals', 'Engineers', 'HR Staff', 'Senior Professionals', 'Consultants', 'Specialists', 'C-Level Executives (CEO, CFO, CTO, COO)', 'Senior Executives', 'Lead Implementers', 'Industry Experts'],
  Advanced: ['Students', 'Fresh Graduates', 'Entry-level employees', 'Working Professionals', 'Engineers', 'HR Staff', 'Senior Professionals', 'Consultants', 'Specialists', 'C-Level Executives (CEO, CFO, CTO, COO)', 'Senior Executives', 'Lead Implementers', 'Industry Experts'],
  Professional: ['Students', 'Fresh Graduates', 'Entry-level employees', 'Working Professionals', 'Engineers', 'HR Staff', 'Senior Professionals', 'Consultants', 'Specialists', 'C-Level Executives (CEO, CFO, CTO, COO)', 'Senior Executives', 'Lead Implementers', 'Industry Experts'],
};

export const INDUSTRIES = [
  'Healthcare & Medical',
  'Finance & Banking',
  'Information Security / Cybersecurity',
  'Manufacturing & Industrial',
  'Education & Academic',
  'Pharmaceutical & Life Sciences',
  'Hospitality & Tourism',
  'Environmental & Sustainability',
];
