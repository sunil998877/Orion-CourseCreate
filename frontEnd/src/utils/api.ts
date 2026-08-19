const getApiBase = () => {
  let url = import.meta.env.VITE_API_BASE_URL || 'https://orion-back-developerevoke-6846s-projects.vercel.app/api';
  // Strip any frozen deployment hashes if they exist (e.g., orion-back-6yz7is0op-...)
  url = url.replace(/orion-back-[a-z0-9]+-developerevoke/, 'orion-back-developerevoke');
  return url.replace(/\/$/, '').replace(/\/login$/, '');
};

export const API_BASE = getApiBase();

export function buildUrl(path: string) {
  if (!path) return API_BASE;
  return API_BASE + (path.startsWith('/') ? path : '/' + path);
}

// ORIGIN is the server origin (without the /api suffix) for serving static files
export const ORIGIN = API_BASE.replace(/\/api$/, '').replace(/\/$/, '');
