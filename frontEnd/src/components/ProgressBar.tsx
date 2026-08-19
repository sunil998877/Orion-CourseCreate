import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, percentage }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-white/80">
          {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-lime-300">
          {percentage}% complete
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-lime-400 via-emerald-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <div key={stepNum} className="flex flex-col items-center">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2
                  ${isCompleted ? 'border-lime-400 bg-gradient-to-r from-lime-400 to-emerald-500 text-black' : ''}
                  ${isActive && !isCompleted ? 'border-lime-400 bg-black text-lime-300' : ''}
                  ${!isActive && !isCompleted ? 'border-white/20 text-white/60' : ''}
                  transition-all duration-300
                `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              <span
                className={`
                  text-xs mt-1 text-white/60
                  ${isActive || isCompleted ? 'text-lime-300 font-medium' : ''}
                `}
              >
                {stepNum === 1 && 'Basics'}
                {stepNum === 2 && 'Details'}
                {stepNum === 3 && 'File Upload'}
                {stepNum === 4 && 'Modules'}
                {stepNum === 5 && 'Review'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
