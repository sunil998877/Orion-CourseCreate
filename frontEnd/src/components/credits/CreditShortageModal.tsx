import React from 'react';
import { AlertTriangle, CreditCard, ExternalLink, Layers, Mic, Sparkles, X } from 'lucide-react';
import type { CreditShortageKind } from '../../utils/creditErrors';
type Props = {
    kind: CreditShortageKind;
    message?: string;
    onClose: () => void;
};
const COPY: Record<CreditShortageKind, {
    title: string;
    body: string;
    accent: string;
    icon: 'wallet' | 'gamma' | 'openai' | 'elevenlabs';
    rechargeLabel: string;
    rechargeHref?: string;
    showUserPlans: boolean;
}> = {
    wallet: {
        title: 'You need to recharge or pick a plan',
        body: 'Your wallet does not have enough credits for this action. Top up credits or upgrade your plan to continue generating.',
        accent: 'lime',
        icon: 'wallet',
        rechargeLabel: 'Recharge',
        showUserPlans: true,
    },
    gamma: {
        title: 'Gamma credits need a recharge',
        body: 'This is a management limit on the Gamma API key used for slide decks — not your personal wallet. Recharge or upgrade the Gamma plan, then retry.',
        accent: 'amber',
        icon: 'gamma',
        rechargeLabel: 'Recharge Gamma',
        rechargeHref: 'https://gamma.app',
        showUserPlans: false,
    },
    openai: {
        title: 'OpenAI quota needs a recharge',
        body: 'This is a management limit on the OpenAI API key — not your personal wallet. Add billing credits or upgrade the OpenAI plan, then retry.',
        accent: 'sky',
        icon: 'openai',
        rechargeLabel: 'OpenAI billing',
        rechargeHref: 'https://platform.openai.com/settings/organization/billing',
        showUserPlans: false,
    },
    elevenlabs: {
        title: 'ElevenLabs credits need a recharge',
        body: 'This is a management limit on the ElevenLabs API key used for audio and podcasts — not your personal wallet. Recharge or upgrade the ElevenLabs plan, then retry.',
        accent: 'violet',
        icon: 'elevenlabs',
        rechargeLabel: 'ElevenLabs billing',
        rechargeHref: 'https://elevenlabs.io/app/subscription',
        showUserPlans: false,
    },
};
const CreditShortageModal: React.FC<Props> = ({ kind, message, onClose }) => {
    const copy = COPY[kind];
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const go = (path: string) => {
        onClose();
        window.location.assign(path);
    };
    const iconClass = copy.accent === 'amber'
        ? 'border-amber-400/30 bg-amber-400/10 text-amber-400'
        : copy.accent === 'sky'
            ? 'border-sky-400/30 bg-sky-400/10 text-sky-400'
            : copy.accent === 'violet'
                ? 'border-violet-400/30 bg-violet-400/10 text-violet-400'
                : 'border-lime-400/30 bg-lime-400/10 text-lime-400';
    const noteClass = copy.accent === 'amber'
        ? 'border-amber-500/20 bg-amber-500/10 text-amber-200'
        : copy.accent === 'sky'
            ? 'border-sky-500/20 bg-sky-500/10 text-sky-200'
            : copy.accent === 'violet'
                ? 'border-violet-500/20 bg-violet-500/10 text-violet-200'
                : 'border-lime-500/20 bg-lime-500/10 text-lime-200';
    return (<div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md max-md:items-end max-md:p-0">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0e1320] p-6 shadow-2xl max-md:max-h-[90vh] max-md:rounded-t-3xl max-md:rounded-b-none max-md:p-5">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white" aria-label="Close">
          <X className="h-4 w-4"/>
        </button>

        <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border ${iconClass}`}>
          {copy.icon === 'gamma' && <Layers className="h-6 w-6"/>}
          {copy.icon === 'openai' && <Sparkles className="h-6 w-6"/>}
          {copy.icon === 'elevenlabs' && <Mic className="h-6 w-6"/>}
          {copy.icon === 'wallet' && <AlertTriangle className="h-6 w-6"/>}
        </div>

        <h3 className="pr-8 text-xl font-black text-white">{copy.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{copy.body}</p>
        {message && <p className={`mt-3 rounded-xl border p-3 text-xs ${noteClass}`}>{message}</p>}

        {copy.showUserPlans ? (<div className="mt-6 grid grid-cols-2 gap-2 max-md:grid-cols-1">
            <button type="button" onClick={() => go('/add-credits#recharge')} className="flex items-center justify-center gap-2 rounded-xl bg-lime-500 py-3 text-sm font-black text-black hover:bg-lime-400">
              <CreditCard className="h-4 w-4"/>
              Recharge
            </button>
            <button type="button" onClick={() => go('/add-credits#plans')} className="flex items-center justify-center gap-2 rounded-xl border border-lime-500/40 bg-lime-500/10 py-3 text-sm font-black text-lime-400 hover:bg-lime-500/20">
              <Sparkles className="h-4 w-4"/>
              View plans
            </button>
          </div>) : (<div className="mt-6 space-y-2">
            {copy.rechargeHref && (<a href={copy.rechargeHref} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-500 py-3 text-sm font-black text-black hover:bg-lime-400">
                <ExternalLink className="h-4 w-4"/>
                {copy.rechargeLabel}
              </a>)}
            {isAdmin && (<button type="button" onClick={() => go('/admin/settings')} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white hover:bg-white/10">
                Open management settings
              </button>)}
          </div>)}

        <button type="button" onClick={onClose} className="mt-3 w-full py-2 text-xs font-semibold text-white/40 hover:text-white">
          Maybe later
        </button>
      </div>
    </div>);
};
export default CreditShortageModal;
