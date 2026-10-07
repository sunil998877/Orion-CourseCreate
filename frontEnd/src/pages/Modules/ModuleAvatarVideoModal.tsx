import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Captions,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize,
  Minimize2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Settings,
  Sparkles,
  UserCheck,
  Video,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE, ORIGIN } from '../../utils/api';
import avatarPlaceholder from '../../assests/avatar.png';

export type AvatarInfo = {
  avatarId: string;
  avatarName: string;
  previewImageUrl: string;
  previewVideoUrl: string;
  voiceId?: string;
  gender?: string;
  isSelected?: boolean;
};

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
  fallbackSlides?: any[];
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

function absoluteMediaUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

function waitForCanPlay(el: HTMLMediaElement, isCurrent: () => boolean, timeoutMs = 20000) {
  if (!isCurrent()) return Promise.reject(new Error('stale'));
  if (el.readyState >= 3 && el.src) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const finish = (ok: boolean) => {
      window.clearTimeout(timer);
      el.removeEventListener('canplay', onReady);
      el.removeEventListener('error', onFail);
      if (!isCurrent()) reject(new Error('stale'));
      else if (ok) resolve();
      else reject(new Error('media'));
    };
    const onReady = () => finish(true);
    const onFail = () => finish(false);
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    el.addEventListener('canplay', onReady);
    el.addEventListener('error', onFail);
  });
}

function liveCaptionFromOffset(text: string, offset: number, windowSize = 8) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const words = clean.split(' ');
  let count = 0;
  let wordIdx = 0;
  for (let i = 0; i < words.length; i++) {
    if (offset <= count + words[i].length) {
      wordIdx = i;
      break;
    }
    count += words[i].length + 1;
    wordIdx = i;
  }
  const end = Math.min(words.length, wordIdx + 1);
  const start = Math.max(0, end - windowSize);
  return words.slice(start, end).join(' ');
}

export function ModuleAvatarVideoModal({
  courseId,
  moduleNumber,
  moduleTitle,
  gammaUrl: gammaUrlProp,
  fallbackSlides,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gammaUrl, setGammaUrl] = useState<string | null>(gammaUrlProp || null);
  const [gammaImages, setGammaImages] = useState<string[]>([]);
  const [slides, setSlides] = useState<SlideNarration[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [prevSlideIndex, setPrevSlideIndex] = useState<number | null>(null);
  const [slideAnimDirection, setSlideAnimDirection] = useState<'forward' | 'backward' | null>(null);
  const advanceRef = useRef<() => void>(() => {});
  const advancingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedInSlide, setElapsedInSlide] = useState(0);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showChapters, setShowChapters] = useState(false);
  const [chaptersPos, setChaptersPos] = useState<{ left: number; bottom: number; maxH: number } | null>(null);

  const downloadBtnRef = useRef<HTMLButtonElement | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloadPos, setDownloadPos] = useState<{ left: number; bottom: number } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ slide: number; total: number; percent: number; statusText?: string } | null>(null);
  const [isDownloadingDirect, setIsDownloadingDirect] = useState(false);
  const [moduleVideoUrl, setModuleVideoUrl] = useState<string | null>(null);
  const cancelExportRef = useRef(false);

  const [masterAvatar, setMasterAvatar] = useState<AvatarInfo>({
    avatarId: 'Abigail_expressive_2024112501',
    avatarName: 'Abigail (Professional Instructor)',
    previewImageUrl: 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_target.webp',
    previewVideoUrl: 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_video_target.mp4',
    voiceId: '1bd001e7e50f421d891986aad5158bc8',
  });
  const [avatarList, setAvatarList] = useState<AvatarInfo[]>([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);
  const isSpeakingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Record<string, string>>({});
  const audioLoadingRef = useRef<Record<string, boolean>>({});
  const [slideDurations, setSlideDurations] = useState<Record<number, number>>({});
  const vocalAnimFrameRef = useRef<number | null>(null);

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
  const utteranceIdRef = useRef(0);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechProgressRef = useRef({ slide: 0, offset: 0, text: '', at: 0 });
  const narrationIdRef = useRef<string | null>(null);
  const avatarVideoIdRef = useRef<string | null>(null);
  const syncStatusRef = useRef('idle');
  const mediaLoadingRef = useRef(false);
  const loadedSlideRef = useRef<number | null>(null);
  const lipSyncUrlRef = useRef<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lipSyncVideoUrl, setLipSyncVideoUrl] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [captionLine, setCaptionLine] = useState('');

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);
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

        const contentResp = await fetch(
          `${API_BASE}/module-contents?courseId=${encodeURIComponent(courseId)}&moduleNumber=${moduleNumber}`,
          { headers }
        );
        const imagesResp = await fetch(
          `${API_BASE}/courses/${encodeURIComponent(courseId)}/modules/${moduleNumber}/gamma-slide-images`,
          { headers }
        ).catch(() => null);

        const docs = contentResp.ok ? await contentResp.json() : null;
        const latest = Array.isArray(docs) && docs.length ? docs[0] : docs && !Array.isArray(docs) ? docs : null;

        let rawList: any[] = [];
        if (Array.isArray(latest?.slides)) {
          if (latest.slides.length > 0 && Array.isArray(latest.slides[0]?.Slides)) {
            rawList = latest.slides[0].Slides;
          } else if (latest.slides.length > 0 && Array.isArray(latest.slides[0]?.slides)) {
            rawList = latest.slides[0].slides;
          } else {
            rawList = latest.slides;
          }
        } else if (latest?.slides && typeof latest.slides === 'object') {
          if (Array.isArray(latest.slides.Slides)) rawList = latest.slides.Slides;
          else if (Array.isArray(latest.slides.slides)) rawList = latest.slides.slides;
        } else if (Array.isArray(latest)) {
          if (latest.length > 0 && Array.isArray(latest[0]?.Slides)) {
            rawList = latest[0].Slides;
          } else {
            rawList = latest;
          }
        }
        if (!rawList.length && Array.isArray(fallbackSlides) && fallbackSlides.length) {
          rawList = fallbackSlides;
        }

        const narrations: SlideNarration[] = rawList.map((slide, idx) => {
          const title = String(slide?.Title || slide?.title || `Slide ${idx + 1}`).trim();

          let script = String(
            slide?.Transcript ||
            slide?.transcript ||
            slide?.VoiceScript ||
            
            slide?.voiceScript ||
            slide?.Narration ||
            slide?.narration ||
            slide?.Script ||
            slide?.script ||
            ''
          ).trim();

          const bullets = Array.isArray(slide?.Bullets)
            ? slide.Bullets.map((b: any) => String(b || '').trim()).filter(Boolean)
            : Array.isArray(slide?.bullets)
              ? slide.bullets.map((b: any) => String(b || '').trim()).filter(Boolean)
              : Array.isArray(slide?.BulletPoints)
                ? slide.BulletPoints.map((b: any) => String(b || '').trim()).filter(Boolean)
                : [];

          const content = String(slide?.Content || slide?.content || '').trim();

          if (!script) {
            const parts: string[] = [];
            if (content) parts.push(content);
            if (bullets.length) parts.push(bullets.join('. '));
            if (parts.length > 0) {
              script = `${title}. ${parts.join(' ')}`;
            } else {
              script = title;
            }
          }

          return {
            slideNumber: Number(slide?.SlideNumber || slide?.slideNumber || idx + 1),
            title,
            script,
            bullets,
            content,
          };
        });

        let images: string[] = [];
        if (imagesResp?.ok) {
          const imgData = await imagesResp.json();
          images = (imgData.images || []).map((p: string) =>
            p.startsWith('http') ? p : `${ORIGIN}${p.startsWith('/') ? p : `/${p}`}`
          );
          if (imgData.gammaUrl) setGammaUrl(imgData.gammaUrl);
        } else if (imagesResp && imagesResp.status !== 404) {
          const errBody = await imagesResp.json().catch(() => ({}));
          console.warn('Gamma slide images unavailable:', errBody?.message || imagesResp.status);
        }

        if (cancelled) return;

        let aligned = narrations;
        if (images.length && narrations.length < images.length) {
          aligned = [
            ...narrations,
            ...Array.from({ length: images.length - narrations.length }, (_, i) => {
              const num = narrations.length + i + 1;
              return {
                slideNumber: num,
                title: `Slide ${num}`,
                script: `Now moving to slide ${num}. Let's examine the key concepts and practical takeaways.`,
                bullets: [] as string[],
                content: '',
              };
            }),
          ];
        } else if (images.length && narrations.length > images.length) {
          aligned = narrations.slice(0, images.length);
        }

        const deckUrl = latest?.gammaUrl || gammaUrlProp || null;
        if (!aligned.length && deckUrl) {
          aligned = [{
            slideNumber: 1,
            title: moduleTitle || `Module ${moduleNumber}`,
            script: moduleTitle || `Module ${moduleNumber}`,
            bullets: [],
            content: '',
          }];
        }
        setSlides(aligned.length ? aligned : narrations);
        setGammaImages(images);
        setGammaUrl((prev) => deckUrl || prev || null);
        setSlideDirection(1);
        setSlideIndex(0);
        setActiveSlideIndex(0);
        setPrevSlideIndex(null);
        setSlideAnimDirection(null);
        setElapsedInSlide(0);
        setPlaying(false);

        if (!aligned.length && !images.length && !deckUrl) {
          setError('No slides found for this module.');
        }
      } catch (e: any) {
        if (!cancelled && !gammaUrlProp) setError(e?.message || 'Failed to load slides');
        if (!cancelled && gammaUrlProp) setGammaUrl(gammaUrlProp);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      utteranceIdRef.current += 1;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (tickRef.current) window.cancelAnimationFrame(tickRef.current);
      try { window.speechSynthesis?.cancel(); } catch {}
      if (vocalAnimFrameRef.current) window.cancelAnimationFrame(vocalAnimFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (avatarVideoRef.current) {
        avatarVideoRef.current.pause();
        avatarVideoRef.current.removeAttribute('src');
        try { avatarVideoRef.current.load(); } catch {}
      }
    };
  }, [courseId, moduleNumber, gammaUrlProp, fallbackSlides, moduleTitle]);

  useEffect(() => {
    if (gammaImages.length > 0) {
      gammaImages.forEach((src) => {
        if (src) {
          const img = new Image();
          img.src = src;
        }
      });
    }
  }, [gammaImages]);

  useEffect(() => {
    if (slideIndex !== activeSlideIndex) {
      setPrevSlideIndex(activeSlideIndex);
      setActiveSlideIndex(slideIndex);
      setSlideAnimDirection(slideDirection >= 0 ? 'forward' : 'backward');

      const t = setTimeout(() => {
        setPrevSlideIndex(null);
        setSlideAnimDirection(null);
      }, 550);
      return () => clearTimeout(t);
    }
  }, [slideIndex, activeSlideIndex, slideDirection]);

  const durations = useMemo(
    () =>
      slides.map((s, idx) =>
        slideDurations[idx] && slideDurations[idx] > 0
          ? slideDurations[idx]
          : estimateSeconds(s.script || s.content || s.title)
      ),
    [slides, slideDurations]
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

  const stopSpeech = useCallback(() => {
    utteranceIdRef.current += 1;
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    activeUtteranceRef.current = null;
    try {
      window.speechSynthesis?.cancel();
    } catch {

    }
    if (vocalAnimFrameRef.current) {
      cancelAnimationFrame(vocalAnimFrameRef.current);
      vocalAnimFrameRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onerror = null;
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    loadedSlideRef.current = null;
    narrationIdRef.current = null;
    avatarVideoIdRef.current = null;
    lipSyncUrlRef.current = null;
    syncStatusRef.current = 'idle';
    mediaLoadingRef.current = false;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setCaptionLine('');
    setLipSyncVideoUrl(null);
    const vid = avatarVideoRef.current;
    if (vid) {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.volume = 0;
      vid.loop = false;
      vid.pause();
    }
  }, []);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const warm = () => {
      window.speechSynthesis.getVoices();
    };
    warm();
    window.speechSynthesis.addEventListener('voiceschanged', warm);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', warm);
      stopSpeech();
    };
  }, [stopSpeech]);

  useEffect(() => {
    const fetchMasterAvatar = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${API_BASE}/heygen/config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.avatar?.previewVideoUrl) {
            setMasterAvatar(data.avatar);
          }
        }
      } catch (err) {
        console.warn('Could not load master avatar config:', err);
      }
    };
    fetchMasterAvatar();
  }, []);

  const openAvatarPicker = async () => {
    setShowAvatarPicker(true);
    setLoadingAvatars(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/heygen/avatars`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data.avatars)) {
          setAvatarList(data.avatars);
        }
      }
    } catch (err) {
      console.error('Failed to load avatars list:', err);
    } finally {
      setLoadingAvatars(false);
    }
  };

  const handleSelectMasterAvatar = async (selected: AvatarInfo) => {
    setIsSavingAvatar(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/heygen/avatar/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selected),
      });
      if (resp.ok) {
        const data = await resp.json();
        const updated = data.masterAvatar || selected;
        setMasterAvatar(updated);
        setShowAvatarPicker(false);
      }
    } catch (err) {
      console.error('Failed to select master avatar:', err);
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const setAvatarLips = useCallback((speaking: boolean) => {
    const vid = avatarVideoRef.current;
    if (!vid) return;
    vid.muted = true;
    vid.volume = 0;
    if (!speaking || !playingRef.current) {
      if (!vid.paused) vid.pause();
    }
  }, []);

  const prefetchSlideAudio = useCallback((slideIdx: number) => {
    if (slideIdx < 0 || slideIdx >= slides.length) return;
    const s = slides[slideIdx];
    const text = (s?.script || s?.content || s?.title || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    const cacheKey = `${slideIdx}::${text}`;
    if (audioCacheRef.current[cacheKey] || audioLoadingRef.current[cacheKey]) return;
    audioLoadingRef.current[cacheKey] = true;
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/heygen/slide-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
      },
      body: JSON.stringify({
        text,
        voiceId: masterAvatar.voiceId || undefined,
        gender: masterAvatar.gender || (/albert|adrian|male/i.test(masterAvatar.avatarName) ? 'male' : 'female'),
        avatarId: masterAvatar.avatarId,
      }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data?.audioUrl) {
          const fullUrl = data.audioUrl.startsWith('http')
            ? data.audioUrl
            : `${ORIGIN}${data.audioUrl.startsWith('/') ? data.audioUrl : `/${data.audioUrl}`}`;
          audioCacheRef.current[cacheKey] = fullUrl;
        }
      })
      .catch(() => {})
      .finally(() => {
        audioLoadingRef.current[cacheKey] = false;
      });
  }, [slides, masterAvatar]);

  const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const isMale =
      masterAvatar.gender === 'male' ||
      /albert|adrian|male/i.test(masterAvatar.avatarName) ||
      /albert|adrian/i.test(masterAvatar.avatarId);

    const en = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    const pool = en.length ? en : voices;

    if (isMale) {
      return (
        pool.find((v) =>
          /david|mark|guy|george|james|male|microsoft david|microsoft mark/i.test(v.name)
        ) || pool[0]
      );
    }
    return (
      pool.find((v) =>
        /zira|jenny|samantha|aria|female|microsoft zira|microsoft jenny/i.test(v.name)
      ) || pool[0]
    );
  }, [masterAvatar]);

  const logSync = useCallback((event: string, extra?: Record<string, unknown>) => {
    const audio = audioRef.current;
    const video = avatarVideoRef.current;
    const slide = slides[slideIndexRef.current];
    console.log('[course-video]', {
      event,
      slideId: slide?.slideNumber ?? slideIndexRef.current,
      narrationId: narrationIdRef.current,
      avatarVideoId: avatarVideoIdRef.current,
      audioCurrentTime: audio && Number.isFinite(audio.currentTime) ? Number(audio.currentTime.toFixed(3)) : null,
      avatarCurrentTime: video && video.currentSrc && Number.isFinite(video.currentTime) ? Number(video.currentTime.toFixed(3)) : null,
      playing: playingRef.current,
      loading: mediaLoadingRef.current,
      generationStatus: syncStatusRef.current,
      ...extra,
    });
  }, [slides]);

  const stopAvatarLock = useCallback(() => {
    if (vocalAnimFrameRef.current) {
      cancelAnimationFrame(vocalAnimFrameRef.current);
      vocalAnimFrameRef.current = null;
    }
  }, []);

  const startAvatarLock = useCallback(() => {
    stopAvatarLock();
    const tick = () => {
      if (!playingRef.current) return;
      const audio = audioRef.current;
      const video = avatarVideoRef.current;
      const narrationLive = !!audio && !audio.paused && !audio.ended;
      const speechLive = isSpeakingRef.current && (!audio || !audio.src);
      if (video && (narrationLive || speechLive)) {
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;
        if (lipSyncUrlRef.current && video.readyState >= 2 && narrationLive && audio) {
          video.loop = false;
          const drift = video.currentTime - audio.currentTime;
          if (Number.isFinite(drift) && Math.abs(drift) > 0.12) {
            try { video.currentTime = audio.currentTime; } catch {}
            logSync('correct-drift', { drift: Number(drift.toFixed(3)) });
          }
          video.playbackRate = audio.playbackRate || speedRef.current;
        } else {
          video.loop = true;
          const rate = narrationLive && audio ? audio.playbackRate : speedRef.current;
          video.playbackRate = Math.min(1.25, Math.max(0.85, rate || 1));
          const duration = video.duration;
          if (duration && Number.isFinite(duration) && (video.currentTime < 0.15 || video.currentTime > duration - 0.12)) {
            try { video.currentTime = Math.min(0.35, duration / 3); } catch {}
          }
        }
        if (video.paused) {
          const attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
        }
      } else if (video && !video.paused) {
        video.pause();
      }
      vocalAnimFrameRef.current = requestAnimationFrame(tick);
    };
    vocalAnimFrameRef.current = requestAnimationFrame(tick);
  }, [logSync, stopAvatarLock]);

  const clearAvatarPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const detachAvatarVideo = useCallback(() => {
    lipSyncUrlRef.current = null;
    avatarVideoIdRef.current = null;
    setLipSyncVideoUrl(null);
    const video = avatarVideoRef.current;
    if (!video) return;
    video.pause();
  }, []);

  const attachAvatarVideo = useCallback(async (session: number, videoUrl: string, videoId: string | null) => {
    if (utteranceIdRef.current !== session || !videoUrl) return;
    const absolute = absoluteMediaUrl(videoUrl);
    lipSyncUrlRef.current = absolute;
    avatarVideoIdRef.current = videoId;
    syncStatusRef.current = 'ready';
    setLipSyncVideoUrl(absolute);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    if (utteranceIdRef.current !== session) return;
    const video = avatarVideoRef.current;
    const audio = audioRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.loop = false;
    video.playsInline = true;
    try {
      await waitForCanPlay(video, () => utteranceIdRef.current === session);
    } catch (error) {
      if ((error as Error).message === 'stale') return;
      lipSyncUrlRef.current = null;
      avatarVideoIdRef.current = null;
      setLipSyncVideoUrl(null);
      syncStatusRef.current = 'audio_only';
      logSync('avatar-video-load-failed', { avatarVideoId: videoId, message: (error as Error).message });
      return;
    }
    if (utteranceIdRef.current !== session) return;
    try { video.currentTime = audio?.currentTime || 0; } catch {}
    video.playbackRate = audio?.playbackRate || speedRef.current;
    if (playingRef.current && audio && !audio.paused) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    }
    logSync('avatar-attached');
    startAvatarLock();
  }, [logSync, startAvatarLock]);

  const pollAvatarVideo = useCallback((session: number, narrationId: string, avatarId: string) => {
    clearAvatarPoll();
    const run = async () => {
      if (utteranceIdRef.current !== session) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${API_BASE}/heygen/slide-sync/${encodeURIComponent(narrationId)}?avatarId=${encodeURIComponent(avatarId)}`,
          { headers: { Authorization: `Bearer ${token || ''}` } }
        );
        if (utteranceIdRef.current !== session) return;
        if (!res.ok) {
          syncStatusRef.current = 'audio_only';
          logSync('avatar-status-failed', { statusCode: res.status });
          return;
        }
        const data = await res.json();
        syncStatusRef.current = data.status || 'audio_only';
        avatarVideoIdRef.current = data.avatarVideoId || null;
        logSync('avatar-status');
        if (data.status === 'ready' && data.avatarVideoUrl) {
          await attachAvatarVideo(session, data.avatarVideoUrl, data.avatarVideoId || null);
          return;
        }
        if (data.status === 'generating') {
          pollTimerRef.current = setTimeout(run, 4000);
        }
      } catch (error) {
        if (utteranceIdRef.current !== session) return;
        syncStatusRef.current = 'audio_only';
        logSync('avatar-status-error', { message: (error as Error).message });
      }
    };
    pollTimerRef.current = setTimeout(run, 1200);
  }, [attachAvatarVideo, clearAvatarPoll, logSync]);

  const speakSlide = useCallback(
    (index: number, opts?: { fromUserGesture?: boolean; startOffset?: number; startSeconds?: number }) => {
      utteranceIdRef.current += 1;
      const speakId = utteranceIdRef.current;
      clearAvatarPoll();
      stopAvatarLock();
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      activeUtteranceRef.current = null;
      try { window.speechSynthesis?.cancel(); } catch {}
      loadedSlideRef.current = null;
      narrationIdRef.current = null;
      detachAvatarVideo();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
        audioRef.current.onloadedmetadata = null;
        audioRef.current.onpause = null;
        audioRef.current.removeAttribute('src');
        try { audioRef.current.load(); } catch {}
      }
      setSpeechError(null);
      setIsSpeaking(false);
      isSpeakingRef.current = false;

      const slide = slides[index];
      const fullText = (slide?.script || slide?.content || slide?.title || '').replace(/\s+/g, ' ').trim();
      if (!fullText) {
        syncStatusRef.current = 'missing-narration';
        mediaLoadingRef.current = false;
        logSync('missing-narration', { slideId: slide?.slideNumber ?? index });
        return;
      }

      const startSeconds = Math.max(0, opts?.startSeconds || 0);
      const gender = masterAvatar.gender || (/albert|adrian|male/i.test(masterAvatar.avatarName) ? 'male' : 'female');
      const avatarId = masterAvatar.avatarId;
      mediaLoadingRef.current = true;
      syncStatusRef.current = 'loading-narration';
      logSync('load-narration', { slideId: slide?.slideNumber ?? index });

      const fallbackSpeechSynthesis = () => {
        if (utteranceIdRef.current !== speakId) return;
        if (!('speechSynthesis' in window)) {
          setIsSpeaking(false);
          setSpeechError('Narration audio is unavailable in this browser.');
          syncStatusRef.current = 'narration-failed';
          logSync('narration-failed');
          return;
        }
        syncStatusRef.current = 'speech-fallback';
        detachAvatarVideo();
        const utter = new SpeechSynthesisUtterance(fullText);
        activeUtteranceRef.current = utter;
        const rate = Math.min(1.5, Math.max(0.75, speedRef.current));
        utter.rate = rate;
        utter.pitch = 1;
        utter.volume = mutedRef.current ? 0 : 1;
        utter.lang = 'en-US';
        const voice = pickVoice();
        if (voice) utter.voice = voice;
        speechProgressRef.current = { slide: index, offset: 0, text: fullText, at: performance.now() };
        utter.onstart = () => {
          if (utteranceIdRef.current !== speakId) return;
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          setSpeechError(null);
          logSync('play');
        };
        utter.onboundary = (event) => {
          if (utteranceIdRef.current !== speakId || event.name !== 'word') return;
          const nextOffset = event.charIndex || 0;
          speechProgressRef.current = { slide: index, offset: nextOffset, text: fullText, at: performance.now() };
          setCaptionLine(liveCaptionFromOffset(fullText, Math.max(0, nextOffset - 12)));
        };
        utter.onend = () => {
          if (utteranceIdRef.current !== speakId) return;
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          logSync('ended');
          advanceRef.current();
        };
        utter.onerror = (event) => {
          const err = (event as SpeechSynthesisErrorEvent).error;
          if (err === 'interrupted' || err === 'canceled') return;
          if (utteranceIdRef.current !== speakId) return;
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setSpeechError('Narration could not be played.');
          logSync('audio-error', { message: err });
        };
        try {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          window.speechSynthesis.speak(utter);
          const video = avatarVideoRef.current;
          if (video) {
            video.muted = true;
            video.volume = 0;
            video.loop = true;
            const attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
          }
          startAvatarLock();
          loadedSlideRef.current = null;
          mediaLoadingRef.current = false;
          logSync('speech-fallback');
        } catch (error) {
          setSpeechError('Narration could not be played.');
          logSync('audio-error', { message: (error as Error).message });
        }
      };

      const token = localStorage.getItem('token');
      fetch(`${API_BASE}/heygen/slide-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          text: fullText,
          voiceId: masterAvatar.voiceId || undefined,
          gender,
          avatarId,
        }),
      })
        .then(async (res) => {
          if (utteranceIdRef.current !== speakId) return null;
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.message || `HTTP ${res.status}`);
          }
          return res.json();
        })
        .then(async (data) => {
          if (!data || utteranceIdRef.current !== speakId) return;
          narrationIdRef.current = data.narrationId || null;
          avatarVideoIdRef.current = data.avatarVideoId || null;
          syncStatusRef.current = data.status || 'audio_only';
          const audioUrl = absoluteMediaUrl(data.audioUrl || '');
          if (!audioUrl) throw new Error('Narration audio missing');
          logSync('narration-ready');

          const audio = audioRef.current || (audioRef.current = new Audio());
          audio.crossOrigin = 'anonymous';
          audio.loop = false;
          audio.preload = 'auto';
          audio.src = audioUrl;
          audio.playbackRate = speedRef.current;
          audio.muted = mutedRef.current;

          await waitForCanPlay(audio, () => utteranceIdRef.current === speakId);
          if (utteranceIdRef.current !== speakId) return;

          const offset = audio.duration && Number.isFinite(audio.duration)
            ? Math.min(startSeconds, Math.max(0, audio.duration - 0.05))
            : 0;
          try { audio.currentTime = offset; } catch {}
          setElapsedInSlide(offset);
          elapsedRef.current = offset;

          audio.onloadedmetadata = () => {
            if (utteranceIdRef.current !== speakId) return;
            if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
              setSlideDurations((prev) => (prev[index] === audio.duration ? prev : { ...prev, [index]: audio.duration }));
            }
          };
          audio.ontimeupdate = () => {
            if (utteranceIdRef.current !== speakId) return;
            const cur = audio.currentTime;
            const dur = audio.duration || 1;
            setElapsedInSlide(cur);
            elapsedRef.current = cur;
            const charOffset = Math.floor((cur / dur) * fullText.length);
            speechProgressRef.current = { slide: index, offset: charOffset, text: fullText, at: performance.now() };
            setCaptionLine(liveCaptionFromOffset(fullText, charOffset));
          };
          audio.onplay = () => {
            if (utteranceIdRef.current !== speakId) return;
            setIsSpeaking(true);
            isSpeakingRef.current = true;
            const video = avatarVideoRef.current;
            if (video) {
              video.muted = true;
              video.volume = 0;
              const attempt = video.play();
              if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
            }
            logSync('play');
          };
          audio.onpause = () => {
            if (utteranceIdRef.current !== speakId) return;
            const video = avatarVideoRef.current;
            if (video && !video.paused) video.pause();
            if (!playingRef.current) {
              setIsSpeaking(false);
              isSpeakingRef.current = false;
            }
            logSync('pause');
          };
          audio.onended = () => {
            if (utteranceIdRef.current !== speakId) return;
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            const video = avatarVideoRef.current;
            if (video && !video.paused) video.pause();
            logSync('ended');
            advanceRef.current();
          };
          audio.onerror = () => {
            if (utteranceIdRef.current !== speakId) return;
            mediaLoadingRef.current = false;
            syncStatusRef.current = 'audio-error';
            logSync('audio-error');
            setSpeechError('Narration audio failed to load.');
            fallbackSpeechSynthesis();
          };

          loadedSlideRef.current = index;
          mediaLoadingRef.current = false;

          if (data.status === 'ready' && data.avatarVideoUrl) {
            await attachAvatarVideo(speakId, data.avatarVideoUrl, data.avatarVideoId || null);
            if (utteranceIdRef.current !== speakId) return;
          } else if (data.status === 'generating' && data.narrationId) {
            logSync('avatar-generating');
            pollAvatarVideo(speakId, data.narrationId, avatarId);
          } else {
            logSync('avatar-fallback', { error: data.error || null });
          }

          if (!playingRef.current || utteranceIdRef.current !== speakId) {
            logSync('narration-ready-paused');
            return;
          }
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          const video = avatarVideoRef.current;
          if (video) {
            video.muted = true;
            video.defaultMuted = true;
            video.volume = 0;
            if (lipSyncUrlRef.current) {
              try { video.currentTime = audio.currentTime; } catch {}
              video.loop = false;
              video.playbackRate = audio.playbackRate || speedRef.current;
            } else {
              video.loop = true;
            }
            const videoStart = video.play();
            if (videoStart && typeof videoStart.catch === 'function') videoStart.catch(() => {});
          }
          const started = audio.play();
          if (started && typeof started.catch === 'function') {
            started.catch(() => {
              if (utteranceIdRef.current !== speakId) return;
              fallbackSpeechSynthesis();
            });
          }
          startAvatarLock();
          prefetchSlideAudio(index + 1);
        })
        .catch((error) => {
          if (utteranceIdRef.current !== speakId) return;
          mediaLoadingRef.current = false;
          syncStatusRef.current = 'narration-failed';
          logSync('narration-failed', { message: (error as Error).message });
          setSpeechError((error as Error).message || 'Narration could not be generated.');
          fallbackSpeechSynthesis();
        });
    },
    [slides, pickVoice, prefetchSlideAudio, masterAvatar, logSync, clearAvatarPoll, stopAvatarLock, detachAvatarVideo, attachAvatarVideo, pollAvatarVideo, startAvatarLock]
  );

  const toggleMute = () => {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setMuted(nextMuted);
    if (audioRef.current) audioRef.current.muted = nextMuted;
    const video = avatarVideoRef.current;
    if (video) {
      video.muted = true;
      video.volume = 0;
    }
    logSync(nextMuted ? 'mute' : 'unmute');
  };

  const applyPlaybackSpeed = (next: number) => {
    speedRef.current = next;
    setPlaybackSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
    if (avatarVideoRef.current && lipSyncUrlRef.current) {
      avatarVideoRef.current.playbackRate = next;
    }
    logSync('speed', { playbackRate: next });
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

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${API_BASE}/heygen/courses/${encodeURIComponent(courseId)}/modules/${moduleNumber}/status`,
          { headers: { Authorization: `Bearer ${token || ''}` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.videoUrl) {
            setModuleVideoUrl(data.videoUrl);
          }
        }
      } catch (err) {
        console.warn('Could not fetch module video status:', err);
      }
    };
    fetchStatus();
  }, [courseId, moduleNumber]);

  const openDownloadMenu = () => {
    const btn = downloadBtnRef.current;
    if (!btn) {
      setShowDownloadMenu((v) => !v);
      return;
    }
    if (showDownloadMenu) {
      setShowDownloadMenu(false);
      setDownloadPos(null);
      return;
    }
    const rect = btn.getBoundingClientRect();
    const gap = 12;
    const menuWidth = 340;
    const left = Math.max(16, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 16));
    setDownloadPos({
      left,
      bottom: window.innerHeight - rect.top + gap,
    });
    setShowDownloadMenu(true);
  };

  useEffect(() => {
    if (!showDownloadMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDownloadMenu(false);
        setDownloadPos(null);
      }
    };
    const onResize = () => {
      setShowDownloadMenu(false);
      setDownloadPos(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [showDownloadMenu]);

  const downloadDirectMp4 = async (videoUrl: string, suffix: string) => {
    if (!videoUrl) {
      toast.error('No video URL available for download.');
      return;
    }
    setIsDownloadingDirect(true);
    const toastId = toast.loading('Preparing MP4 video download...');
    try {
      const cleanTitle = (moduleTitle || `Module_${moduleNumber}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanTitle}_${suffix}.mp4`;
      const proxyUrl = `${API_BASE}/heygen/proxy-media?url=${encodeURIComponent(videoUrl)}`;

      const resp = await fetch(proxyUrl);
      if (!resp.ok) throw new Error(`Proxy error: ${resp.status}`);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      toast.update(toastId, {
        render: 'Video downloaded successfully in MP4 format!',
        type: 'success',
        isLoading: false,
        autoClose: 3500,
      });
      setShowDownloadMenu(false);
    } catch (err: any) {
      console.warn('Proxy download failed, falling back to direct:', err);
      try {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.target = '_blank';
        a.download = `${moduleTitle || `Module_${moduleNumber}`}_${suffix}.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.update(toastId, {
          render: 'Download started in browser!',
          type: 'success',
          isLoading: false,
          autoClose: 3500,
        });
      } catch (fallbackErr: any) {
        toast.update(toastId, {
          render: 'Failed to download video: ' + (fallbackErr?.message || 'Error'),
          type: 'error',
          isLoading: false,
          autoClose: 4000,
        });
      }
      setShowDownloadMenu(false);
    } finally {
      setIsDownloadingDirect(false);
    }
  };

  const exportFullPresentationVideo = async () => {
    if (!slides.length) {
      toast.warn('No slides available to export.');
      return;
    }

    setShowDownloadMenu(false);
    setIsExporting(true);
    cancelExportRef.current = false;
    setExportProgress({
      slide: 0,
      total: slides.length,
      percent: 5,
      statusText: 'Preparing voiceover narration & slide assets...',
    });

    if (playingRef.current) {
      togglePlay();
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('HTML Canvas 2D context is not available.');

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      const dest = audioCtx.createMediaStreamDestination();

      let chosenMime = 'video/mp4';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')) {
          chosenMime = 'video/mp4;codecs=avc1,mp4a.40.2';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          chosenMime = 'video/mp4';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          chosenMime = 'video/webm;codecs=vp9,opus';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          chosenMime = 'video/webm';
        }
      }

      const canvasStream = canvas.captureStream(25);
      const audioTracks = dest.stream.getAudioTracks();
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioTracks,
      ]);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: chosenMime,
        videoBitsPerSecond: 2500000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const token = localStorage.getItem('token');
      const gender = masterAvatar.gender || (/albert|adrian|male/i.test(masterAvatar.avatarName) ? 'male' : 'female');

      const vid = avatarVideoRef.current;
      if (vid) {
        vid.muted = true;
        vid.loop = true;
        try { await vid.play(); } catch {}
      }

      const avatarImg = new Image();
      avatarImg.crossOrigin = 'anonymous';
      if (masterAvatar.previewImageUrl) {
        avatarImg.src = masterAvatar.previewImageUrl.startsWith('http') && !masterAvatar.previewImageUrl.includes(window.location.host)
          ? `${API_BASE}/heygen/proxy-media?url=${encodeURIComponent(masterAvatar.previewImageUrl)}`
          : masterAvatar.previewImageUrl;
      }

      const exportVid = document.createElement('video');
      exportVid.crossOrigin = 'anonymous';
      exportVid.muted = true;
      exportVid.playsInline = true;
      exportVid.loop = true;
      exportVid.autoplay = true;

      const slideAvatarUrls: (string | null)[] = new Array(slides.length).fill(null);

      const [preloadedAudios, preloadedImages] = await Promise.all([
        Promise.all(
          slides.map(async (slide, idx) => {
            const fullText = (slide.script || slide.content || slide.title || '').replace(/\s+/g, ' ').trim();
            if (!fullText) return null;
            const cacheKey = `${idx}::${fullText}`;
            let audioUrl = audioCacheRef.current[cacheKey];

            try {
              const res = await fetch(`${API_BASE}/heygen/slide-sync`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token || ''}`,
                },
                body: JSON.stringify({
                  text: fullText,
                  voiceId: masterAvatar.voiceId || undefined,
                  gender,
                  avatarId: masterAvatar.avatarId,
                }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data?.audioUrl) {
                  audioUrl = absoluteMediaUrl(data.audioUrl);
                  audioCacheRef.current[cacheKey] = audioUrl;
                }
                if (data?.avatarVideoUrl) {
                  slideAvatarUrls[idx] = data.avatarVideoUrl;
                }
              }
            } catch {}

            if (audioUrl) {
              try {
                const resp = await fetch(audioUrl);
                if (resp.ok) {
                  const arrBuf = await resp.arrayBuffer();
                  return await audioCtx.decodeAudioData(arrBuf);
                }
              } catch {}
            }
            return null;
          })
        ),
        Promise.all(
          slides.map(async (_, idx) => {
            const srcUrl = gammaImages[idx];
            if (!srcUrl) return null;
            try {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = srcUrl.startsWith('http') && !srcUrl.includes(window.location.host)
                ? `${API_BASE}/heygen/proxy-media?url=${encodeURIComponent(srcUrl)}`
                : srcUrl;
              await new Promise((res) => {
                if (img.complete) return res(null);
                img.onload = () => res(null);
                img.onerror = () => res(null);
                setTimeout(() => res(null), 2500);
              });
              return img.naturalWidth > 0 ? img : null;
            } catch {
              return null;
            }
          })
        ),
      ]);

      if (cancelExportRef.current) {
        setIsExporting(false);
        setExportProgress(null);
        return;
      }

      recorder.start(100);

      for (let i = 0; i < slides.length; i++) {
        if (cancelExportRef.current) break;

        const currentPct = 10 + Math.round((i / slides.length) * 85);
        setExportProgress({
          slide: i + 1,
          total: slides.length,
          percent: currentPct,
          statusText: `Recording slide ${i + 1} of ${slides.length} with talking avatar & voice narration...`,
        });

        const slide = slides[i];
        const audioBuf = preloadedAudios[i];
        const slideImg = preloadedImages[i];
        const avatarVidSrc = slideAvatarUrls[i] || masterAvatar.previewVideoUrl;

        if (avatarVidSrc) {
          const proxiedVid = avatarVidSrc.startsWith('http') && !avatarVidSrc.includes(window.location.host)
            ? `${API_BASE}/heygen/proxy-media?url=${encodeURIComponent(avatarVidSrc)}`
            : avatarVidSrc;
          exportVid.src = proxiedVid;
          exportVid.loop = !slideAvatarUrls[i];
          exportVid.currentTime = 0;
          try {
            await exportVid.play();
          } catch {}
        }

        let sourceNode: AudioBufferSourceNode | null = null;
        if (audioBuf) {
          sourceNode = audioCtx.createBufferSource();
          sourceNode.buffer = audioBuf;
          sourceNode.connect(dest);
          sourceNode.start();
        }

        const effectiveDur = audioBuf ? Math.max(2.5, audioBuf.duration + 0.2) : 3.5;
        const startT = performance.now();
        const endT = startT + effectiveDur * 1000;

        while (performance.now() < endT) {
          if (cancelExportRef.current) break;

          ctx.fillStyle = '#0a0a0c';
          ctx.fillRect(0, 0, 1280, 720);

          if (slideImg && slideImg.complete && slideImg.naturalWidth > 0) {
            const scale = Math.min(1280 / slideImg.naturalWidth, 720 / slideImg.naturalHeight);
            const dw = slideImg.naturalWidth * scale;
            const dh = slideImg.naturalHeight * scale;
            const dx = (1280 - dw) / 2;
            const dy = (720 - dh) / 2;
            ctx.drawImage(slideImg, dx, dy, dw, dh);
          } else {
            const grad = ctx.createLinearGradient(0, 0, 1280, 720);
            grad.addColorStop(0, '#0d1527');
            grad.addColorStop(1, '#020617');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1280, 720);

            ctx.fillStyle = '#a3e635';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(`COURSE MODULE ${moduleNumber}`, 80, 110);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 38px sans-serif';
            ctx.fillText(slide.title, 80, 170, 950);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '22px sans-serif';
            const contentText = slide.content || slide.script || '';
            const words = contentText.split(' ');
            let line = '';
            let y = 240;
            for (let w = 0; w < words.length; w++) {
              const testLine = line + words[w] + ' ';
              if (ctx.measureText(testLine).width > 880) {
                ctx.fillText(line, 80, y);
                line = words[w] + ' ';
                y += 34;
                if (y > 580) break;
              } else {
                line = testLine;
              }
            }
            if (line && y <= 580) ctx.fillText(line, 80, y);
          }

          const avSize = 135;
          const avX = 1280 - avSize - 35;
          const avY = 35;
          ctx.save();
          ctx.beginPath();
          ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
          ctx.clip();
          let drawn = false;
          if (exportVid.readyState >= 2) {
            try {
              if (exportVid.paused) void exportVid.play();
              ctx.drawImage(exportVid, avX, avY, avSize, avSize);
              drawn = true;
            } catch {}
          }
          if (!drawn && vid && vid.readyState >= 2) {
            try {
              if (vid.paused) void vid.play();
              ctx.drawImage(vid, avX, avY, avSize, avSize);
              drawn = true;
            } catch {}
          }
          if (!drawn && avatarImg.complete && avatarImg.naturalWidth > 0) {
            ctx.drawImage(avatarImg, avX, avY, avSize, avSize);
          }
          ctx.restore();

          ctx.save();
          ctx.beginPath();
          ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = '#a3e635';
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(35, 720 - 50, 160, 28);
          ctx.fillStyle = '#a3e635';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(`SLIDE ${i + 1} OF ${slides.length}`, 48, 720 - 31);

          await new Promise((r) => setTimeout(r, 40));
        }

        if (sourceNode) {
          try { sourceNode.stop(); } catch {}
        }
      }

      try {
        exportVid.pause();
        exportVid.removeAttribute('src');
      } catch {}

      if (!cancelExportRef.current) {
        setExportProgress({
          slide: slides.length,
          total: slides.length,
          percent: 100,
          statusText: 'Finalizing MP4 video download...',
        });

        recorder.stop();
        await new Promise((res) => { recorder.onstop = res; });

        const finalBlob = new Blob(chunks, { type: chosenMime.includes('mp4') ? 'video/mp4' : chosenMime });
        const dlUrl = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = dlUrl;
        const cleanName = (moduleTitle || `Module_${moduleNumber}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `${cleanName}_Module_${moduleNumber}_Course_Video.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(dlUrl), 10000);

        toast.success('Course video downloaded with voiceover & talking avatar in MP4!');
      }
    } catch (err: any) {
      console.error('Export presentation video error:', err);
      toast.error('Export failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const goToSlide = useCallback(
    (index: number, opts?: { playSpeech?: boolean; keepPlaying?: boolean; fromUserGesture?: boolean }) => {
      const next = Math.max(0, Math.min(slides.length - 1, index));
      setSlideDirection(next >= slideIndexRef.current ? 1 : -1);
      setSlideIndex(next);
      slideIndexRef.current = next;
      setElapsedInSlide(0);
      elapsedRef.current = 0;
      lastTickRef.current = performance.now();
      if (opts?.playSpeech !== false && (opts?.keepPlaying || playingRef.current)) {
        speakSlide(next, { fromUserGesture: opts?.fromUserGesture });
      } else {
        stopSpeech();
      }
    },
    [slides.length, speakSlide, stopSpeech]
  );

  const seekAbsolute = useCallback(
    (timeSec: number, opts?: { fromUserGesture?: boolean }) => {
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
      const local = Math.max(0, t - (slideStarts[idx] || 0));
      const previous = slideIndexRef.current;
      if (idx !== previous) {
        setSlideDirection(idx >= previous ? 1 : -1);
      }
      setSlideIndex(idx);
      slideIndexRef.current = idx;
      setElapsedInSlide(local);
      elapsedRef.current = local;
      lastTickRef.current = performance.now();

      const audio = audioRef.current;
      const sameLoadedSlide = previous === idx && loadedSlideRef.current === idx && !!audio?.src;
      if (sameLoadedSlide && audio) {
        const nextTime = audio.duration && Number.isFinite(audio.duration)
          ? Math.min(Math.max(0, audio.duration - 0.05), local)
          : local;
        try { audio.currentTime = nextTime; } catch {}
        const video = avatarVideoRef.current;
        if (video) {
          video.muted = true;
          video.volume = 0;
          if (lipSyncUrlRef.current) {
            try { video.currentTime = audio.currentTime; } catch {}
            video.loop = false;
            video.playbackRate = audio.playbackRate || speedRef.current;
          } else {
            video.loop = true;
          }
        }
        if (playingRef.current) {
          audio.play().catch(() => {});
          if (video) video.play().catch(() => {});
          startAvatarLock();
        } else if (video && !video.paused) {
          video.pause();
        }
        logSync('seek', { slideId: slides[idx]?.slideNumber ?? idx, local: Number(local.toFixed(3)) });
        return;
      }

      if (playingRef.current) {
        speakSlide(idx, { fromUserGesture: opts?.fromUserGesture, startSeconds: local });
      } else {
        stopSpeech();
      }
    },
    [slides, totalDuration, slideStarts, durations, speakSlide, stopSpeech, startAvatarLock, logSync]
  );

  const advanceToNextSlide = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setTimeout(() => {
      advancingRef.current = false;
    }, 250);

    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    setIsSpeaking(false);
    setAvatarLips(false);
    activeUtteranceRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      try {
        audioRef.current.currentTime = 0;
      } catch {}
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onerror = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    setCaptionLine('');

    const cur = slideIndexRef.current;
    const next = cur + 1;
    if (next < slides.length) {
      setSlideDirection(1);
      setSlideIndex(next);
      slideIndexRef.current = next;
      setElapsedInSlide(0);
      elapsedRef.current = 0;
      lastTickRef.current = performance.now();
      speechProgressRef.current = { slide: next, offset: 0, text: '', at: 0 };

      if (playingRef.current) {
        speakTimeoutRef.current = setTimeout(() => {
          if (!playingRef.current) return;
          speakSlide(next);
        }, 60);
      }
    } else {
      setPlaying(false);
      playingRef.current = false;
      if (tickRef.current) {
        window.cancelAnimationFrame(tickRef.current);
        tickRef.current = null;
      }
    }
  }, [slides.length, speakSlide, setAvatarLips]);

  useEffect(() => {
    advanceRef.current = advanceToNextSlide;
  }, [advanceToNextSlide]);

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

      const curAudio = audioRef.current;
      const usingNarrationClock =
        mediaLoadingRef.current ||
        (syncStatusRef.current !== 'speech-fallback' && !!curAudio?.src);
      if (usingNarrationClock) {
        if (curAudio && !curAudio.paused && Number.isFinite(curAudio.currentTime)) {
          const cur = curAudio.currentTime;
          const audioDur = curAudio.duration || dur;
          setElapsedInSlide(cur);
          elapsedRef.current = cur;
          if (audioDur > 0 && cur >= audioDur - 0.08) {
            advanceRef.current();
            lastTickRef.current = performance.now();
          }
        }
        if (playingRef.current) {
          tickRef.current = window.requestAnimationFrame(loop);
        }
        return;
      }

      const nextElapsed = elapsedRef.current + dt;
      if (nextElapsed >= dur) {
        setElapsedInSlide(dur);
        elapsedRef.current = dur;
        advanceRef.current();
        lastTickRef.current = performance.now();
        if (playingRef.current) {
          tickRef.current = window.requestAnimationFrame(loop);
        }
        return;
      }

      setElapsedInSlide(nextElapsed);
      elapsedRef.current = nextElapsed;

      if (playingRef.current) {
        tickRef.current = window.requestAnimationFrame(loop);
      }
    };

    tickRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (tickRef.current) window.cancelAnimationFrame(tickRef.current);
    };
  }, [playing, slides.length, durations]);

  const togglePlay = () => {
    if (!slides.length) return;
    if (playing) {
      setPlaying(false);
      playingRef.current = false;
      stopAvatarLock();
      audioRef.current?.pause();
      if (avatarVideoRef.current && !avatarVideoRef.current.paused) avatarVideoRef.current.pause();
      try { window.speechSynthesis?.pause(); } catch {}
      logSync('pause');
      return;
    }
    setPlaying(true);
    playingRef.current = true;
    lastTickRef.current = performance.now();

    if (slideIndex >= slides.length - 1 && elapsedInSlide >= (durations[slideIndex] || 5) - 0.15) {
      setSlideDirection(1);
      setSlideIndex(0);
      slideIndexRef.current = 0;
      setElapsedInSlide(0);
      elapsedRef.current = 0;
      loadedSlideRef.current = null;
      speakSlide(0, { fromUserGesture: true });
      return;
    }

    const audio = audioRef.current;
    if (loadedSlideRef.current === slideIndexRef.current && audio?.src) {
      audio.muted = mutedRef.current;
      audio.playbackRate = speedRef.current;
      const video = avatarVideoRef.current;
      if (video) {
        video.muted = true;
        video.volume = 0;
        if (lipSyncUrlRef.current) {
          try { video.currentTime = audio.currentTime; } catch {}
          video.loop = false;
          video.playbackRate = audio.playbackRate;
        } else {
          video.loop = true;
          video.playbackRate = audio.playbackRate;
        }
        const videoPlay = video.play();
        if (videoPlay && typeof videoPlay.catch === 'function') videoPlay.catch(() => {});
      }
      const audioPlay = audio.play();
      if (audioPlay && typeof audioPlay.catch === 'function') audioPlay.catch(() => {});
      startAvatarLock();
      logSync('resume');
      return;
    }

    try { window.speechSynthesis?.resume(); } catch {}
    speakSlide(slideIndex, { fromUserGesture: true, startSeconds: elapsedRef.current });
  };

  const skipBy = (delta: number) => seekAbsolute(currentTime + delta, { fromUserGesture: true });

  const goPrev = () => {
    if (slideIndex <= 0) {
      setElapsedInSlide(0);
      elapsedRef.current = 0;
      stopSpeech();
      return;
    }
    setSlideDirection(-1);
    goToSlide(slideIndex - 1, { keepPlaying: playing, fromUserGesture: true });
  };

  const goNext = () => {
    if (slideIndex >= slides.length - 1) return;
    setSlideDirection(1);
    goToSlide(slideIndex + 1, { keepPlaying: playing, fromUserGesture: true });
  };

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekAbsolute(ratio * totalDuration, { fromUserGesture: true });
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

              <div
                className="absolute inset-0 overflow-hidden bg-black"
                onClick={() => setShowControls((v) => !v)}
              >
                <style>{`
                  @keyframes slideInFromLeft {
                    0% { transform: translate3d(-100%, 0, 0); opacity: 0.6; }
                    100% { transform: translate3d(0, 0, 0); opacity: 1; }
                  }
                  @keyframes slideOutToRight {
                    0% { transform: translate3d(0, 0, 0); opacity: 1; }
                    100% { transform: translate3d(100%, 0, 0); opacity: 0; }
                  }
                  @keyframes slideInFromRight {
                    0% { transform: translate3d(100%, 0, 0); opacity: 0.6; }
                    100% { transform: translate3d(0, 0, 0); opacity: 1; }
                  }
                  @keyframes slideOutToLeft {
                    0% { transform: translate3d(0, 0, 0); opacity: 1; }
                    100% { transform: translate3d(-100%, 0, 0); opacity: 0; }
                  }
                `}</style>

                {prevSlideIndex !== null && gammaImages[prevSlideIndex] && slideAnimDirection && (
                  <div
                    key={`prev-slide-${prevSlideIndex}`}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                      animation: `${slideAnimDirection === 'forward' ? 'slideOutToRight' : 'slideOutToLeft'} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                      willChange: 'transform, opacity',
                    }}
                  >
                    <img
                      src={gammaImages[prevSlideIndex]}
                      alt=""
                      className="h-full w-full object-contain object-center pointer-events-none select-none"
                    />
                  </div>
                )}

                {gammaImages[activeSlideIndex] ? (
                  <div
                    key={`curr-slide-${activeSlideIndex}`}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={
                      slideAnimDirection
                        ? {
                            animation: `${slideAnimDirection === 'forward' ? 'slideInFromLeft' : 'slideInFromRight'} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                            willChange: 'transform, opacity',
                          }
                        : undefined
                    }
                  >
                    <img
                      src={gammaImages[activeSlideIndex]}
                      alt={current?.title || `Slide ${activeSlideIndex + 1}`}
                      className="h-full w-full object-contain object-center pointer-events-none select-none"
                    />
                  </div>
                ) : gammaUrl ? (
                  <iframe
                    key="gamma-deck-iframe"
                    src={gammaUrl.replace('/docs/', '/embed/').replace('/view/', '/embed/')}
                    className="absolute inset-0 h-full w-full border-0"
                    allowFullScreen
                    title="Course deck"
                  />
                ) : current ? (
                  <div
                    key={`curr-fallback-${activeSlideIndex}`}
                    className="absolute inset-0 flex bg-gradient-to-br from-[#0d1424] via-[#0a1020] to-black pointer-events-none"
                    style={
                      slideAnimDirection
                        ? {
                            animation: `${slideAnimDirection === 'forward' ? 'slideInFromLeft' : 'slideInFromRight'} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                            willChange: 'transform, opacity',
                          }
                        : undefined
                    }
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
                  <div key="no-slides" className="flex h-full items-center justify-center text-white/60 pointer-events-none">
                    <p className="text-sm">No slides found</p>
                  </div>
                )}

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    openAvatarPicker();
                  }}
                  className="pointer-events-auto absolute right-0 top-0 z-20 cursor-pointer"
                  title="Click to change avatar"
                >
                  <div className="relative h-[132px] w-[132px] md:h-[162px] md:w-[162px] overflow-hidden rounded-full border-2 border-black bg-black">
                    <video
                      ref={avatarVideoRef}
                      src={
                        lipSyncVideoUrl
                          ? (lipSyncVideoUrl.startsWith('http') && !lipSyncVideoUrl.includes(window.location.host)
                              ? `${API_BASE}/heygen/proxy-media?url=${encodeURIComponent(lipSyncVideoUrl)}`
                              : lipSyncVideoUrl)
                          : (masterAvatar.previewVideoUrl && masterAvatar.previewVideoUrl.startsWith('http') && !masterAvatar.previewVideoUrl.includes(window.location.host)
                              ? `${API_BASE}/heygen/proxy-media?url=${encodeURIComponent(masterAvatar.previewVideoUrl)}`
                              : masterAvatar.previewVideoUrl)
                      }
                      crossOrigin="anonymous"
                      poster={masterAvatar.previewImageUrl}
                      playsInline
                      muted
                      loop={!lipSyncVideoUrl}
                      autoPlay={false}
                      preload="auto"
                      onPlay={(e) => {
                        e.currentTarget.muted = true;
                        e.currentTarget.defaultMuted = true;
                        e.currentTarget.volume = 0;
                      }}
                      onError={() => {
                        if (!lipSyncUrlRef.current) return;
                        lipSyncUrlRef.current = null;
                        avatarVideoIdRef.current = null;
                        syncStatusRef.current = 'audio_only';
                        setLipSyncVideoUrl(null);
                        logSync('avatar-video-load-failed');
                      }}
                      className="h-full w-full scale-[1.15] object-cover object-[50%_12%]"
                    />
                    <img
                      src={masterAvatar.previewImageUrl || avatarPlaceholder}
                      alt=""
                      className={`pointer-events-none absolute inset-0 h-full w-full scale-[1.15] object-cover object-[50%_12%] transition-opacity duration-100 ${
                        playing && isSpeaking ? 'opacity-0' : 'opacity-100'
                      }`}
                    />

                    <div
                      className="pointer-events-none absolute inset-0 rounded-full"
                      style={{
                        background:
                          'radial-gradient(circle at 50% 40%, transparent 42%, rgba(0,0,0,0.55) 68%, #000000 92%)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 pb-5 pt-16 transition-all duration-300 md:px-6 ${
                  showControls
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {captionsOn && captionLine && (
                  <div className="pointer-events-none mb-3 flex w-full justify-center px-2">
                    <div className="max-w-3xl rounded bg-black/75 px-4 py-2 text-center text-sm font-medium leading-snug text-white md:text-[15px]">
                      {captionLine}
                    </div>
                  </div>
                )}

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

                {speechError && (
                  <div className="mb-3 max-w-3xl rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-sm text-amber-100">
                    {speechError}
                  </div>
                )}

                <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-2.5">
                  {/* Row 1: Play, Prev/Next slide, Seek & Time */}
                  <div className="flex w-full items-center gap-1.5 sm:gap-2 md:w-auto md:gap-2.5">
                    <button
                      type="button"
                      onClick={togglePlay}
                      disabled={!slides.length}
                      className="flex h-10 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 disabled:opacity-40 sm:h-11 sm:w-[4.75rem]"
                      aria-label={playing ? 'Pause' : 'Play'}
                    >
                      {playing ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>

                    <div className="flex h-10 shrink-0 items-center gap-0.5 rounded-2xl bg-[#2a2a2a]/95 px-1 text-white backdrop-blur sm:h-11 sm:px-1.5">
                      <button
                        type="button"
                        onClick={goPrev}
                        disabled={!slides.length || slideIndex === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-35 sm:h-9 sm:w-9"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={!slides.length || slideIndex >= slides.length - 1}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-35 sm:h-9 sm:w-9"
                        aria-label="Next slide"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    <div className="flex h-10 min-w-0 flex-1 items-center justify-between gap-1 rounded-2xl bg-[#2a2a2a]/95 px-2 text-white backdrop-blur sm:h-11 sm:justify-center sm:px-2.5 md:flex-initial">
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => skipBy(-10)}
                          disabled={!slides.length}
                          className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40 sm:h-9 sm:w-9"
                          aria-label="Back 10 seconds"
                        >
                          <RotateCcw size={18} strokeWidth={2} />
                          <span className="pointer-events-none absolute text-[8px] font-bold leading-none">10</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => skipBy(10)}
                          disabled={!slides.length}
                          className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40 sm:h-9 sm:w-9"
                          aria-label="Forward 10 seconds"
                        >
                          <RotateCw size={18} strokeWidth={2} />
                          <span className="pointer-events-none absolute text-[8px] font-bold leading-none">10</span>
                        </button>
                      </div>
                      <span className="shrink-0 px-1 font-mono text-[11px] tabular-nums text-white/95 sm:text-[13px] md:min-w-[5.75rem] md:px-1.5">
                        {formatTime(currentTime)} / {formatTime(totalDuration || slideDur)}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Chapters, Secondary Controls & Close */}
                  <div className="flex w-full items-center gap-1.5 sm:gap-2 md:w-auto md:ml-auto md:gap-2.5">
                    <div className="relative shrink-0">
                      <button
                        ref={chaptersBtnRef}
                        type="button"
                        onClick={openChapters}
                        disabled={!slides.length}
                        className="flex h-10 items-center rounded-2xl bg-[#2a2a2a]/95 px-3 text-[12px] font-medium text-white/90 backdrop-blur hover:bg-[#333] disabled:opacity-40 sm:h-11 sm:px-3.5 sm:text-[13px]"
                      >
                        Chapters
                      </button>
                    </div>

                    <div className="flex h-10 min-w-0 flex-1 items-center justify-around rounded-2xl bg-[#2a2a2a]/95 px-1 text-white backdrop-blur sm:h-11 sm:justify-start sm:gap-0.5 sm:px-1.5 md:flex-initial">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 hover:bg-white/10 sm:h-9 sm:w-9"
                        aria-label={muted ? 'Unmute' : 'Mute'}
                      >
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCaptionsOn((c) => !c)}
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 sm:h-9 sm:w-9 ${
                          captionsOn ? 'text-lime-400' : 'text-white/90'
                        }`}
                        aria-label={captionsOn ? 'Captions on' : 'Captions off'}
                        aria-pressed={captionsOn}
                        title={captionsOn ? 'Captions: On' : 'Captions: Off'}
                      >
                        <Captions size={18} />
                        {captionsOn && (
                          <span className="absolute bottom-1 left-1/2 h-0.5 w-3.5 -translate-x-1/2 rounded-full bg-lime-400" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cyclePlaybackSpeed}
                        className="flex h-8 min-w-[2rem] items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums text-white/90 hover:bg-white/10 sm:h-9 sm:min-w-[2.5rem] sm:px-1.5 sm:text-[13px]"
                        aria-label="Playback speed"
                      >
                        {`${playbackSpeed}x`}
                      </button>
                      <button
                        type="button"
                        onClick={openAvatarPicker}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 hover:bg-white/10 sm:h-9 sm:w-9"
                        aria-label="Avatar Studio Settings"
                        title="Choose Master AI Avatar"
                      >
                        <Settings size={17} />
                      </button>
                      <button
                        ref={downloadBtnRef}
                        type="button"
                        onClick={openDownloadMenu}
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-9 ${
                          showDownloadMenu ? 'bg-lime-400 text-black' : 'text-white/90 hover:bg-white/10 hover:text-lime-400'
                        }`}
                        aria-label="Download Video in MP4"
                        title="Download Video (MP4)"
                      >
                        <Download size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 hover:bg-white/10 sm:h-9 sm:w-9"
                        aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
                      >
                        {isFullscreen ? <Minimize2 size={17} /> : <Maximize size={17} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#2a2a2a]/95 text-white/90 backdrop-blur hover:bg-[#333] sm:h-11 sm:w-11"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
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

      {showDownloadMenu && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[10000] cursor-default bg-transparent"
            aria-label="Close download menu"
            onClick={() => {
              setShowDownloadMenu(false);
              setDownloadPos(null);
            }}
          />
          <div
            className="fixed z-[10001] w-[340px] max-w-[calc(100vw-32px)] overflow-hidden rounded-3xl border border-white/20 bg-[#18181c]/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: downloadPos ? downloadPos.left : '50%',
              bottom: downloadPos ? downloadPos.bottom : 80,
              transform: downloadPos ? undefined : 'translateX(-50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-lime-400">
                <Download size={18} />
                <span className="text-xs font-black uppercase tracking-wider">
                  Download Video
                </span>
              </div>
              <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-[10px] font-bold text-lime-400">
                MP4 Format
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-lime-500/40">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <h5 className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Video size={13} className="text-lime-400" />
                      Full Course Video
                    </h5>
                    <p className="mt-1 text-[11px] leading-snug text-white/60">
                      Complete slide deck with voiceover narration and avatar presenter in MP4.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isExporting || !slides.length}
                    onClick={exportFullPresentationVideo}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-lime-400/40 bg-lime-400/10 px-3 py-1.5 text-xs font-bold text-lime-400 transition hover:bg-lime-400 hover:text-black active:scale-95 disabled:opacity-50"
                  >
                    <Download size={13} />
                    <span>Export MP4</span>
                  </button>
                </div>
              </div>

              {moduleVideoUrl && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-lime-500/40">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <h5 className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <UserCheck size={13} className="text-lime-400" />
                        HeyGen Studio Video
                      </h5>
                      <p className="mt-1 text-[11px] leading-snug text-white/60">
                        Full studio module video rendered by HeyGen.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isDownloadingDirect}
                      onClick={() =>
                        downloadDirectMp4(moduleVideoUrl, 'Studio_Module')
                      }
                      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-lime-400 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-lime-300 active:scale-95 disabled:opacity-50"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {isExporting && exportProgress && (
        <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-3xl border border-lime-500/30 bg-[#141416] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-500/15 text-lime-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Generating Course MP4 Video</h4>
                <p className="text-xs font-medium text-lime-400">
                  {exportProgress.statusText || `Recording slide ${exportProgress.slide} of ${exportProgress.total}`}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-xs font-semibold text-white/80">
                <span>Rendering Progress</span>
                <span className="font-mono text-lime-400">{exportProgress.percent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-lime-500 to-lime-300 transition-all duration-300"
                  style={{ width: `${exportProgress.percent}%` }}
                />
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] text-white/50">
              Please keep this window open while the video and voiceover are encoded.
            </p>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  cancelExportRef.current = true;
                  setIsExporting(false);
                  setExportProgress(null);
                  toast.info('Export cancelled');
                }}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAvatarPicker && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative flex h-[90vh] max-h-[820px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#11192b] via-[#0d1424] to-[#070b14] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-500/20 text-lime-400">
                    <Sparkles size={16} />
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-white md:text-xl">
                    AI Instructor Avatar Studio
                  </h3>
                  <span className="rounded-full bg-lime-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime-400">
                    Saved in DB
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-white/60">
                  Select the master avatar to use across all course videos. Only the voice narration and lip-sync will change for each course, eliminating render delays and credit exhaustion.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mx-6 mt-4 flex items-center justify-between rounded-2xl border border-lime-500/30 bg-lime-500/10 p-3.5">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-lime-400">
                  <img
                    src={masterAvatar.previewImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/50">Current Master Avatar:</span>
                    <span className="text-sm font-bold text-white">{masterAvatar.avatarName}</span>
                  </div>
                  <span className="text-[11px] text-lime-300/80 font-mono">
                    ID: {masterAvatar.avatarId} · Active across all courses
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-lime-400/20 px-3 py-1 text-xs font-bold text-lime-300">
                <UserCheck size={14} />
                <span>Active in MongoDB</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingAvatars ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/60">
                  <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
                  <p className="text-sm">Fetching instructor avatars from HeyGen…</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {(avatarList.length ? avatarList : [masterAvatar]).map((av) => {
                    const isSelected = av.avatarId === masterAvatar.avatarId;
                    return (
                      <div
                        key={av.avatarId}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-lime-400 bg-lime-500/10 shadow-[0_0_25px_rgba(163,230,53,0.15)] ring-1 ring-lime-400'
                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/[0.08]'
                        }`}
                      >

                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                          <img
                            src={av.previewImageUrl}
                            alt={av.avatarName}
                            className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                          />
                          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.7)]" />
                          {isSelected && (
                            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-lime-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-lg">
                              <Check size={12} strokeWidth={3} />
                              Active
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-3.5">
                          <div>
                            <h4 className="text-sm font-bold text-white truncate" title={av.avatarName}>
                              {av.avatarName}
                            </h4>
                            <p className="mt-0.5 text-[11px] text-white/50 truncate font-mono">
                              {av.avatarId}
                            </p>
                          </div>

                          <div className="mt-3 pt-2">
                            {isSelected ? (
                              <button
                                type="button"
                                disabled
                                className="w-full rounded-xl bg-lime-400/20 py-2 text-xs font-bold text-lime-300 border border-lime-400/40 cursor-default flex items-center justify-center gap-1.5"
                              >
                                <Check size={14} />
                                Master Avatar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectMasterAvatar(av)}
                                disabled={isSavingAvatar}
                                className="w-full rounded-xl bg-lime-400 py-2 text-xs font-bold text-black transition hover:bg-lime-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-lime-500/20"
                              >
                                {isSavingAvatar ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" />
                                    Saving…
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={13} />
                                    Use for All Courses
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-black/30">
              <span className="text-[11px] text-white/50">
                Avatar is saved to database. Voice & lip-sync will automatically synchronize with each slide transcript.
              </span>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
