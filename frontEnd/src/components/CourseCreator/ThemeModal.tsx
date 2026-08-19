import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import { GAMMA_THEMES, THEME_CATEGORIES } from '../../utils/themes';

const ThemeModal: React.FC = () => {
    const {
        isThemeModalOpen, selectedModuleForTheme, setIsThemeModalOpen, setSelectedModuleForTheme,
        themeFilter, setThemeFilter, themeByModule, setThemeByModule, courseData, updateCourseData
    } = useCourseCreator();

    if (!isThemeModalOpen) return null;

    return (
        <>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#12141a] border border-gray-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-800">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">
                                {selectedModuleForTheme !== null ? `Choose Theme for Module ${selectedModuleForTheme}` : 'Choose Default Theme for Slides'}
                            </h3>
                            <p className="text-gray-400 text-sm">Select a visual style for your Orion generated presentation.</p>
                        </div>
                        <button
                            onClick={() => {
                                setIsThemeModalOpen(false);
                                setSelectedModuleForTheme(null);
                            }}
                            className="p-2 text-gray-500 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all"
                            type="button"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {THEME_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setThemeFilter(cat)}
                                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${themeFilter === cat ? 'bg-transparent text-white border border-gray-600' : 'bg-transparent text-gray-500 border border-gray-800 hover:border-gray-600 hover:text-gray-300'}`}
                                    type="button"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Theme Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {GAMMA_THEMES.filter(t => themeFilter === 'All' || t.category === themeFilter).map(theme => (
                                <motion.button
                                    key={theme.id}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (selectedModuleForTheme !== null) {
                                            setThemeByModule((prev: any) => ({ ...prev, [selectedModuleForTheme]: theme.id }));
                                            setIsThemeModalOpen(false);
                                            setSelectedModuleForTheme(null);
                                        } else {
                                            updateCourseData({ orionTheme: theme.id });
                                            setIsThemeModalOpen(false);
                                        }
                                    }}
                                    className={`flex flex-col text-left rounded-[20px] p-4 border transition-all duration-300 ${(selectedModuleForTheme !== null ? (themeByModule[selectedModuleForTheme] || courseData.orionTheme) : courseData.orionTheme) === theme.id
                                        ? 'border-lime-500 bg-[#1e222b] shadow-[0_0_15px_rgba(132,204,22,0.1)]'
                                        : 'border-gray-800/80 hover:border-gray-600 bg-[#171a21]'}`}
                                    type="button"
                                >
                                    <div className={`w-full h-20 rounded-xl mb-4 ${theme.gradient} shadow-inner flex items-center justify-center`}>
                                        <div className="flex gap-1.5">
                                            {theme.colors.slice(0, 3).map((c, i) => (
                                                <div key={i} className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-white text-base">{theme.name}</span>
                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-lime-500/10 text-lime-400 font-black uppercase tracking-tighter">{theme.category}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {theme.style.split(', ').map(tag => (
                                                <span key={tag} className="px-1.5 py-0.5 rounded bg-black/40 text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ThemeModal;
