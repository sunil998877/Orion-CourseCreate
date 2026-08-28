import React, { useEffect, useMemo } from 'react';
import { Check, Headphones, Loader2, Mic2, X } from 'lucide-react';
type Props = {
    courseTitle: string;
    progress: number;
    isGenerating: boolean;
    error: string | null;
    hasPodcast: boolean;
    onGenerate: () => void;
    onListen: () => void;
    onClose: () => void;
};
const STAGES = [
    { at: 0, label: 'Writing dialogue' },
    { at: 28, label: 'Voicing Host A' },
    { at: 55, label: 'Voicing Host B' },
    { at: 82, label: 'Mixing episode' },
];
const Waveform = ({ active }: {
    active: boolean;
}) => (<div className="flex h-[84px] items-end justify-center gap-[3px]" aria-hidden>
    {[10, 22, 36, 54, 70, 48, 78, 40, 62, 28, 50, 82, 46, 32, 20, 38, 66, 44, 26, 16, 30, 52, 24, 14, 34, 58, 42, 18].map((h, i) => (<span key={i} className="w-[4px] rounded-full bg-[#D4FF4F] origin-bottom" style={{
            height: h,
            opacity: active ? (i % 4 === 0 ? 0.35 : 0.95) : 0.22,
            animation: active ? `podcast-bar 1.1s ease-in-out ${i * 0.04}s infinite` : undefined,
        }}/>))}
  </div>);
const GeneratePodcastModal: React.FC<Props> = ({ courseTitle, progress, isGenerating, error, hasPodcast, onGenerate, onListen, onClose, }) => {
    const stage = useMemo(() => {
        const current = [...STAGES].reverse().find((s) => progress >= s.at);
        return current?.label || STAGES[0].label;
    }, [progress]);
    const done = !isGenerating && hasPodcast && !error;
    const failed = !isGenerating && Boolean(error);
    const canClose = !isGenerating;
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && canClose)
                onClose();
        };
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [canClose, onClose]);
    return (<div className="fixed inset-0 z-[280] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn max-md:items-end max-md:p-0" onClick={() => {
            if (canClose)
                onClose();
        }} role="presentation">
      <style>{`
        @keyframes podcast-bar {
          0%, 100% { transform: scaleY(0.45); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      <div role="dialog" aria-modal="true" aria-labelledby="podcast-generate-title" onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#0c0c0c] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/10 animate-fadeInUp max-md:rounded-t-2xl max-md:rounded-b-none">
        {canClose && (<button type="button" onClick={onClose} className="absolute right-3 top-3 rounded-full p-2 text-white/35 hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="h-4 w-4"/>
          </button>)}

        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
            <rect width="32" height="32" rx="8" fill="#111"/>
            <rect x="9" y="8" width="4.2" height="16" rx="1.2" fill="#fff"/>
            <rect x="18.8" y="8" width="4.2" height="16" rx="1.2" fill="#fff"/>
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Podcast studio
          </span>
        </div>

        <div className="mt-6">
          <Waveform active={isGenerating}/>
        </div>

        {!isGenerating && !done && !failed && (<>
            <h3 id="podcast-generate-title" className="mt-5 text-[22px] font-semibold tracking-tight">
              Generate a two-host episode
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-white/50">
              {courseTitle
                ? `Create a conversational podcast from "${courseTitle}". Two hosts, studio voices, mixed into one episode.`
                : 'Create a conversational podcast with two hosts, studio voices, and a mixed episode.'}
            </p>
            <ul className="mt-4 space-y-2 text-[12px] text-white/55">
              <li className="flex items-center gap-2">
                <Mic2 className="h-3.5 w-3.5 text-[#D4FF4F]"/>
                Host A and Host B dialogue
              </li>
              <li className="flex items-center gap-2">
                <Headphones className="h-3.5 w-3.5 text-[#D4FF4F]"/>
                Downloadable MP3 when ready
              </li>
            </ul>
            <button type="button" onClick={onGenerate} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF4F] py-2.5 text-sm font-semibold text-black hover:bg-[#e6ff7a]">
              Generate episode
            </button>
            <button type="button" onClick={onClose} className="mt-3 w-full py-1.5 text-xs font-medium text-white/40 hover:text-white">
              Not now
            </button>
          </>)}

        {isGenerating && (<>
            <h3 id="podcast-generate-title" className="mt-5 text-[22px] font-semibold tracking-tight">
              Generating your episode
            </h3>
            <p className="mt-2 text-[13.5px] text-white/50">{stage}…</p>
            <div className="mt-5 rounded-xl bg-white/[0.04] px-3.5 py-3">
              <div className="mb-2 flex items-center justify-between text-[11px] font-medium">
                <span className="text-white/45">Render progress</span>
                <span className="text-[#D4FF4F]">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#D4FF4F] transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(4, progress))}%` }}/>
              </div>
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/35">
              <Loader2 className="h-3.5 w-3.5 animate-spin"/>
              Keep this window open until mixing finishes
            </p>
          </>)}

        {done && (<>
            <div className="mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#D4FF4F] text-black">
              <Check className="h-5 w-5"/>
            </div>
            <h3 id="podcast-generate-title" className="mt-4 text-[22px] font-semibold tracking-tight">
              Episode is ready
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-white/50">
              Your two-host podcast has been mixed. Play it now or download it from the course page.
            </p>
            <button type="button" onClick={onListen} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4FF4F] py-2.5 text-sm font-semibold text-black hover:bg-[#e6ff7a]">
              <Headphones className="h-4 w-4"/>
              Listen now
            </button>
            <button type="button" onClick={onClose} className="mt-3 w-full py-1.5 text-xs font-medium text-white/40 hover:text-white">
              Close
            </button>
          </>)}

        {failed && (<>
            <h3 id="podcast-generate-title" className="mt-5 text-[22px] font-semibold tracking-tight">
            Generation did not finish
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-white/50">{error}</p>
            <button type="button" onClick={onGenerate} className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#D4FF4F] py-2.5 text-sm font-semibold text-black hover:bg-[#e6ff7a]">
              Try again
            </button>
            <button type="button" onClick={onClose} className="mt-3 w-full py-1.5 text-xs font-medium text-white/40 hover:text-white">
              Close
            </button>
          </>)}
      </div>
    </div>);
};
export default GeneratePodcastModal;
