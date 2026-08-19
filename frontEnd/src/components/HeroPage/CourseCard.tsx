import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Trash2 } from 'lucide-react';
import type { Course } from '../../types/Course.types';

export const CourseCard: React.FC<{ course: Course; index: number; onClick: () => void; onDelete: () => void; variants: any }> = ({ course, index, onClick, onDelete, variants }) => (
<motion.div key={index} variants={variants} onClick={onClick} className="group relative bg-[#111827]/40 border border-white/5 rounded-3xl p-8 hover:border-lime-500/30 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md hover:shadow-[0_0_50px_-12px_rgba(132,204,22,0.15)]">
  <div className="absolute inset-0 bg-gradient-to-br from-lime-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  <div className="relative z-10">
    <div className="flex justify-between items-start mb-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-400/20 to-emerald-600/20 flex items-center justify-center border border-lime-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
        <GraduationCap className="w-7 h-7 text-lime-400" />
      </div>
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest group-hover:text-lime-400 transition-colors">
          {course.level || 'Beginner'}
        </span>
        <button type="button" aria-label="Delete course" onClick={e =>
          { e.stopPropagation(); onDelete(); }} className="p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-400/40 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all active:scale-90">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-lime-400 transition-colors line-clamp-1">
      {course.title}
    </h3>
    <p className="text-white/40 text-sm mb-8 line-clamp-2 h-10 leading-relaxed font-medium">
      {course.description || 'Architecting the future of specialized learning modules.'}
    </p>
    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.1em] text-white/20 border-t border-white/5 pt-6 group-hover:text-white/40 transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-lime-500/40" />
        <span>
          {course.module || 0} Modules
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
        <span>
          {course.duration?.value || 0} {course.duration?.unit || 'hrs'}
        </span>
      </div>
    </div>
  </div>
</motion.div>
);
