import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ChevronDown, FileText, Shield, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';

const LEVELS = ['Level 1 — Controlling authority', 'Level 2 — Strong support', 'Level 3 — Explanatory support', 'Level 4 — General explanation'];

const labelClass = 'block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider group-hover:text-lime-500 transition-colors';
const controlClass = 'w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:ring-2 focus:ring-lime-500 outline-none transition-all hover:border-gray-600';

const CourseForgeInput: React.FC<{ part: 'basics' | 'structure' }> = ({ part }) => {
    const { courseData, uploadCourseSource, courseForgeBusy } = useCourseCreator();
    const forge = courseData.courseForge || {};
    const [sourceTitle, setSourceTitle] = useState('');
    const [sourceLevel, setSourceLevel] = useState(LEVELS[0]);
    const [isLevelOpen, setIsLevelOpen] = useState(false);
    const levelRef = useRef<HTMLDivElement>(null);
    const [sourceText, setSourceText] = useState('');
    const [sourceFile, setSourceFile] = useState<File | null>(null);

    useEffect(() => {
        if (!isLevelOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (levelRef.current && !levelRef.current.contains(event.target as Node)) {
                setIsLevelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLevelOpen]);

    if (part !== 'basics')
        return null;
    return (
        <div className="mt-10 rounded-2xl border border-gray-700 bg-gray-800/30 p-5 space-y-5">
            <div>
                <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Source material</p>
                <p className="text-xs text-gray-500 mt-1">Optional. Add the document Orion should follow. Skip this if you are entering the course yourself.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                    <label className={labelClass}>Source title</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input value={sourceTitle} placeholder="Official manual or standard name" onChange={(e) => setSourceTitle(e.target.value)} className={controlClass} />
                    </div>
                </div>
                <div className="group">
                    <label className={labelClass}>Authority level</label>
                    <div ref={levelRef} className={`relative ${isLevelOpen ? 'z-30' : 'z-10'}`}>
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none z-10" />
                        <div
                            onClick={() => setIsLevelOpen((prev) => !prev)}
                            className={`w-full bg-gray-800/50 border rounded-xl py-3 pl-11 pr-10 flex items-center justify-between cursor-pointer transition-all ${
                                isLevelOpen
                                    ? 'border-lime-500 ring-2 ring-lime-500/20'
                                    : 'border-gray-700 hover:border-gray-600'
                            }`}
                        >
                            <span className="text-sm text-white select-none truncate">{sourceLevel}</span>
                            <ChevronDown
                                className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-transform ${
                                    isLevelOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </div>
                        <AnimatePresence>
                            {isLevelOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute z-50 w-full mt-2 bg-[#111827] border border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                                >
                                    <div className="p-2 space-y-1">
                                        {LEVELS.map((option) => {
                                            const isSelected = sourceLevel === option;
                                            return (
                                                <div
                                                    key={option}
                                                    onClick={() => {
                                                        setSourceLevel(option);
                                                        setIsLevelOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${
                                                        isSelected
                                                            ? 'bg-lime-500/20 text-lime-400 font-medium'
                                                            : 'text-gray-300 hover:bg-white/5'
                                                    }`}
                                                >
                                                    <span className="truncate">{option}</span>
                                                    {isSelected && <Check size={16} className="text-lime-500 shrink-0 ml-2" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <div className="group">
                <label className={labelClass}>Source text</label>
                <div className="relative">
                    <BookOpen className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
                    <textarea value={sourceText} placeholder="Paste the source, or upload a file below" onChange={(e) => setSourceText(e.target.value)} className={`${controlClass} min-h-[96px] resize-none`} />
                </div>
            </div>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-gray-600 bg-gray-900/40 px-4 py-3 cursor-pointer hover:border-lime-500/40 transition-colors">
                <span className="flex items-center gap-3 text-sm text-gray-400">
                    <Upload className="w-4 h-4 text-lime-400" />
                    {sourceFile ? sourceFile.name : 'Upload PDF, DOCX, or TXT'}
                </span>
                <input type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={(e) => setSourceFile(e.target.files?.[0] || null)} />
            </label>
            <button type="button" disabled={courseForgeBusy === 'source'} onClick={() => uploadCourseSource(sourceFile, { title: sourceTitle || sourceFile?.name || 'Source', level: sourceLevel, text: sourceText, forbidden: false })} className="inline-flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50">
                {courseForgeBusy === 'source' ? 'Reading source...' : 'Add source'}
            </button>
            {(forge.sources || []).length > 0 && (
                <ul className="space-y-2">
                    {(forge.sources || []).map((source: any, index: number) => (
                        <li key={`${source.title}-${index}`} className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900/50 px-4 py-2 text-sm text-gray-200">
                            <span>{source.title}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">{source.level}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CourseForgeInput;
