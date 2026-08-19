import React from 'react';
    import type { Course } from '../../types/Course.types';

export const PodcastTranscript: React.FC<{
  course: Course;
  activeIndex: number;
  onGenerate: () => void;
}> = ({ course, activeIndex, onGenerate }) => (
  <div className="mt-10 animate-fadeInUp">
    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white/90">
      <div className="w-1 h-6 bg-lime-500 rounded-full" />
      Course Dialogue: Podcast Edition
    </h3>
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm max-h-[500px] overflow-y-auto space-y-6">
      {course.podcastScript?.length ? (
        course.podcastScript.map((turn, index) => {
          const isHostA =
            turn.speaker.toLowerCase().includes('hosta') ||
            turn.speaker.toLowerCase().includes('alex');
          const active = index === activeIndex;

          return (
            <div
              key={index}
              className={`flex gap-4 items-start ${isHostA ? 'justify-start' : 'justify-end'}`}
            >
              {isHostA && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black text-xs">
                  AL
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-3.5 ${isHostA ? 'bg-slate-800/60 border border-slate-700/50 text-slate-100' : 'bg-emerald-950/50 border border-emerald-500/20 text-emerald-100'} ${active ? 'ring-2 ring-lime-400 scale-[1.02]' : ''}`}
              >
                <div className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-1">
                  {isHostA ? 'Alex (Co-host)' : 'Sam (Host)'}
                </div>
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {turn.text}
                </p>
              </div>
              {!isHostA && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex-shrink-0 flex items-center justify-center text-white font-black text-xs">
                  SM
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-8">
          <p className="text-white/40 italic mb-4">
            No podcast has been generated for this course yet.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            className="text-xs font-bold text-lime-400 border border-lime-500/20 px-4 py-2 rounded-lg"
          >
            Generate Podcast Now
          </button>
        </div>
      )}
    </div>
  </div>
);
