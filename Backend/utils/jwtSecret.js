export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('JWT_SECRET must be set in production');
  }
  return secret || 'course12@21';
}
