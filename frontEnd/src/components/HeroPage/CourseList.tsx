import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Plus } from 'lucide-react';
import type { Course } from '../../types/Course.types';
import { CourseCard } from './CourseCard';

export const CourseList: React.FC<{ courses: Course[]; isSearching: boolean; onCourseClick: (c: Course) => void; onDelete: (c: Course) => void; onCreateNew: () => void }> = ({ courses, isSearching, onCourseClick, onDelete, onCreateNew }) => {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="animate-fadeIn">
      <div className="mb-10 relative">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-lime-500/10 blur-[120px] rounded-full pointer-events-none" />
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
          Course
          <span className="text-lime-400">
            Dashboard
          </span>
        </h1>
        <p className="text-white/40 font-medium tracking-wide uppercase text-[10px]">
          Manage your educational ecosystem
        </p>
      </div>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, idx) => <CourseCard key={course._id || course.courseId || idx} course={course} index={idx} onClick={() => onCourseClick(course)} onDelete={() => onDelete(course)} variants={itemVariants} />)}
        {!courses.length && (isSearching ?
          <div className="col-span-full flex items-center justify-center p-8 rounded-2xl text-white">
            <p>
              there is no such course available
            </p>
          </div>
          :
          <div className="col-span-full flex flex-col items-center justify-center p-8 border border-white/10 rounded-2xl bg-white/5 text-white/70">
            <GraduationCap className="w-8 h-8 mb-2 text-white/60" />
            <p className="mb-4">
              No courses yet
            </p>
          </div>
        )}
        {!isSearching &&
          <motion.button variants={itemVariants} onClick={onCreateNew} className="group relative flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-white/10 rounded-3xl hover:border-lime-500/50 hover:bg-lime-500/5 transition-all duration-500 w-full overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lime-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 group-hover:bg-lime-500/20 border border-white/5 group-hover:border-lime-500/30">
              <Plus className="w-10 h-10 text-white/20 group-hover:text-lime-400 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white/40 group-hover:text-white transition-colors tracking-tight">
              Architect New Course
            </h3>
          </motion.button>
        }
      </motion.div>
    </div>
  );
};
