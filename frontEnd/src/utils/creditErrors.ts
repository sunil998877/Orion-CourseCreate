export type CreditShortageKind = 'wallet' | 'gamma' | 'openai' | 'elevenlabs';

export const CREDIT_SHORTAGE_EVENT = 'orion-credit-shortage';

type CreditErrBody = {
  message?: string;
  error?: string;
  details?: string;
  code?: string;
} | null;

function flattenCreditBody(data?: CreditErrBody) {
  const code = String(data?.code || '').toLowerCase();
  const message = [data?.message, data?.error, data?.details]
    .filter(Boolean)
    .join(' ');
  return { code, message, msg: message.toLowerCase() };
}

export function emitCreditShortage(kind: CreditShortageKind, message?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(CREDIT_SHORTAGE_EVENT, {
      detail: { kind, message },
    })
  );
}

export function classifyCreditShortage(
  status?: number,
  data?: CreditErrBody
): CreditShortageKind | null {
  const { code, msg } = flattenCreditBody(data);

  if (
    code === 'gamma_credits_exhausted' ||
    msg.includes('gamma slide credits are exhausted') ||
    (msg.includes('gamma') && (msg.includes('insufficient credit') || msg.includes('billing') || msg.includes('quota')))
  ) {
    return 'gamma';
  }

  if (
    code === 'openai_credits_exhausted' ||
    code === 'ai_rate_limit' ||
    code === 'insufficient_quota' ||
    msg.includes('insufficient_quota') ||
    (msg.includes('openai') && (msg.includes('quota') || msg.includes('billing') || msg.includes('rate limit')))
  ) {
    return 'openai';
  }

  if (
    code === 'elevenlabs_credits_exhausted' ||
    msg.includes('elevenlabs') ||
    msg.includes('eleven labs') ||
    msg.includes('exceeds your quota') ||
    (msg.includes('credits remaining') && msg.includes('required'))
  ) {
    return 'elevenlabs';
  }

  if (
    status === 402 ||
    code === 'insufficient_credits' ||
    (msg.includes('need ') && msg.includes('credit')) ||
    msg.includes('insufficient credit') ||
    msg.includes('not enough credit')
  ) {
    return 'wallet';
  }

  return null;
}

export function handleCreditApiFailure(status?: number, data?: CreditErrBody): boolean {
  const kind = classifyCreditShortage(status, data);
  if (!kind) return false;
  const { message } = flattenCreditBody(data);
  emitCreditShortage(kind, message || undefined);
  return true;
}

export function handleCreditThrowable(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err || '');
  return handleCreditApiFailure(undefined, { message });
}
