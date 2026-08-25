import React from 'react';
import { AlertTriangle, CreditCard, Layers, Sparkles, X } from 'lucide-react';
import type { CreditShortageKind } from '../../utils/creditErrors';

type Props = {
  kind: CreditShortageKind;
  message?: string;
  onClose: () => void;
};

const CreditShortageModal: React.FC<Props> = ({ kind, message, onClose }) => {
  const isGamma = kind === 'gamma';
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  const go = (path: string) => {
    onClose();
    window.location.assign(path);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0e1320] p-6 shadow-2xl max-md:rounded-2xl max-md:p-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border ${isGamma ? 'border-amber-400/30 bg-amber-400/10 text-amber-400' : 'border-lime-400/30 bg-lime-400/10 text-lime-400'}`}>
          {isGamma ? <Layers className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
        </div>

        {isGamma ? (
          <>
            <h3 className="text-xl font-black text-white">Gamma credits are not enough</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              The Gamma API key used for slide generation is out of credits. Recharge or upgrade the Gamma plan, then retry.
            </p>
            {message && <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">{message}</p>}
            <div className="mt-6 space-y-2">
              <a
                href="https://gamma.app"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-500 py-3 text-sm font-black text-black hover:bg-lime-400"
              >
                <Sparkles className="h-4 w-4" />
                Recharge Gamma plan
              </a>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => go('/admin/settings')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white hover:bg-white/10"
                >
                  Open management settings
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-white/40 hover:text-white"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-black text-white">You need to recharge or pick a plan</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Your wallet does not have enough credits for this action. Top up credits or upgrade your plan to continue generating.
            </p>
            {message && <p className="mt-3 rounded-xl border border-lime-500/20 bg-lime-500/10 p-3 text-xs text-lime-200">{message}</p>}
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => go('/add-credits#recharge')}
                className="flex items-center justify-center gap-2 rounded-xl bg-lime-500 py-3 text-sm font-black text-black hover:bg-lime-400"
              >
                <CreditCard className="h-4 w-4" />
                Recharge
              </button>
              <button
                type="button"
                onClick={() => go('/add-credits#plans')}
                className="flex items-center justify-center gap-2 rounded-xl border border-lime-500/40 bg-lime-500/10 py-3 text-sm font-black text-lime-400 hover:bg-lime-500/20"
              >
                <Sparkles className="h-4 w-4" />
                View plans
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full py-2 text-xs font-semibold text-white/40 hover:text-white"
            >
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreditShortageModal;
