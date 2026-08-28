import React, { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { PlanData } from '../../types/credits.types';
import { useCredits } from '../../contextAPI/CreditsContext';
import { createRazorpayOrder, getRazorpayConfig, loadRazorpayScript, verifyRazorpayPlan, } from '../../services/razorpayService';
type PlanPurchaseModalProps = {
    plan: PlanData | null;
    onClose: () => void;
    onSuccess?: (planName: string) => void;
};
type PaymentStage = 'summary' | 'processing' | 'verifying' | 'success' | 'error';
const PlanPurchaseModal: React.FC<PlanPurchaseModalProps> = ({ plan, onClose, onSuccess }) => {
    const { subscribeToPlan, refreshWallet } = useCredits();
    const [stage, setStage] = useState<PaymentStage>('summary');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    if (!plan)
        return null;
    const isFree = plan.priceInr === 0;
    const handleConfirmPlan = async () => {
        try {
            setErrorMessage(null);
            setStage('processing');
            const token = localStorage.getItem('token') || '';
            if (isFree) {
                setStage('verifying');
                await subscribeToPlan(plan.name, plan.id);
                setStage('success');
                onSuccess?.(plan.name);
                setTimeout(() => onClose(), 1800);
                return;
            }
            const loaded = await loadRazorpayScript();
            if (!loaded)
                throw new Error('Failed to load Razorpay checkout');
            const config = await getRazorpayConfig(token);
            const order = await createRazorpayOrder(token, {
                amount: plan.priceInr,
                plan_id: plan.id,
                plan_name: plan.name,
                type: 'plan',
            });
            const username = localStorage.getItem('username') || '';
            const email = localStorage.getItem('email') || '';
            await new Promise<void>((resolve, reject) => {
                const razorpay = new (window as any).Razorpay({
                    key: config.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'Course Creator',
                    description: `${plan.name} plan subscription`,
                    order_id: order.id,
                    prefill: { name: username, email },
                    theme: { color: '#84cc16' },
                    handler: async (response: {
                        razorpay_order_id: string;
                        razorpay_payment_id: string;
                        razorpay_signature: string;
                    }) => {
                        try {
                            setStage('verifying');
                            await verifyRazorpayPlan(token, {
                                ...response,
                                plan_id: plan.id,
                                plan_name: plan.name,
                            });
                            await refreshWallet();
                            resolve();
                        }
                        catch (err) {
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment cancelled')),
                    },
                });
                razorpay.on('payment.failed', (resp: any) => {
                    reject(new Error(resp?.error?.description || 'Razorpay payment failed'));
                });
                razorpay.open();
            });
            setStage('success');
            onSuccess?.(plan.name);
            setTimeout(() => onClose(), 1800);
        }
        catch (err: any) {
            setStage('error');
            setErrorMessage(err?.message || 'Plan subscription failed. Please try again.');
        }
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gray-950 p-6 md:p-8 shadow-2xl">
        {stage !== 'processing' && stage !== 'verifying' && (<button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition">
            <X className="h-4 w-4"/>
          </button>)}

        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-lime-500/10 blur-[50px] pointer-events-none"/>

        {(stage === 'summary' || stage === 'error') && (<div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-400/30 bg-lime-400/10 text-lime-400">
                <Sparkles className="h-5 w-5"/>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Subscribe to {plan.name}</h3>
                <p className="text-xs text-white/40">
                  {isFree ? 'Activate free plan' : 'Pay securely with Razorpay'}
                </p>
              </div>
            </div>

            {errorMessage && (<div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {errorMessage}
              </div>)}

            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Selected Plan</span>
                <span className="font-bold text-lime-400">{plan.name} Plan</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Monthly Credits</span>
                <span className="font-semibold text-white">+{plan.monthlyCreditAllotment.toLocaleString()} Credits / mo</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Credit Rollover</span>
                <span className="font-semibold text-white">{plan.rolloverAllowed ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="my-2 h-px bg-white/10"/>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-white">Monthly Subscription</span>
                <span className="font-black text-lime-400">
                  {isFree ? 'Free' : `₹${plan.priceInr.toLocaleString()} / mo`}
                </span>
              </div>
            </div>

            {!isFree && (<div className="flex items-center justify-center gap-2 rounded-2xl border border-lime-400 bg-lime-400/10 p-3 text-center text-xs font-semibold text-white">
                <CreditCard className="h-4 w-4 text-lime-400"/>
                Razorpay Checkout
              </div>)}

            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <ShieldCheck className="h-4 w-4 text-lime-400 shrink-0"/>
              <span>
                {isFree
                ? 'No payment required for the Free plan.'
                : 'UPI, cards, netbanking and wallets via Razorpay.'}
              </span>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 transition">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmPlan} className="w-2/3 rounded-xl border border-lime-400 bg-lime-400 py-2.5 text-sm font-bold text-black hover:bg-lime-300 transition shadow-[0_0_20px_rgba(132,204,22,0.2)]">
                {isFree ? 'Activate Free Plan' : `Pay ₹${plan.priceInr} with Razorpay`}
              </button>
            </div>
          </div>)}

        {(stage === 'processing' || stage === 'verifying') && (<div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-lime-400/30 bg-lime-400/10">
              <Loader2 className="h-8 w-8 animate-spin text-lime-400"/>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {stage === 'processing'
                ? isFree
                    ? 'Activating Subscription Plan...'
                    : 'Opening Razorpay Checkout...'
                : 'Verifying Subscription & Updating Wallet...'}
              </h4>
              <p className="text-xs text-white/40 mt-1">Please do not close or refresh this window.</p>
            </div>
          </div>)}

        {stage === 'success' && (<div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-lime-400/40 bg-lime-400/20 text-lime-400 animate-bounce">
              <CheckCircle2 className="h-8 w-8"/>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Subscription Active!</h4>
              <p className="text-sm text-lime-400 mt-1 font-semibold">
                You are now subscribed to the {plan.name} Plan
              </p>
            </div>
          </div>)}
      </div>
    </div>);
};
export default PlanPurchaseModal;
