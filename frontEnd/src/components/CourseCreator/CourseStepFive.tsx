import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import avatar from '../../assests/avatar.png';
import { GAMMA_THEMES, THEME_CATEGORIES } from '../../utils/themes';
import { formatAudience } from '../../utils/courseHelpers';
import WarningSign from './WarningSign';
import {
    Check, Clock, ChevronDown, ChevronRight, ChevronLeft, Loader2, FileText, Target,
    Palette, Globe, Zap, Sparkles, Book, BookOpen, Monitor, Eye, CheckCircle2, Pencil,
    Link, Plus, Trash2, ExternalLink, AlertCircle, X, Download, Layers, MapPin, Wrench,
    Rocket, AlertTriangle, Construction, Lightbulb, RefreshCw, Star, LogOut,
    User as UserIcon, Bell
} from 'lucide-react';


const CourseStepFive: React.FC = () => {
    const {
        step,
        courseData,
        updateCourseData,
        isGeneratingSlides,
        isGeneratingContent,
        previewModules,
        selectedModule,
        selectedSlide,
        setSelectedModule,
        setSelectedSlide,
        isPreviewLoading,
        isDescriptionModalOpen,
        setIsDescriptionModalOpen,
        isRefiningDescription,
        refinePromptOpen,
        setRefinePromptOpen,
        refinePromptText,
        setRefinePromptText,
        prefetchedSlidesMap,
        orionUrlByModule,
        isBatchGenerating,
        batchSlidesProgress,
        batchSlidesDisplayProgress,
        batchGeneratingModuleId,
        batchSelectedModuleIdForPreview,
        refineProgress,
        downloadingModuleId,
        goToPrevStep,
        handleRefineDescription,
        regenerateSingleModule,
        refineSingleModule,
        downloadModulePPTX,
        openSlidesPreview,
        handleLaunchCourse,
        moduleCredits,
        stepVariants,
        containerVariants,
        itemVariants
    } = useCourseCreator();

    return (
        <motion.div
            key="step5"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pt-6 flex flex-col xl:flex-row gap-8 xl:gap-12 min-h-[600px] h-full"
        >
            {/* Left Side: Form Content */}
            <div className="flex-1 xl:w-[55%] bg-[#0A0A0B]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] max-md:rounded-2xl p-8 md:p-12 max-md:p-5 shadow-2xl relative overflow-hidden group flex flex-col h-full">
                <div className="grid lg:grid-cols-3 gap-8 mb-10 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar flex-1">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-800">
                            <h4 className="text-xs font-black text-lime-500 uppercase tracking-widest mb-4">Specs Snapshot</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500">TITLE</p>
                                    <p className="font-bold text-white leading-tight">{courseData.title || 'Untitled Course'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">LEVEL</p>
                                        <p className="font-bold text-white">{courseData.level}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">DURATION</p>
                                        <p className="font-bold text-white">{courseData.duration?.value ?? 0} {courseData.duration?.unit ?? 'Hours'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">AUDIENCE</p>
                                    <p className="text-sm text-gray-300 italic">"{formatAudience(courseData.audience)}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        {previewModules.map((mod: any) => (
                            <div key={mod.id} className="group bg-gray-800/30 hover:bg-gray-800/60 p-6 rounded-3xl border border-gray-800 transition-all">
                                <div className="flex justify-between items-center mb-1">
                                    <h5 className="font-bold text-lg text-white group-hover:text-lime-400 transition-colors">Module {mod.id}: {mod.title}</h5>
                                    <span className="text-[10px] font-black bg-gray-700 px-2 py-1 rounded text-gray-400 tracking-tighter">CERTIFIED</span>
                                </div>
                                <div className="flex items-center gap-1.5 mb-4">
                                    <div className="px-2 py-0.5 rounded-md bg-lime-500/10 border border-lime-500/20 text-[9px] font-black text-lime-400 uppercase tracking-wider flex items-center gap-1">
                                        <Zap size={10} className="fill-lime-400" /> {moduleCredits[mod.id] || 0} Credits
                                    </div>
                                </div>
                                {prefetchedSlidesMap[mod.id]?.Slides?.length > 0 && (
                                    <div className="pt-2 flex gap-2">
                                        {orionUrlByModule[mod.id] && (
                                            <button
                                                onClick={() => openSlidesPreview(mod.id, true)}
                                                disabled={isPreviewLoading}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase rounded-xl border border-lime-500/20 text-lime-400 bg-lime-500/10 hover:bg-lime-500/20 transition-all disabled:opacity-50"
                                                type="button"
                                            >
                                                <Book size={14} />
                                                View Deck
                                            </button>
                                        )}
                                        <button
                                            onClick={() => downloadModulePPTX(mod.id)}
                                            disabled={downloadingModuleId === mod.id}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase bg-lime-500/10 hover:bg-lime-500/20 rounded-xl border border-lime-500/20 text-lime-400 transition-all disabled:opacity-50"
                                            type="button"
                                        >
                                            {downloadingModuleId === mod.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Download size={14} />
                                            )}
                                            {downloadingModuleId === mod.id ? 'Downloading...' : 'Download PPTX'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-auto pt-6 border-t border-gray-800 flex justify-between items-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={goToPrevStep}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                        type="button"
                    >
                        <ChevronLeft size={20} /> Back to Blueprint
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLaunchCourse}
                        className="flex items-center gap-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
                        type="button"
                        disabled={isGeneratingSlides || isGeneratingContent}
                    >
                        {isGeneratingContent ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        Launch Course
                    </motion.button>
                </div>
            </div>

            {/* Right Side: Orion Guidance for Step 5 */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 xl:w-[45%] bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none"></div>

                <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                    <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
                </div>

                <div className="relative z-10 flex flex-col h-full max-h-[80vh]">
                    <div className="mb-6 pr-48 text-left min-h-[140px]">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                            Final Review & Launch <Rocket className="inline-block w-5 h-5 ml-1 text-lime-400" />
                        </h3>
                        <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                            You’re all set <CheckCircle2 className="inline-block w-5 h-5 ml-1 text-lime-400" /><br />This is the final step where you review your course and prepare to <span className="text-lime-400 font-bold">launch</span> it.
                        </p>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                            <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                                <Layers className="w-4 h-4 text-lime-400" />
                            </span>
                            What You Can Do Here
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
                                    <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Specs Snapshot</h5>
                                    <p className="text-gray-400 text-xs leading-relaxed">Review the final metadata of your course—Learner level, Style, and Duration. This ensures all background settings are locked in correctly.</p>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                                <div>
                                    <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Asset Delivery</h5>
                                    <p className="text-gray-400 text-xs leading-relaxed">Download your **PPTX** file directly or use the **Slide Deck** generator for advanced visual styling. All your generated content is bundled here.</p>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">3</div>
                                <div>
                                    <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Final Launch</h5>
                                    <p className="text-gray-400 text-xs leading-relaxed">Hit **'Launch Course'** to finalize the project in the system. This saves all your work to your main dashboard.</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        <div className="mt-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-sm relative overflow-hidden group-hover:bg-amber-500/10 transition-colors duration-500 mb-2">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-600"></div>
                            <div className="flex items-start gap-3 pl-2">
                                <span className="text-amber-400 mt-0.5 text-lg"><Zap className="w-5 h-5" /></span>
                                <div>
                                    <h6 className="text-amber-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Final Note</h6>
                                    <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">Your course is now fully structured and ready to deliver a complete learning experience.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm relative overflow-hidden transition-colors duration-500 hover:bg-gray-800/50 mx-1 shrink-0">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-500 to-gray-700"></div>
                        <div className="flex items-start gap-4 pl-2">
                            <span className="text-gray-400 bg-gray-800/80 p-1.5 rounded-lg border border-gray-700"><ChevronLeft size={16} /></span>
                            <div>
                                <h6 className="text-gray-300 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Navigation Help</h6>
                                <p className="text-gray-400 text-xs italic opacity-90 leading-relaxed max-w-[95%]">
                                    Click <span className="text-gray-300 font-semibold">Exit Architect</span> at the top right to return back to the dashboard "<span className="text-red-500 font-semibold"> once you click the exit button you can can't return back to the course creator form</span> ."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 pb-2 text-center shrink-0">
                        <p className="text-lime-400 text-xs font-bold tracking-wide uppercase">
                            “Launch your course and start sharing your knowledge →” <Rocket className="inline-block w-5 h-5 ml-1 text-lime-400" />
                        </p>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
};

export default CourseStepFive;
