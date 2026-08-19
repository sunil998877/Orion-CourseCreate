const GAMMA_API_KEY = process.env.GAMMA_API_KEY;
const GAMMA_ENABLED = Boolean(GAMMA_API_KEY);
const GAMMA_BASE = 'https://public-api.gamma.app';

export class GammaApiError extends Error {
  constructor(message, statusCode = 502, code = 'gamma_error') {
    super(message);
    this.name = 'GammaApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function mapGammaFailure(message, httpStatus) {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('insufficient credits') || normalized.includes('billing')) {
    return new GammaApiError(
      'Gamma slide credits are exhausted. Upgrade your Gamma plan or contact support.',
      503,
      'gamma_credits_exhausted'
    );
  }

  if (httpStatus === 401 || httpStatus === 403) {
    return new GammaApiError(
      'Gamma API authentication failed. Check GAMMA_API_KEY configuration.',
      503,
      'gamma_auth_error'
    );
  }

  if (httpStatus === 429) {
    return new GammaApiError(
      'Gamma API rate limit reached. Please try again later.',
      503,
      'gamma_rate_limit'
    );
  }

  return new GammaApiError(message || 'Gamma slide generation failed', 502, 'gamma_error');
}

export async function generateGammaSlides(outline, theme = 'aurora', courseTitle = 'Your Course') {
  if (!GAMMA_ENABLED || !GAMMA_API_KEY) {
    throw new Error('Gamma API is not configured. Set GAMMA_API_KEY in .env');
  }

  try {
    const expertPrompt = `Act as a world-class instructional designer, visual learning expert, and presentation strategist.
Your task is to generate a visually engaging, modern educational slide deck for: [${courseTitle}].

GENERAL DESIGN PRINCIPLES:
- Keep slides clean, modern, and visually appealing.
- Use minimal text (3–5 bullet points maximum per slide).
- Maintain strong visual hierarchy with clear headings and spacing.
- Ensure slides are suitable for academic and professional presentation.

STYLE REQUIREMENTS:
- Modern, clean, and professional.
- Use the theme provided (${theme}).

SLIDE COUNT:
- Generate exactly 10 slides.`;

    const createRes = await fetch(`${GAMMA_BASE}/v1.0/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': GAMMA_API_KEY
      },
      body: JSON.stringify({
        inputText: outline,
        textMode: 'preserve',
        format: 'presentation',
        exportAs: 'pptx',
        numCards: 10,
        themeId: theme,
        additionalInstructions: expertPrompt,
        imageOptions: { source: 'aiGenerated' }
      })
    });

    if (!createRes.ok) {
      const errBody = await createRes.json().catch(() => ({}));
      throw mapGammaFailure(errBody.message || `Gamma API error: ${createRes.status}`, createRes.status);
    }

    const createData = await createRes.json();
    console.log("Gamma Create Response:", createData);

    const generationId = createData.generationId || createData.id;
    if (!generationId) {
      throw new Error('Gamma did not return a generation ID');
    }

    let currentInterval = 2000;

    while (true) {
      const statusRes = await fetch(
        `${GAMMA_BASE}/v1.0/generations/${generationId}`,
        {
          headers: { 'X-API-KEY': GAMMA_API_KEY }
        }
      );

      if (!statusRes.ok) {
        throw new Error(`Gamma status check failed: ${statusRes.status}`);
      }

      const statusData = await statusRes.json();
      console.log("Gamma Status Response:", statusData);

      if (statusData.status === 'completed') {
        const gammaLink =
          statusData.gammaUrl ||
          statusData.url ||
          statusData.publicUrl ||
          statusData.shareUrl ||
          statusData.output?.url ||
          statusData.output?.publicUrl ||
          null;

        if (!gammaLink) {
          console.log("Completed but no link found in response:", statusData);
          throw new Error('Gamma completed but no presentation URL found.');
        }

        const credits =
          statusData.credits ??
          statusData.creditsUsed ??
          statusData.creditCost ??
          statusData.cost ??
          statusData.output?.credits ??
          statusData.output?.creditsUsed ??
          statusData.output?.creditCost ??
          null;

        return {
          success: true,
          generationId,
          gammaLink,
          exportUrl: statusData.exportUrl || null,
          credits
        };
      }

      if (statusData.status === 'failed') {
        const msg = statusData.error?.message || 'Gamma generation failed';
        throw mapGammaFailure(msg);
      }

      await new Promise(resolve => setTimeout(resolve, currentInterval));
      currentInterval = Math.min(currentInterval + 2000, 10000);
    }

  } catch (error) {
    console.error('Gamma Generation Error:', error.message);
    if (error instanceof GammaApiError) {
      throw error;
    }
    throw mapGammaFailure(error.message);
  }
}
