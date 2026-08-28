import { useState } from 'react';
import { Copy, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cleanTitle, type ModuleState } from './moduleTypes';

export const TranscriptModal = ({
  mod,
  onClose,
}: {
  mod: ModuleState;
  onClose: () => void;
}) => {
  const slides: any[] = Array.isArray(mod.slide?.Slides) ? mod.slide.Slides : [];
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const copySlide = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };
  const copyAll = () => {
    const all = slides
      .map((s, i) => `[Slide ${i + 1}: ${s.Title || ''}]\n${s.Transcript || s.transcript || ''}`)
      .join('\n\n');
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 max-md:p-2 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-950 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] max-md:max-h-[100dvh] max-md:h-full max-md:rounded-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-start justify-between gap-3 px-8 py-6 border-b border-white/5 shrink-0 max-md:flex-col max-md:px-4 max-md:py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-500/60 mb-1 max-md:tracking-wider">Voiceover Script</p>
            <h3 className="text-xl font-black text-white max-md:text-base leading-snug">
              Module {mod.id}: {cleanTitle(mod.Content?.Title || mod.Module)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{slides.length} slides · slide-by-slide transcript</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 max-md:w-full max-md:justify-between">
            <button
              onClick={copyAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 font-bold text-xs transition-all border border-lime-500/20 max-md:flex-1 max-md:justify-center"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedAll ? 'Copied!' : 'Copy All'}
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 px-8 py-6 space-y-4 custom-scrollbar max-md:px-3 max-md:py-4">
          {slides.length === 0 ? (
            <div className="text-center py-16 text-gray-500 italic">No slide transcripts found for this module yet.</div>
          ) : (
            slides.map((slide: any, i: number) => {
              const transcript = slide.Transcript || slide.transcript || '';
              return (
                <div
                  key={i}
                  className="group bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 hover:border-lime-500/20 p-5 transition-all duration-200 max-md:p-3 max-md:rounded-xl"
                >
                  <div className="flex items-start justify-between gap-4 mb-3 max-md:flex-col max-md:gap-2">
                    <div className="flex items-center gap-3 min-w-0 max-md:w-full">
                      <span className="px-3 h-8 rounded-xl bg-lime-500/10 text-lime-400 flex items-center justify-center font-black text-[10px] ring-1 ring-lime-500/20 shrink-0">
                        Slide {i + 1}
                      </span>
                      <span className="text-sm font-bold text-white max-md:text-[13px] leading-snug">{slide.Title || slide.title || `Slide ${i + 1}`}</span>
                    </div>
                    <button
                      onClick={() => copySlide(transcript, i)}
                      className="shrink-0 text-[10px] font-bold text-gray-500 hover:text-lime-400 flex items-center gap-1.5 transition-colors opacity-0 group-hover:opacity-100 max-md:opacity-100 max-md:self-end"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedIdx === i ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  {transcript ? (
                    <p className="text-sm text-gray-400 leading-relaxed italic pl-11 max-md:pl-0 max-md:text-[13px]">"{transcript}"</p>
                  ) : (
                    <p className="text-sm text-gray-600 italic pl-11 max-md:pl-0">No transcript for this slide.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
