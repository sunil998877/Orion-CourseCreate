import React, { useState } from 'react';
import PlanCards from './PlanCards';
import CreditPackages from './CreditPackages';
import CreditsPurchase from './CreditsPurchase';
import PlanPurchaseModal from './PlanPurchaseModal';
import type { CreditPackage, PlanData } from '../../types/credits.types';

type Props = {
  onPurchase?: (credits: number, packageId: string) => void;
};

const AddCreditsContent: React.FC<Props> = ({ onPurchase }) => {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);

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

  return (
    <div className="space-y-12">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 md:p-8">
        <PlanCards onSelectPlan={handleSelectPlan} />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 md:p-8">
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
        />
      )}

      {selectedPlan && (
        <PlanPurchaseModal
          plan={selectedPlan}
          onClose={handleClosePlanPurchase}
        />
      )}
    </div>
  );
};

export default AddCreditsContent;
