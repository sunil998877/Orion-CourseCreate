import { useEffect, useState, useMemo } from 'react';
import { API_BASE } from '../../utils/api';
import { useCourseData } from '../../contextAPI/courseAPI';
import { ModuleViewer } from './ModuleViewer';
import { SlideContent } from './SlideContent';
import { CheckCircle, Book, Download, Loader2, FileText, Copy, X } from 'lucide-react';
import { createPortal } from 'react-dom';

// ─── Slide Transcript Modal ───────────────────────────────────────────────────
const TranscriptModal = ({ mod, onClose }: { mod: ModuleState; onClose: () => void }) => {
    const slides: any[] = Array.isArray(mod.slide?.Slides) ? mod.slide.Slides : [];
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const copySlide = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const copyAll = () => {
        const all = slides.map((s, i) => `[Slide ${i + 1}: ${s.Title || ''}]\n${s.Transcript || s.transcript || ''}`).join('\n\n');
        navigator.clipboard.writeText(all);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2500);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-950 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 shrink-0">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-500/60 mb-1">Voiceover Script</p>
                        <h3 className="text-xl font-black text-white">Module {mod.id}: {cleanTitle(mod.Content?.Title || mod.Module)}</h3>
                        <p className="text-xs text-gray-500 mt-1">{slides.length} slides · slide-by-slide transcript</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={copyAll}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 font-bold text-xs transition-all border border-lime-500/20"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedAll ? 'Copied!' : 'Copy All'}
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Slide list */}
                <div className="overflow-y-auto flex-1 px-8 py-6 space-y-4 custom-scrollbar">
                    {slides.length === 0 ? (
                        <div className="text-center py-16 text-gray-500 italic">No slide transcripts found for this module yet.</div>
                    ) : (
                        slides.map((slide: any, i: number) => {
                            const transcript = slide.Transcript || slide.transcript || '';
                            return (
                                <div key={i} className="group bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 hover:border-lime-500/20 p-5 transition-all duration-200">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 h-8 rounded-xl bg-lime-500/10 text-lime-400 flex items-center justify-center font-black text-[10px] ring-1 ring-lime-500/20 shrink-0">
                                                Slide {i + 1}
                                            </span>
                                            <span className="text-sm font-bold text-white">{slide.Title || slide.title || `Slide ${i + 1}`}</span>
                                        </div>
                                        <button
                                            onClick={() => copySlide(transcript, i)}
                                            className="shrink-0 text-[10px] font-bold text-gray-500 hover:text-lime-400 flex items-center gap-1.5 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Copy className="w-3 h-3" />
                                            {copiedIdx === i ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    {transcript ? (
                                        <p className="text-sm text-gray-400 leading-relaxed italic pl-11">
                                            "{transcript}"
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-600 italic pl-11">No transcript for this slide.</p>
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

export type ModuleState = {
    id: number;
    Module: string;
    Content: any;
    slide: any;
    isGenerating: boolean;
    isGenerated: boolean;
    viewMode: 'module' | 'slide';
    error?: string | null;
    orionUrl?: string;
    orionGenerationId?: string;
    showOrion?: boolean;
    progress?: number;
};

export const cleanTitle = (title: string) => {
    if (!title) return '';
    const cleaned = title.replace(/^Module\s+\d+[:\-\s]*/i, '').replace(/^Chapter\s+\d+[:\-\s]*/i, '').trim();
    return cleaned || title;
};

const ModuleGen = () => {
    const { courseData } = useCourseData();

    const [selectedModule, setSelectedModule] = useState<ModuleState | null>(null);
    const [modules, setModules] = useState<ModuleState[]>([]);
    const [selectedSlide, setSelectedSlide] = useState<ModuleState | null>(null);
    const [downloadingModuleId, setDownloadingModuleId] = useState<number | null>(null);
    const [selectedTranscriptMod, setSelectedTranscriptMod] = useState<ModuleState | null>(null);

    const moduleCredits = useMemo(() => {
        const n = modules.length;
        if (n === 0) return {};

        let credits: number[] = [];
        if (n <= 2) {
            const base = Math.floor(100 / n);
            credits = Array(n).fill(base);
        } else {
            const d = 2; // increment
            const a = (100 - (n * (n - 1) * d) / 2) / n;

            if (a < 5) {
                const base = Math.floor(100 / n);
                credits = Array(n).fill(base);
            } else {
                credits = Array.from({ length: n }, (_, i) => Math.round(a + i * d));
            }
        }

        const currentSum = credits.reduce((sum, c) => sum + c, 0);
        if (currentSum !== 100 && credits.length > 0) {
            credits[credits.length - 1] += (100 - currentSum);
        }

        const map: Record<number, number> = {};
        modules.forEach((mod, idx) => {
            map[mod.id] = credits[idx];
        });
        return map;
    }, [modules]);

    useEffect(() => {
        const interval = setInterval(() => {
            setModules(prev => prev.map(m => {
                if (m.isGenerating) {
                    const current = m.progress ?? 0;
                    if (current < 95) {
                        const inc = Math.random() * 0.8 + 0.2;
                        return { ...m, progress: Math.min(95, current + inc) };
                    }
                }
                return m;
            }));
        }, 250);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const moduleCount = Number.isFinite(courseData?.module) && (courseData?.module ?? 0) > 0 ? (courseData?.module ?? 0) : 0;
        const initialModules = Array.from({ length: moduleCount }, (_, index) => ({
            id: index + 1,
            Module: `Module ${index + 1}`,
            Content: { Title: '', Objectives: [], TeachingContent: [], CaseStudy: {}, Quizzes: [], VisualDescriptions: [], FurtherStudy: {} },
            slide: { Module: '', Slides: [] },
            isGenerating: false,
            isGenerated: false,
            error: null,
            viewMode: 'module' as const,
            progress: 0
        }));
        setModules(initialModules);
    }, [courseData?.module]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const courseId = courseData?.courseId;
        if (!courseId || modules.length === 0 || !token) return;

        let stopped = false;
        const checkOnce = async () => {
            const pendingModules = modules.filter(m => !m.isGenerated || !m.slide?.Slides?.length);
            if (pendingModules.length === 0) return;

            for (const mod of pendingModules) {
                if (stopped) break;
                try {
                    const resp = await fetch(
                        `${API_BASE}/module-contents?courseId=${encodeURIComponent(String(courseId))}&moduleNumber=${mod.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (!resp.ok) continue;
                    const docs = await resp.json();
                    const latest = Array.isArray(docs) && docs.length ? docs[0] : docs;
                    if (latest) {
                        const content = (latest?.Title || latest?.title) ? latest : null;
                        const slidesRaw = latest?.slides;
                        let slides: any = { Module: `Module ${mod.id}`, Slides: [] };
                        if (slidesRaw && Array.isArray(slidesRaw?.Slides)) {
                            slides = { Module: `Module ${mod.id}`, Slides: slidesRaw.Slides };
                        } else if (Array.isArray(slidesRaw)) {
                            slides = { Module: `Module ${mod.id}`, Slides: slidesRaw };
                        } else if (slidesRaw && typeof slidesRaw === 'object') {
                            slides = slidesRaw;
                        }

                        if (content || (Array.isArray(slides.Slides) && slides.Slides.length > 0)) {
                            setModules(prev =>
                                prev.map(m => m.id === mod.id
                                    ? {
                                        ...m,
                                        Content: content || m.Content,
                                        slide: slides || m.slide,
                                        orionUrl: latest?.gammaUrl || m.orionUrl,
                                        orionGenerationId: latest?.gammaGenerationId || m.orionGenerationId,
                                        isGenerated: true,
                                        isGenerating: false,
                                        progress: 100
                                    }
                                    : m
                                )
                            );
                        }
                    }
                } catch { }
            }
        };

        const interval = setInterval(checkOnce, 4000);
        checkOnce();

        return () => {
            stopped = true;
            clearInterval(interval);
        };
    }, [courseData?.courseId, modules]);



    const downloadOrionPPTX = async (mod: ModuleState) => {
        try {
            setDownloadingModuleId(mod.id);
            const token = localStorage.getItem('token');
            const courseId = courseData?.courseId;
            if (!courseId || !token) {
                setDownloadingModuleId(null);
                return;
            }

            const toastId = (window as any).toast?.loading?.('Preparing PPTX download...') || null;

            const resp = await fetch(
                `${API_BASE}/courses/${courseId}/modules/${mod.id}/download-pptx`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                if (toastId) (window as any).toast?.dismiss?.(toastId);
                throw new Error(err.message || 'Failed to download PPTX');
            }

            const blob = await resp.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${courseData?.title || 'Course'}_Module_${mod.id}.pptx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            if (toastId) (window as any).toast?.dismiss?.(toastId);
            (window as any).toast?.success?.('Download started!');
        } catch (e: any) {
            console.error('Download error:', e);
            (window as any).toast?.error?.(e.message || 'Failed to download PPTX');
        } finally {
            setDownloadingModuleId(null);
        }
    };

    const openSlidesPreview = async (mod: ModuleState, showOrion = false) => {
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(
                `${API_BASE}/module-contents?courseId=${courseData?.courseId}&moduleNumber=${mod.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (resp.ok) {
                const docs = await resp.json();
                const latestModule = Array.isArray(docs) && docs.length ? docs[0] : docs;
                const content = (latestModule?.Title || latestModule?.title) ? latestModule : null;
                const rawSlides = latestModule?.slides ?? latestModule;
                let slides: any = { Module: `Module ${mod.id}`, Slides: [] };
                if (rawSlides && Array.isArray((rawSlides as any).Slides)) {
                    slides = { Module: `Module ${mod.id}`, Slides: (rawSlides as any).Slides };
                } else if (Array.isArray(rawSlides)) {
                    slides = { Module: `Module ${mod.id}`, Slides: rawSlides as any[] };
                } else if (rawSlides && typeof rawSlides === 'object') {
                    slides = rawSlides;
                }
                const orionUrl = latestModule?.gammaUrl;
                const orionGenerationId = latestModule?.gammaGenerationId;
                setSelectedSlide({ ...mod, Content: content || mod.Content, slide: slides, orionUrl, orionGenerationId, showOrion });
                return;
            }
        } catch (e) {
            console.error("Failed to fetch slides:", e);
        }
        setSelectedSlide({
            ...mod,
            slide: { Module: `Module ${mod.id}`, Slides: [] },
            showOrion
        });
    };

    const handleChat = async (prompt: string, moduleData: ModuleState, history: { role: 'user' | 'assistant'; content: string }[]) => {
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt,
                    moduleContext: moduleData.Content,
                    history
                })
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to get AI response');
            }

            const data = await resp.json();
            return data.message;
        } catch (error) {
            console.error('Chat error:', error);
            (window as any).toast?.error?.('Failed to reach AI architect');
            throw error;
        }
    };

    return (
        <div className="space-y-6 mt-8 ">
            <div className="text-left mb-8">
                <div className='flex items-center gap-2'>
                    <Book className="w-12 h-12 text-lime-400 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Course Modules</h2>
                </div>
                <p className="text-white/70">Generate comprehensive content for each module using Course Creator</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-1">
                {modules.map(mod => (
                    <div key={mod.id} className="group relative bg-[#111827]/30 border border-white/5 rounded-3xl transition-all duration-500 hover:border-lime-500/20 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="p-8 relative z-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6">
                                <div className="flex items-center space-x-5">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-lime-400/20 to-emerald-600/20 border border-lime-500/20 group-hover:scale-105 transition-transform duration-500">
                                        <span className="text-lime-400 font-black text-xl">{mod.id}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white group-hover:text-lime-400 transition-colors">
                                            {mod.isGenerated ? cleanTitle(mod.Content?.Title || mod.Module) : mod.Module}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <div className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">
                                                {mod.isGenerating ? 'Architecting' : mod.isGenerated ? 'Ready' : 'Pending'}
                                            </div>
                                            <p className="text-xs font-bold text-white/30 truncate max-w-[200px]">
                                                {mod.isGenerating ? `Constructing digital architecture... ${Math.round(mod.progress || 0)}%` : mod.isGenerated ? 'System documentation finalized' : 'Awaiting initialization'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {mod.isGenerated && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-500/10 border border-lime-500/20">
                                        <CheckCircle className="w-4 h-4 text-lime-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">Validated</span>
                                    </div>
                                )}
                                {mod.isGenerating && (
                                    <div className="flex flex-col items-end gap-2 w-full sm:w-48">
                                        <div className="flex justify-between w-full px-1">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">System Progress</span>
                                            <span className="text-[8px] font-black text-lime-400">{Math.round(mod.progress || 0)}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5 p-0.5">
                                            <div
                                                className="bg-gradient-to-r from-lime-500 to-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(132,204,22,0.3)] transition-all duration-300"
                                                style={{ width: `${mod.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-4">
                                    {mod.orionUrl && (
                                        <>
                                            <button
                                                onClick={() => openSlidesPreview(mod, true)}
                                                className="group/btn flex items-center px-5 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 hover:border-white/20 transition-all font-bold text-xs uppercase tracking-widest active:scale-95 shadow-lg bg-white/[0.02]"
                                            >
                                                <Book size={14} className="mr-3 text-lime-500 group-hover/btn:rotate-12 transition-transform" />
                                                View Deck
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const token = localStorage.getItem('token');
                                                    try {
                                                        const resp = await fetch(
                                                            `${API_BASE}/module-contents?courseId=${courseData?.courseId}&moduleNumber=${mod.id}`,
                                                            { headers: { Authorization: `Bearer ${token}` } }
                                                        );
                                                        if (resp.ok) {
                                                            const docs = await resp.json();
                                                            const latestModule = Array.isArray(docs) && docs.length ? docs[0] : docs;
                                                            const rawSlides = latestModule?.slides ?? latestModule;
                                                            let slides: any = { Module: `Module ${mod.id}`, Slides: [] };
                                                            if (rawSlides && Array.isArray((rawSlides as any).Slides)) {
                                                                slides = { Module: `Module ${mod.id}`, Slides: (rawSlides as any).Slides };
                                                            } else if (Array.isArray(rawSlides)) {
                                                                slides = { Module: `Module ${mod.id}`, Slides: rawSlides as any[] };
                                                            } else if (rawSlides && typeof rawSlides === 'object') {
                                                                slides = rawSlides;
                                                            }
                                                            const content = (latestModule?.Title || latestModule?.title) ? latestModule : null;
                                                            setSelectedTranscriptMod({ ...mod, Content: content || mod.Content, slide: slides });
                                                            return;
                                                        }
                                                    } catch { }
                                                    setSelectedTranscriptMod(mod);
                                                }}
                                                className="group/btn flex items-center px-5 py-3 text-lime-400 hover:text-white hover:bg-lime-500/10 rounded-2xl border border-lime-500/10 hover:border-lime-500/40 transition-all font-bold text-xs uppercase tracking-widest active:scale-95 shadow-[0_10px_30px_-10px_rgba(132,204,22,0.1)]"
                                            >
                                                <FileText size={14} className="mr-3 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                Voice Script
                                            </button>
                                            <button
                                                onClick={() => downloadOrionPPTX(mod)}
                                                disabled={downloadingModuleId === mod.id}
                                                className="group/btn flex items-center px-5 py-3 text-lime-400 hover:text-white hover:bg-lime-500/10 rounded-2xl border border-lime-500/10 hover:border-lime-500/40 transition-all font-bold text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_-10px_rgba(132,204,22,0.1)]"
                                            >
                                                {downloadingModuleId === mod.id ? (
                                                    <>
                                                        <Loader2 size={14} className="mr-3 animate-spin" /> ...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download size={14} className="mr-3 group-hover/btn:translate-y-0.5 transition-transform" />
                                                        Download PPTX
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedTranscriptMod && (
                <TranscriptModal
                    mod={selectedTranscriptMod}
                    onClose={() => setSelectedTranscriptMod(null)}
                />
            )}

            {selectedModule && (
                <ModuleViewer
                    moduleData={selectedModule}
                    onClose={() => setSelectedModule(null)}
                    onRefine={(prompt, history) => handleChat(prompt, selectedModule, history)}
                    isRegenerating={modules.find(m => m.id === selectedModule.id)?.isGenerating}
                    credit={moduleCredits[selectedModule.id]}
                    duration={`${courseData?.duration?.value || 0} ${courseData?.duration?.unit || 'hours'}`}
                />
            )}

            {selectedSlide && (
                <SlideContent
                    moduleData={selectedSlide}
                    onClose={() => setSelectedSlide(null)}
                />
            )}
        </div>
    )
}

export default ModuleGen;
