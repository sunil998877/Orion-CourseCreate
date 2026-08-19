import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import avatar from '../../assests/avatar.png';
import WarningSign from './WarningSign';
import {
    Check, ChevronDown, ChevronRight, Loader2, FileText, Target,
    Palette, Globe, Zap, Sparkles, Plus, MapPin, Wrench,
    Rocket, X, Layers
} from 'lucide-react';


const CourseStepOne: React.FC = () => {
    const {
        courseData,
        updateCourseData,
        showValidation,
        isGeneratingDescription,
        setIsCustomAudience,
        isAudienceDropdownOpen,
        setIsAudienceDropdownOpen,
        customAudienceInput,
        setCustomAudienceInput,
        isCustomIndustry,
        setIsCustomIndustry,
        isCustomCountry,
        setIsCustomCountry,
        goToNextStep,
        containerVariants,
        itemVariants,
        stepVariants,
        hasAudience,
        AUDIENCE_OPTIONS,
        INDUSTRIES
    } = useCourseCreator();

    const [isStandardsOpen, setIsStandardsOpen] = React.useState(false);
    const [isStyleOpen, setIsStyleOpen] = React.useState(false);
    const [isCountryOpen, setIsCountryOpen] = React.useState(false);
    const [isIndustryOpen, setIsIndustryOpen] = React.useState(false);

    const STANDARDS_OPTIONS = [
        { value: 'Global (ISO/IEC)', label: 'Global (ISO/IEC)' },
        { value: 'Regional', label: 'Regional' },
        { value: 'Industry Specific', label: 'Industry Specific' },
    ];

    const STYLE_OPTIONS = [
        'Academic / Formal Style',
        'Storytelling Style',
        'Interactive Coaching Style',
        'Humanized Teaching Style',
        'Modern Edutainment Style',
        'Scenario-Based Style',
    ];

    return (
        <motion.div
            key="step1"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pt-6 flex flex-col xl:flex-row gap-8 xl:gap-12"
        >

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 xl:w-[65%] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] max-md:rounded-2xl p-10 md:p-14 max-md:p-5 shadow-2xl relative overflow-hidden group/card shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)]"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-lime-500/[0.02] to-transparent pointer-events-none" />
                <motion.div variants={itemVariants} className="mb-12 text-center relative z-10">
                    <label className="block text-[10px] font-black text-white/40 mb-6 uppercase tracking-[0.3em] group-hover/card:text-lime-400 transition-colors">Cognitive complexity Level</label>
                    <div className="max-w-2xl mx-auto flex bg-black/40 p-2 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                        {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => {
                                    updateCourseData({ level: lvl });
                                    setIsCustomAudience(false);
                                }}
                                className={`flex-1 py-4 text-xs font-black rounded-2xl transition-all duration-500 uppercase tracking-widest ${courseData.level === lvl
                                    ? 'bg-lime-500 text-black shadow-[0_0_30px_rgba(132,204,22,0.4)] scale-[1.05] z-10 font-black'
                                    : 'text-white/20 hover:text-white/60 hover:bg-white/5'
                                    }`}
                                type="button"
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider group-hover:text-lime-500 transition-colors">Course Title</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    className={`w-full bg-gray-800/50 border rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-lime-500 outline-none transition-all ${showValidation && !courseData.title?.trim() ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700'
                                        }`}
                                    placeholder="e.g. Masterclass in Quantum SEO"
                                    value={courseData.title}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                                        updateCourseData({ title: capitalized });
                                    }}
                                />
                                {showValidation && !courseData.title?.trim() && <WarningSign />}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Target Audience</label>
                            <div className="relative">
                                {!courseData.level ? (
                                    <div className="relative group opacity-60">
                                        <input
                                            disabled
                                            className="w-full bg-[#1a1f2e] border border-[#2a2f3e] rounded-xl py-3 pl-4 pr-4 text-gray-500 cursor-not-allowed transition-all"
                                            placeholder="Please select an Experience Level first..."
                                            value=""
                                        />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Trigger button */}
                                        <div
                                            onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
                                            className={`w-full min-h-[50px] bg-[#181d2a] border rounded-xl py-2 pl-4 pr-10 flex flex-wrap items-center gap-2 cursor-pointer transition-all ${showValidation && !hasAudience(courseData.audience)
                                                ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                                                : 'border-[#2a3045] hover:border-[#3a4060]'
                                                }`}
                                        >
                                            <Target className="text-gray-500 w-4 h-4 flex-shrink-0" />
                                            {Array.isArray(courseData.audience) && courseData.audience.length > 0 ? (
                                                courseData.audience.map((aud: any, idx: any) => (
                                                    <span key={idx} className="bg-lime-500/20 text-lime-400 text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-lime-500/30">
                                                        {aud}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newAud = (courseData.audience as string[]).filter(a => a !== aud);
                                                                updateCourseData({ audience: newAud });
                                                            }}
                                                            className="hover:text-lime-300"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))
                                            ) : typeof courseData.audience === 'string' && courseData.audience.trim() ? (
                                                <span className="bg-lime-500/20 text-lime-400 text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-lime-500/30">
                                                    {courseData.audience}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateCourseData({ audience: [] });
                                                        }}
                                                        className="hover:text-lime-300"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 select-none py-1 text-sm">Select Target Audiences...</span>
                                            )}
                                        </div>
                                        <ChevronDown
                                            className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none transition-transform duration-200 ${isAudienceDropdownOpen ? 'rotate-180' : ''
                                                }`}
                                        />

                                        {/* Dropdown panel */}
                                        <AnimatePresence>
                                            {isAudienceDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scaleY: 0.92, y: -8, filter: 'blur(3px)' }}
                                                    animate={{ opacity: 1, scaleY: 1, y: 0, filter: 'blur(0px)' }}
                                                    exit={{ opacity: 0, scaleY: 0.92, y: -8, filter: 'blur(3px)' }}
                                                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                                    style={{ transformOrigin: 'top', background: '#141824', border: '1px solid #252b3b' }}
                                                    className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                                                >
                                                    {/* Scrollable list */}
                                                    <div
                                                        className="overflow-y-auto"
                                                        style={{
                                                            maxHeight: '220px',
                                                            scrollbarWidth: 'thin',
                                                            scrollbarColor: '#84cc16 #1e2430',
                                                        }}
                                                    >
                                                        {/* Select All */}
                                                        {(() => {
                                                            const allOptions = AUDIENCE_OPTIONS[courseData.level] || [];
                                                            const currentAudience = Array.isArray(courseData.audience)
                                                                ? courseData.audience
                                                                : courseData.audience ? [courseData.audience] : [];
                                                            const allSelected =
                                                                allOptions.length > 0 &&
                                                                allOptions.every((opt: any) => currentAudience.includes(opt));
                                                            return (
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -6 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.02, duration: 0.12 }}
                                                                    onClick={() => {
                                                                        if (allSelected) {
                                                                            updateCourseData({ audience: [] });
                                                                        } else {
                                                                            updateCourseData({ audience: [...allOptions] });
                                                                        }
                                                                    }}
                                                                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none border-b border-white/5"
                                                                    style={{
                                                                        color: allSelected ? '#84cc16' : '#e5e7eb',
                                                                        background: allSelected ? 'rgba(132,204,22,0.07)' : 'transparent',
                                                                    }}
                                                                >
                                                                    <span className="text-xs font-black uppercase tracking-[0.18em]">Select All</span>
                                                                    <AnimatePresence>
                                                                        {allSelected && (
                                                                            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                                                                                <Check size={14} className="text-lime-400" />
                                                                            </motion.span>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </motion.div>
                                                            );
                                                        })()}

                                                        {/* Options */}
                                                        {AUDIENCE_OPTIONS[courseData.level]?.map((opt: any, i: number) => {
                                                            const isSelected = Array.isArray(courseData.audience)
                                                                ? courseData.audience.includes(opt)
                                                                : courseData.audience === opt;
                                                            return (
                                                                <motion.div
                                                                    key={opt}
                                                                    initial={{ opacity: 0, x: -8 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.02 + i * 0.018, duration: 0.12 }}
                                                                    onClick={() => {
                                                                        let current = Array.isArray(courseData.audience)
                                                                            ? [...courseData.audience]
                                                                            : courseData.audience ? [courseData.audience] : [];
                                                                        if (isSelected) {
                                                                            current = current.filter(a => a !== opt);
                                                                        } else {
                                                                            current.push(opt);
                                                                        }
                                                                        updateCourseData({ audience: current });
                                                                    }}
                                                                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
                                                                    style={{
                                                                        color: isSelected ? '#84cc16' : '#d1d5db',
                                                                        background: isSelected ? 'rgba(132,204,22,0.07)' : 'transparent',
                                                                        transition: 'background 0.12s, color 0.12s',
                                                                    }}
                                                                    onMouseEnter={e => {
                                                                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                                                                    }}
                                                                    onMouseLeave={e => {
                                                                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                                    }}
                                                                >
                                                                    <span className="text-sm">{opt}</span>
                                                                    <AnimatePresence>
                                                                        {isSelected && (
                                                                            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                                                                                <Check size={14} className="text-lime-400 flex-shrink-0" />
                                                                            </motion.span>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Custom audience input */}
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.06, duration: 0.14 }}
                                                        className="flex items-center gap-2 px-3 py-2.5 border-t"
                                                        style={{ borderColor: '#252b3b', background: '#10131c' }}
                                                    >
                                                        <input
                                                            type="text"
                                                            value={customAudienceInput}
                                                            onChange={(e) => setCustomAudienceInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    if (customAudienceInput.trim()) {
                                                                        const capitalized = customAudienceInput.charAt(0).toUpperCase() + customAudienceInput.slice(1);
                                                                        const current = Array.isArray(courseData.audience)
                                                                            ? [...courseData.audience]
                                                                            : courseData.audience ? [courseData.audience] : [];
                                                                        if (!current.includes(capitalized)) {
                                                                            current.push(capitalized);
                                                                            updateCourseData({ audience: current });
                                                                        }
                                                                        setCustomAudienceInput('');
                                                                    }
                                                                }
                                                            }}
                                                            placeholder="Add custom audience..."
                                                            className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none py-1"
                                                        />
                                                        <motion.button
                                                            whileHover={{ scale: 1.12, backgroundColor: 'rgba(132,204,22,0.25)' }}
                                                            whileTap={{ scale: 0.9 }}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (customAudienceInput.trim()) {
                                                                    const capitalized = customAudienceInput.charAt(0).toUpperCase() + customAudienceInput.slice(1);
                                                                    const current = Array.isArray(courseData.audience)
                                                                        ? [...courseData.audience]
                                                                        : courseData.audience ? [courseData.audience] : [];
                                                                    if (!current.includes(capitalized)) {
                                                                        current.push(capitalized);
                                                                        updateCourseData({ audience: current });
                                                                    }
                                                                    setCustomAudienceInput('');
                                                                }
                                                            }}
                                                            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-lime-400 border border-lime-500/40 transition-colors"
                                                        >
                                                            <Plus size={14} />
                                                        </motion.button>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                                {showValidation && !hasAudience(courseData.audience) && <WarningSign />}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">International/Regional Industry Standard</label>
                            <div className="relative">
                                {/* Custom Standards Dropdown Trigger */}
                                <div
                                    onClick={() => { setIsStandardsOpen(!isStandardsOpen); setIsStyleOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all select-none"
                                    style={{ background: '#181d2a', border: '1px solid #252b3b' }}
                                >
                                    <Globe className="text-gray-400 w-4 h-4 flex-shrink-0" />
                                    <span className="flex-1 text-sm text-gray-200">{courseData.standards || 'Global (ISO/IEC)'}</span>
                                    <ChevronDown
                                        className={`text-gray-400 w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isStandardsOpen ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>

                                {/* Standards dropdown panel */}
                                <AnimatePresence>
                                    {isStandardsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scaleY: 0.88, y: -10, filter: 'blur(4px)' }}
                                            animate={{ opacity: 1, scaleY: 1, y: 0, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, scaleY: 0.88, y: -10, filter: 'blur(4px)' }}
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            style={{ transformOrigin: 'top', background: '#141824', border: '1px solid #252b3b' }}
                                            className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                                        >
                                            {STANDARDS_OPTIONS.map((opt, i) => (
                                                <motion.div
                                                    key={opt.value}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.02 + i * 0.022, duration: 0.12 }}
                                                    onClick={() => {
                                                        updateCourseData({ standards: opt.value });
                                                        if (opt.value !== 'Regional') updateCourseData({ country: '' });
                                                        setIsStandardsOpen(false);
                                                    }}
                                                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
                                                    style={{
                                                        color: courseData.standards === opt.value ? '#84cc16' : '#d1d5db',
                                                        background: courseData.standards === opt.value ? 'rgba(132,204,22,0.07)' : 'transparent',
                                                        transition: 'background 0.12s, color 0.12s',
                                                    }}
                                                    onMouseEnter={e => {
                                                        if (courseData.standards !== opt.value) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        if (courseData.standards !== opt.value) (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                    }}
                                                >
                                                    <span className="text-sm">{opt.label}</span>
                                                    <AnimatePresence>
                                                        {courseData.standards === opt.value && (
                                                            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                                                                <Check size={14} className="text-lime-400" />
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {courseData.standards === 'Regional' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    className="mt-3 pl-4 border-l-2 border-lime-500/40"
                                >
                                    <label className="block text-[11px] font-semibold text-lime-400 mb-1.5 uppercase tracking-wider">Specific Region/Country</label>
                                    <div className="relative">
                                        {!isCustomCountry ? (
                                            <>
                                                {/* Custom Country Dropdown Trigger */}
                                                <div
                                                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all ${
                                                        showValidation && !courseData.country
                                                            ? 'ring-1 ring-amber-500/30'
                                                            : ''
                                                    }`}
                                                    style={{ background: '#181d2a', border: `1px solid ${showValidation && !courseData.country ? 'rgba(245,158,11,0.5)' : '#252b3b'}` }}
                                                >
                                                    <Globe className="text-gray-500 w-4 h-4 flex-shrink-0" />
                                                    <span className={`flex-1 text-sm ${courseData.country ? 'text-gray-200' : 'text-gray-500'}`}>
                                                        {courseData.country || 'Select a region...'}
                                                    </span>
                                                    <ChevronDown className={`text-gray-400 w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isCountryOpen ? 'rotate-180' : ''}`} />
                                                </div>

                                                <AnimatePresence>
                                                    {isCountryOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scaleY: 0.88, y: -8, filter: 'blur(3px)' }}
                                                            animate={{ opacity: 1, scaleY: 1, y: 0, filter: 'blur(0px)' }}
                                                            exit={{ opacity: 0, scaleY: 0.88, y: -8, filter: 'blur(3px)' }}
                                                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                                            style={{ transformOrigin: 'top', background: '#141824', border: '1px solid #252b3b' }}
                                                            className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                                                        >
                                                            {['Australia', 'Canada', 'India', 'United States', 'London (UK)'].map((country, i) => (
                                                                <motion.div
                                                                    key={country}
                                                                    initial={{ opacity: 0, x: -6 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.02 + i * 0.018, duration: 0.12 }}
                                                                    onClick={() => {
                                                                        updateCourseData({ country: country });
                                                                        setIsCountryOpen(false);
                                                                    }}
                                                                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                                                                    style={{
                                                                        color: courseData.country === country ? '#84cc16' : '#d1d5db',
                                                                        background: courseData.country === country ? 'rgba(132,204,22,0.07)' : 'transparent',
                                                                        transition: 'background 0.1s',
                                                                    }}
                                                                    onMouseEnter={e => { if (courseData.country !== country) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                                                    onMouseLeave={e => { if (courseData.country !== country) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                                                >
                                                                    <span className="text-sm">{country}</span>
                                                                    <AnimatePresence>
                                                                        {courseData.country === country && (
                                                                            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                                                                                <Check size={13} className="text-lime-400" />
                                                                            </motion.span>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </motion.div>
                                                            ))}
                                                            {/* Other/Custom */}
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -6 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.12, duration: 0.12 }}
                                                                onClick={() => { setIsCustomCountry(true); updateCourseData({ country: '' }); setIsCountryOpen(false); }}
                                                                className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none border-t"
                                                                style={{ borderColor: '#252b3b', color: '#9ca3af', transition: 'background 0.1s' }}
                                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                                            >
                                                                <Plus size={12} />
                                                                <span className="text-sm">Other / Custom...</span>
                                                            </motion.div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        ) : (
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    className="w-full bg-[#181d2a] border border-lime-500/50 rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-2 focus:ring-lime-500 outline-none"
                                                    placeholder="Type custom region..."
                                                    value={courseData.country}
                                                    onChange={(e) => updateCourseData({ country: e.target.value })}
                                                />
                                                <button
                                                    onClick={() => { setIsCustomCountry(false); updateCourseData({ country: '' }); }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                        {showValidation && !courseData.country && !isCustomCountry && (
                                            <div className="absolute right-9 top-1/2 -translate-y-1/2 text-amber-500 animate-pulse">
                                                <Zap size={16} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {courseData.standards === 'Industry Specific' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    className="mt-3 pl-4 border-l-2 border-lime-500/40"
                                >
                                    <label className="block text-[11px] font-semibold text-lime-400 mb-1.5 uppercase tracking-wider">Select Industry</label>
                                    <div className="relative">
                                        {!isCustomIndustry ? (
                                            <>
                                                {/* Custom Industry Dropdown Trigger */}
                                                <div
                                                    onClick={() => setIsIndustryOpen(!isIndustryOpen)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all ${
                                                        showValidation && !courseData.industry ? 'ring-1 ring-amber-500/30' : ''
                                                    }`}
                                                    style={{ background: '#181d2a', border: `1px solid ${showValidation && !courseData.industry ? 'rgba(245,158,11,0.5)' : '#252b3b'}` }}
                                                >
                                                    <Sparkles className="text-gray-500 w-4 h-4 flex-shrink-0" />
                                                    <span className={`flex-1 text-sm ${courseData.industry ? 'text-gray-200' : 'text-gray-500'}`}>
                                                        {courseData.industry || 'Select an industry...'}
                                                    </span>
                                                    <ChevronDown className={`text-gray-400 w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isIndustryOpen ? 'rotate-180' : ''}`} />
                                                </div>

                                                <AnimatePresence>
                                                    {isIndustryOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scaleY: 0.88, y: -8, filter: 'blur(3px)' }}
                                                            animate={{ opacity: 1, scaleY: 1, y: 0, filter: 'blur(0px)' }}
                                                            exit={{ opacity: 0, scaleY: 0.88, y: -8, filter: 'blur(3px)' }}
                                                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                                            style={{ transformOrigin: 'top', background: '#141824', border: '1px solid #252b3b' }}
                                                            className="absolute z-50 w-full mt-1 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
                                                        >
                                                            <div className="overflow-y-auto" style={{ maxHeight: '200px', scrollbarWidth: 'thin', scrollbarColor: '#84cc16 #1e2430' }}>
                                                                {INDUSTRIES.map((ind: any, i: number) => (
                                                                    <motion.div
                                                                        key={ind}
                                                                        initial={{ opacity: 0, x: -6 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: 0.02 + i * 0.014, duration: 0.11 }}
                                                                        onClick={() => { updateCourseData({ industry: ind }); setIsIndustryOpen(false); }}
                                                                        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                                                                        style={{
                                                                            color: courseData.industry === ind ? '#84cc16' : '#d1d5db',
                                                                            background: courseData.industry === ind ? 'rgba(132,204,22,0.07)' : 'transparent',
                                                                            transition: 'background 0.1s',
                                                                        }}
                                                                        onMouseEnter={e => { if (courseData.industry !== ind) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                                                        onMouseLeave={e => { if (courseData.industry !== ind) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                                                    >
                                                                        <span className="text-sm">{ind}</span>
                                                                        <AnimatePresence>
                                                                            {courseData.industry === ind && (
                                                                                <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                                                                                    <Check size={13} className="text-lime-400" />
                                                                                </motion.span>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                            {/* Other/Custom */}
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.1, duration: 0.12 }}
                                                                onClick={() => { setIsCustomIndustry(true); updateCourseData({ industry: '' }); setIsIndustryOpen(false); }}
                                                                className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none border-t"
                                                                style={{ borderColor: '#252b3b', color: '#9ca3af', transition: 'background 0.1s' }}
                                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                                            >
                                                                <Plus size={12} />
                                                                <span className="text-sm">Other / Custom...</span>
                                                            </motion.div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        ) : (
                                            <div className="relative">
                                                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    className="w-full bg-[#181d2a] border border-lime-500/50 rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-2 focus:ring-lime-500 outline-none"
                                                    placeholder="Type custom industry..."
                                                    value={courseData.industry}
                                                    onChange={(e) => updateCourseData({ industry: e.target.value })}
                                                />
                                                <button
                                                    onClick={() => { setIsCustomIndustry(false); updateCourseData({ industry: '' }); }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                        {showValidation && !courseData.industry && !isCustomIndustry && (
                                            <div className="absolute right-9 top-1/2 -translate-y-1/2 text-amber-500 animate-pulse">
                                                <Zap size={16} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="mt-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 transition-all duration-300">
                            <p className="text-[10px] leading-relaxed text-gray-400">
                                {courseData.standards === 'Global (ISO/IEC)' && (
                                    <>
                                        <span className="text-lime-400 font-bold tracking-wider uppercase mr-2 text-[9px]">Global Standard:</span>
                                        High-level international standards ensure your course is recognized and consistent across all borders and countries.
                                    </>
                                )}
                                {courseData.standards === 'Regional' && (
                                    <>
                                        <span className="text-lime-400 font-bold tracking-wider uppercase mr-2 text-[9px]">Regional Standard:</span>
                                        Focuses on educational or professional requirements specific to a particular continent, region, or geographic area.
                                    </>
                                )}
                                {courseData.standards === 'Industry Specific' && (
                                    <>
                                        <span className="text-lime-400 font-bold tracking-wider uppercase mr-2 text-[9px]">Industry Standard:</span>
                                        Tailors content to meet stringent professional requirements in specialized fields like Medical, Legal, or Technical sectors.
                                    </>
                                )}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Course Tone & Style</label>
                            <div className="relative">
                                {/* Custom Style Dropdown Trigger */}
                                <div
                                    onClick={() => { setIsStyleOpen(!isStyleOpen); setIsStandardsOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all select-none"
                                    style={{ background: '#181d2a', border: '1px solid #252b3b' }}
                                >
                                    <Palette className="text-gray-400 w-4 h-4 flex-shrink-0" />
                                    <span className="flex-1 text-sm text-gray-200">{courseData.courseStyle || 'Academic / Formal Style'}</span>
                                    <ChevronDown
                                        className={`text-gray-400 w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isStyleOpen ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>

                                {/* Style dropdown panel */}
                                <AnimatePresence>
                                    {isStyleOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scaleY: 0.88, y: -10, filter: 'blur(4px)' }}
                                            animate={{ opacity: 1, scaleY: 1, y: 0, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, scaleY: 0.88, y: -10, filter: 'blur(4px)' }}
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            style={{ transformOrigin: 'top', background: '#141824', border: '1px solid #252b3b' }}
                                            className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                                        >
                                            {STYLE_OPTIONS.map((opt, i) => (
                                                <motion.div
                                                    key={opt}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.02 + i * 0.02, duration: 0.12 }}
                                                    onClick={() => {
                                                        updateCourseData({ courseStyle: opt });
                                                        setIsStyleOpen(false);
                                                    }}
                                                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none"
                                                    style={{
                                                        color: (courseData.courseStyle || 'Academic / Formal Style') === opt ? '#84cc16' : '#d1d5db',
                                                        background: (courseData.courseStyle || 'Academic / Formal Style') === opt ? 'rgba(132,204,22,0.07)' : 'transparent',
                                                        transition: 'background 0.12s, color 0.12s',
                                                    }}
                                                    onMouseEnter={e => {
                                                        if ((courseData.courseStyle || 'Academic / Formal Style') !== opt) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        if ((courseData.courseStyle || 'Academic / Formal Style') !== opt) (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                    }}
                                                >
                                                    <span className="text-sm">{opt}</span>
                                                    <AnimatePresence>
                                                        {(courseData.courseStyle || 'Academic / Formal Style') === opt && (
                                                            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                                                                <Check size={14} className="text-lime-400" />
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-12 flex justify-start">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={goToNextStep}
                        disabled={isGeneratingDescription}
                        className="flex items-center gap-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-wait disabled:transform-none"
                        type="button"
                    >
                        {isGeneratingDescription ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing Description...
                            </>
                        ) : (
                            <>
                                Next Step <ChevronRight size={20} strokeWidth={3} />
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Right Side: Orion Guidance */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 xl:w-[38%] bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8"
            >
                {/* Background glow lines */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none"></div>

                <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                    <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
                </div>

                <div className="relative z-10">
                    <div className="mb-6 pr-48 text-left min-h-[140px]">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight flex items-center gap-2">
                            Hey! Welcome to the first step <Sparkles className="text-lime-400 w-6 h-6 animate-pulse" />
                        </h3>
                        <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                            Hey! I'm <span className="text-lime-400 font-bold px-1 bg-lime-400/10 rounded">Orion</span> again, and I'll guide you in shaping the core of your course. Let's define a few key details so I can build everything exactly the way you need.
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
                                    <p><span className="text-lime-400 font-bold flex items-center gap-1"><Globe className="w-3 h-3" /> Global (ISO/IEC):</span> High-level international standards for consistency across borders.</p>
                                    <p><span className="text-lime-400 font-bold flex items-center gap-1"><MapPin className="w-3 h-3" /> Regional:</span> Standards specific to a geographic area or continent.</p>
                                    <p><span className="text-lime-400 font-bold flex items-center gap-1"><Wrench className="w-3 h-3" /> Industry Specific:</span> Focused standards for fields like Medical, Legal, or Tech.</p>
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
                            <span className="text-lime-400 mt-0.5 text-lg"><Rocket className="w-5 h-5" /></span>
                            <div>
                                <h6 className="text-lime-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Orion Insight</h6>
                                <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">The clearer your inputs, the smarter and more tailored your course will be.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 text-center">
                        <p className="text-gray-500 text-xs font-semibold tracking-wide">
                            "Once you're ready, continue—I'll take care of the next step." <Sparkles className="inline-block w-4 h-4 text-lime-400" />
                        </p>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
};

export default CourseStepOne;
