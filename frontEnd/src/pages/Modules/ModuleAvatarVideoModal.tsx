import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Captions,
  Check,
  ChevronLeft,
  ChevronRight,
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

const LIP_LOOP_START = 0.18;
const LIP_LOOP_END = 0.92;

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

  // Persistent master avatar state (loaded from DB, shared across courses)
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

  // Active speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);
  const isSpeakingRef = useRef(false);

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
  const [speechError, setSpeechError] = useState<string | null>(null);

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

        // Unpack slides from various MongoDB shapes: [ { Module, Slides: [...] } ], latest.slides, etc.
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

        const narrations: SlideNarration[] = rawList.map((slide, idx) => {
          const title = String(slide?.Title || slide?.title || `Slide ${idx + 1}`).trim();
          // Extract full voice transcript or generate natural narration from content + bullets
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
      /* ignore */
    }
    setIsSpeaking(false);
    const vid = avatarVideoRef.current;
    if (vid) {
      if (lipTickRef.current) {
        vid.removeEventListener('timeupdate', lipTickRef.current);
        lipTickRef.current = null;
      }
      vid.pause();
      try {
        vid.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) stopSpeech();
  }, [muted, stopSpeech]);

  // Prefetch browser voices (Chrome returns [] until voiceschanged)
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

  // Fetch current Master Avatar from DB
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

  // Load avatar choices from HeyGen API / DB for the Avatar Studio picker
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

  const lipTickRef = useRef<((this: HTMLVideoElement, ev: Event) => void) | null>(null);

  const setAvatarLips = useCallback((speaking: boolean, rate = 1) => {
    const vid = avatarVideoRef.current;
    if (!vid) return;
    vid.muted = true;
    vid.volume = 0;
    vid.loop = false;
    if (lipTickRef.current) {
      vid.removeEventListener('timeupdate', lipTickRef.current);
      lipTickRef.current = null;
    }
    if (speaking && playingRef.current && !mutedRef.current) {
      vid.playbackRate = Math.min(1.35, Math.max(0.8, rate));
      const onTick = () => {
        if (vid.currentTime >= LIP_LOOP_END) {
          try {
            vid.currentTime = LIP_LOOP_START;
          } catch {
            /* ignore */
          }
        }
      };
      lipTickRef.current = onTick;
      vid.addEventListener('timeupdate', onTick);
      try {
        vid.currentTime = LIP_LOOP_START;
      } catch {
        /* ignore */
      }
      const p = vid.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      vid.pause();
      try {
        vid.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
  }, []);

  const pulseLipsForWord = useCallback(() => {
    const vid = avatarVideoRef.current;
    if (!vid || !playingRef.current || mutedRef.current) return;
    try {
      vid.currentTime = LIP_LOOP_START + Math.random() * 0.12;
    } catch {
      /* ignore */
    }
    vid.playbackRate = Math.min(1.35, Math.max(0.8, speedRef.current));
    const p = vid.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, []);

  useEffect(() => {
    setAvatarLips(isSpeaking && playing && !muted, speedRef.current);
  }, [isSpeaking, playing, muted, playbackSpeed, setAvatarLips]);

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

  const splitSpeechChunks = (text: string, maxLen = 180): string[] => {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return [];
    if (cleaned.length <= maxLen) return [cleaned];
    const parts = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
    const chunks: string[] = [];
    let buf = '';
    for (const part of parts) {
      const next = part.trim();
      if (!next) continue;
      if ((buf + ' ' + next).trim().length <= maxLen) {
        buf = (buf + ' ' + next).trim();
      } else {
        if (buf) chunks.push(buf);
        if (next.length <= maxLen) buf = next;
        else {
          for (let i = 0; i < next.length; i += maxLen) chunks.push(next.slice(i, i + maxLen));
          buf = '';
        }
      }
    }
    if (buf) chunks.push(buf);
    return chunks.length ? chunks : [cleaned];
  };

  const speakSlide = useCallback(
    (index: number, opts?: { fromUserGesture?: boolean }) => {
      utteranceIdRef.current += 1;
      const speakId = utteranceIdRef.current;
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      activeUtteranceRef.current = null;
      setSpeechError(null);

      const wasBusy =
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        (window.speechSynthesis.speaking || window.speechSynthesis.pending);
      if (wasBusy) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* ignore */
        }
      }

      if (mutedRef.current) {
        setIsSpeaking(false);
        setAvatarLips(false);
        return;
      }

      const slide = slides[index];
      const text = (slide?.script || slide?.content || slide?.title || '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!text) {
        setIsSpeaking(false);
        setAvatarLips(false);
        return;
      }
      if (!('speechSynthesis' in window)) {
        setIsSpeaking(false);
        setSpeechError('Browser voice is not supported in this browser.');
        return;
      }

      const chunks = splitSpeechChunks(text);
      let chunkIndex = 0;

      const finishSlideSpeech = () => {
        if (utteranceIdRef.current !== speakId) return;
        setIsSpeaking(false);
        setAvatarLips(false);
        activeUtteranceRef.current = null;

        if (!playingRef.current) return;
        const next = index + 1;
        if (next < slides.length) {
          setSlideIndex(next);
          slideIndexRef.current = next;
          setElapsedInSlide(0);
          elapsedRef.current = 0;
          speakTimeoutRef.current = setTimeout(() => {
            if (!playingRef.current || mutedRef.current) return;
            speakSlide(next);
          }, 80);
        } else {
          setPlaying(false);
          playingRef.current = false;
        }
      };

      const speakNextChunk = () => {
        if (utteranceIdRef.current !== speakId || mutedRef.current) return;
        if (chunkIndex >= chunks.length) {
          finishSlideSpeech();
          return;
        }

        const chunkText = chunks[chunkIndex];
        const utter = new SpeechSynthesisUtterance(chunkText);
        activeUtteranceRef.current = utter;
        const rate = Math.min(1.6, Math.max(0.75, speedRef.current));
        utter.rate = rate;
        utter.pitch = 1;
        utter.volume = 1;
        utter.lang = 'en-US';
        const voice = pickVoice();
        if (voice) utter.voice = voice;

        utter.onstart = () => {
          if (utteranceIdRef.current !== speakId) return;
          setIsSpeaking(true);
          setSpeechError(null);
          setAvatarLips(true, rate);
        };

        utter.onboundary = (event) => {
          if (utteranceIdRef.current !== speakId) return;
          if (event.name === 'word') {
            pulseLipsForWord();
          }
        };

        utter.onend = () => {
          if (utteranceIdRef.current !== speakId) return;
          chunkIndex += 1;
          speakNextChunk();
        };

        utter.onerror = (event) => {
          const err = (event as SpeechSynthesisErrorEvent).error;
          if (err === 'interrupted' || err === 'canceled') return;
          if (utteranceIdRef.current !== speakId) return;
          console.warn('Speech error:', err);
          if (chunkIndex === 0) {
            setSpeechError('Browser voice failed. Check Windows speech voices / tab mute.');
            setIsSpeaking(false);
            setAvatarLips(false);
            return;
          }
          chunkIndex += 1;
          speakNextChunk();
        };

        try {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
          window.speechSynthesis.speak(utter);
          setIsSpeaking(true);
          setAvatarLips(true, rate);
        } catch (err) {
          console.warn('speak() failed:', err);
          setSpeechError('Could not start browser voice.');
          setIsSpeaking(false);
          setAvatarLips(false);
        }
      };

      const kickOff = () => {
        if (utteranceIdRef.current !== speakId) return;
        try {
          window.speechSynthesis.getVoices();
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        } catch {
          /* ignore */
        }
        speakNextChunk();
      };

      if (opts?.fromUserGesture && !wasBusy) {
        kickOff();
      } else {
        speakTimeoutRef.current = setTimeout(kickOff, opts?.fromUserGesture ? 40 : 80);
      }
    },
    [slides, pickVoice, setAvatarLips, pulseLipsForWord]
  );

  const applyPlaybackSpeed = (next: number) => {
    speedRef.current = next;
    setPlaybackSpeed(next);
    if (avatarVideoRef.current) {
      avatarVideoRef.current.playbackRate = next;
    }
    // Re-speak current slide at new rate so voice + lips stay matched
    if (playingRef.current && !mutedRef.current) {
      speakSlide(slideIndexRef.current, { fromUserGesture: true });
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
    (index: number, opts?: { playSpeech?: boolean; keepPlaying?: boolean; fromUserGesture?: boolean }) => {
      const next = Math.max(0, Math.min(slides.length - 1, index));
      setSlideIndex(next);
      setElapsedInSlide(0);
      elapsedRef.current = 0;
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
      const local = t - (slideStarts[idx] || 0);
      setSlideIndex(idx);
      setElapsedInSlide(local);
      elapsedRef.current = local;
      if (playingRef.current) {
        speakSlide(idx, { fromUserGesture: opts?.fromUserGesture });
      } else {
        stopSpeech();
      }
    },
    [slides.length, totalDuration, slideStarts, durations, speakSlide, stopSpeech]
  );

  useEffect(() => {
    if (!playing || !slides.length) {
      if (tickRef.current) window.cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
      return;
    }

    lastTickRef.current = performance.now();

    // Progress bar only — slide changes are driven by browser voice ending
    // so lips + script stay on the same slide.
    const loop = (now: number) => {
      const dt = ((now - lastTickRef.current) / 1000) * speedRef.current;
      lastTickRef.current = now;
      if (!playingRef.current) return;

      const idx = slideIndexRef.current;
      const dur = durations[idx] || 5;
      const nextElapsed = Math.min(dur * 0.98, elapsedRef.current + dt);
      setElapsedInSlide(nextElapsed);
      elapsedRef.current = nextElapsed;

      tickRef.current = window.requestAnimationFrame(loop);
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
      stopSpeech();
      return;
    }
    setPlaying(true);
    playingRef.current = true;
    // Speak inside the click handler (user gesture) so Chrome allows audio
    if (slideIndex >= slides.length - 1 && elapsedInSlide >= (durations[slideIndex] || 5) - 0.15) {
      setSlideIndex(0);
      slideIndexRef.current = 0;
      setElapsedInSlide(0);
      elapsedRef.current = 0;
      speakSlide(0, { fromUserGesture: true });
    } else {
      speakSlide(slideIndex, { fromUserGesture: true });
    }
  };

  const skipBy = (delta: number) => seekAbsolute(currentTime + delta, { fromUserGesture: true });

  const goPrev = () => {
    if (slideIndex <= 0) {
      setElapsedInSlide(0);
      elapsedRef.current = 0;
      stopSpeech();
      return;
    }
    goToSlide(slideIndex - 1, { keepPlaying: playing, fromUserGesture: true });
  };

  const goNext = () => {
    if (slideIndex >= slides.length - 1) return;
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

                {/* Clean Circular Master Avatar on pure black background */}
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
                      src={masterAvatar.previewVideoUrl}
                      poster={masterAvatar.previewImageUrl}
                      playsInline
                      muted
                      autoPlay={false}
                      preload="metadata"
                      onLoadedData={(e) => {
                        e.currentTarget.muted = true;
                        e.currentTarget.volume = 0;
                      }}
                      className="h-full w-full scale-[1.15] object-cover object-[50%_12%]"
                    />
                    {/* Soft black edges — keep full face visible, hide studio glow */}
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

                {speechError && (
                  <div className="mb-3 max-w-3xl rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-sm text-amber-100">
                    {speechError}
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
                      onClick={openAvatarPicker}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
                      aria-label="Avatar Studio Settings"
                      title="Choose Master AI Avatar"
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

      {/* AI Instructor Avatar Studio Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative flex h-[90vh] max-h-[820px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#11192b] via-[#0d1424] to-[#070b14] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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

            {/* Current Master Avatar Banner */}
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

            {/* Avatar Grid */}
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
                        {/* Avatar Image / Video Container */}
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

                        {/* Info & Select Button */}
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

            {/* Footer */}
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
