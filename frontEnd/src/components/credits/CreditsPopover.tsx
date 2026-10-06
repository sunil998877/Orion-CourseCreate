import React, { useEffect, useRef } from 'react';
import { X, Zap } from 'lucide-react';
import type { CreditsBalance, WalletTransaction } from '../../types/credits.types';
import UsageHistory from './UsageHistory';
type Props = {
    credits: CreditsBalance;
    usagePercentage: number;
    usageHistory: WalletTransaction[];
    onClose: () => void;
    onAddCredits: () => void;
};
const CreditsPopover: React.FC<Props> = ({ credits, usagePercentage, usageHistory, onClose, onAddCredits, }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;
        const fit = () => {
            const parent = panel.offsetParent as HTMLElement | null;
            const parentTop = parent?.getBoundingClientRect().top ?? window.innerHeight;
            const available = Math.max(160, Math.floor(parentTop - 72));
            panel.style.height = `${available}px`;
            panel.style.maxHeight = `${available}px`;
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, []);

    return (<div ref={panelRef} className="absolute bottom-full left-0 z-50 mb-2 flex w-[250px] max-w-[calc(100vw-6rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0A0F1A]/95 shadow-2xl backdrop-blur-xl animate-fadeInUp">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0A0F1A]/95 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10">
            <Zap className="h-3.5 w-3.5 text-lime-400"/>
          </div>
          <h3 className="text-sm font-semibold text-white">Credits</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white" aria-label="Close credits details">
          <X className="h-4 w-4"/>
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-color:rgba(190,242,100,0.8)_rgba(255,255,255,0.06)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-lime-400/70">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
            <p className="text-white/40">Remaining</p>
            <p className="font-bold text-lime-400">{credits.remaining.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
            <p className="text-white/40">Used</p>
            <p className="font-bold text-white">{credits.used.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
            <p className="text-white/40">Total</p>
            <p className="font-bold text-white">{credits.total.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
            <p className="text-white/40">Usage</p>
            <p className="font-bold text-white">
              {usagePercentage > 0 && usagePercentage < 10 && usagePercentage % 1 !== 0
            ? usagePercentage.toFixed(1)
            : Math.round(usagePercentage)}%
            </p>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-[10px] text-white/40">
            <span>Usage progress</span>
            <span>
              {usagePercentage > 0 && usagePercentage < 10 && usagePercentage % 1 !== 0
            ? usagePercentage.toFixed(1)
            : Math.round(usagePercentage)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-500" style={{ width: `${usagePercentage}%` }}/>
          </div>
        </div>

        <UsageHistory items={usageHistory} compact maxHeight="max-h-none" />
      </div>

      <div className="shrink-0 border-t border-white/10 px-4 py-3">
        <button type="button" onClick={onAddCredits} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-lime-400 to-emerald-500 px-3 py-2 text-xs font-bold text-black transition hover:brightness-110">
          + Add Credits
        </button>
      </div>
    </div>);
};
export default CreditsPopover;
