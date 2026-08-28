import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import avatar from '../../assests/avatar.png';
import WarningSign from './WarningSign';
import { Check, ChevronDown, ChevronRight, Loader2, FileText, Target, Palette, Globe, Zap, Sparkles, Plus, MapPin, Wrench, Rocket, X, Layers } from 'lucide-react';
const REGION_OPTIONS = ['Australia', 'Canada', 'India', 'United States', 'London (UK)'];
const STANDARD_OPTIONS = ['Global (ISO/IEC)', 'Regional', 'Industry Specific'];
const STYLE_OPTIONS = [
    'Academic / Formal Style',
    'Storytelling Style',
    'Interactive Coaching Style',
    'Humanized Teaching Style',
    'Modern Edutainment Style',
    'Scenario-Based Style',
];
const CourseStepOne: React.FC = () => {
    const { courseData, updateCourseData, showValidation, isGeneratingDescription, setIsCustomAudience, isAudienceDropdownOpen, setIsAudienceDropdownOpen, customAudienceInput, setCustomAudienceInput, goToNextStep, containerVariants, itemVariants, stepVariants, hasAudience, AUDIENCE_OPTIONS, INDUSTRIES } = useCourseCreator();
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
    const [isStandardsDropdownOpen, setIsStandardsDropdownOpen] = useState(false);
    const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
    const [customCountryInput, setCustomCountryInput] = useState('');
    const [customIndustryInput, setCustomIndustryInput] = useState('');
    const addCustomCountry = () => {
        const capitalized = customCountryInput.trim().charAt(0).toUpperCase() + customCountryInput.trim().slice(1);
        if (!capitalized)
            return;
        updateCourseData({ country: capitalized });
        setCustomCountryInput('');
        setIsCountryDropdownOpen(false);
    };
    const addCustomIndustry = () => {
        const capitalized = customIndustryInput.trim().charAt(0).toUpperCase() + customIndustryInput.trim().slice(1);
        if (!capitalized)
            return;
        updateCourseData({ industry: capitalized });
        setCustomIndustryInput('');
        setIsIndustryDropdownOpen(false);
    };
    return (<motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="pt-6 flex flex-col xl:flex-row gap-8 xl:gap-12">

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex-1 xl:w-[65%] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative overflow-visible group/card shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)] max-md:rounded-2xl max-md:p-4">
                <div className="absolute inset-0 rounded-[2.5rem] max-md:rounded-2xl bg-gradient-to-br from-lime-500/[0.02] to-transparent pointer-events-none overflow-hidden"/>
                <motion.div variants={itemVariants} className="mb-12 text-center relative z-10">
                    <label className="block text-[10px] font-black text-white/40 mb-6 uppercase tracking-[0.3em] max-md:mb-3 max-md:tracking-wider group-hover/card:text-lime-400 transition-colors">Cognitive complexity Level</label>
                    <div className="w-full max-w-2xl mx-auto grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-3xl shadow-2xl md:grid-cols-4 md:gap-1 md:p-2 md:rounded-[2rem]">
                        {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map(lvl => (<button key={lvl} onClick={() => {
                updateCourseData({ level: lvl });
                setIsCustomAudience(false);
            }} className={`flex items-center justify-center text-center min-w-0 w-full px-2 py-3 text-[10px] leading-tight font-black rounded-xl transition-all duration-500 uppercase tracking-wide whitespace-normal md:px-1 md:py-4 md:text-[11px] md:leading-normal md:rounded-2xl md:tracking-wider lg:text-xs lg:tracking-widest ${courseData.level === lvl
                ? 'bg-lime-500 text-black shadow-[0_0_30px_rgba(132,204,22,0.4)] z-10 font-black'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`} type="button">
                                {lvl}
                            </button>))}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider group-hover:text-lime-500 transition-colors">Course Title</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5"/>
                                <input className={`w-full bg-gray-800/50 border rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-lime-500 outline-none transition-all ${showValidation && !courseData.title?.trim() ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700'}`} placeholder="e.g. Masterclass in Quantum SEO" value={courseData.title} onChange={(e) => {
            const val = e.target.value;
            const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
            updateCourseData({ title: capitalized });
        }}/>
                                {showValidation && !courseData.title?.trim() && <WarningSign />}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Target Audience</label>
                            <div className="relative">
                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5"/>
                                {!courseData.level ? (<div className="relative group opacity-60">
                                        <input disabled className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-gray-500 cursor-not-allowed transition-all" placeholder="Please select an Experience Level first..." value=""/>
                                    </div>) : (<div className="relative">
                                        <div onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)} className={`w-full min-h-[50px] bg-gray-800/50 border rounded-xl py-2 pl-11 pr-10 flex flex-wrap items-center gap-2 cursor-pointer transition-all ${showValidation && !hasAudience(courseData.audience) ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700'}`}>
                                            {Array.isArray(courseData.audience) && courseData.audience.length > 0 ? (courseData.audience.map((aud: any, idx: any) => (<span key={idx} className="bg-lime-500/20 text-lime-400 text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-lime-500/30">
                                                        {aud}
                                                        <button type="button" onClick={(e) => {
                    e.stopPropagation();
                    const newAud = (courseData.audience as string[]).filter(a => a !== aud);
                    updateCourseData({ audience: newAud });
                }} className="hover:text-lime-300">
                                                            <X size={12}/>
                                                        </button>
                                                    </span>))) : (typeof courseData.audience === 'string' && courseData.audience.trim() ? (<span className="bg-lime-500/20 text-lime-400 text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-lime-500/30">
                                                    {courseData.audience}
                                                    <button type="button" onClick={(e) => {
                    e.stopPropagation();
                    updateCourseData({ audience: [] });
                }} className="hover:text-lime-300">
                                                        <X size={12}/>
                                                    </button>
                                                </span>) : (<span className="text-gray-500 select-none py-1">Select Target Audiences...</span>))}
                                        </div>
                                        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none transition-transform ${isAudienceDropdownOpen ? 'rotate-180' : ''}`}/>

                                        <AnimatePresence>
                                            {isAudienceDropdownOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 w-full mt-2 bg-[#111827] border border-gray-700 rounded-xl shadow-xl overflow-hidden max-md:overflow-y-auto max-md:max-h-[min(18rem,55vh)]">
                                                    <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">

                                                        {(() => {
                    const allOptions = AUDIENCE_OPTIONS[courseData.level] || [];
                    const currentAudience = Array.isArray(courseData.audience) ? courseData.audience : (courseData.audience ? [courseData.audience] : []);
                    const allSelected = allOptions.length > 0 && allOptions.every((opt: any) => currentAudience.includes(opt));
                    return (<div onClick={() => {
                            if (allSelected) {
                                updateCourseData({ audience: [] });
                            }
                            else {
                                updateCourseData({ audience: [...allOptions] });
                            }
                        }} className={`w-full text-left px-3 py-2 max-md:py-3 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between border-b border-white/5 mb-1 pb-2 ${allSelected ? 'bg-lime-500/20 text-lime-400' : 'text-gray-300 hover:bg-white/5'}`}>
                                                                    <span className="font-bold uppercase tracking-wider text-xs">Select All</span>
                                                                    {allSelected && <Check size={16} className="text-lime-500"/>}
                                                                </div>);
                })()}
                                                        {AUDIENCE_OPTIONS[courseData.level]?.map((opt: any) => {
                    const isSelected = Array.isArray(courseData.audience)
                        ? courseData.audience.includes(opt)
                        : courseData.audience === opt;
                    return (<div key={opt} onClick={() => {
                            let current = Array.isArray(courseData.audience) ? [...courseData.audience] : (courseData.audience ? [courseData.audience] : []);
                            if (isSelected) {
                                current = current.filter(a => a !== opt);
                            }
                            else {
                                current.push(opt);
                            }
                            updateCourseData({ audience: current });
                        }} className={`w-full text-left px-3 py-2 max-md:py-3 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-lime-500/20 text-lime-400' : 'text-gray-300 hover:bg-white/5'}`}>
                                                                    {opt}
                                                                    {isSelected && <Check size={16} className="text-lime-500"/>}
                                                                </div>);
                })}
                                                    </div>
                                                    <div className="p-2 border-t border-gray-700 bg-gray-900/50">
                                                        <div className="flex gap-2">
                                                            <input type="text" value={customAudienceInput} onChange={(e) => setCustomAudienceInput(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customAudienceInput.trim()) {
                            const capitalized = customAudienceInput.charAt(0).toUpperCase() + customAudienceInput.slice(1);
                            const current = Array.isArray(courseData.audience) ? [...courseData.audience] : (courseData.audience ? [courseData.audience] : []);
                            if (!current.includes(capitalized)) {
                                current.push(capitalized);
                                updateCourseData({ audience: current });
                            }
                            setCustomAudienceInput('');
                        }
                    }
                }} placeholder="Add custom audience..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none"/>
                                                            <button type="button" onClick={(e) => {
                    e.preventDefault();
                    if (customAudienceInput.trim()) {
                        const capitalized = customAudienceInput.charAt(0).toUpperCase() + customAudienceInput.slice(1);
                        const current = Array.isArray(courseData.audience) ? [...courseData.audience] : (courseData.audience ? [courseData.audience] : []);
                        if (!current.includes(capitalized)) {
                            current.push(capitalized);
                            updateCourseData({ audience: current });
                        }
                        setCustomAudienceInput('');
                    }
                }} className="bg-lime-500/20 text-lime-400 p-2 rounded-lg hover:bg-lime-500/30 transition-colors">
                                                                <Plus size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>)}
                                        </AnimatePresence>
                                    </div>)}
                                {showValidation && !hasAudience(courseData.audience) && <WarningSign />}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider max-md:normal-case max-md:tracking-normal">International/Regional Industry Standard</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 z-10 pointer-events-none"/>
                                <div onClick={() => {
            setIsStandardsDropdownOpen(!isStandardsDropdownOpen);
            setIsCountryDropdownOpen(false);
            setIsIndustryDropdownOpen(false);
            setIsStyleDropdownOpen(false);
        }} className="w-full min-h-[50px] bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-11 pr-10 flex items-center cursor-pointer transition-all hover:border-gray-600">
                                    <span className="text-sm text-white select-none">{courseData.standards}</span>
                                </div>
                                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none transition-transform ${isStandardsDropdownOpen ? 'rotate-180' : ''}`}/>
                                <AnimatePresence>
                                    {isStandardsDropdownOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 w-full mt-2 bg-[#111827] border border-gray-700 rounded-xl shadow-xl overflow-hidden max-md:overflow-y-auto max-md:max-h-[min(18rem,55vh)]">
                                            <div className="p-2 space-y-1">
                                                {STANDARD_OPTIONS.map((opt) => {
                const isSelected = courseData.standards === opt;
                return (<div key={opt} onClick={() => {
                        updateCourseData({
                            standards: opt,
                            ...(opt !== 'Regional' ? { country: '' } : {}),
                        });
                        setIsStandardsDropdownOpen(false);
                        setIsCountryDropdownOpen(false);
                        setIsIndustryDropdownOpen(false);
                    }} className={`w-full text-left px-3 py-2 max-md:py-3 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-lime-500/20 text-lime-400' : 'text-gray-300 hover:bg-white/5'}`}>
                                                            {opt}
                                                            {isSelected && <Check size={16} className="text-lime-500"/>}
                                                        </div>);
            })}
                                            </div>
                                        </motion.div>)}
                                </AnimatePresence>
                            </div>
                            {courseData.standards === 'Regional' && (<div className="mt-3 pl-4 border-l-2 border-lime-500/40 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[11px] font-semibold text-lime-400 mb-1.5 uppercase tracking-wider">Specific Region/Country</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 z-10 pointer-events-none"/>
                                        <div onClick={() => {
                setIsCountryDropdownOpen(!isCountryDropdownOpen);
                setIsStandardsDropdownOpen(false);
                setIsIndustryDropdownOpen(false);
                setIsStyleDropdownOpen(false);
            }} className={`w-full min-h-[42px] bg-gray-800/50 border rounded-xl py-2.5 pl-9 pr-10 flex items-center cursor-pointer transition-all ${showValidation && !courseData.country ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700/50 hover:border-gray-600'}`}>
                                            <span className={`text-sm select-none ${courseData.country ? 'text-white' : 'text-gray-500'}`}>
                                                {courseData.country || 'Select a region...'}
                                            </span>
                                        </div>
                                        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`}/>
                                        {showValidation && !courseData.country && (<div className="absolute right-8 top-1/2 -translate-y-1/2 text-amber-500 animate-pulse pointer-events-none">
                                                <Zap size={18} fill="currentColor"/>
                                            </div>)}
                                        <AnimatePresence>
                                            {isCountryDropdownOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 w-full mt-2 bg-[#111827] border border-gray-700 rounded-xl shadow-xl overflow-hidden max-md:overflow-y-auto max-md:max-h-[min(18rem,55vh)]">
                                                    <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                                        {REGION_OPTIONS.map((opt) => {
                    const isSelected = courseData.country === opt;
                    return (<div key={opt} onClick={() => {
                            updateCourseData({ country: opt });
                            setIsCountryDropdownOpen(false);
                        }} className={`w-full text-left px-3 py-2 max-md:py-3 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-lime-500/20 text-lime-400' : 'text-gray-300 hover:bg-white/5'}`}>
                                                                    {opt}
                                                                    {isSelected && <Check size={16} className="text-lime-500"/>}
                                                                </div>);
                })}
                                                    </div>
                                                    <div className="p-2 border-t border-gray-700 bg-gray-900/50">
                                                        <div className="flex gap-2">
                                                            <input type="text" value={customCountryInput} onChange={(e) => setCustomCountryInput(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomCountry();
                    }
                }} placeholder="Add custom region..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none"/>
                                                            <button type="button" onClick={(e) => {
                    e.preventDefault();
                    addCustomCountry();
                }} className="bg-lime-500/20 text-lime-400 p-2 rounded-lg hover:bg-lime-500/30 transition-colors">
                                                                <Plus size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>)}
                                        </AnimatePresence>
                                    </div>
                                </div>)}

                            {courseData.standards === 'Industry Specific' && (<div className="mt-3 pl-4 border-l-2 border-lime-500/40 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[11px] font-semibold text-lime-400 mb-1.5 uppercase tracking-wider">Select Industry</label>
                                    <div className="relative">
                                        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 z-10 pointer-events-none"/>
                                        <div onClick={() => {
                setIsIndustryDropdownOpen(!isIndustryDropdownOpen);
                setIsStandardsDropdownOpen(false);
                setIsCountryDropdownOpen(false);
                setIsStyleDropdownOpen(false);
            }} className={`w-full min-h-[42px] bg-gray-800/50 border rounded-xl py-2.5 pl-9 pr-10 flex items-center cursor-pointer transition-all ${showValidation && !courseData.industry ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700/50 hover:border-gray-600'}`}>
                                            <span className={`text-sm select-none ${courseData.industry ? 'text-white' : 'text-gray-500'}`}>
                                                {courseData.industry || 'Select an industry...'}
                                            </span>
                                        </div>
                                        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none transition-transform ${isIndustryDropdownOpen ? 'rotate-180' : ''}`}/>
                                        {showValidation && !courseData.industry && (<div className="absolute right-8 top-1/2 -translate-y-1/2 text-amber-500 animate-pulse pointer-events-none">
                                                <Zap size={18} fill="currentColor"/>
                                            </div>)}
                                        <AnimatePresence>
                                            {isIndustryDropdownOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 w-full mt-2 bg-[#111827] border border-gray-700 rounded-xl shadow-xl overflow-hidden max-md:overflow-y-auto max-md:max-h-[min(18rem,55vh)]">
                                                    <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                                        {INDUSTRIES.map((ind: any) => {
                    const isSelected = courseData.industry === ind;
                    return (<div key={ind} onClick={() => {
                            updateCourseData({ industry: ind });
                            setIsIndustryDropdownOpen(false);
                        }} className={`w-full text-left px-3 py-2 max-md:py-3 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-lime-500/20 text-lime-400' : 'text-gray-300 hover:bg-white/5'}`}>
                                                                    {ind}
                                                                    {isSelected && <Check size={16} className="text-lime-500"/>}
                                                                </div>);
                })}
                                                    </div>
                                                    <div className="p-2 border-t border-gray-700 bg-gray-900/50">
                                                        <div className="flex gap-2">
                                                            <input type="text" value={customIndustryInput} onChange={(e) => setCustomIndustryInput(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomIndustry();
                    }
                }} placeholder="Add custom industry..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none"/>
                                                            <button type="button" onClick={(e) => {
                    e.preventDefault();
                    addCustomIndustry();
                }} className="bg-lime-500/20 text-lime-400 p-2 rounded-lg hover:bg-lime-500/30 transition-colors">
                                                                <Plus size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>)}
                                        </AnimatePresence>
                                    </div>
                                </div>)}
                        </div>

                        <div className="mt-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 transition-all duration-300">
                            <p className="text-[10px] leading-relaxed text-gray-400">
                                {courseData.standards === 'Global (ISO/IEC)' && (<>
                                        <span className="text-lime-400 font-bold tracking-wider uppercase mr-2 text-[9px]">Global Standard:</span>
                                        High-level international standards ensure your course is recognized and consistent across all borders and countries.
                                    </>)}
                                {courseData.standards === 'Regional' && (<>
                                        <span className="text-lime-400 font-bold tracking-wider uppercase mr-2 text-[9px]">Regional Standard:</span>
                                        Focuses on educational or professional requirements specific to a particular continent, region, or geographic area.
                                    </>)}
                                {courseData.standards === 'Industry Specific' && (<>
                                        <span className="text-lime-400 font-bold tracking-wider uppercase mr-2 text-[9px]">Industry Standard:</span>
                                        Tailors content to meet stringent professional requirements in specialized fields like Medical, Legal, or Technical sectors.
                                    </>)}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Course Tone & Style</label>
                            <div className="relative">
                                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 z-10 pointer-events-none"/>
                                <div onClick={() => {
            setIsStyleDropdownOpen(!isStyleDropdownOpen);
            setIsStandardsDropdownOpen(false);
            setIsCountryDropdownOpen(false);
            setIsIndustryDropdownOpen(false);
        }} className="w-full min-h-[50px] bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-11 pr-10 flex items-center cursor-pointer transition-all hover:border-gray-600">
                                    <span className="text-sm text-white select-none">{courseData.courseStyle || 'Academic / Formal Style'}</span>
                                </div>
                                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none transition-transform ${isStyleDropdownOpen ? 'rotate-180' : ''}`}/>
                                <AnimatePresence>
                                    {isStyleDropdownOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 w-full mt-2 bg-[#111827] border border-gray-700 rounded-xl shadow-xl overflow-hidden max-md:overflow-y-auto max-md:max-h-[min(18rem,55vh)]">
                                            <div className="p-2 space-y-1">
                                                {STYLE_OPTIONS.map((opt) => {
                const isSelected = (courseData.courseStyle || 'Academic / Formal Style') === opt;
                return (<div key={opt} onClick={() => {
                        updateCourseData({ courseStyle: opt });
                        setIsStyleDropdownOpen(false);
                    }} className={`w-full text-left px-3 py-2 max-md:py-3 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-lime-500/20 text-lime-400' : 'text-gray-300 hover:bg-white/5'}`}>
                                                            {opt}
                                                            {isSelected && <Check size={16} className="text-lime-500"/>}
                                                        </div>);
            })}
                                            </div>
                                        </motion.div>)}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-12 flex justify-start max-md:mt-8">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={goToNextStep} disabled={isGeneratingDescription} className="flex items-center gap-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-wait disabled:transform-none max-md:w-full max-md:justify-center" type="button">
                        {isGeneratingDescription ? (<>
                                <Loader2 className="w-5 h-5 animate-spin"/>
                                Processing Description...
                            </>) : (<>
                                Next Step <ChevronRight size={20} strokeWidth={3}/>
                            </>)}
                    </motion.button>
                </div>
            </motion.div>


            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex-1 xl:w-[38%] bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8 max-md:rounded-2xl max-md:p-4 max-md:static">

                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none"></div>

                <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                    <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover"/>
                </div>

                <div className="relative z-10">
                    <div className="mb-6 pr-48 text-left min-h-[140px] max-md:pr-0 max-md:min-h-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight flex items-center gap-2">
                            Hey! Welcome to the first step <Sparkles className="text-lime-400 w-6 h-6 animate-pulse"/>
                        </h3>
                        <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                            Hey! I'm <span className="text-lime-400 font-bold px-1 bg-lime-400/10 rounded">Orion</span> again, and I'll guide you in shaping the core of your course. Let's define a few key details so I can build everything exactly the way you need.
                        </p>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                    <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                        <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                            <Layers className="w-4 h-4 text-lime-400"/>
                        </span>
                        Step-by-Step Guidance
                    </h4>

                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">1</div>
                            <div>
                                <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Choose Cognitive complexity Level</h5>
                                <p className="text-gray-400 text-xs leading-relaxed">Select the proficiency level of your students. I will automatically calibrate the complexity of the terminology and the depth of the concepts to match this choice.</p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                            <div>
                                <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Course Title</h5>
                                <p className="text-gray-400 text-xs leading-relaxed">Enter a clear, professional title. I use this to determine the primary 'North Star' of your course content and to generate relevant imagery later.</p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">3</div>
                            <div>
                                <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Define Target Audience</h5>
                                <p className="text-gray-400 text-xs leading-relaxed">Who is this for? Identifying the audience allows me to tailor the examples and case studies to their specific interests and needs.</p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">4</div>
                            <div>
                                <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Select International/Regional Industry Standard</h5>
                                <div className="text-gray-400 text-[11px] leading-relaxed space-y-1">
                                    <p>Choose your professional alignment:</p>
                                    <p><span className="text-lime-400 font-bold flex items-center gap-1"><Globe className="w-3 h-3"/> Global (ISO/IEC):</span> High-level international standards for consistency across borders.</p>
                                    <p><span className="text-lime-400 font-bold flex items-center gap-1"><MapPin className="w-3 h-3"/> Regional:</span> Standards specific to a geographic area or continent.</p>
                                    <p><span className="text-lime-400 font-bold flex items-center gap-1"><Wrench className="w-3 h-3"/> Industry Specific:</span> Focused standards for fields like Medical, Legal, or Tech.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">5</div>
                            <div>
                                <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Course Tone & Style</h5>
                                <p className="text-gray-400 text-xs leading-relaxed">Choose whether the content should be academic/formal, storytelling, interactive coaching, humanized teaching modern Edutainment or scenario-based style. This sets the 'voice' for every slide I generate.</p>
                            </div>
                        </motion.div>

                    </motion.div>

                    <div className="mt-8 p-4 rounded-xl bg-lime-500/5 border border-lime-500/10 backdrop-blur-sm relative overflow-hidden group-hover:bg-lime-500/10 transition-colors duration-500">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lime-400 to-emerald-600"></div>
                        <div className="flex items-start gap-3 pl-2">
                            <span className="text-lime-400 mt-0.5 text-lg"><Rocket className="w-5 h-5"/></span>
                            <div>
                                <h6 className="text-lime-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Orion Insight</h6>
                                <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">The clearer your inputs, the smarter and more tailored your course will be.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 text-center">
                        <p className="text-gray-500 text-xs font-semibold tracking-wide">
                            "Once you're ready, continue—I'll take care of the next step." <Sparkles className="inline-block w-4 h-4 text-lime-400"/>
                        </p>
                    </div>

                </div>
            </motion.div>
        </motion.div>);
};
export default CourseStepOne;
