const getApiBase = () => {
    const fromEnv = import.meta.env.VITE_API_BASE_URL;
    let url = fromEnv || (import.meta.env.DEV ? 'http://localhost:3000/api' : '');
    if (!url) {
        throw new Error('VITE_API_BASE_URL must be set for production builds');
    }
    url = url.replace(/orion-back-[a-z0-9]+-developerevoke/, 'orion-back-developerevoke');
    url = url.replace(/\/$/, '').replace(/\/login$/, '');
    if (!url.endsWith('/api')) {
        url = `${url}/api`;
    }
    return url;
};
export const API_BASE = getApiBase();
export function buildUrl(path: string) {
    if (!path)
        return API_BASE;
    return API_BASE + (path.startsWith('/') ? path : '/' + path);
}
export const ORIGIN = API_BASE.replace(/\/api$/, '').replace(/\/$/, '');
