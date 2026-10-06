import React from 'react';
import { CreditCard, Info, ShieldCheck, Zap } from 'lucide-react';
import CreditPackageCard from './CreditPackageCard';
import { CREDIT_PACKAGES, type CreditPackage } from '../../types/credits.types';

type CreditPackagesProps = {
  onSelectPackage: (pkg: CreditPackage) => void;
  selectedPackageId?: string | null;
  isProcessing?: boolean;
};

const CreditPackages: React.FC<CreditPackagesProps> = ({
  onSelectPackage,
  selectedPackageId,
  isProcessing = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#101720]/80 p-6 md:p-8 shadow-xl backdrop-blur-xl">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute -top-10 left-1/4 h-56 w-3/4 opacity-20"
          viewBox="0 0 800 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 0,160 C 200,60 400,180 600,90 C 700,45 760,80 820,60"
            stroke="url(#bg-wave-gradient)"
            strokeWidth="2.5"
            filter="url(#bg-wave-glow)"
          />
          <path
            d="M 50,170 C 250,70 450,190 650,100 C 750,55 790,90 850,70"
            stroke="#10e760"
            strokeWidth="1"
            opacity="0.3"
          />
          <defs>
            <linearGradient id="bg-wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10e760" stopOpacity="0" />
              <stop offset="35%" stopColor="#10e760" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#00e5a3" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10e760" stopOpacity="0" />
            </linearGradient>
            <filter id="bg-wave-glow">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
        </svg>
      </div>


      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">

        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-1.5 rounded-full bg-[#10e760] shadow-[0_0_14px_#10e760] shrink-0" />
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              Buy Extra <span className="text-[#10e760]">Credits</span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 md:text-sm">
              Purchase additional credits for your wallet.
            </p>
          </div>
        </div>


        <div className="flex flex-wrap items-center gap-5 sm:gap-7">

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[#10e760] shadow-[0_0_12px_rgba(16,231,96,0.15)]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-[11px] font-semibold leading-tight text-slate-300">
              <div>Secure</div>
              <div>Payments</div>
            </div>
          </div>


          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[#10e760] shadow-[0_0_12px_rgba(16,231,96,0.15)]">
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-[11px] font-semibold leading-tight text-slate-300">
              <div>Instant</div>
              <div>Top-up</div>
            </div>
          </div>


          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[#10e760] shadow-[0_0_12px_rgba(16,231,96,0.15)]">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="text-[11px] font-semibold leading-tight text-slate-300">
              <div>No Hidden</div>
              <div>Charges</div>
            </div>
          </div>
        </div>
      </div>


      <div className="relative z-10 mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {CREDIT_PACKAGES.map((pkg) => (
          <CreditPackageCard
            key={pkg.id}
            pkg={pkg}
            onSelect={onSelectPackage}
            isLoading={isProcessing && selectedPackageId === pkg.id}
            isDisabled={isProcessing}
          />
        ))}
      </div>


      <div className="relative z-10 mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        <Info className="h-4 w-4 text-[#00e5a3] shrink-0" />
        <span>
          Packages are one-time top-ups added directly to your existing wallet balance after payment verification.
        </span>
      </div>
    </div>
  );
};

export default CreditPackages;

