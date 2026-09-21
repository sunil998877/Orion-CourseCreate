import React from 'react';
import { AlertCircle, Bell, X } from 'lucide-react';

export type CancellationDetails = {
    type: 'recharge' | 'plan';
    title: string;
    message: string;
    details?: string;
};

interface CancellationPopupModalProps {
    isOpen: boolean;
    cancellation: CancellationDetails | null;
    onClose: () => void;
    onRetry?: () => void;
}

export const CancellationPopupModal: React.FC<CancellationPopupModalProps> = ({
    isOpen,
    cancellation,
    onClose,
    onRetry,
}) => {
    if (!isOpen || !cancellation) return null;

    const isRecharge = cancellation.type === 'recharge';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0c1017] p-6 md:p-8 shadow-2xl">
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber-500/15 blur-[60px] pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-orange-500/10 blur-[60px] pointer-events-none" />

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                                {isRecharge ? 'Top-Up Cancelled' : 'Plan Cancelled'}
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                {cancellation.title}
                            </h3>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300 leading-relaxed">
                        <p>{cancellation.message}</p>
                        {cancellation.details && (
                            <p className="mt-2 text-xs text-white/50 font-medium">
                                {cancellation.details}
                            </p>
                        )}
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-lime-500/20 bg-lime-500/[0.05] p-3 text-xs text-lime-300">
                        <Bell className="h-4 w-4 shrink-0 mt-0.5 text-lime-400" />
                        <span>
                            This update has been logged to your <strong>Notification Area</strong> (top-right bell icon).
                        </span>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                        >
                            Understood
                        </button>
                        {onRetry && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onRetry();
                                }}
                                className="w-full rounded-xl border border-lime-400 bg-lime-400 py-2.5 text-sm font-bold text-black hover:bg-lime-300 transition shadow-[0_0_20px_rgba(132,204,22,0.2)]"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancellationPopupModal;
