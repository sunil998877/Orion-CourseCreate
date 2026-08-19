import React from 'react';
import { Headphones } from 'lucide-react';

interface AudioTranscriptProps {
  transcript?: string;
  onGenerate: () => void;
}

export const AudioTranscript: React.FC<AudioTranscriptProps> = ({
  transcript,
  onGenerate,
}) => {
  return (
    <div className="mt-10 animate-fadeInUp">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white/90">
        <div className="w-1 h-6 bg-lime-500 rounded-full" />
        Course Narrative Transcript
      </h3>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Headphones className="w-16 h-16" />
        </div>
        {transcript ? (
          <p className="text-white/70 leading-relaxed font-serif text-lg italic whitespace-pre-line relative z-10">
            "{transcript}"
          </p>
        ) : (
          <div className="text-center py-6 relative z-10">
            <p className="text-white/40 italic mb-4">
              No transcript has been generated for this course yet.
            </p>
            <button
              type="button"
              onClick={onGenerate}
              className="text-xs font-bold text-lime-400 hover:text-lime-300 uppercase tracking-widest border border-lime-500/20 px-4 py-2 rounded-lg hover:bg-lime-500/5 transition-all"
            >
              Generate Audio &amp; Transcript Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioTranscript;
