import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import avatar from '../../assests/avatar.png';
import { GAMMA_THEMES } from '../../utils/themes';
import ThemeModal from './ThemeModal';
import ModuleList from './ModuleList';
import {
    ChevronRight, ChevronLeft, Zap, Sparkles, AlertTriangle,
    Construction, Lightbulb, RefreshCw, Layers, Rocket
} from 'lucide-react';


const CourseStepFour: React.FC = () => {
    const {
        courseData,
        isBlueprinting,
        hasBlueprint,
        previewModules,
        blueprintingProgress,
        setThemeByModule,
        showGenerateWarning,
        setShowGenerateWarning,
        goToNextStep,
        goToPrevStep,
        generateOrionPreview,
        stepVariants,
        containerVariants,
        itemVariants
    } = useCourseCreator();

    return (
        <motion.div
            key="step4"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pt-6 flex flex-col xl:flex-row gap-8 xl:gap-12 min-h-[600px] h-full"
        >
            {/* Left Side: Form Content */}
            <div className="flex-1 xl:w-[66%] bg-[#0A0A0B]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] max-md:rounded-2xl p-8 md:p-12 max-md:p-5 shadow-2xl relative overflow-hidden group flex flex-col h-full">
                {!hasBlueprint && !isBlueprinting ? (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                            <div className="bg-gray-800/50 p-8 rounded-full mb-6 border border-gray-700">
                                <Sparkles className="w-16 h-16 text-lime-400" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Module Blueprinting</h2>
                            <p className="text-gray-400 max-w-lg mb-10 leading-relaxed">
                                Based on your inputs, ORION is ready to architect {courseData.module} specialized modules for <span className="text-lime-400">"{courseData.title || 'Your Course'}"</span>.
                            </p>
                            <div className="relative group">
                                {/* Confirmation Popup */}
                                <AnimatePresence>
                                    {showGenerateWarning && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-72 bg-[#1a1c24] border border-red-500/30 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-xl"
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                                                    <AlertTriangle className="text-red-500 w-6 h-6 animate-pulse" />
                                                </div>
                                                <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Are you sure?</h4>
                                                <p className="text-gray-400 text-[11px] leading-relaxed mb-4">
                                                    Once generation begins, <span className="text-red-400 font-bold underline">there's no turning back</span>. Your core settings will be locked in to architect the modules.
                                                </p>
                                                <div className="flex gap-2 w-full">
                                                    <button
                                                        onClick={() => setShowGenerateWarning(false)}
                                                        className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        No
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowGenerateWarning(false);
                                                            generateOrionPreview();
                                                        }}
                                                        className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                                                    >
                                                        Yes
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-[#1a1c24]"></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    onClick={() => setShowGenerateWarning(true)}
                                    className="flex items-center gap-3 bg-lime-500 hover:bg-lime-400 text-black px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-lime-500/20"
                                    type="button"
                                >
                                    <Zap size={24} /> Generate Modules
                                </button>
                            </div>
                        </div>
                        <div className="mt-auto pt-8 flex justify-start">
                            <button
                                onClick={goToPrevStep}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                                type="button"
                            >
                                <ChevronLeft size={20} /> Back
                            </button>
                        </div>
                    </div>
                ) : isBlueprinting ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <div className="relative w-44 h-44 mb-10">
                            <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
                            <div
                                className="absolute inset-0 rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(132,204,22,0.15)]"
                                style={{
                                    background: `conic-gradient(#84cc16 ${blueprintingProgress}%, transparent ${blueprintingProgress}%)`,
                                    WebkitMask: 'radial-gradient(transparent 64%, black 65%)',
                                    mask: 'radial-gradient(transparent 64%, black 65%)'
                                }}
                            />
                            <div className="absolute inset-0 border-4 border-lime-500/20 rounded-full border-t-transparent animate-spin" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Zap className="text-lime-400 w-12 h-12 animate-pulse mb-1 drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]" />
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-4xl font-black text-white tracking-tight">{Math.round(blueprintingProgress)}</span>
                                    <span className="text-lg font-bold text-lime-500">%</span>
                                </div>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-3">Architecting Modules</h2>
                        <p className="text-gray-400 animate-pulse font-mono uppercase text-xs tracking-widest mb-10">Compiling datasets & structuring learning paths...</p>

                        <div className="w-full max-w-md">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 px-1">
                                <span>Progress</span>
                                <span>Module {Math.min(Math.floor((blueprintingProgress / 100) * (courseData.module || 1)) + 1, courseData.module || 1)} of {courseData.module}</span>
                            </div>
                            <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden border border-gray-700 p-0.5 shadow-inner">
                                <div
                                    className="bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                                    style={{ width: `${blueprintingProgress}%` }}
                                />
                            </div>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {Array.from({ length: courseData.module ?? 0 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all duration-500 ${idx < Math.floor((blueprintingProgress / 100) * (courseData.module || 1)) ? 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.6)]' : 'bg-gray-800'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                            <div>
                                <h2 className="text-4xl font-black tracking-tight text-white mb-2">Curriculum Blueprint</h2>
                                <div className="flex items-center gap-2">
                                    <p className="text-gray-400 text-sm font-medium">Here is your Curriculum Blueprint — review and finalize the course structure, modules.</p>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                                        <AlertTriangle size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Navigation Locked</span>
                                    </div>
                                </div>
                                <p className="text-red-400/80 text-[11px] font-bold mt-1 uppercase tracking-widest italic">Once generated, you won’t be able to return to this section.</p>
                            </div>

                            <button
                                onClick={() => {
                                    const shuffled: Record<number, string> = {};
                                    previewModules.forEach((m: any) => {
                                        shuffled[m.id] = GAMMA_THEMES[Math.floor(Math.random() * GAMMA_THEMES.length)].id;
                                    });
                                    setThemeByModule(shuffled);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-lime-400 rounded-xl border border-white/10 transition-all font-bold text-[10px] uppercase tracking-widest group"
                                type="button"
                            >
                                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Shuffle Themes
                            </button>

                        </div>

                        {/* Theme Modal */}
                        <ThemeModal />
                        <ModuleList />

                        <div className="mt-auto pt-8 flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToNextStep}
                                className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-lime-500/20 transition-all"
                                type="button"
                            >
                                Looks Good, Continue <ChevronRight size={20} />
                            </motion.button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Orion Guidance for Step 4 */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 xl:w-[30%] xl:ml-auto bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none"></div>

                <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                    <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
                </div>

                <div className="relative z-10 flex flex-col h-full max-h-[80vh]">
                    {!hasBlueprint ? (
                        <>
                            <div className="mb-6 pr-48 text-left min-h-[140px]">
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                                    Design the Blueprint <Construction className="inline-block w-5 h-5 ml-1 text-lime-400" />
                                </h3>
                                <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                                    In this section, I am going to architecture the modules for you. Please wait while I process the information.
                                    <span className="block mt-2 text-red-400 font-bold italic">Once you click 'Generate Modules', you cannot change any setting by going back.</span>
                                </p>
                            </div>

                            <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                                <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                                    <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                                        <Lightbulb className="w-4 h-4 text-lime-400" />
                                    </span>
                                    Guidance
                                </h4>

                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-6"
                                >
                                    <motion.div variants={itemVariants} className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                                        <h5 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">What Happens Here?</h5>
                                        <ul className="text-gray-400 text-xs space-y-2 leading-relaxed">
                                            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-lime-500"></div>Curating specialized lesson topics</li>
                                            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-lime-500"></div>Balanced learning progression</li>
                                            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-lime-500"></div>Content aligned with your selected style and level</li>
                                        </ul>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">1</div>
                                        <div>
                                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Generate Module</h5>
                                            <p className="text-gray-400 text-xs leading-relaxed">Click Generate module and I will synthesize all your inputs—title, files, and description—to build a logical flow of modules.</p>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                                        <div>
                                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Review & Edit Blueprint</h5>
                                            <p className="text-gray-400 text-xs leading-relaxed">Once the curriculum appears, you can hover over any module to edit titles or reorder them. This is your chance to fine-tune the story before slide creation.</p>
                                        </div>
                                    </motion.div>
                                </motion.div>

                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-6 pr-48 text-left min-h-[140px]">
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                                    Curriculum Blueprint <Rocket className="inline-block w-5 h-5 ml-1 text-lime-400" />
                                </h3>
                                <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                                    This step focuses on reviewing your course <span className="text-lime-400 font-bold">structure</span> and preparing your final module content for generation.
                                    <span className="block mt-2 text-red-400 font-bold italic">Once the course is generated you cannot navigate to previous steps.</span>
                                </p>
                            </div>

                            <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                                <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                                    <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                                        <Layers className="w-4 h-4 text-lime-400" />
                                    </span>
                                    Advanced Blueprint Tools
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
                                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Review Generated Module content</h5>
                                            <p className="text-gray-400 text-xs leading-relaxed">Click view button inside each module and walk through the module wise content. I've logicaly organized your topics into a sequence that ensures a smooth learning curve for the students. But still You can adjust the module content by scrolling down at the buttom of that section which is named as "<span className="text-lime-400 font-bold">Refine Your Architecture</span>".</p>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                                        <div>
                                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Review Generated Module Slide Content</h5>
                                            <p className="text-gray-400 text-xs leading-relaxed">Click the Slides button inside each module to preview the automatically generated slide content. I have transformed your lesson structure into clear, engaging slides designed for effective learning delivery.</p>
                                        </div>
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">3</div>
                                        <div>
                                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Choose slide theme</h5>
                                            <p className="text-gray-400 text-xs leading-relaxed">Before generating slide i have added choose theme section in each module section by clicking change button you can select desired theme "<span className="text-lime-400 font-bold">note: you can change the theme for each slide seperately </span>"</p>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">4</div>
                                        <div>
                                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Final Slide Engine</h5>
                                            <p className="text-gray-400 text-xs leading-relaxed">Once satisfied, and choosed the theme click <span className="text-lime-400 font-bold">'Generate Orion Slides'</span> . and once you click Generate orion slide I'll start generating slides based on you input and"<span className="text-lime-400 font-bold"> please wait it may take some time based on the modules you have selected. </span>" </p>
                                        </div>
                                    </motion.div>



                                    <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">5</div>
                                        <div>
                                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Next (Final Review)</h5>
                                            <p className="text-gray-400 text-xs leading-relaxed">After generating slides, click 'Continue' to perform the final review before launching your course.</p>
                                        </div>
                                    </motion.div>
                                </motion.div>

                                {/* ── AUTO-GENERATE HIGHLIGHT CALLOUT ── */}
                                <motion.div
                                    variants={itemVariants}
                                    className="relative mt-6 rounded-2xl overflow-hidden border border-lime-500/40 bg-gradient-to-br from-lime-500/10 via-emerald-500/5 to-transparent p-4 shadow-[0_0_24px_rgba(132,204,22,0.12)]"
                                    style={{ animation: 'pulse-lime-border 2.5s ease-in-out infinite' }}
                                >
                                    {/* Glow blob */}
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-lime-500/20 rounded-full blur-2xl pointer-events-none" />

                                    {/* Header row */}
                                    <div className="flex items-center gap-2 mb-2 relative z-10">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-lime-500/20 border border-lime-500/40 shadow-inner shrink-0">
                                            <Zap className="w-4 h-4 text-lime-400 fill-lime-400" />
                                        </span>
                                        <h5 className="text-lime-400 font-black text-[11px] uppercase tracking-[0.18em]">
                                            Auto-Generate on Continue
                                        </h5>
                                        {/* <span className="ml-auto px-2 py-0.5 rounded-full bg-lime-500/20 border border-lime-500/30 text-lime-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
                                  NEW
                                </span> */}
                                    </div>

                                    {/* Body */}
                                    <p className="text-gray-300 text-xs leading-relaxed relative z-10">
                                        Clicking{' '}
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-lime-500 text-black font-black text-[10px] tracking-wide shadow-md shadow-lime-500/30 mx-0.5">
                                            Looks Good, Continue <ChevronRight className="w-3 h-3" />
                                        </span>{' '}
                                        will <span className="text-lime-400 font-bold">automatically start generating Orion Slides</span> for{' '}
                                        <span className="text-white font-bold">all your modules at once</span> — no need to click{' '}
                                        <span className="text-gray-200 font-semibold italic">"Generate Orion Slides"</span> individually on each module.
                                    </p>

                                    <div className="mt-3 flex items-center gap-1.5 relative z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                                        <p className="text-gray-400 text-[10px] italic">
                                            Sit back — batch generation will run automatically in the background.
                                        </p>
                                    </div>
                                </motion.div>

                            </div>
                        </>
                    )}


                    <div className="mt-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm relative overflow-hidden transition-colors duration-500 hover:bg-gray-800/50 mx-1 shrink-0">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-500 to-gray-700"></div>
                        <div className="flex items-start gap-4 pl-2">
                            <span className="text-gray-400 bg-gray-800/80 p-1.5 rounded-lg border border-gray-700"><Zap className="w-4 h-4 text-lime-400" /></span>
                            <div>
                                <h6 className="text-gray-300 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Tip</h6>
                                <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">Make sure your previous inputs are accurate, as the generated modules will directly depend on them.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 pb-2 text-center shrink-0">
                        <p className="text-gray-500 text-xs font-semibold tracking-wide">
                            "Once you're ready, continue—I'll take care of the next step." <Sparkles className="inline-block w-4 h-4 text-lime-400" />
                        </p>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
};

export default CourseStepFour;
