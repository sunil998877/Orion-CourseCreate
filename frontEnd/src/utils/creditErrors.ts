export type CreditShortageKind = 'wallet' | 'gamma';

export const CREDIT_SHORTAGE_EVENT = 'orion-credit-shortage';

export function emitCreditShortage(kind: CreditShortageKind, message?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(CREDIT_SHORTAGE_EVENT, {
      detail: { kind, message },
    })
  );
}

export function isWalletCreditError(status?: number, data?: { message?: string; code?: string } | null) {
  const code = String(data?.code || '').toLowerCase();
  const msg = String(data?.message || '').toLowerCase();
  return (
    status === 402 ||
    code === 'insufficient_credits' ||
    (msg.includes('need ') && msg.includes('credit')) ||
    msg.includes('insufficient credit') ||
    msg.includes('not enough credit')
  );
}

export function isGammaCreditError(status?: number, data?: { message?: string; code?: string } | null) {
  const code = String(data?.code || '').toLowerCase();
  const msg = String(data?.message || '').toLowerCase();
  return (
    code === 'gamma_credits_exhausted' ||
    msg.includes('gamma slide credits are exhausted') ||
    (msg.includes('gamma') && (msg.includes('insufficient credit') || msg.includes('billing')))
  );
}

export function handleCreditApiFailure(
  status?: number,
  data?: { message?: string; code?: string } | null
): boolean {
  if (isGammaCreditError(status, data)) {
    emitCreditShortage('gamma', data?.message);
    return true;
  }
  if (isWalletCreditError(status, data)) {
    emitCreditShortage('wallet', data?.message);
    return true;
  }
  return false;
}
