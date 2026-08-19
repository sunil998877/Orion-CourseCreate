import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Monitor, Sparkles, Zap, Check, Clock } from 'lucide-react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';

const BatchGenerationOverlay: React.FC = () => {
    const {
        isBatchGenerating, batchSlidesProgress, batchSlidesDisplayProgress,
        batchGeneratingModuleId, batchSelectedModuleIdForPreview, previewModules,
        orionUrlByModule, setBatchSelectedModuleIdForPreview
    } = useCourseCreator();

    return (
        <AnimatePresence>
            {isBatchGenerating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-xl"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-[#0B0C10] border border-white/[0.08] w-full max-w-7xl h-[88vh] rounded-[2.5rem] p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row gap-8 backdrop-blur-3xl"
                    >
                        {/* Left Side: Progress tracker and Scrollable Module list */}
                        <div className="w-full md:w-[38%] flex flex-col h-full min-h-0 border-r border-white/5 pr-0 md:pr-8">
                            <div className="relative shrink-0 flex items-center gap-5 mb-6">
                                {/* Progress Circle container */}
                                <div className="relative w-24 h-24 shrink-0">
                                    <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
                                    <div
                                        className="absolute inset-0 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(132,204,22,0.15)]"
                                        style={{
                                            background: `conic-gradient(#84cc16 ${batchSlidesDisplayProgress}%, transparent ${batchSlidesDisplayProgress}%)`,
                                            WebkitMask: 'radial-gradient(transparent 64%, black 65%)',
                                            mask: 'radial-gradient(transparent 64%, black 65%)'
                                        }}
                                    />
                                    <div className="absolute inset-0 border-4 border-lime-500/10 rounded-full border-t-transparent animate-spin" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <Zap className="text-lime-400 w-6 h-6 animate-pulse mb-0.5" />
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-xl font-black text-white tracking-tight">{Math.round(batchSlidesDisplayProgress)}</span>
                                            <span className="text-[10px] font-bold text-lime-500">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left">
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5 tracking-tight flex items-center gap-2">
                                        Live Studio <Sparkles className="w-5 h-5 text-lime-400 animate-pulse" />
                                    </h3>
                                    <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
                                        Orion is baking slide layouts. Click any <span className="text-lime-400 font-bold">Ready</span> module to watch the slides!
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar info */}
                            <div className="shrink-0 mb-6 bg-gray-900/40 border border-white/5 p-4 rounded-2xl">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                    <span>Batch Generation</span>
                                    <span>Module {Math.min(batchSlidesProgress.completed + 1, batchSlidesProgress.total)} of {batchSlidesProgress.total}</span>
                                </div>
                                <div className="w-full bg-gray-800/40 rounded-full h-2 overflow-hidden border border-gray-800 p-0.5">
                                    <div
                                        className="bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(132,204,22,0.4)]"
                                        style={{ width: `${batchSlidesDisplayProgress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="shrink-0 text-xs font-black uppercase tracking-widest text-gray-500 mb-3 text-left">Modules status</div>

                            {/* Module List scrollbox */}
                            <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 custom-scrollbar min-h-0">
                                {previewModules.map((mod: any) => {
                                    const isGenerated = !!orionUrlByModule[mod.id];
                                    const isGenerating = batchGeneratingModuleId === mod.id;
                                    const activePreviewId = batchSelectedModuleIdForPreview || batchGeneratingModuleId || (previewModules[0]?.id);
                                    const isActive = activePreviewId === mod.id;

                                    return (
                                        <button
                                            key={mod.id}
                                            onClick={() => isGenerated && setBatchSelectedModuleIdForPreview(mod.id)}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group/item ${isActive
                                                ? 'border-lime-500/80 bg-lime-500/[0.07] shadow-[0_0_20px_rgba(132,204,22,0.05)]'
                                                : isGenerated
                                                    ? 'border-gray-800/60 bg-gray-900/20 hover:border-gray-700 hover:bg-gray-800/30'
                                                    : 'border-gray-800/40 bg-gray-900/10 cursor-not-allowed opacity-60'
                                                }`}
                                            disabled={!isGenerated}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isActive
                                                    ? 'bg-lime-500 text-black'
                                                    : isGenerated
                                                        ? 'bg-lime-500/10 text-lime-400'
                                                        : 'bg-gray-800 text-gray-500'
                                                    }`}>
                                                    {mod.id}
                                                </span>
                                                <span className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-white' : 'text-gray-300 group-hover/item:text-white'
                                                    }`}>
                                                    {mod.title}
                                                </span>
                                            </div>

                                            {/* Status indicators */}
                                            <div className="shrink-0 flex items-center gap-2">
                                                {isGenerated ? (
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase text-emerald-400">
                                                        <Check className="w-3 h-3" /> Ready
                                                    </span>
                                                ) : isGenerating ? (
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-[9px] font-black uppercase text-lime-400 animate-pulse">
                                                        <Loader2 className="w-3 h-3 animate-spin" /> Baking
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-[9px] font-black uppercase text-gray-500">
                                                        <Clock className="w-3 h-3" /> Queued
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Side: Interactive Slide Preview container */}
                        <div className="flex-1 flex flex-col h-full min-h-0 bg-black/50 border border-white/[0.04] rounded-3xl overflow-hidden relative shadow-inner">
                            {(() => {
                                const activePreviewId = batchSelectedModuleIdForPreview || batchGeneratingModuleId || (previewModules[0]?.id);
                                const activeUrl = activePreviewId ? orionUrlByModule[activePreviewId] : null;

                                if (activeUrl) {
                                    return (
                                        <div className="w-full h-full flex flex-col relative animate-in fade-in duration-500">
                                            {/* Interactive floating indicator */}
                                            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-lime-500/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-lime-400 shadow-lg">
                                                <div className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                                                <span>Previewing Module {activePreviewId} Generated Deck</span>
                                            </div>
                                            <iframe
                                                src={activeUrl.replace('/docs/', '/embed/').replace('/view/', '/embed/')}
                                                className="w-full h-full border-0 bg-transparent relative z-0"
                                                allowFullScreen
                                                title="Generated Slide deck preview"
                                            />
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden h-full">
                                            {/* Glow spots */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

                                            <div className="relative z-10 flex flex-col items-center max-w-sm">
                                                <div className="relative p-6 bg-lime-500/10 border border-lime-500/20 rounded-full mb-6">
                                                    <Monitor className="w-10 h-10 text-lime-400 animate-pulse" />
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lime-500 animate-ping" />
                                                </div>

                                                <h3 className="text-lg font-black text-white tracking-wide mb-2">
                                                    Designing Module {activePreviewId} Slides
                                                </h3>
                                                <p className="text-gray-400 text-xs leading-relaxed mb-6 max-w-xs font-medium">
                                                    Orion is compiling layouts, templates, and interactive media segments in the background. The live deck will auto-load here in seconds.
                                                </p>

                                                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-lime-500/60 uppercase">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Working...
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BatchGenerationOverlay;
