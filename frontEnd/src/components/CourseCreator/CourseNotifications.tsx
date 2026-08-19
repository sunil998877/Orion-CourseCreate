import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';

const CourseNotifications: React.FC = () => {
    const {
        notifDropdownRef, notifOpen, setNotifOpen, fetchNotifications,
        notifications, markAllRead, removeAllNotifications
    } = useCourseCreator();

    return (
        <div className="relative" ref={notifDropdownRef}>
            <button
                className={`p-2 rounded-full border transition-all relative group ${notifOpen ? 'bg-lime-500/25 border-lime-500/70' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
            >
                <Bell className={`w-5 h-5 transition-all ${notifOpen ? 'text-lime-400' : 'text-white/70 group-hover:text-lime-400 group-hover:rotate-12'}`} />
                {notifications.some((n: any) => !n.isRead) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-lime-500 rounded-full ring-2 ring-black animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {notifOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-3 w-80 bg-[#0A0F1A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] ring-1 ring-white/5"
                        >
                            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-widest opacity-80">Notifications</span>
                                <div className="flex gap-2">
                                    <button
                                        className="text-[10px] px-2 py-1 rounded-lg bg-lime-500/20 text-lime-300 hover:bg-lime-500/30 transition font-bold"
                                        onClick={markAllRead}
                                    >
                                        Mark All Read
                                    </button>
                                    <button
                                        className="text-[10px] px-2 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition font-bold"
                                        onClick={removeAllNotifications}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-80 overflow-auto scrollbar-thin scrollbar-thumb-white/10">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-12 text-center flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                            <Bell className="w-6 h-6 text-white/40" />
                                        </div>
                                        <span className="text-sm text-white/60 font-medium">No new notifications</span>
                                    </div>
                                ) : (
                                    notifications.map((n: any, i: any) => (
                                        <div
                                            key={i}
                                            className={`px-4 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors relative group ${!n.isRead ? 'bg-lime-500/[0.02]' : ''}`}
                                        >
                                            {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-400" />}
                                            <p className="text-sm text-white font-medium leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-white/50 mt-2 font-bold uppercase tracking-wider">
                                                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourseNotifications;
