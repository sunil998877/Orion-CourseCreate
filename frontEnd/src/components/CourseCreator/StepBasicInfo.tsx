
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Zap, ChevronRight, ChevronLeft, ChevronDown,
  FileText, Target, Globe, Plus, Palette, Sparkles, Layers,
  AlertCircle, AlertTriangle, Pencil, Loader2, BookOpen, Eye, Monitor,
  Construction, Lightbulb, RefreshCw, Book, Download, MapPin, Wrench, Rocket
} from 'lucide-react';


const INDUSTRIES = [
  "Technology & Software", "Healthcare & Medicine", "Finance & Banking",
  "Education & E-Learning", "Manufacturing", "Retail & E-Commerce",
  "Legal", "Real Estate", "Marketing & Advertising"
];

const AUDIENCE_OPTIONS: Record<string, string[]> = {
  'Beginner': ['Students', 'Career Changers', 'Enthusiasts', 'General Public', 'Junior Staff'],
  'Intermediate': ['Practitioners', 'Mid-level Professionals', 'Specialists', 'Managers', 'Consultants'],
  'Advanced': ['Senior Experts', 'Directors', 'Researchers', 'Strategists', 'Architects'],
  'Professional': ['C-Level Executives', 'Industry Leaders', 'Principal Engineers', 'Fellows', 'Regulators']
};

interface StepBasicInfoProps {
  courseData: any;
  updateCourseData: (data: any) => void;
  showValidation: boolean;
  hasAudience: (audience?: string | string[]) => boolean;
  goToNextStep: () => void;
  isGeneratingDescription: boolean;
  containerVariants: any;
  itemVariants: any;
  stepVariants: any;
  WarningSign: React.FC;
  avatar: string;
}

export const StepBasicInfo: React.FC<StepBasicInfoProps> = ({
  courseData,
  updateCourseData,
  showValidation,
  hasAudience,
  goToNextStep,
  isGeneratingDescription,
  containerVariants,
  itemVariants,
  stepVariants,
  WarningSign,
  avatar
}) => {

  const [isCustomCountry, setIsCustomCountry] = useState(false);
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [isCustomAudience, setIsCustomAudience] = useState(false);
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [customAudienceInput, setCustomAudienceInput] = useState('');
  const audienceDropdownRef = useRef<HTMLDivElement>(null);


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
        className="flex-1 xl:w-[65%] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group/card shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)]"
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
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                {!courseData.level ? (
                  <div className="relative group opacity-60">
                    <input
                      disabled
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-gray-500 cursor-not-allowed transition-all"
                      placeholder="Please select an Experience Level first..."
                      value=""
                    />
                  </div>
                ) : (
                  <div className="relative" ref={audienceDropdownRef}>
                    <div
                      onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
                      className={`w-full min-h-[50px] bg-gray-800/50 border rounded-xl py-2 pl-11 pr-10 flex flex-wrap items-center gap-2 cursor-pointer transition-all ${showValidation && !hasAudience(courseData.audience) ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700'}`}
                    >
                      {Array.isArray(courseData.audience) && courseData.audience.length > 0 ? (
                        courseData.audience.map((aud: string, idx: number) => (
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
                      ) : (typeof courseData.audience === 'string' && courseData.audience.trim() ? (
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
                        <span className="text-gray-500 select-none py-1">Select Target Audiences...</span>
                      ))}
                    </div>
                    <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none transition-transform ${isAudienceDropdownOpen ? 'rotate-180' : ''}`} />

                    <AnimatePresence>
                      {isAudienceDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                        >
                          <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {/* Select All Option */}
                            {(() => {
                              const allOptions = AUDIENCE_OPTIONS[courseData.level] || [];
                              const currentAudience = Array.isArray(courseData.audience) ? courseData.audience : (courseData.audience ? [courseData.audience] : []);
                              const allSelected = allOptions.length > 0 && allOptions.every(opt => currentAudience.includes(opt));
                              return (
                                <div
                                  onClick={() => {
                                    if (allSelected) {
                                      updateCourseData({ audience: [] });
                                    } else {
                                      updateCourseData({ audience: [...allOptions] });
                                    }
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between border-b border-white/5 mb-1 pb-2 ${allSelected ? 'bg-lime-500/10 text-lime-400' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                >
                                  <span className="font-bold uppercase tracking-wider text-xs">Select All</span>
                                  {allSelected && <Check size={16} className="text-lime-500" />}
                                </div>
                              );
                            })()}
                            {AUDIENCE_OPTIONS[courseData.level]?.map(opt => {
                              const isSelected = Array.isArray(courseData.audience)
                                ? courseData.audience.includes(opt)
                                : courseData.audience === opt;
                              return (
                                <div
                                  key={opt}
                                  onClick={() => {
                                    let current = Array.isArray(courseData.audience) ? [...courseData.audience] : (courseData.audience ? [courseData.audience] : []);
                                    if (isSelected) {
                                      current = current.filter(a => a !== opt);
                                    } else {
                                      current.push(opt);
                                    }
                                    updateCourseData({ audience: current });
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-lime-500/10 text-lime-400' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                >
                                  {opt}
                                  {isSelected && <Check size={16} className="text-lime-500" />}
                                </div>
                              );
                            })}
                          </div>
                          <div className="p-2 border-t border-gray-700 bg-gray-900/50">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customAudienceInput}
                                onChange={(e) => setCustomAudienceInput(e.target.value)}
                                onKeyDown={(e) => {
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
                                }}
                                placeholder="Add custom audience..."
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
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
                                }}
                                className="bg-lime-500/20 text-lime-400 p-2 rounded-lg hover:bg-lime-500/30 transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
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
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <select
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-lime-500 outline-none appearance-none cursor-pointer"
                  value={courseData.standards}
                  onChange={(e) => {
                    updateCourseData({ standards: e.target.value });
                    if (e.target.value !== 'Regional') {
                      updateCourseData({ country: '' });
                    }
                  }}
                >
                  <option>Global (ISO/IEC)</option>
                  <option>Regional</option>
                  <option>Industry Specific</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              </div>
              {courseData.standards === 'Regional' && (
                <div className="mt-3 pl-4 border-l-2 border-lime-500/40 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[11px] font-semibold text-lime-400 mb-1.5 uppercase tracking-wider">Specific Region/Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    {!isCustomCountry ? (
                      <select
                        className={`w-full bg-gray-800/30 border rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-2 focus:ring-lime-500 outline-none appearance-none cursor-pointer transition-all ${showValidation && !courseData.country ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700/50 hover:border-gray-600'
                          }`}
                        value={courseData.country}
                        onChange={(e) => {
                          if (e.target.value === 'Other') {
                            setIsCustomCountry(true);
                            updateCourseData({ country: '' });
                          } else {
                            updateCourseData({ country: e.target.value });
                          }
                        }}
                      >
                        <option value="">Select a region...</option>
                        <option>Australia</option>
                        <option>Canada</option>
                        <option>India</option>
                        <option>United States</option>
                        <option>London (UK)</option>
                        <option value="Other">Other / Custom...</option>
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          autoFocus
                          className="w-full bg-gray-800/30 border border-lime-500/50 rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-2 focus:ring-lime-500 outline-none"
                          placeholder="Type custom region..."
                          value={courseData.country}
                          onChange={(e) => updateCourseData({ country: e.target.value })}
                        />
                        <button
                          onClick={() => {
                            setIsCustomCountry(false);
                            updateCourseData({ country: '' });
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {!isCustomCountry && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />}
                    {showValidation && !courseData.country && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 animate-pulse">
                        <Zap size={18} fill="currentColor" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {courseData.standards === 'Industry Specific' && (
                <div className="mt-3 pl-4 border-l-2 border-lime-500/40 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[11px] font-semibold text-lime-400 mb-1.5 uppercase tracking-wider">Select Industry</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    {!isCustomIndustry ? (
                      <select
                        className={`w-full bg-gray-800/30 border rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-2 focus:ring-lime-500 outline-none appearance-none cursor-pointer transition-all ${showValidation && !courseData.industry ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700/50 hover:border-gray-600'
                          }`}
                        value={courseData.industry}
                        onChange={(e) => {
                          if (e.target.value === 'Other') {
                            setIsCustomIndustry(true);
                            updateCourseData({ industry: '' });
                          } else {
                            updateCourseData({ industry: e.target.value });
                          }
                        }}
                      >
                        <option value="">Select an industry...</option>
                        {INDUSTRIES.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                        <option value="Other">Other / Custom...</option>
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          autoFocus
                          className="w-full bg-gray-800/30 border border-lime-500/50 rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-2 focus:ring-lime-500 outline-none"
                          placeholder="Type custom industry..."
                          value={courseData.industry}
                          onChange={(e) => updateCourseData({ industry: e.target.value })}
                        />
                        <button
                          onClick={() => {
                            setIsCustomIndustry(false);
                            updateCourseData({ industry: '' });
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {!isCustomIndustry && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />}
                    {showValidation && !courseData.industry && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 animate-pulse">
                        <Zap size={18} fill="currentColor" />
                      </div>
                    )}
                  </div>
                </div>
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
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <select
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-lime-500 outline-none appearance-none cursor-pointer"
                  value={courseData.courseStyle || 'Academic / Formal Style'}
                  onChange={(e) => updateCourseData({ courseStyle: e.target.value })}
                >
                  <option>Academic / Formal Style</option>
                  <option>Storytelling Style</option>
                  <option>Interactive Coaching Style</option>
                  <option>Humanized Teaching Style</option>
                  <option>Modern Edutainment Style</option>
                  <option>Scenario-Based Style</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
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
