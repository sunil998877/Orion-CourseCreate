import React, { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, ShieldCheck, Zap, X } from 'lucide-react';
import type { CreditPackage } from '../../types/credits.types';
import { useCredits } from '../../contextAPI/CreditsContext';
import { createRechargeStripeSession } from '../../services/rechargeService';

type CreditsPurchaseProps = {
  pkg: CreditPackage | null;
  onClose: () => void;
  onSuccess?: (creditsAdded: number) => void;
};

type PaymentStage = 'summary' | 'processing' | 'verifying' | 'success' | 'error';
type PaymentMethod = 'stripe' | 'direct';

const CreditsPurchase: React.FC<CreditsPurchaseProps> = ({ pkg, onClose, onSuccess }) => {
  const { addCredits } = useCredits();
  const [stage, setStage] = useState<PaymentStage>('summary');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!pkg) return null;

  const orderId = `RECHARGE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const handleConfirmPayment = async () => {
    try {
      setErrorMessage(null);
      setStage('processing');

      const token = localStorage.getItem('token') || '';

      if (paymentMethod === 'stripe') {
        const stripeSession = await createRechargeStripeSession(token, {
          amount: pkg.credits,
          package_id: pkg.id,
          price: pkg.price,
        });

        if (stripeSession.mode === 'live_stripe' && stripeSession.checkoutUrl) {
          window.location.href = stripeSession.checkoutUrl;
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStage('verifying');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await addCredits(pkg.credits, orderId);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setStage('verifying');
        await new Promise((resolve) => setTimeout(resolve, 800));
        await addCredits(pkg.credits, orderId);
      }

      setStage('success');
      onSuccess?.(pkg.credits);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setStage('error');
      setErrorMessage(err?.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gray-950 p-6 md:p-8 shadow-2xl">
        {stage !== 'processing' && stage !== 'verifying' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-lime-500/10 blur-[50px] pointer-events-none" />

        {(stage === 'summary' || stage === 'error') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-400/30 bg-lime-400/10 text-lime-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Recharge Credits</h3>
                <p className="text-xs text-white/40">Credit Top-Up Checkout</p>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {errorMessage}
              </div>
            )}

            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Package</span>
                <span className="font-semibold text-white">{pkg.label}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Credits Added</span>
                <span className="font-bold text-lime-400">+{pkg.credits.toLocaleString()} Credits</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Reference</span>
                <span className="font-mono text-white/50">{orderId}</span>
              </div>
              <div className="my-2 h-px bg-white/10" />
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-white">Total Amount</span>
                <span className="font-black text-lime-400">₹{pkg.price}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs transition ${
                    paymentMethod === 'stripe'
                      ? 'border-lime-400 bg-lime-400/10 text-white font-bold shadow-[0_0_15px_rgba(132,204,22,0.15)]'
                      : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20'
                  }`}
                >
                  <CreditCard className={`h-5 w-5 ${paymentMethod === 'stripe' ? 'text-lime-400' : 'text-white/40'}`} />
                  <span>Stripe Checkout</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('direct')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs transition ${
                    paymentMethod === 'direct'
                      ? 'border-lime-400 bg-lime-400/10 text-white font-bold shadow-[0_0_15px_rgba(132,204,22,0.15)]'
                      : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20'
                  }`}
                >
                  <Zap className={`h-5 w-5 ${paymentMethod === 'direct' ? 'text-lime-400' : 'text-white/40'}`} />
                  <span>Direct Instant</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <ShieldCheck className="h-4 w-4 text-lime-400 shrink-0" />
              <span>
                {paymentMethod === 'stripe'
                  ? 'Encrypted checkout session powered by Stripe.'
                  : 'Direct instant wallet top-up.'}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="w-2/3 rounded-xl border border-lime-400 bg-lime-400 py-2.5 text-sm font-bold text-black hover:bg-lime-300 transition shadow-[0_0_20px_rgba(132,204,22,0.2)]"
              >
                Pay ₹{pkg.price} Now
              </button>
            </div>
          </div>
        )}

        {(stage === 'processing' || stage === 'verifying') && (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-lime-400/30 bg-lime-400/10">
              <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {stage === 'processing'
                  ? paymentMethod === 'stripe'
                    ? 'Connecting to Stripe Checkout...'
                    : 'Processing Credit Top-Up...'
                  : 'Verifying Payment & Updating Wallet...'}
              </h4>
              <p className="text-xs text-white/40 mt-1">
                Please do not close or refresh this window.
              </p>
            </div>
          </div>
        )}

        {stage === 'success' && (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-lime-400/40 bg-lime-400/20 text-lime-400 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Top-Up Successful!</h4>
              <p className="text-sm text-lime-400 mt-1 font-semibold">
                +{pkg.credits.toLocaleString()} credits added to your wallet
              </p>
              <p className="text-xs text-white/40 mt-2">
                Order reference: {orderId}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditsPurchase;
