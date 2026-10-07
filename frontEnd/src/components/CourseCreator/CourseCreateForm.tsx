
import { AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useCourseCreator, CourseCreatorProvider } from '../../contextAPI/CourseCreatorContext';
import Loading from '../Loading';
import CourseHeader from './CourseHeader';
import StepProgress from './StepProgress';
import CourseStepOne from './CourseStepOne';
import CourseStepTwo from './CourseStepTwo';
import CourseStepFour from './CourseStepFour';
import CourseStepFive from './CourseStepFive';
import BatchGenerationOverlay from './BatchGenerationOverlay';
import ModulePreview from './ModulePreview';
import CourseDescriptionModal from './CourseDescriptionModal';

const CourseCreatorContent: React.FC = () => {
  const { step, isGeneratingContent } = useCourseCreator();

  if (isGeneratingContent) return <Loading />;

  return (
    <div className="relative min-h-screen bg-black text-gray-100 font-sans selection:bg-lime-500 selection:text-black">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-lime-900/10 blur-[120px] rounded-full" />
      </div>

      <CourseHeader />

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 pb-8 pt-12 transition-all duration-700 max-md:px-4 max-md:pb-6 max-md:pt-8">
        <StepProgress />

        <div className="mt-12 flex flex-col lg:flex-row gap-8 max-md:items-stretch items-start w-full">
          <div className="flex-1 w-full min-h-[620px] relative z-10 transition-all duration-300">
            <AnimatePresence mode="wait">
              {step === 1 && <CourseStepOne />}
              {step === 2 && <CourseStepTwo />}
              {step === 4 && <CourseStepFour />}
              {step === 5 && <CourseStepFive />}
            </AnimatePresence>
          </div>
        </div>

        <div className="mb-4 mt-8 flex flex-col items-center justify-center gap-1 opacity-80 animate-pulse max-md:mb-0 max-md:mt-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] sm:text-xs text-amber-500 uppercase tracking-widest font-black text-center">
              Warning: AI can make mistakes. Please verify all generated content before launching.
            </p>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-[9px] sm:text-[10px] text-amber-500/60 uppercase tracking-[0.2em] font-bold">
            Internet connectivity may also affect the generation time
          </p>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4d7c0f; }

        .step-scrollbar {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .step-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        @keyframes blink-lime {
          0%, 100% { border-color: rgba(132, 204, 22, 0.3); box-shadow: 0 0 0 rgba(132, 204, 22, 0); }
          50% { border-color: rgba(132, 204, 22, 0.8); box-shadow: 0 0 20px rgba(132, 204, 22, 0.2); }
        }
        .animate-blink-module {
          animation: blink-lime 1s ease-in-out infinite;
          border-width: 2px !important;
        }
        @keyframes pulse-lime-border {
          0%, 100% { border-color: rgba(132, 204, 22, 0.4); box-shadow: 0 0 24px rgba(132, 204, 22, 0.08); }
          50% { border-color: rgba(132, 204, 22, 0.75); box-shadow: 0 0 32px rgba(132, 204, 22, 0.22); }
        }
      `}</style>

      <BatchGenerationOverlay />
      <ModulePreview />

      <CourseDescriptionModal />
    </div>
  );
};

const CourseCreatorForm: React.FC = () => (
  <CourseCreatorProvider>
    <CourseCreatorContent />
  </CourseCreatorProvider>
);

export default CourseCreatorForm;
