import React from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Loader2, Monitor } from 'lucide-react';
import { ModuleState, cleanTitle } from './ModuleGen';

interface SlideContentProps {
    moduleData: ModuleState
    onClose: () => void;
}



export const SlideContent: React.FC<SlideContentProps> = ({ moduleData, onClose }) => {

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[9999] px-4 py-4 animate-in fade-in duration-300 bg-gray-950/40 backdrop-blur-xl">
            <div
                className="fixed inset-0 z-0 bg-transparent"
                onClick={onClose}
            />
            <div className={`relative w-full ${moduleData.showOrion ? 'max-w-7xl' : 'max-w-4xl'} max-h-[96vh] flex flex-col bg-gray-900/90 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden text-white z-10 transition-all duration-500 animate-in zoom-in-95 fade-in duration-300 backdrop-blur-2xl`}>

                {/* Decorative Corner Glow */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-lime-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Integrated Header */}
                <div className="relative px-8 py-10 shrink-0 border-b border-white/5 bg-white/[0.02]">
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="relative p-5 rounded-2xl bg-lime-500/10 border border-lime-500/20 group animate-in slide-in-from-left duration-500">
                                <Monitor className="w-10 h-10 text-lime-400 group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-lime-500 animate-pulse shadow-[0_0_10px_rgba(132,204,22,0.5)]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1 animate-in slide-in-from-left duration-500 delay-100">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-500/60">Module Presentation</span>
                                    <div className="h-px w-8 bg-lime-500/30" />
                                </div>
                                <h2 className="text-4xl font-black tracking-tight text-white mb-2 animate-in slide-in-from-left duration-500 delay-200">
                                    {moduleData.showOrion ? 'Orion Slide Deck' : 'Visual Storyboard'}
                                </h2>
                                <div className="flex items-center gap-3 text-gray-400 animate-in slide-in-from-left duration-500 delay-300">
                                    <Sparkles className="w-4 h-4 text-lime-400" />
                                    <span className="text-sm font-medium italic">{cleanTitle(moduleData.Content?.Title || moduleData.Module)}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="group relative px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-lime-500/30 hover:bg-lime-500/5 transition-all duration-300 flex items-center gap-2 animate-in slide-in-from-right duration-500"
                        >
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-black uppercase tracking-widest text-[10px] text-gray-400 group-hover:text-white transition-colors">Return to Studio</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-transparent">
                    {!(moduleData &&
                        Array.isArray(moduleData.slide?.Slides) &&
                        moduleData.slide?.Slides.length > 0) && !moduleData.showOrion ? (

                        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
                            <div className="relative">
                                <div className="absolute inset-0 bg-lime-500/20 rounded-full blur-xl animate-pulse" />
                                <Loader2 className="w-16 h-16 animate-spin text-lime-400 relative z-10" />
                            </div>
                            <h3 className="text-2xl font-black text-white mt-8 mb-3 tracking-tight">Visualizing Slides...</h3>
                            <p className="text-gray-500 text-center max-w-sm font-medium">
                                Our AI is orchestrating the perfect visual sequence for this curriculum.
                            </p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {moduleData.showOrion && moduleData.orionUrl ? (
                                <div className="relative w-full h-[75vh] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] group bg-black/40 backdrop-blur-sm">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-lime-500/20 to-transparent z-10" />
                                    <iframe
                                        src={moduleData.orionUrl.replace('/docs/', '/embed/').replace('/view/', '/embed/')}
                                        className="absolute inset-0 w-full h-full border-0"
                                        allowFullScreen
                                        title="Orion Slide Deck"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-1 h-6 bg-lime-500 rounded-full" />
                                        <h2 className="text-xl font-black uppercase tracking-widest text-white">Slide Breakdown</h2>
                                    </div>
                                    <div className="grid grid-cols-1 gap-8">
                                        {Array.isArray(moduleData.slide?.Slides) && moduleData.slide?.Slides.length ? (
                                            moduleData.slide?.Slides?.map((slide: Record<string, unknown>, i: number) => {
                                                const slideNum = ('SlideNumber' in slide && (slide as any).SlideNumber) ? (slide as any).SlideNumber : (i + 1);
                                                const slideTitle = (slide as any).title || (slide as any).Title || '';
                                                const bullets = Array.isArray((slide as any).Bullets)
                                                    ? (slide as any).Bullets
                                                    : Array.isArray((slide as any).BulletPoints)
                                                        ? (slide as any).BulletPoints
                                                        : [];
                                                const contentText = (slide as any).Content || (slide as any).content || '';
                                                const contentLines = typeof contentText === 'string'
                                                    ? contentText.split(/\n+|\. +/).filter(Boolean).map((l: string) => l.trim())
                                                    : [];
                                                const visualPrompt = (slide as any).VisualPrompt || (slide as any).visualPrompt || '';
                                                const transcriptText = (slide as any).Transcript || (slide as any).transcript || '';

                                                return (
                                                    <div key={i} className="group bg-white/[0.02] hover:bg-white/[0.04] p-8 rounded-[2rem] border border-white/5 hover:border-lime-500/20 transition-all duration-300">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className="flex items-center gap-4">
                                                                <span className="w-12 h-12 rounded-2xl bg-lime-500/10 text-lime-400 flex items-center justify-center font-black text-xs ring-1 ring-lime-500/20 group-hover:bg-lime-500 group-hover:text-black transition-all">
                                                                    {slideNum}
                                                                </span>
                                                                <h3 className="text-2xl font-black text-white tracking-tight">
                                                                    {slideTitle || 'Untitled Slide'}
                                                                </h3>
                                                            </div>
                                                            <div className="h-px flex-1 mx-8 bg-white/5" />
                                                            <Monitor className="w-5 h-5 text-gray-700 group-hover:text-lime-500/40 transition-colors" />
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-12">
                                                            <div className="space-y-6">
                                                                <div className="text-[10px] font-black text-lime-500/60 uppercase tracking-[0.2em] mb-4">Key Bullets</div>
                                                                <ul className="space-y-4">
                                                                    {bullets.map((b: string, j: number) => (
                                                                        <li key={j} className="flex items-start gap-4">
                                                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.4)]" />
                                                                            <span className="text-gray-300 font-medium leading-relaxed">{b}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            <div className="space-y-8">
                                                                {contentLines.length > 0 && (
                                                                    <div>
                                                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Content Summary</div>
                                                                        <div className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                                                                            {contentLines.map((line: string, j: number) => (
                                                                                <p key={j} className="text-gray-400 text-sm leading-relaxed italic font-medium">
                                                                                    {line}{line.endsWith('.') ? '' : '.'}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {transcriptText && (
                                                                    <div>
                                                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Voiceover Transcript</div>
                                                                        <p className="text-sm text-lime-400 font-medium bg-lime-500/5 p-5 rounded-2xl border border-lime-500/10 italic leading-relaxed">
                                                                            "{transcriptText}"
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Visual Art Direction</div>
                                                                    <p className="text-xs text-gray-400 font-bold bg-white/5 p-4 rounded-xl border border-white/5 italic leading-relaxed">
                                                                        {visualPrompt || 'No visual prompt provided.'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-20 text-gray-500 font-bold italic">No slides curated for this segment.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
