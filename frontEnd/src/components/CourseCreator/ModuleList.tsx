import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import ModuleCard from './ModuleCard';

const PAGE_SIZE = 5;

const ModuleList: React.FC<{ openModuleId: number | null; onSelectModule: (id: number) => void; children?: React.ReactNode }> = ({ openModuleId, onSelectModule, children }) => {
    const { previewModules, scrollRefModules, handleModulesScroll } = useCourseCreator();
    const [page, setPage] = useState(0);
    const totalPages = Math.max(1, Math.ceil(previewModules.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages - 1);
    const visible = previewModules.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
    useEffect(() => {
        if (page > totalPages - 1)
            setPage(Math.max(0, totalPages - 1));
    }, [page, totalPages]);
    return (<div className="relative min-h-0">
            <div ref={scrollRefModules} onScroll={handleModulesScroll} className="flex flex-col gap-3">
                {visible.map((mod: any) => (<ModuleCard key={mod.id} mod={mod} expanded={openModuleId === mod.id} onSelect={() => onSelectModule(mod.id)} />))}
            </div>
            {(totalPages > 1 || children) && (
                <div className="mt-4 flex w-full items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
                    {totalPages > 1 ? (
                        <div className="inline-flex overflow-hidden rounded-xl border border-lime-500/40 bg-black/40">
                            <button type="button" disabled={safePage <= 0} onClick={() => setPage(safePage - 1)} className="inline-flex items-center gap-1 border-r border-lime-500/30 px-4 py-2 text-sm font-black text-gray-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">
                                <ChevronLeft className="h-4 w-4" /> Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button key={index} type="button" onClick={() => setPage(index)} className={`min-w-10 px-3 py-2 text-sm font-black transition-colors ${index === safePage ? 'bg-lime-500 text-black' : 'text-gray-300 hover:bg-white/5'}`}>
                                    {index + 1}
                                </button>
                            ))}
                            <button type="button" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)} className="inline-flex items-center gap-1 border-l border-lime-500/30 px-4 py-2 text-sm font-black text-gray-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">
                                Next <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    ) : <span />}
                    {children}
                </div>
            )}
        </div>);
};
export default ModuleList;
