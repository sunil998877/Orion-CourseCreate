export const envVal = (key, fallback = '') =>
  String(process.env[key] ?? fallback).trim().replace(/^["']|["']$/g, '');

export const isCloudHost = Boolean(process.env.RENDER || process.env.VERCEL);

export const assertSmtpConfig = () => {
  const host = envVal('SMTP_HOST');
  const user = envVal('SMTP_USER');
  const pass = envVal('SMTP_PASS');
  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS on orion-api in Render)');
  }
  return { host, user, pass };
};

export const smtpPortOrder = () => {
  const configured = parseInt(envVal('SMTP_PORT', isCloudHost ? '587' : '465'), 10);
  const preferred = Number.isFinite(configured) && configured > 0 ? configured : (isCloudHost ? 587 : 465);
  const rest = [587, 465].filter((port) => port !== preferred);
  return isCloudHost
    ? [587, preferred, 465].filter((port, i, arr) => arr.indexOf(port) === i)
    : [preferred, ...rest];
};

export const mailFrom = () => {
  const user = envVal('SMTP_USER');
  const customFrom = envVal('EMAIL_FROM');
  return {
    name: 'Course Creator',
    address: customFrom || user || 'noreply@localhost',
  };
};
