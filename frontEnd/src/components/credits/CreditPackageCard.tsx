import React from 'react';
import { Loader2 } from 'lucide-react';
import type { CreditPackage } from '../../types/credits.types';

type CreditPackageCardProps = {
  pkg: CreditPackage;
  onSelect: (pkg: CreditPackage) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
};

const CreditPackageCard: React.FC<CreditPackageCardProps> = ({
  pkg,
  onSelect,
  isLoading = false,
  isDisabled = false,
}) => {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
        pkg.popular
          ? 'border-lime-400/40 bg-lime-400/5 shadow-[0_0_30px_rgba(132,204,22,0.08)]'
          : 'border-white/10 bg-white/[0.03]'
      } hover:border-lime-400/30`}
    >
      {pkg.popular && (
        <span className="absolute right-3 top-3 rounded-full bg-lime-400 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
          Popular
        </span>
      )}

      <div>
        <p className="text-3xl font-black text-white">{pkg.credits.toLocaleString()}</p>
        <p className="text-xs text-white/40 mt-1">Extra Wallet Credits</p>

        <div className="my-5 h-px bg-white/10" />

        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs text-white/40">Price</span>
          <span className="text-xl font-bold text-lime-400">₹{pkg.price}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={isDisabled || isLoading}
        onClick={() => onSelect(pkg)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-lime-400/30 hover:bg-lime-400/10 hover:text-lime-400 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Initializing…
          </>
        ) : (
          'Select Package'
        )}
      </button>
    </div>
  );
};

export default CreditPackageCard;
