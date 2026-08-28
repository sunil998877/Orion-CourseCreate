import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import CourseNotifications from './CourseNotifications';
import logo5 from '../../assests/logo5.png';
const CourseHeader: React.FC = () => {
    const { handleExitArchitect } = useCourseCreator();
    return (<nav className="relative z-[100] py-4 px-8 border-b border-white/10 backdrop-blur-xl bg-black/40 max-md:px-3 max-md:py-3">
            <div className="w-full flex justify-between items-center transition-all duration-500">
                <div className="flex-1 flex justify-start">
                    <div className="flex flex-col items-start gap-1">
                        <img src={logo5} alt="ORION Logo" className="h-16 w-auto hover:rotate-3 transition-transform cursor-pointer max-md:h-10"/>
                        <div className="flex items-center gap-2 max-md:hidden">
                            <span className="text-lime-400 text-[9px] font-black uppercase tracking-[0.2em] leading-none">EVOKE AI</span>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex flex-col items-center flex-1 justify-center translate-x-4">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        Course Creator <span className="text-lime-500/30">|</span> <span className="text-[10px] font-black uppercase tracking-widest text-lime-400/80">Architect Mode</span>
                    </h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">Designing Precision Learning</p>
                </div>


                <div className="flex-1 flex items-center justify-end gap-6 max-md:gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExitArchitect} className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-lime-500/30 transition-all text-xs font-bold shadow-sm">
                        <ChevronLeft size={16} strokeWidth={2.5} className="text-lime-500"/>
                        Exit Architect
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleExitArchitect} aria-label="Exit Architect" className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-lime-400">
                        <ChevronLeft size={18} strokeWidth={2.5}/>
                    </motion.button>

                    <div className="h-8 w-px bg-white/10 hidden md:block"/>


                    <CourseNotifications />
                </div>
            </div>
        </nav>);
};
export default CourseHeader;
