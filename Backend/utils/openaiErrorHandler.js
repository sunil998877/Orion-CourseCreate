/**
 * Centralised OpenAI error handler.
 * Maps OpenAI SDK errors to meaningful HTTP responses so the frontend
 * can show a helpful message instead of a vague "Internal Server Error".
 */

/**
 * @param {Error} err  - The caught error from the openai SDK
 * @param {import('express').Response} res
 * @param {string} [label] - Short label for the console log (e.g. 'generate-course-description')
 */
export function handleOpenAIError(err, res, label = 'openai') {
  console.error(`[${label}] OpenAI error:`, err.message);

  const code = err.code || err.error?.code;
  const status = err.status;

  // ── Authentication / invalid key ──────────────────────────────────────────
  if (status === 401 || code === 'invalid_api_key') {
    return res.status(503).json({
      error: 'AI service is temporarily unavailable.',
      details: 'The AI API key is invalid or has expired. Please contact support.',
      code: 'ai_auth_error',
    });
  }

  // ── Rate limit / quota exceeded ───────────────────────────────────────────
  if (status === 429 || code === 'rate_limit_exceeded' || code === 'insufficient_quota') {
    const isQuota = code === 'insufficient_quota' || /quota|billing/i.test(String(err.message || ''));
    return res.status(isQuota ? 402 : 503).json({
      error: isQuota ? 'OpenAI credits are exhausted.' : 'AI service is temporarily unavailable.',
      details: isQuota
        ? 'The OpenAI API key is out of quota. Recharge or upgrade the OpenAI plan, then retry.'
        : 'The AI usage limit has been reached. Please try again later.',
      code: isQuota ? 'openai_credits_exhausted' : 'ai_rate_limit',
      message: err.message,
    });
  }


  if (status === 404 || code === 'model_not_found') {
    return res.status(503).json({
      error: 'AI service configuration error.',
      details: 'The requested AI model is unavailable. Please contact support.',
      code: 'ai_model_error',
    });
  }


  if (status >= 500) {
    return res.status(502).json({
      error: 'AI service is temporarily unavailable.',
      details: 'The AI provider is experiencing issues. Please try again in a moment.',
      code: 'ai_upstream_error',
    });
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return res.status(500).json({
    error: 'Failed to generate AI content.',
    details: err.message,
    code: 'ai_unknown_error',
  });
}
