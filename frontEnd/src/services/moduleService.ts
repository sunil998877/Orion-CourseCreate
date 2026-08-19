import { API_BASE } from '../utils/api';

const headers = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const generateAllModulesDraft = async (modules: any[], token: string) => {
  const res = await fetch(`${API_BASE}/generate-all-modules-draft`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ modules }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Module generation failed');
  return data;
};

export const generateModuleDraft = async (payload: any, token: string) => {
  const res = await fetch(`${API_BASE}/generate-module-draft`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Module generation failed');
  return data;
};

export const generateModuleSlides = async (payload: any, token: string) => {
  const res = await fetch(`${API_BASE}/generate-module-slides-gamma`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Slide generation failed');
  return data;
};

export const getModuleContents = async (
  courseId: string,
  moduleNumber: number,
  token: string
) => {
  const res = await fetch(
    `${API_BASE}/module-contents?courseId=${encodeURIComponent(courseId)}&moduleNumber=${moduleNumber}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error(data.message || 'Failed to fetch module content');
  return data;
};

export const saveModuleContent = async (payload: any, token: string) => {
  const res = await fetch(`${API_BASE}/module-contents`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to save module');
  return data;
};

export const downloadModulePptx = async (
  courseId: string,
  moduleId: number,
  token: string
) => {
  const res = await fetch(
    `${API_BASE}/courses/${courseId}/modules/${moduleId}/download-pptx`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to download PPTX');
  }
  return res.blob();
};
