import React from 'react';
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

const CreditsPopover: React.FC<Props> = ({
  credits,
  usagePercentage,
  usageHistory,
  onClose,
  onAddCredits,
}) => {
  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50 rounded-xl border border-white/10 bg-[#0A0F1A]/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-fadeInUp">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10">
            <Zap className="h-3.5 w-3.5 text-lime-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Credits</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
          aria-label="Close credits details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 px-4 py-3">
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
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        <UsageHistory items={usageHistory} limit={4} compact />

        <button
          type="button"
          onClick={onAddCredits}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-lime-400 to-emerald-500 px-3 py-2 text-xs font-bold text-black transition hover:brightness-110"
        >
          + Add Credits
        </button>
      </div>
    </div>
  );
};

export default CreditsPopover;
