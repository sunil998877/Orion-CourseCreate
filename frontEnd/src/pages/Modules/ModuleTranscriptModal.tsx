import { useState } from 'react';
import {
  Copy,
  X,
  Sparkles,
  Mic,
  ClipboardList,
  Check,
  Loader2,
  FileText,
  Volume2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { cleanTitle, type ModuleState } from './moduleTypes';
import { API_BASE } from '../../utils/api';
import { toast } from 'react-toastify';
import { saveModuleContent } from '../../services/moduleService';

const bulletText = (slide: any) => {
  const source = Array.isArray(slide?.Bullets) ? slide.Bullets : Array.isArray(slide?.bullets) ? slide.bullets : [];
  return source.map((item: any) => String(item || '').trim()).filter(Boolean);
};

export const spokenLine = (slide: any, index = 0) => {
  const direct = String(slide?.Transcript || slide?.transcript || slide?.Narration || slide?.narration || '').trim();
  if (direct)
    return direct;
  const title = String(slide?.Title || slide?.title || `Slide ${index + 1}`).trim();
  const content = String(slide?.Content || slide?.content || '').trim();
  const bullets = bulletText(slide);
  const body = [content, bullets.join('. ')].filter(Boolean).join(' ');
  if (title && body)
    return `${title}. ${body}`;
  return body || title;
};

export const slideCueCards = (slide: any): string[] => {
  const direct = Array.isArray(slide?.CueCard)
    ? slide.CueCard
    : Array.isArray(slide?.cueCard)
    ? slide.cueCard
    : Array.isArray(slide?.cue_card)
    ? slide.cue_card
    : [];
  if (direct.length)
    return direct.map((c: any) => String(c || '').trim()).filter(Boolean);
  const bullets = bulletText(slide);
  if (bullets.length)
    return bullets;
  return [];
};

export const slidesForScript = (mod: ModuleState) => {
  const stored = mod.slide as any;
  let list: any[] = [];
  if (Array.isArray(stored?.Slides) && stored.Slides.length)
    list = stored.Slides;
  else if (Array.isArray(stored?.slides) && stored.slides.length)
    list = Array.isArray(stored.slides[0]?.Slides) ? stored.slides[0].Slides : stored.slides;
  else if (Array.isArray(stored) && stored.length)
    list = stored;
  if (!list.length) {
    const topics = Array.isArray(mod.Content?.TeachingContent) ? mod.Content.TeachingContent : [];
    list = topics.map((topic: any, index: number) => ({
      SlideNumber: index + 1,
      Title: topic?.Topics || `Part ${index + 1}`,
      Content: Array.isArray(topic?.ContentPoints) ? topic.ContentPoints.join(' ') : '',
    }));
  }
  if (!list.length && mod.Content) {
    const objectives = Array.isArray(mod.Content.Objectives) ? mod.Content.Objectives.filter(Boolean) : [];
    const caseText = String(mod.Content.CaseStudy?.CaseStudyDescription || '').trim();
    const body = [objectives.join('. '), caseText].filter(Boolean).join(' ');
    if (body) {
      list = [{
        SlideNumber: 1,
        Title: cleanTitle(mod.Content.Title || mod.Module || 'Module'),
        Content: body,
      }];
    }
  }
  return list.map((slide, index) => ({
    ...slide,
    Transcript: spokenLine(slide, index),
    CueCard: slideCueCards(slide),
  }));
};

export const TranscriptModal = ({
  mod,
  courseData,
  onUpdateSlides,
  onClose,
}: {
  mod: ModuleState;
  courseData?: any;
  onUpdateSlides?: (updatedSlides: any[]) => void;
  onClose: () => void;
}) => {
  const [slides, setSlides] = useState<any[]>(() => slidesForScript(mod));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'script' | 'cues'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const hasCues = slides.some((s) => Array.isArray(s.CueCard) && s.CueCard.length > 0);

  const handleGenerateAiNarration = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/generate-narration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          courseData,
          moduleNumber: mod.id,
          slides: slides.map((s, idx) => ({
            SlideNumber: s.SlideNumber || idx + 1,
            Title: s.Title || s.title || `Slide ${idx + 1}`,
            Content: s.Content || s.content || '',
            Bullets: s.Bullets || s.bullets || [],
            Purpose: s.Purpose || '',
            LearningOutcome: s.LearningOutcome || '',
            LearnerAction: s.LearnerAction || '',
          })),
          allowDirect: true,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !Array.isArray(data?.slides)) {
        toast.error(data?.message || 'Could not generate trainer narration');
        return;
      }

      const merged = slides.map((slide, idx) => {
        const num = slide.SlideNumber || idx + 1;
        const match = data.slides.find(
          (item: any) => Number(item.SlideNumber) === Number(num)
        );
        return match
          ? {
              ...slide,
              Transcript: match.Transcript || slide.Transcript || '',
              CueCard: Array.isArray(match.CueCard) ? match.CueCard : slide.CueCard || [],
            }
          : slide;
      });

      setSlides(merged);
      if (onUpdateSlides) {
        onUpdateSlides(merged);
      }

      if (courseData?.courseId && token) {
        try {
          await saveModuleContent(
            {
              courseId: courseData.courseId,
              moduleNumber: mod.id,
              title: mod.Content?.Title || mod.Module,
              slides: merged,
              TeachingContent: mod.Content?.TeachingContent || [],
            },
            token
          );
        } catch {

        }
      }

      toast.success('✨ Trainer script & cue cards generated successfully!');
    } catch (err) {
      console.error('Failed to generate trainer script:', err);
      toast.error('AI narration generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copySlideText = (text: string, idx: number, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedIdx(null);
      setCopiedType(null);
    }, 2000);
  };

  const copyAll = (mode: 'all' | 'script' | 'cues' = activeTab) => {
    let fullText = '';
    if (mode === 'script') {
      fullText = slides
        .map((s, i) => `[Slide ${i + 1}: ${s.Title || s.title || ''}]\n${spokenLine(s, i)}`)
        .join('\n\n');
    } else if (mode === 'cues') {
      fullText = slides
        .map((s, i) => {
          const cues = slideCueCards(s);
          return `[Slide ${i + 1}: ${s.Title || s.title || ''}]\n${cues.map((c) => `• ${c}`).join('\n')}`;
        })
        .join('\n\n');
    } else {
      fullText = slides
        .map((s, i) => {
          const script = spokenLine(s, i);
          const cues = slideCueCards(s);
          return `[Slide ${i + 1}: ${s.Title || s.title || ''}]\nVOICEOVER NARRATION:\n${script}\n\nTRAINER CUE CARDS:\n${cues.map((c) => `• ${c}`).join('\n')}`;
        })
        .join('\n\n---\n\n');
    }

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return createPortal(
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200 ${isFullscreen ? 'p-0' : 'p-4 max-md:p-2'}`}>
      <div className={`bg-gray-950 border border-white/10 shadow-2xl flex flex-col transition-all duration-200 animate-in zoom-in-95 overflow-hidden ${
        isFullscreen
          ? 'w-full h-full max-w-none max-h-none rounded-none'
          : 'w-full max-w-3xl rounded-3xl max-h-[90vh] max-md:max-h-[100dvh] max-md:h-full max-md:rounded-2xl'
      }`}>

        <div className="flex items-start justify-between gap-4 px-8 py-6 border-b border-white/10 bg-white/[0.02] shrink-0 max-md:flex-col max-md:px-4 max-md:py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-lime-500/10 border border-lime-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
                Trainer & Voice Script
              </span>
              <span className="text-xs text-gray-500">
                {slides.length} slides · Spoken voiceover & trainer cues
              </span>
            </div>
            <h3 className="text-xl font-black text-white max-md:text-base leading-snug">
              Module {mod.id}: {cleanTitle(mod.Content?.Title || mod.Module)}
            </h3>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap max-md:w-full max-md:justify-between">
            <button
              onClick={handleGenerateAiNarration}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-black text-xs transition-all shadow-[0_0_20px_rgba(132,204,22,0.2)] active:scale-95 disabled:opacity-50"
              title="Generate or enrich trainer narration and cues using AI"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Script...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  ✨ AI Generate Trainer Script
                </>
              )}
            </button>

            <button
              onClick={() => copyAll()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-all border border-white/10 active:scale-95"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-lime-400" />
                  <span className="text-lime-400">Copied All!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-lime-400" />
                  Copy All
                </>
              )}
            </button>

            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              aria-label={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-8 py-3 bg-white/[0.01] border-b border-white/5 shrink-0 max-md:px-4 max-md:flex-col max-md:gap-2 max-md:items-stretch">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-lime-500/15 text-lime-400 border border-lime-500/30'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              All (Script & Cues)
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'script'
                  ? 'bg-lime-500/15 text-lime-400 border border-lime-500/30'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Spoken Voiceover
            </button>
            <button
              onClick={() => setActiveTab('cues')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'cues'
                  ? 'bg-lime-500/15 text-lime-400 border border-lime-500/30'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Trainer Cue Cards
            </button>
          </div>

          <div className="text-[11px] text-gray-400">
            {activeTab === 'script' && 'Showing verbatim narration used for audio & avatar'}
            {activeTab === 'cues' && 'Showing bullet talk tracks & delivery cues for live trainers'}
            {activeTab === 'all' && 'Full comprehensive trainer view'}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 px-8 py-6 space-y-5 custom-scrollbar max-md:px-3 max-md:py-4">
          {slides.length === 0 ? (
            <div className="text-center py-16 text-gray-500 italic">
              No slides or transcripts found for this module yet.
            </div>
          ) : (
            slides.map((slide: any, i: number) => {
              const transcript = spokenLine(slide, i);
              const cues = slideCueCards(slide);

              return (
                <div
                  key={i}
                  className="group bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 hover:border-lime-500/20 p-5 transition-all duration-200 max-md:p-4 max-md:rounded-xl space-y-4"
                >

                  <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="px-2.5 h-7 rounded-lg bg-lime-500/10 text-lime-400 flex items-center justify-center font-black text-[10px] ring-1 ring-lime-500/20 shrink-0">
                        Slide {i + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white max-md:text-[13px] leading-snug truncate">
                        {slide.Title || slide.title || `Slide ${i + 1}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const both = `Slide ${i + 1}: ${slide.Title || ''}\nVoiceover:\n${transcript}\n\nCue Cards:\n${cues.map((c) => `• ${c}`).join('\n')}`;
                          copySlideText(both, i, 'all');
                        }}
                        className="text-[10px] font-bold text-gray-500 hover:text-lime-400 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                        title="Copy slide narration & cues"
                      >
                        {copiedIdx === i && copiedType === 'all' ? (
                          <>
                            <Check className="w-3 h-3 text-lime-400" />
                            <span className="text-lime-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Slide</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {(activeTab === 'all' || activeTab === 'script') && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-lime-400/90">
                        <span className="flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 text-lime-400" />
                          Spoken Voiceover Narration
                        </span>
                        <button
                          onClick={() => copySlideText(transcript, i, 'script')}
                          className="text-[10px] font-medium text-gray-500 hover:text-lime-400 lowercase"
                        >
                          {copiedIdx === i && copiedType === 'script' ? 'copied!' : 'copy narration'}
                        </button>
                      </div>

                      {transcript ? (
                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-sm text-gray-300 leading-relaxed italic max-md:text-[13px]">
                          "{transcript}"
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-gray-600 italic">
                          No spoken transcript for this slide. Click "AI Generate Trainer Script" to create one.
                        </div>
                      )}
                    </div>
                  )}

                  {(activeTab === 'all' || activeTab === 'cues') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-sky-400">
                        <span className="flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5 text-sky-400" />
                          Trainer Cue Cards & Delivery Prompts
                        </span>
                        <button
                          onClick={() => copySlideText(cues.map((c) => `• ${c}`).join('\n'), i, 'cues')}
                          className="text-[10px] font-medium text-gray-500 hover:text-sky-400 lowercase"
                        >
                          {copiedIdx === i && copiedType === 'cues' ? 'copied!' : 'copy cues'}
                        </button>
                      </div>

                      {cues.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {cues.map((cue: string, cueIdx: number) => {
                            const isDeliveryNote = /\[(pause|wait|ask|reveal|action|question)/i.test(cue);
                            return (
                              <div
                                key={cueIdx}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs leading-relaxed ${
                                  isDeliveryNote
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                                    : 'bg-white/[0.03] border-white/5 text-gray-300'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                    isDeliveryNote ? 'bg-amber-400' : 'bg-sky-400'
                                  }`}
                                />
                                <span className="flex-1 font-medium">{cue}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-gray-600 italic">
                          No cue cards generated yet. Click "AI Generate Trainer Script" above to generate talk tracks and cues.
                        </div>
                      )}
                    </div>
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
