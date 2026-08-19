const fs = require('fs');
const path = require('path');

const stepProgressContent = `
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepProgressProps {
  step: number;
  handleStepClick: (step: number) => void;
}

export const StepProgress: React.FC<StepProgressProps> = ({ step, handleStepClick }) => {
  const activeSteps = [1, 2, 4, 5];
  
  return (
    <div className="relative w-full max-w-4xl mx-auto mb-16 mt-8 hidden sm:block">
      <div className="absolute top-1/2 left-0 w-full h-1.5 -translate-y-1/2 bg-gray-900 rounded-full shadow-inner" />
      <div className="relative flex justify-between">
        {activeSteps.map((num) => (
          <div key={num} className="flex-1 flex items-center relative group">
            <div className="relative flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStepClick(num)}
                className={\`relative z-10 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-xl \${step >= num
                  ? 'bg-lime-500 border-lime-400 text-black shadow-lime-500/30'
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                  }\`}
              >
                {step > num ? <Check size={20} strokeWidth={4} /> : (
                  <span className={\`font-bold \${step === num ? 'text-black' : 'text-gray-500'}\`}>
                    {activeSteps.indexOf(num) + 1}
                  </span>
                )}
              </motion.button>
              <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-lime-500/80">
                  {num === 1 && "Basics"}
                  {num === 2 && "Structure"}
                  {num === 3 && "Resources"}
                  {num === 4 && "Generate / Preview"}
                  {num === 5 && "Review & Launch"}
                </span>
              </div>
            </div>

            {num < 5 && (
              <div className="h-1.5 flex-1 mx-4 rounded-full bg-gray-900 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 shadow-[0_0_10px_rgba(132,204,22,0.3)]"
                  initial={false}
                  animate={{ width: step > num ? "100%" : "0%" }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
`;

fs.writeFileSync(path.join(__dirname, 'frontEnd/src/components/CourseCreator/StepProgress.tsx'), stepProgressContent, 'utf-8');

// Now we need to modify CourseCreatorForm.tsx to import and use it.
const ccFormPath = path.join(__dirname, 'frontEnd/src/components/CourseCreatorForm.tsx');
let ccFormContent = fs.readFileSync(ccFormPath, 'utf-8');

ccFormContent = ccFormContent.replace(
  "import { StepLaunch } from './CourseCreator/StepLaunch';",
  "import { StepLaunch } from './CourseCreator/StepLaunch';\nimport { StepProgress } from './CourseCreator/StepProgress';"
);

ccFormContent = ccFormContent.replace(
  "{/* We would render StepProgress here */}",
  "<StepProgress step={step} handleStepClick={(n) => handleStepClick(n, isBlueprinting, hasBlueprint, previewModules.length, Object.keys(orionUrlByModule).length)} />"
);

fs.writeFileSync(ccFormPath, ccFormContent, 'utf-8');
console.log("StepProgress added.");
