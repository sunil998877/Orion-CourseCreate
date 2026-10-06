import React, { useState } from 'react';
import { BookOpen, Download, Headphones, Loader2, Mic, Sparkles } from 'lucide-react';

const solid = 'inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-lime-400 px-3.5 text-sm font-bold text-black shadow-[0_0_28px_rgba(163,230,53,0.45)] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60';
const outline = 'inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-lime-400/80 bg-black/55 px-3.5 text-sm font-bold text-lime-300 shadow-[0_0_18px_rgba(132,204,22,0.18)] transition hover:bg-lime-400/10 disabled:cursor-not-allowed disabled:opacity-60';

const Wave = () => (
    <svg viewBox="0 0 18 14" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M1 7h2l1.5-4 2 8 2-6 1.5 3H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CourseActions: React.FC<any> = ({ course, isGeneratingEbook, isGeneratingAudio, isGeneratingPodcast, showTranscript, showAudioPlayer, showPodcastTranscript, showPodcastPlayer, onGenerateEbook, onDownloadEbook, onGenerateAudio, onGeneratePodcast, onToggleTranscript, onToggleAudio, onTogglePodcastTranscript, onTogglePodcast }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            if (onDownloadEbook) {
                await Promise.all([
                    Promise.resolve(onDownloadEbook()),
                    new Promise((resolve) => setTimeout(resolve, 800)),
                ]);
            }
        } catch (err) {
            console.error('Error downloading ebook:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-3 max-md:w-full max-md:flex-col max-md:items-stretch max-md:[&>button]:w-full max-md:[&>button]:justify-center">
            {course.ebookUrl ? (
                <button onClick={handleDownload} disabled={isDownloading} className={solid}>
                    {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookOpen className="h-5 w-5" />}
                    <span>{isDownloading ? 'Please wait...' : 'Download Ebook'}</span>
                    {!isDownloading && <Download className="h-4 w-4" />}
                </button>
            ) : (
                <button onClick={onGenerateEbook} disabled={isGeneratingEbook} className={solid}>
                    {isGeneratingEbook ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookOpen className="h-5 w-5" />}
                    <span>{isGeneratingEbook ? 'Generating Ebook...' : 'Generate Ebook'}</span>
                </button>
            )}
            {course.audioUrl ? (
                <>
                    <button onClick={onToggleAudio} className={outline}>
                        <Headphones className="h-5 w-5" />
                        <span>{showAudioPlayer ? 'Hide Player' : 'Listen Audio Book'}</span>
                        <Wave />
                    </button>
                    <button onClick={onToggleTranscript} className={outline}>
                        <BookOpen className="h-5 w-5" />
                        <span>{showTranscript ? 'Hide Transcript' : 'View Transcript'}</span>
                    </button>
                </>
            ) : (
                <button disabled={isGeneratingAudio} onClick={onGenerateAudio} className={outline}>
                    {isGeneratingAudio ? <Loader2 className="h-5 w-5 animate-spin" /> : <Headphones className="h-5 w-5" />}
                    <span>{isGeneratingAudio ? 'Generating...' : 'Generate Audio Book'}</span>
                    {!isGeneratingAudio && <Wave />}
                </button>
            )}
            {course.podcastUrl ? (
                <>
                    <button onClick={onTogglePodcast} className={outline}>
                        <Sparkles className="h-5 w-5" />
                        <span>{showPodcastPlayer ? 'Hide Podcast' : 'Listen Podcast'}</span>
                        <Mic className="h-4 w-4" />
                    </button>
                    <button onClick={onTogglePodcastTranscript} className={outline}>
                        <Sparkles className="h-5 w-5" />
                        <span>{showPodcastTranscript ? 'Hide Podcast Chat' : 'View Podcast Chat'}</span>
                    </button>
                </>
            ) : (
                <button disabled={isGeneratingPodcast} onClick={onGeneratePodcast} className={outline}>
                    {isGeneratingPodcast ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                    <span>{isGeneratingPodcast ? 'Generating...' : 'Generate Podcast'}</span>
                    {!isGeneratingPodcast && <Mic className="h-4 w-4" />}
                </button>
            )}
        </div>
    );
};
