import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import PlanCards from './PlanCards';
import CreditPackages from './CreditPackages';
import CreditsPurchase from './CreditsPurchase';
import PlanPurchaseModal from './PlanPurchaseModal';
import CancellationPopupModal, { type CancellationDetails } from './CancellationPopupModal';
import type { CreditPackage, PlanData } from '../../types/credits.types';
import { useCredits } from '../../contextAPI/CreditsContext';
import { createNotification, triggerNotificationsRefresh } from '../../services/notificationService';
import { cancelPlanSubscription } from '../../services/walletService';

type Props = {
    onPurchase?: (credits: number, packageId: string) => void;
};

const AddCreditsContent: React.FC<Props> = ({ onPurchase }) => {
    const { refreshWallet } = useCredits();
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);

    const [cancellationModal, setCancellationModal] = useState<{
        isOpen: boolean;
        data: CancellationDetails | null;
    }>({
        isOpen: false,
        data: null,
    });

    const [planToCancel, setPlanToCancel] = useState<PlanData | null>(null);
    const [isCancellingActivePlan, setIsCancellingActivePlan] = useState(false);

    const handleSelectPackage = (pkg: CreditPackage) => {
        setSelectedPackage(pkg);
    };

    const handleSelectPlan = (plan: PlanData) => {
        setSelectedPlan(plan);
    };

    const handleClosePackagePurchase = () => {
        setSelectedPackage(null);
    };

    const handleClosePlanPurchase = () => {
        setSelectedPlan(null);
    };

    const handlePackagePurchaseSuccess = (creditsAdded: number) => {
        if (selectedPackage) {
            onPurchase?.(creditsAdded, selectedPackage.id);
        }
    };

    const handlePackagePurchaseCancel = async (details: { credits: number; price: number; label: string }) => {
        setSelectedPackage(null);
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await createNotification(token, {
                    title: 'Recharge Cancelled',
                    message: `Recharge for ${details.label} (${details.credits.toLocaleString()} Credits - ₹${details.price}) was cancelled.`,
                    type: 'warning',
                });
            } catch (err) {
                console.error('Failed to log recharge cancellation:', err);
            }
        }
        toast.warning(`Recharge Cancelled: Credit top-up of ${details.credits.toLocaleString()} credits was cancelled.`);
        setCancellationModal({
            isOpen: true,
            data: {
                type: 'recharge',
                title: 'Recharge Cancelled',
                message: `Your recharge for ${details.label} (${details.credits.toLocaleString()} Credits) was cancelled.`,
                details: 'No payment was deducted and no credits were added to your account.',
            },
        });
        triggerNotificationsRefresh();
    };

    const handlePlanPurchaseCancel = async (details: { planName: string; price: number }) => {
        setSelectedPlan(null);
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await createNotification(token, {
                    title: 'Plan Subscription Cancelled',
                    message: `Subscription checkout for ${details.planName} Plan (${details.price > 0 ? `₹${details.price}/mo` : 'Free'}) was cancelled.`,
                    type: 'warning',
                });
            } catch (err) {
                console.error('Failed to log plan cancellation:', err);
            }
        }
        toast.warning(`Plan Cancelled: Subscription to ${details.planName} Plan was cancelled.`);
        setCancellationModal({
            isOpen: true,
            data: {
                type: 'plan',
                title: 'Plan Subscription Cancelled',
                message: `Your subscription process for the ${details.planName} Plan was cancelled.`,
                details: 'Your existing subscription and credits balance remain unchanged.',
            },
        });
        triggerNotificationsRefresh();
    };

    const handlePromptCancelActivePlan = (plan: PlanData) => {
        setPlanToCancel(plan);
    };

    const handleConfirmCancelActivePlan = async () => {
        if (!planToCancel) return;
        setIsCancellingActivePlan(true);
        try {
            const token = localStorage.getItem('token') || '';
            await cancelPlanSubscription(token);
            await refreshWallet();
            triggerNotificationsRefresh();
            toast.warning(`Plan Cancelled: Your ${planToCancel.name} subscription has been cancelled.`);
            setCancellationModal({
                isOpen: true,
                data: {
                    type: 'plan',
                    title: 'Plan Subscription Cancelled',
                    message: `Your ${planToCancel.name} plan subscription has been cancelled.`,
                    details: 'Your account has been successfully reverted to the Free plan.',
                },
            });
            setPlanToCancel(null);
        } catch (err: any) {
            console.error('Failed to cancel active plan:', err);
            toast.error(err?.message || 'Failed to cancel plan subscription');
        } finally {
            setIsCancellingActivePlan(false);
        }
    };

    return (
        <div className="space-y-12">
            <section id="plans" className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 md:p-8 max-md:rounded-2xl max-md:p-4">
                <PlanCards
                    onSelectPlan={handleSelectPlan}
                    onCancelPlan={handlePromptCancelActivePlan}
                />
            </section>

            <section id="recharge" className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 md:p-8 max-md:rounded-2xl max-md:p-4">
                <CreditPackages
                    onSelectPackage={handleSelectPackage}
                    selectedPackageId={selectedPackage?.id}
                />
            </section>

            {selectedPackage && (
                <CreditsPurchase
                    pkg={selectedPackage}
                    onClose={handleClosePackagePurchase}
                    onSuccess={handlePackagePurchaseSuccess}
                    onCancel={handlePackagePurchaseCancel}
                />
            )}

            {selectedPlan && (
                <PlanPurchaseModal
                    plan={selectedPlan}
                    onClose={handleClosePlanPurchase}
                    onCancel={handlePlanPurchaseCancel}
                />
            )}

            <CancellationPopupModal
                isOpen={cancellationModal.isOpen}
                cancellation={cancellationModal.data}
                onClose={() => setCancellationModal({ isOpen: false, data: null })}
            />

            {planToCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-500/30 bg-[#0c1017] p-6 md:p-8 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setPlanToCancel(null)}
                            disabled={isCancellingActivePlan}
                            className="absolute right-4 top-4 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Cancel Plan Subscription</h3>
                                    <p className="text-xs text-white/50">{planToCancel.name} Plan</p>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-gray-300 leading-relaxed">
                                Are you sure you want to cancel your <strong>{planToCancel.name} Plan</strong>?
                                Your subscription will be cancelled and your account will revert to the <strong>Free plan</strong>.
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setPlanToCancel(null)}
                                    disabled={isCancellingActivePlan}
                                    className="w-1/2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition disabled:opacity-50"
                                >
                                    Keep Plan
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCancelActivePlan}
                                    disabled={isCancellingActivePlan}
                                    className="w-1/2 rounded-xl border border-red-500 bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50"
                                >
                                    {isCancellingActivePlan ? 'Cancelling...' : 'Yes, Cancel Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddCreditsContent;
