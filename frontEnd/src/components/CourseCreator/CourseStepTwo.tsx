import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import avatar from '../../assests/avatar.png';
import CourseStepIllustration from './CourseStepIllustration';
import {
    AlertCircle,
    AlertTriangle,
    BarChart3,
    BookOpen,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Layers,
    Loader2,
    Pencil,
    Sparkles,
    X,
} from 'lucide-react';

const CourseStepTwo: React.FC = () => {
    const {
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
        stepVariants,
        containerVariants,
        itemVariants,
    } = useCourseCreator();

    const rightCardRef = useRef<HTMLDivElement>(null);
    const [rightCardHeight, setRightCardHeight] = useState<number | undefined>(undefined);

    useEffect(() => {
        const updateHeight = () => {
            if (window.innerWidth >= 1024 && rightCardRef.current) {
                setRightCardHeight(rightCardRef.current.offsetHeight);
            } else {
                setRightCardHeight(undefined);
            }
        };

        updateHeight();

        const ro = new ResizeObserver(() => {
            updateHeight();
        });

        if (rightCardRef.current) {
            ro.observe(rightCardRef.current);
        }
        window.addEventListener('resize', updateHeight);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', updateHeight);
        };
    }, []);

    const description = courseData.description || '';
    const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
    const descriptionValid = description.trim().length > 0 && wordCount >= 50 && wordCount <= 5000;
    const descriptionInvalid = showValidation && (!description.trim() || wordCount < 50 || wordCount >= 5000);
    const durationValid = (courseData.duration?.value ?? 0) > 0;
    const durationInvalid = showValidation && (!(courseData.duration?.value) || (courseData.duration?.value ?? 0) <= 0);
    const moduleValid = (courseData.module ?? 0) > 0;
    const moduleInvalid = showValidation && (courseData.module === undefined || courseData.module === null || courseData.module <= 0);

    const chips = [
        { icon: Sparkles, label: 'AI-Powered Content' },
        { icon: Clock, label: 'Structured Learning' },
        { icon: BarChart3, label: 'Industry Relevant' },
    ];

    return (
        <motion.div
            key="step2"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pt-6 flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-10"
        >

            <div
                style={{ height: rightCardHeight ? `${rightCardHeight}px` : undefined }}
                className="flex-1 lg:w-[58%] w-full rounded-[1.75rem] border border-white/10 bg-[#071018] p-5 text-white shadow-2xl md:p-8 flex flex-col justify-between overflow-hidden"
            >
                <div className="flex-1 min-h-0 overflow-y-auto step-scrollbar pr-2 relative z-10 pb-4">
                    <div className="flex items-start justify-between gap-6 max-2xl:flex-col">
                        <div className="max-w-xl">
                            <p className="text-xs font-bold text-lime-400">Step 2 of 4</p>
                            <div className="mt-2 flex w-56 gap-1.5">
                                <span className="h-1.5 flex-1 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
                                <span className="h-1.5 flex-1 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
                                <span className="h-1.5 flex-1 rounded-full bg-white/15" />
                                <span className="h-1.5 flex-1 rounded-full bg-white/15" />
                            </div>
                            <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-400">Provide key details to help AI create a structured and high-quality course tailored to your goals.</p>
                        </div>
                        <div className="flex items-center gap-4 max-md:w-full max-md:justify-between">
                            <CourseStepIllustration className="w-36 h-32 shrink-0" />
                            <div className="flex flex-col gap-2">
                                {chips.map((chip) => (
                                    <span key={chip.label} className="inline-flex items-center gap-2.5 rounded-full border border-lime-400/35 bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-gray-200 whitespace-nowrap shadow-sm hover:border-lime-400/50 transition-colors">
                                        <chip.icon className="h-3.5 w-3.5 text-lime-400" />
                                        {chip.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-lime-400/25 bg-black/20 p-4 md:p-5">
                        <div className="flex items-start justify-between gap-4 max-md:flex-col">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-lime-400/40 bg-lime-400/10 text-lime-300">
                                    <FileText className="h-4 w-4" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-white">High-Level Description <span className={`text-sm font-bold leading-none ${descriptionInvalid ? 'text-red-400' : 'text-red-500'}`}>*</span></h3>
                                    <p className="mt-1 text-xs text-gray-500">Provide a detailed overview of the course goals and curriculum structure.</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setRefinePromptOpen(!refinePromptOpen)} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-lime-400 px-3 py-2 text-xs font-black text-black hover:bg-lime-300 transition-colors">
                                <Sparkles className="h-3.5 w-3.5" /> Refine with AI
                            </button>
                        </div>
                        <div className="relative mt-4">
                            <textarea
                                readOnly={!isDescriptionEditable || isRefiningDescription}
                                className={`min-h-[150px] w-full resize-none rounded-xl border bg-black/30 p-4 pr-10 text-sm leading-relaxed outline-none transition-all focus:ring-2 focus:ring-lime-500 ${!isDescriptionEditable || isRefiningDescription ? 'cursor-default text-gray-300' : 'text-white'} ${
                                    descriptionInvalid
                                        ? 'border-red-500 ring-1 ring-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)] focus:ring-red-500'
                                        : descriptionValid
                                        ? 'border-lime-500/80 ring-1 ring-lime-500/20 focus:ring-lime-500'
                                        : 'border-white/10 focus:ring-lime-500'
                                }`}
                                placeholder="Describe the primary learning outcomes... (Minimum 50 words required)"
                                value={description}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                                    const words = capitalized.trim().split(/\s+/).filter(Boolean);
                                    if (words.length <= 5000 || val.length < description.length)
                                        updateCourseData({ description: capitalized });
                                }}
                            />
                            <button type="button" onClick={() => setIsDescriptionModalOpen(true)} className="absolute bottom-3 right-3 text-gray-500 hover:text-lime-300" title="Edit description in full view">
                                <Pencil className="h-4 w-4" />
                            </button>
                            {isRefiningDescription && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-lime-500/30 bg-gray-950/70">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-lime-400">
                                        <Loader2 className="h-5 w-5 animate-spin" /> Refining Description...
                                    </div>
                                </div>
                            )}
                            {isDescriptionEditable && !isRefiningDescription && (
                                <button type="button" onClick={() => setIsDescriptionEditable(false)} className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-lg bg-lime-500 px-3 py-1.5 text-[10px] font-black uppercase text-black">
                                    <Check className="h-3.5 w-3.5" /> Save
                                </button>
                            )}
                        </div>
                        <div className="mt-2 flex justify-end text-[11px] text-gray-500">{description.length} / 1500</div>
                        {descriptionInvalid ? (
                            <p className="mt-1.5 text-xs text-red-500 font-medium">Please provide a description with at least 50 words.</p>
                        ) : descriptionValid ? (
                            <p className="mt-1.5 text-xs text-lime-400 font-medium">Looks good!</p>
                        ) : null}
                        {refinePromptOpen && (
                            <div className="mt-3 rounded-xl border border-lime-500/30 bg-black/40 p-3">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-lime-400">How should I refine this?</label>
                                <div className="flex gap-2 max-md:flex-col">
                                    <input type="text" value={refinePromptText} onChange={(e) => setRefinePromptText(e.target.value)} placeholder="e.g., Make it shorter, focus more on beginners..." className="flex-1 rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm text-white outline-none focus:border-lime-500" onKeyDown={(e) => { if (e.key === 'Enter') handleRefineDescription(); }} />
                                    <button onClick={handleRefineDescription} disabled={isRefiningDescription || !refinePromptText.trim()} className="inline-flex items-center gap-2 rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50" type="button">
                                        {isRefiningDescription ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Refine
                                    </button>
                                    <button onClick={() => { setRefinePromptOpen(false); setRefinePromptText(''); }} className="rounded-lg bg-gray-700 px-3 py-2 text-white" type="button"><X className="h-4 w-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-lime-400/30 bg-lime-400/10 text-lime-300"><Clock className="h-3.5 w-3.5" /></span>
                                    <h3 className="text-xs sm:text-sm font-bold truncate">Duration (Hours) <span className={`text-sm font-bold leading-none ${durationInvalid ? 'text-red-400' : 'text-red-500'}`}>*</span></h3>
                                </div>
                                {courseData.level && (
                                    <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[10px] font-bold text-lime-300">
                                        <Sparkles className="h-3 w-3" /> Recommended by Orion
                                    </span>
                                )}
                            </div>
                            <div className={`mt-2 flex items-center rounded-xl border bg-black/30 px-3 transition-all ${
                                durationInvalid
                                    ? 'border-red-500 ring-1 ring-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                                    : durationValid
                                    ? 'border-lime-500/80 ring-1 ring-lime-500/20'
                                    : 'border-white/10 focus-within:border-lime-400 focus-within:ring-1 focus-within:ring-lime-400/30'
                            }`}>
                                <input
                                    type="number"
                                    min="0"
                                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                    className="no-focus-outline w-full bg-transparent py-2 text-base font-semibold text-white border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={courseData.duration?.value === 0 ? '' : (courseData.duration?.value ?? '')}
                                    onChange={(e) => {
                                        const val = Math.max(0, Number(e.target.value || 0));
                                        let recommendedModules = val * 4;
                                        if (val <= 2)
                                            recommendedModules = val * 5;
                                        updateCourseData({
                                            duration: { ...(courseData.duration || { value: 0, unit: 'Hours' }), value: val },
                                            module: recommendedModules
                                        });
                                    }}
                                />
                                <span className="inline-flex items-center gap-2 border-l border-white/10 pl-3 py-1 text-xs text-gray-400 select-none"><Clock className="h-3.5 w-3.5" /> Hours</span>
                            </div>
                            {durationInvalid ? (
                                <p className="mt-1.5 text-xs text-red-500 font-medium">Please provide a valid duration in hours.</p>
                            ) : durationValid ? (
                                <p className="mt-1.5 text-xs text-lime-400 font-medium">Looks good!</p>
                            ) : null}
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-lime-400/30 bg-lime-400/10 text-lime-300"><BookOpen className="h-3.5 w-3.5" /></span>
                                    <h3 className="text-xs sm:text-sm font-bold truncate">Modules <span className={`text-sm font-bold leading-none ${moduleInvalid ? 'text-red-400' : 'text-red-500'}`}>*</span></h3>
                                </div>
                                {courseData.level && (
                                    <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[10px] font-bold text-lime-300">
                                        <Sparkles className="h-3 w-3" /> Recommended by Orion
                                    </span>
                                )}
                            </div>
                            <div className={`mt-2 flex items-center rounded-xl border bg-black/30 px-3 transition-all ${
                                moduleInvalid
                                    ? 'border-red-500 ring-1 ring-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                                    : moduleValid
                                    ? 'border-lime-500/80 ring-1 ring-lime-500/20'
                                    : 'border-white/10 focus-within:border-lime-400 focus-within:ring-1 focus-within:ring-lime-400/30'
                            }`}>
                                <input
                                    type="number"
                                    min="0"
                                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                    className="no-focus-outline w-full bg-transparent py-2 text-base font-semibold text-white border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={courseData.module === 0 ? '' : courseData.module}
                                    onChange={(e) => {
                                        const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                                        updateCourseData({ module: val });
                                    }}
                                />
                                <span className="inline-flex items-center gap-2 border-l border-white/10 pl-3 py-1 text-xs text-gray-400 select-none"><BookOpen className="h-3.5 w-3.5" /> Modules</span>
                            </div>
                            {moduleInvalid ? (
                                <p className="mt-1.5 text-xs text-red-500 font-medium">Please provide at least 1 module.</p>
                            ) : moduleValid ? (
                                <p className="mt-1.5 text-xs text-lime-400 font-medium">Looks good!</p>
                            ) : null}
                        </div>
                    </div>

                    {courseData.level && (
                        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                            <p className="text-sm leading-relaxed text-amber-100/80">Duration and Modules are adjustable. Sticking near the recommended values ensures the AI can generate high-quality, balanced content for this specific Experience Level.</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={goToPrevStep} className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-5 py-3 text-sm font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all" type="button">
                        <ChevronLeft className="h-4 w-4" /> Back
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={goToNextStep} className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3 text-sm font-black text-black shadow-[0_0_24px_rgba(163,230,53,0.35)] hover:bg-lime-300 transition-all" type="button">
                        Continue <ChevronRight className="h-4 w-4" />
                    </motion.button>
                </div>
            </div>

            <motion.div
                ref={rightCardRef}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 lg:w-[42%] w-full bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8 max-md:rounded-2xl max-md:p-4 max-md:static"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none" />

                <div className="absolute top-8 right-8 w-28 h-28 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                    <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
                </div>

                <div className="relative z-10">
                    <div className="mb-6 pr-32 text-left min-h-[120px] max-md:pr-0 max-md:min-h-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight flex items-center gap-2">
                            Welcome to the second step <Sparkles className="text-lime-400 w-5 h-5 animate-pulse" />
                        </h3>
                        <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                            This step focuses on defining your course overview, <span className="text-lime-400 font-bold">structure</span>, and learning flow.
                        </p>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6" />

                    <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                        <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                            <Layers className="w-4 h-4 text-lime-400" />
                        </span>
                        Step-by-Step Guidance
                    </h4>

                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">1</div>
                            <div>
                                <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">High-Level Description</h5>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    Review the generated course overview (minimum 50 words required).{' '}
                                    <span className="text-lime-400 font-semibold">Pro Tip:</span> Click the <span className="text-lime-400 font-bold">"Refine with AI"</span> button to prompt adjustments (e.g., make it punchier, focus more on beginners), or click the pencil icon to edit in full view.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                            <div>
                                <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Total Course Duration (Hours)</h5>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    This value is <span className="text-lime-400 font-bold underline">recommended by Orion</span> based on your chosen complexity level.
                                    <br /><br />
                                    <span className="text-white font-medium">Scaling Logic:</span> My engine calculates an ideal learning density of{' '}
                                    <span className="text-lime-400 font-semibold">4–5 modules per hour</span>. Adjusting this duration will automatically recalculate the module count to ensure your course remains balanced and engaging.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">3</div>
                            <div>
                                <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Module Allocation</h5>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    This allocation is <span className="text-lime-400 font-bold underline">recommended by Orion</span> for optimal content breakdown.
                                    <br /><br />
                                    <span className="text-white font-medium">Automatic Sync:</span> This number is dynamically synced with your{' '}
                                    <span className="text-lime-400 font-semibold">Duration</span> input. You can keep the recommended value or manually adjust the module count to match your custom curriculum structure.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="mt-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-sm relative overflow-hidden group-hover:bg-amber-500/10 transition-colors duration-500">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-600" />
                        <div className="flex items-start gap-3 pl-2">
                            <span className="text-amber-400 mt-0.5 text-lg"><AlertTriangle className="w-5 h-5" /></span>
                            <div>
                                <h6 className="text-amber-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Note</h6>
                                <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">
                                    You can adjust duration and modules, but staying close to the recommended values helps maintain content quality and structure.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
export default CourseStepTwo;
