import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';

const StepProgress: React.FC = () => {
  const { step, handleStepClick } = useCourseCreator();
  // To restore the Resources section:
  // 1. Uncomment step 3 in the array below:
  const activeSteps = [1, 2, /* 3, */ 4, 5];

  return (
      <div className="flex items-center justify-between mb-12 max-md:mb-8 max-w-4xl mx-auto px-4 max-md:px-0 relative">
        {activeSteps.map((num) => (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="relative group">
              {step === num && (
                <motion.div
                  layoutId="activeCircle"
                  className="absolute inset-0 rounded-full bg-lime-500/20 scale-150 blur-sm overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                />
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => handleStepClick(num)}
                className={`relative z-10 w-11 h-11 max-md:w-8 max-md:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${step >= num
                  ? 'bg-lime-500 border-lime-400 text-black shadow-lime-500/30'
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                  }`}
              >
                {step > num ? <Check size={20} strokeWidth={4} /> : (
                  <span className={`font-bold ${step === num ? 'text-black' : 'text-gray-500'}`}>
                    {activeSteps.indexOf(num) + 1}
                  </span>
                )}
              </motion.button>
              <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none max-md:hidden">
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
              <div className="h-1.5 flex-1 mx-4 max-md:mx-1 rounded-full bg-gray-900 overflow-hidden shadow-inner">
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
    );
};

export default StepProgress;
