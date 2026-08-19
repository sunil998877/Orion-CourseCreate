import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Pencil, Sparkles, X } from 'lucide-react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';

const CourseDescriptionModal: React.FC = () => {
  const {
    isDescriptionModalOpen, setIsDescriptionModalOpen, courseData, updateCourseData,
    refinePromptOpen, setRefinePromptOpen, refinePromptText, setRefinePromptText,
    handleRefineDescription, isRefiningDescription
  } = useCourseCreator();

  return (
    <>
      <AnimatePresence>
        {isDescriptionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsDescriptionModalOpen(false)}
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-3xl bg-[#0d0f1a] border border-white/10 rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20">
                    <Pencil className="w-4 h-4 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white tracking-wide">Edit High-Level Description</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">Write a detailed overview of your course goals and curriculum</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDescriptionModalOpen(false)}
                  className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-8 py-6 space-y-4">
                <div className="relative">
                  <textarea
                    autoFocus
                    className="w-full bg-gray-900/60 border border-gray-700 rounded-2xl p-5 min-h-[340px] text-white text-sm leading-relaxed focus:ring-2 focus:ring-lime-500 focus:border-lime-500/50 outline-none transition-all resize-none placeholder:text-gray-600"
                    placeholder="Describe the primary learning outcomes, target skills, curriculum structure, and what makes this course unique... (Minimum 50 words required)"
                    value={courseData.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                      const words = capitalized.trim().split(/\s+/).filter(Boolean);
                      if (words.length <= 5000) {
                        updateCourseData({ description: capitalized });
                      }
                    }}
                  />
                </div>

                {/* Refine with AI row inside modal */}
                {refinePromptOpen && (
                  <div className="bg-gray-800/60 p-4 rounded-xl border border-lime-500/20 animate-in fade-in zoom-in-95 duration-200">
                    <label className="block text-xs font-semibold text-lime-400 uppercase tracking-wider mb-2">How should Orion refine this?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={refinePromptText}
                        onChange={(e) => setRefinePromptText(e.target.value)}
                        placeholder="e.g., Make it shorter, focus more on beginners..."
                        className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRefineDescription(); }}
                      />
                      <button
                        onClick={handleRefineDescription}
                        disabled={isRefiningDescription || !refinePromptText.trim()}
                        className="bg-lime-500 hover:bg-lime-400 text-black px-4 py-2 rounded-lg text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                      >
                        {isRefiningDescription ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Refine
                      </button>
                      <button
                        onClick={() => { setRefinePromptOpen(false); setRefinePromptText(''); }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              
              <div className="flex items-center justify-between px-8 py-5 border-t border-white/5 bg-white/[0.01]">
                <button
                  type="button"
                  onClick={() => setRefinePromptOpen(!refinePromptOpen)}
                  className="flex items-center gap-1.5 text-xs text-lime-400 hover:text-lime-300 font-semibold uppercase tracking-wider transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Refine with AI
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDescriptionModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDescriptionModalOpen(false)}
                    className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-black px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-lime-500/20 transition-all"
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                    Save Description
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CourseDescriptionModal;
