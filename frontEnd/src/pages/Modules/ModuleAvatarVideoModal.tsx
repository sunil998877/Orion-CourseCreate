import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Captions,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Video,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { API_BASE, ORIGIN } from '../../utils/api';
import avatarPlaceholder from '../../assests/avatar.png';

type SlideNarration = {
  slideNumber: number;
  title: string;
  script: string;
  bullets: string[];
  content: string;
};

type Props = {
  courseId: string;
  moduleNumber: number;
  moduleTitle?: string;
  gammaUrl?: string | null;
  onClose: () => void;
};

function estimateSeconds(script: string) {
  const words = String(script || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4, words / 2.4);
}

function formatTime(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function ModuleAvatarVideoModal({
  courseId,
  moduleNumber,
  moduleTitle,
  gammaUrl: gammaUrlProp,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gammaUrl, setGammaUrl] = useState<string | null>(gammaUrlProp || null);
  const [gammaImages, setGammaImages] = useState<string[]>([]);
  const [slides, setSlides] = useState<SlideNarration[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedInSlide, setElapsedInSlide] = useState(0);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showChapters, setShowChapters] = useState(false);
  const [chaptersPos, setChaptersPos] = useState<{ left: number; bottom: number; maxH: number } | null>(null);
  const mutedRef = useRef(false);
  const speedRef = useRef(1);
  const chaptersBtnRef = useRef<HTMLButtonElement | null>(null);
  const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tickRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const slideIndexRef = useRef(0);
  const playingRef = useRef(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    slideIndexRef.current = slideIndex;
  }, [slideIndex]);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    elapsedRef.current = elapsedInSlide;
  }, [elapsedInSlide]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [contentResp, imagesResp] = await Promise.all([
          fetch(
            `${API_BASE}/module-contents?courseId=${encodeURIComponent(courseId)}&moduleNumber=${moduleNumber}`,
            { headers }
          ),
          fetch(
            `${API_BASE}/courses/${encodeURIComponent(courseId)}/modules/${moduleNumber}/gamma-slide-images`,
            { headers }
          ),
        ]);

        if (!contentResp.ok) throw new Error('Failed to load module slides');
        const docs = await contentResp.json();
        const latest = Array.isArray(docs) && docs.length ? docs[0] : docs;
        const raw = latest?.slides ?? latest;
        const list: any[] = Array.isArray(raw?.Slides)
          ? raw.Slides
          : Array.isArray(raw)
            ? raw
            : [];

        const narrations: SlideNarration[] = list.map((slide, idx) => ({
          slideNumber: Number(slide?.SlideNumber || slide?.slideNumber || idx + 1),
          title: String(slide?.Title || slide?.title || `Slide ${idx + 1}`),
          script: String(slide?.Transcript || slide?.transcript || '').trim(),
          bullets: Array.isArray(slide?.Bullets)
            ? slide.Bullets.map((b: string) => String(b || '').trim()).filter(Boolean)
            : [],
          content: String(slide?.Content || slide?.content || '').trim(),
        }));

        let images: string[] = [];
        if (imagesResp.ok) {
          const imgData = await imagesResp.json();
          images = (imgData.images || []).map((p: string) =>
            p.startsWith('http') ? p : `${ORIGIN}${p.startsWith('/') ? p : `/${p}`}`
          );
          if (imgData.gammaUrl) setGammaUrl(imgData.gammaUrl);
        } else if (imagesResp.status !== 404) {
          const errBody = await imagesResp.json().catch(() => ({}));
          console.warn('Gamma slide images unavailable:', errBody?.message || imagesResp.status);
        }

        if (cancelled) return;

        let aligned = narrations;
        if (images.length && narrations.length < images.length) {
          aligned = [
            ...narrations,
            ...Array.from({ length: images.length - narrations.length }, (_, i) => ({
              slideNumber: narrations.length + i + 1,
              title: `Slide ${narrations.length + i + 1}`,
              script: '',
              bullets: [] as string[],
              content: '',
            })),
          ];
        } else if (images.length && narrations.length > images.length) {
          aligned = narrations.slice(0, images.length);
        }

        setSlides(aligned.length ? aligned : narrations);
        setGammaImages(images);
        setGammaUrl((prev) => latest?.gammaUrl || gammaUrlProp || prev || null);
        setSlideIndex(0);
        setElapsedInSlide(0);
        setPlaying(false);

        if (!aligned.length && !narrations.length && !images.length) {
          setError('No slides found for this module.');
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load slides');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (tickRef.current) window.cancelAnimationFrame(tickRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [courseId, moduleNumber, gammaUrlProp]);

  const durations = useMemo(
    () => slides.map((s) => estimateSeconds(s.script || s.content || s.title)),
    [slides]
  );

  const totalDuration = useMemo(
    () => durations.reduce((a, b) => a + b, 0),
    [durations]
  );

  const slideStarts = useMemo(() => {
    const starts: number[] = [];
    let acc = 0;
    for (let i = 0; i < durations.length; i++) {
      starts.push(acc);
      acc += durations[i];
    }
    return starts;
  }, [durations]);

  const currentTime = (slideStarts[slideIndex] || 0) + elapsedInSlide;
  const progress = totalDuration > 0 ? Math.min(1, currentTime / totalDuration) : 0;
  const current = slides[slideIndex] || null;
  const slideDur = durations[slideIndex] || 5;

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) window.speechSynthesis?.cancel();
  }, [muted]);

  const stopSpeech = () => window.speechSynthesis?.cancel();

  const speakSlide = useCallback((index: number) => {
    stopSpeech();
    if (mutedRef.current) return;
    const slide = slides[index];
    const text = slide?.script || slide?.content || slide?.title || '';
    if (!text || !('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    // Clamp to what SpeechSynthesis supports reliably across browsers
    utter.rate = Math.min(2, Math.max(0.5, speedRef.current));
    window.speechSynthesis.speak(utter);
  }, [slides]);

  const applyPlaybackSpeed = (next: number) => {
    speedRef.current = next;
    setPlaybackSpeed(next);
    if (playingRef.current && !mutedRef.current) {
      speakSlide(slideIndexRef.current);
    }
  };

  const cyclePlaybackSpeed = () => {
    const idx = SPEED_OPTIONS.findIndex((s) => Math.abs(s - playbackSpeed) < 0.001);
    const next = SPEED_OPTIONS[(idx < 0 ? 0 : idx + 1) % SPEED_OPTIONS.length];
    applyPlaybackSpeed(next);
  };

  const openChapters = () => {
    const btn = chaptersBtnRef.current;
    if (!btn) {
      setShowChapters((v) => !v);
      return;
    }
    if (showChapters) {
      setShowChapters(false);
      setChaptersPos(null);
      return;
    }
    const rect = btn.getBoundingClientRect();
    const gap = 10;
    const maxH = Math.max(160, Math.min(window.innerHeight * 0.55, rect.top - gap - 12));
    setChaptersPos({
      left: Math.min(rect.left, window.innerWidth - 300),
      bottom: window.innerHeight - rect.top + gap,
      maxH,
    });
    setShowChapters(true);
  };

  useEffect(() => {
    if (!showChapters) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowChapters(false);
        setChaptersPos(null);
      }
    };
    const onResize = () => {
      setShowChapters(false);
      setChaptersPos(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [showChapters]);

  const goToSlide = useCallback(
    (index: number, opts?: { playSpeech?: boolean; keepPlaying?: boolean }) => {
      const next = Math.max(0, Math.min(slides.length - 1, index));
      stopSpeech();
      setSlideIndex(next);
      setElapsedInSlide(0);
      elapsedRef.current = 0;
      if (opts?.playSpeech !== false && (opts?.keepPlaying || playingRef.current)) {
        speakSlide(next);
      }
    },
    [slides.length, speakSlide]
  );

  const seekAbsolute = useCallback(
    (timeSec: number) => {
      if (!slides.length || totalDuration <= 0) return;
      const t = Math.max(0, Math.min(totalDuration - 0.05, timeSec));
      let idx = slideStarts.length - 1;
      for (let i = 0; i < slideStarts.length; i++) {
        const start = slideStarts[i];
        const end = start + durations[i];
        if (t >= start && t < end) {
          idx = i;
          break;
        }
      }
      const local = t - (slideStarts[idx] || 0);
      stopSpeech();
      setSlideIndex(idx);
      setElapsedInSlide(local);
      elapsedRef.current = local;
      if (playingRef.current) speakSlide(idx);
    },
    [slides.length, totalDuration, slideStarts, durations, speakSlide]
  );

  useEffect(() => {
    if (!playing || !slides.length) {
      if (tickRef.current) window.cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
      return;
    }

    lastTickRef.current = performance.now();

    const loop = (now: number) => {
      const dt = ((now - lastTickRef.current) / 1000) * speedRef.current;
      lastTickRef.current = now;
      if (!playingRef.current) return;

      const idx = slideIndexRef.current;
      const dur = durations[idx] || 5;
      let nextElapsed = elapsedRef.current + dt;

      if (nextElapsed >= dur) {
        if (idx < slides.length - 1) {
          const overflow = nextElapsed - dur;
          setSlideIndex(idx + 1);
          setElapsedInSlide(Math.min(overflow, (durations[idx + 1] || 5) * 0.2));
          elapsedRef.current = Math.min(overflow, (durations[idx + 1] || 5) * 0.2);
          speakSlide(idx + 1);
        } else {
          setElapsedInSlide(dur);
          elapsedRef.current = dur;
          setPlaying(false);
          stopSpeech();
          return;
        }
      } else {
        setElapsedInSlide(nextElapsed);
        elapsedRef.current = nextElapsed;
      }

      tickRef.current = window.requestAnimationFrame(loop);
    };

    tickRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (tickRef.current) window.cancelAnimationFrame(tickRef.current);
    };
  }, [playing, slides.length, durations, speakSlide]);

  const togglePlay = () => {
    if (!slides.length) return;
    if (playing) {
      setPlaying(false);
      stopSpeech();
      return;
    }
    if (slideIndex >= slides.length - 1 && elapsedInSlide >= (durations[slideIndex] || 5) - 0.15) {
      setSlideIndex(0);
      setElapsedInSlide(0);
      elapsedRef.current = 0;
      speakSlide(0);
    } else {
      speakSlide(slideIndex);
    }
    setPlaying(true);
  };

  const skipBy = (delta: number) => seekAbsolute(currentTime + delta);

  const goPrev = () => {
    if (slideIndex <= 0) {
      setElapsedInSlide(0);
      elapsedRef.current = 0;
      stopSpeech();
      return;
    }
    goToSlide(slideIndex - 1, { keepPlaying: playing });
  };

  const goNext = () => {
    if (slideIndex >= slides.length - 1) return;
    goToSlide(slideIndex + 1, { keepPlaying: playing });
  };

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekAbsolute(ratio * totalDuration);
  };

  const toggleFullscreen = async () => {
    const el = stageRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black">
      <div
        ref={stageRef}
        className="relative flex h-[100dvh] w-screen flex-col overflow-hidden bg-black"
      >
        {/* Top overlay */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent px-4 py-3 transition-all duration-300 md:px-5 ${
            showControls ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          }`}
        >
          <div className="pointer-events-auto min-w-0">
            <div className="flex items-center gap-2 text-lime-400">
              <Video size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Course Video
              </span>
            </div>
            <h3 className="truncate text-sm font-bold text-white drop-shadow">
              Module {moduleNumber}
              {moduleTitle ? ` · ${moduleTitle}` : ''}
              {slides.length > 0 && (
                <span className="ml-2 text-xs font-medium text-white/50">
                  Slide {slideIndex + 1}/{slides.length}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-black">
          {loading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white/70">
              <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
              <p className="text-sm">Loading Gamma slide images…</p>
            </div>
          )}

          {!loading && error && (
            <div className="m-5 mt-20 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Full-screen slide — click to hide/show controls */}
              <div
                className="absolute inset-0 overflow-hidden bg-black"
                onClick={() => setShowControls((v) => !v)}
              >
                {gammaImages[slideIndex] ? (
                  <div key={slideIndex} className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-300">
                    <img
                      src={gammaImages[slideIndex]}
                      alt={current?.title || `Slide ${slideIndex + 1}`}
                      className="h-full w-full object-contain object-center pointer-events-none"
                    />
                  </div>
                ) : current ? (
                  <div
                    key={slideIndex}
                    className="absolute inset-0 flex animate-in fade-in duration-300 bg-gradient-to-br from-[#0d1424] via-[#0a1020] to-black pointer-events-none"
                  >
                    <div className="flex h-full w-full flex-col p-6 pr-36 pt-20 md:p-10 md:pr-48 md:pt-24">
                      <h2 className="text-2xl font-black tracking-tight text-white md:text-4xl">
                        {current.title}
                      </h2>
                      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
                        {current.content || current.script || 'No slide content yet.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-white/60 pointer-events-none">
                    <p className="text-sm">No slides found</p>
                  </div>
                )}

                {/* Circular avatar — top-right corner */}
                <div className="pointer-events-none absolute right-0 top-0 z-20">
                  <div className="relative h-[122px] w-[122px] overflow-hidden rounded-full border-[4px] border-black bg-[#0b1220] shadow-[0_4px_20px_rgba(0,0,0,0.55)] md:h-[154px] md:w-[154px]">
                    <img
                      src={avatarPlaceholder}
                      alt=""
                      className="h-full w-full scale-110 object-cover object-top opacity-40 grayscale"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1220]/50 px-2 text-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-lime-300/90">HeyGen</span>
                      <span className="mt-1 text-[10px] font-semibold text-white/70">Avatar</span>
                      <span className="mt-1 text-[8px] text-white/40">Credits unavailable</span>
                    </div>
                    {playing && (
                      <div className="absolute inset-0 animate-pulse rounded-full ring-2 ring-lime-400/40" />
                    )}
                  </div>
                </div>
              </div>

              {/* Controls overlay — hide when screen is clicked */}
              <div
                className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 pb-5 pt-16 transition-all duration-300 md:px-6 ${
                  showControls
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={totalDuration}
                  aria-valuenow={currentTime}
                  tabIndex={0}
                  onClick={onProgressClick}
                  className="group relative mb-4 h-4 w-full cursor-pointer"
                >
                  <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/25" />
                  <div
                    className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white"
                    style={{ width: `${progress * 100}%` }}
                  />
                  <div
                    className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 bg-white"
                    style={{ left: `calc(${progress * 100}% - 1px)` }}
                  />
                </div>

                {captionsOn && current && (
                  <div className="mb-3 max-w-3xl rounded-xl bg-black/70 px-3 py-2 text-sm text-white/90 backdrop-blur">
                    {current.script || current.content || current.title}
                  </div>
                )}

                <div className="flex w-full flex-wrap items-center gap-2.5">
                  {/* Play */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    disabled={!slides.length}
                    className="flex h-11 w-[4.75rem] shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 disabled:opacity-40"
                    aria-label={playing ? 'Pause' : 'Play'}
                  >
                    {playing ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  {/* Previous / Next slide */}
                  <div className="flex h-11 items-center gap-0.5 rounded-2xl bg-[#2a2a2a]/95 px-1.5 text-white backdrop-blur">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={!slides.length || slideIndex === 0}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-35"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!slides.length || slideIndex >= slides.length - 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-35"
                      aria-label="Next slide"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Skip + time */}
                  <div className="flex h-11 items-center gap-1 rounded-2xl bg-[#2a2a2a]/95 px-2.5 text-white backdrop-blur">
                    <button
                      type="button"
                      onClick={() => skipBy(-10)}
                      disabled={!slides.length}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40"
                      aria-label="Back 10 seconds"
                    >
                      <RotateCcw size={18} strokeWidth={2} />
                      <span className="pointer-events-none absolute text-[8px] font-bold leading-none">10</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => skipBy(10)}
                      disabled={!slides.length}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40"
                      aria-label="Forward 10 seconds"
                    >
                      <RotateCw size={18} strokeWidth={2} />
                      <span className="pointer-events-none absolute text-[8px] font-bold leading-none">10</span>
                    </button>
                    <span className="min-w-[5.75rem] px-1.5 font-mono text-[13px] tabular-nums text-white/95">
                      {formatTime(currentTime)} / {formatTime(totalDuration || slideDur)}
                    </span>
                  </div>

                  {/* Chapters */}
                  <div className="relative">
                    <button
                      ref={chaptersBtnRef}
                      type="button"
                      onClick={openChapters}
                      disabled={!slides.length}
                      className="flex h-11 items-center rounded-2xl bg-[#2a2a2a]/95 px-3.5 text-[13px] font-medium text-white/90 backdrop-blur hover:bg-[#333] disabled:opacity-40"
                    >
                      Chapters
                    </button>
                  </div>

                  {/* Volume · CC · speed · settings · fullscreen */}
                  <div className="ml-auto flex h-11 items-center gap-0.5 rounded-2xl bg-[#2a2a2a]/95 px-1.5 text-white backdrop-blur">
                    <button
                      type="button"
                      onClick={() => setMuted((m) => !m)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                      aria-label={muted ? 'Unmute' : 'Mute'}
                    >
                      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaptionsOn((c) => !c)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 ${
                        captionsOn ? 'text-white' : 'text-white/90'
                      }`}
                      aria-label="Captions"
                    >
                      <Captions size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={cyclePlaybackSpeed}
                      className="flex h-9 min-w-[2.5rem] items-center justify-center rounded-full px-1.5 text-[13px] font-semibold tabular-nums text-white/90 hover:bg-white/10"
                      aria-label="Playback speed"
                    >
                      {`${playbackSpeed}x`}
                    </button>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                      aria-label="Settings"
                    >
                      <Settings size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                      aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
                    >
                      {isFullscreen ? <Minimize2 size={17} /> : <Maximize size={17} />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2a2a2a]/95 text-white/90 backdrop-blur hover:bg-[#333]"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showChapters && chaptersPos && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-[10000] cursor-default bg-transparent"
            aria-label="Close chapters"
            onClick={() => {
              setShowChapters(false);
              setChaptersPos(null);
            }}
          />
          <div
            className="fixed z-[10001] w-72 overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-[#1a1a1a] py-2 shadow-2xl"
            style={{
              left: chaptersPos.left,
              bottom: chaptersPos.bottom,
              maxHeight: chaptersPos.maxH,
            }}
            role="listbox"
            aria-label="Chapters"
          >
            {slides.map((s, i) => (
              <button
                key={`${s.slideNumber}-${i}`}
                type="button"
                role="option"
                aria-selected={i === slideIndex}
                onClick={() => {
                  goToSlide(i, { keepPlaying: playing });
                  setShowChapters(false);
                  setChaptersPos(null);
                }}
                className={`flex w-full shrink-0 items-start gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-white/10 ${
                  i === slideIndex ? 'bg-white/10 text-white' : 'text-white/80'
                }`}
              >
                <span className="mt-0.5 w-4 shrink-0 font-mono text-xs text-white/45">{i + 1}</span>
                <span className="min-w-0 flex-1 leading-snug">{s.title}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>,
    document.body
  );
}
