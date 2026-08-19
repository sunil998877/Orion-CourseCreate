import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import avatar from '../../assests/avatar.png';
import { GAMMA_THEMES, THEME_CATEGORIES } from '../../utils/themes';
import WarningSign from './WarningSign';
import {
  Check, Clock, ChevronDown, ChevronRight, ChevronLeft, Loader2, FileText, Target,
  Palette, Globe, Zap, Sparkles, Book, BookOpen, Monitor, Eye, CheckCircle2, Pencil,
  Link, Plus, Trash2, ExternalLink, AlertCircle, X, Download, Layers, MapPin, Wrench,
  Rocket, AlertTriangle, Construction, Lightbulb, RefreshCw, Star, LogOut,
  User as UserIcon, Bell
} from 'lucide-react';


const CourseStepTwo: React.FC = () => {
  const {
  step,
  courseData,
  updateCourseData,
  showValidation,
  isDescriptionEditable,
  setIsDescriptionEditable,
  setIsDescriptionModalOpen,
  isRefiningDescription,
  refinePromptOpen,
  setRefinePromptOpen,
  refinePromptText,
  setRefinePromptText,
  goToNextStep,
  goToPrevStep,
  handleRefineDescription,
  containerVariants,
  itemVariants,
  stepVariants
  } = useCourseCreator();

  return (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="pt-6 flex flex-col xl:flex-row gap-8 xl:gap-12 min-h-[600px]"
                >
                  <div className="flex-1 xl:w-[55%] bg-[#0A0A0B]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] max-md:rounded-2xl p-8 md:p-12 max-md:p-5 shadow-2xl relative overflow-hidden group space-y-8">
                    {/* Experience Level Removed from here */}

                    <div>
                      <div className="mb-2 flex justify-between items-center">
                        <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider">High-Level Description</label>
                        {showValidation && (courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0) >= 5000 && (
                          <span className="text-xs font-bold text-amber-500 animate-pulse uppercase tracking-widest flex items-center gap-1">
                            <Zap size={12} fill="currentColor" /> Maximum limit reached
                          </span>
                        )}
                      </div>
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => setIsDescriptionModalOpen(true)}
                          className="absolute left-3 top-4 z-10 p-1.5 rounded-lg transition-all bg-gray-800/80 text-gray-500 hover:text-white hover:bg-gray-700"
                          title="Edit description in full view"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <textarea
                          readOnly={!isDescriptionEditable || isRefiningDescription}
                          className={`w-full bg-gray-800/50 border rounded-2xl p-4 pl-12 min-h-[160px] ${isDescriptionEditable ? 'pb-16' : ''} focus:ring-2 focus:ring-lime-500 outline-none transition-all resize-none ${!isDescriptionEditable || isRefiningDescription ? 'cursor-default text-gray-400' : 'cursor-text text-white'} ${showValidation && (courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0) >= 5000
                            ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                            : showValidation && (!courseData.description?.trim() || courseData.description.trim().split(/\s+/).filter(Boolean).length < 50)
                              ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                              : 'border-gray-700'
                            }`}
                          placeholder="Describe the primary learning outcomes... (Minimum 50 words required)"
                          value={courseData.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                            const words = capitalized.trim().split(/\s+/).filter(Boolean);
                            if (words.length <= 5000) {
                              updateCourseData({ description: capitalized });
                            } else {
                              if (val.length < (courseData.description?.length || 0)) {
                                updateCourseData({ description: capitalized });
                              }
                            }
                          }}
                        />
                        {isRefiningDescription && (
                          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-lime-500/30 z-10">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
                              <span className="text-lime-400 text-sm font-semibold tracking-wide uppercase">Refining Description...</span>
                            </div>
                          </div>
                        )}
                        {showValidation && ((!courseData.description?.trim() || courseData.description.trim().split(/\s+/).filter(Boolean).length < 50) ||
                          (courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0) >= 5000) && (
                            <div className="absolute right-4 top-4 text-amber-500 animate-pulse pointer-events-none">
                              <Zap size={18} fill="currentColor" />
                            </div>
                          )}
                        {isDescriptionEditable && !isRefiningDescription && (
                          <div className="absolute right-4 bottom-4 animate-in fade-in zoom-in-95 duration-200 z-10">
                            <button
                              type="button"
                              onClick={() => setIsDescriptionEditable(false)}
                              className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-black px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-lime-500/30 transition-all uppercase tracking-wide"
                            >
                              <Check size={16} strokeWidth={3} /> SAVE
                            </button>
                          </div>
                        )}
                      </div>

                      {refinePromptOpen && (
                        <div className="mt-3 bg-gray-800/80 p-3 rounded-xl border border-lime-500/30 animate-in fade-in zoom-in-95 duration-200">
                          <label className="block text-xs font-semibold text-lime-400 uppercase tracking-wider mb-2">How should I refine this?</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={refinePromptText}
                              onChange={(e) => setRefinePromptText(e.target.value)}
                              placeholder="e.g., Make it shorter, focus more on beginners..."
                              className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRefineDescription();
                              }}
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

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          Provide a detailed overview of the course goals and curriculum structure.
                        </p>
                        <button
                          type="button"
                          onClick={() => setRefinePromptOpen(!refinePromptOpen)}
                          className="flex items-center gap-1.5 text-xs text-lime-400 hover:text-lime-300 font-semibold uppercase tracking-wider transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Refine with AI
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider">Duration (Hours)</label>
                          {courseData.level && (
                            <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20 animate-in fade-in zoom-in duration-300 flex items-center gap-1">
                              <Sparkles size={10} /> RECOMMENDED BY ORION
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            className={`w-full bg-gray-800/50 border rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-lime-500 outline-none transition-all ${showValidation && (!(courseData.duration?.value) || (courseData.duration?.value ?? 0) <= 0) ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700'
                              }`}
                            placeholder="e.g. 1"
                            value={courseData.duration?.value === 0 ? '' : (courseData.duration?.value ?? '')}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value || 0));
                              // Recommended Modules: 5 modules for 1 hour, ~4-5 modules per hour
                              let recommendedModules = val === 1 ? 5 : (val <= 2 ? val * 5 : val * 4);

                              updateCourseData({
                                duration: { ...(courseData.duration || { value: 0, unit: 'Hours' }), value: val },
                                module: recommendedModules
                              });
                            }}
                          />
                          {showValidation && (!(courseData.duration?.value) || (courseData.duration?.value ?? 0) <= 0) && <WarningSign />}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider">Modules</label>
                          {courseData.level && (
                            <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20 animate-in fade-in zoom-in duration-300 flex items-center gap-1">
                              <Sparkles size={10} /> RECOMMENDED BY ORION
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            className={`w-full bg-gray-800/50 border rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-lime-500 outline-none transition-all ${showValidation && (courseData.module === undefined || courseData.module === null || courseData.module <= 0) ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700'
                              }`}
                            placeholder="e.g. 5"
                            value={courseData.module === 0 ? '' : courseData.module}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                              updateCourseData({ module: val });
                            }}
                          />
                          {showValidation && (courseData.module === undefined || courseData.module === null || courseData.module <= 0) && <WarningSign />}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Each module is designed for 10-15 minutes of direct instructional content.
                        </p>
                      </div>
                    </div>

                    {courseData.level && (
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Duration and Modules are adjustable. Sticking near the recommended values ensures the AI can generate high-quality, balanced content for this specific Experience Level.
                        </p>
                      </div>
                    )}

                    <div className="mt-12 flex justify-between items-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={goToPrevStep}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10"
                        type="button"
                      >
                        <ChevronLeft size={20} /> Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToNextStep}
                        className="flex items-center gap-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 transform hover:-translate-y-0.5"
                        type="button"
                      >
                        Continue <ChevronRight size={20} strokeWidth={3} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Right Side: Orion Guidance for Step 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 xl:w-[45%] bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8"
                  >
                    {/* Background glow lines */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none"></div>

                    <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                      <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
                    </div>

                    <div className="relative z-10">
                      <div className="mb-6 pr-48 text-left min-h-[140px]">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight flex items-center gap-2">
                          Welcome to the second step <Sparkles className="text-lime-400 w-6 h-6 animate-pulse" />
                        </h3>
                        <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                          This step focuses on defining your course overview, <span className="text-lime-400 font-bold">structure</span>, and learning flow.
                        </p>
                      </div>

                      <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                      <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                        <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                          <Layers className="w-4 h-4 text-lime-400" />
                        </span>
                        Step-by-Step Guidance
                      </h4>

                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                      >
                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">1</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">High-Level Description</h5>
                            <p className="text-gray-400 text-xs leading-relaxed">I've generated a draft description for you. Review it to ensure it captures the essence of your course. <span className="text-lime-400">Pro Tip:</span> Use the edit tool to refine the focus—the more specific the description, the better the final modules.</p>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Total Course Duration</h5>
                            <p className="text-gray-400 text-xs leading-relaxed">
                              This value is <span className="text-lime-400 font-bold underline">recommended by me</span> based on your learner level.
                              <br /><br />
                              <span className="text-white font-medium">Scaling Logic:</span> My engine calculates an ideal learning density of <span className="text-lime-400">4–5 modules per hour</span>. Adjusting this duration will automatically recalculate the module count to ensure your course remains balanced and isn't too shallow or too overwhelming.
                            </p>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">3</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Module Allocation</h5>
                            <p className="text-gray-400 text-xs leading-relaxed">
                              This allocation is <span className="text-lime-400 font-bold underline">recommended by me</span> for optimal content breakdown.
                              <br /><br />
                              <span className="text-white font-medium">Automatic Sync:</span> This number is dynamically calculated based on your <span className="text-lime-400">Duration</span> input. If you change the hours, I recalculate the modules so that each section remains focused on a single, digestible learning objective.
                            </p>
                          </div>
                        </motion.div>

                      </motion.div>

                      <div className="mt-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-sm relative overflow-hidden group-hover:bg-amber-500/10 transition-colors duration-500">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-600"></div>
                        <div className="flex items-start gap-3 pl-2">
                          <span className="text-amber-400 mt-0.5 text-lg"><AlertTriangle className="w-5 h-5" /></span>
                          <div>
                            <h6 className="text-amber-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Note</h6>
                            <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">You can adjust duration and modules, but staying close to the recommended values helps maintain content quality and structure.</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                </motion.div>
  );
};

export default CourseStepTwo;
