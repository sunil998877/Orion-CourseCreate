import React from 'react';
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Buy Extra Credits</h2>
        <p className="mt-1 text-sm text-white/40">
          Purchase additional credits for your wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <p className="mt-4 text-center text-xs text-white/30">
        Packages are one-time top-ups added directly to your existing wallet balance after payment verification.
      </p>
    </div>
  );
};

export default CreditPackages;
