import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, GraduationCap, Shield } from 'lucide-react';
import { CourseInfoCards } from './CourseInfoCards';
import { CourseActions } from './CourseActions';
import { AudioBookPlayer } from './AudioBookPlayer';
import { PodcastPlayer } from './PodcastPlayer';
import { AudioTranscript } from './AudioTranscript';
import { PodcastTranscript } from './PodcastTranscript';
import { formatAudience } from '../../utils/courseHelpers';
import { API_BASE, ORIGIN } from '../../utils/api';

const heroSrc = (url?: string) => {
    if (!url) return '';
    if (/^https?:/i.test(url)) return url;
    return `${ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};

const standardsBadge = (standards?: string) => {
    const value = String(standards || '').trim();
    if (!value) return '';
    if (/iso|global/i.test(value)) return 'Follows Global ISO/IEC Standards';
    if (/regional/i.test(value)) return 'Follows Regional Standards';
    if (/industry/i.test(value)) return 'Follows Industry Standards';
    return `Follows ${value}`;
};

const splitDescription = (course: any) => {
    const description = String(course?.description || '').trim();
    const sentence = description.split(/(?<=[.!?])\s/)[0] || '';
    const level = String(course?.level || 'beginner').toLowerCase();
    const audience = formatAudience(course?.audience) || 'learners';
    const lead = sentence && sentence.length <= 140 && description.length > sentence.length + 40
        ? sentence
        : `A ${level} course for ${audience}.`;
    const body = lead === sentence ? description.slice(sentence.length).trim() : description;
    return { lead, body: body || description };
};

export const CourseDetails: React.FC<any> = ({ course, generation, audioPlayer, podcastPlayer, showAudioPlayer, setShowAudioPlayer, showTranscript, setShowTranscript, showPodcastPlayer, setShowPodcastPlayer, showPodcastTranscript, setShowPodcastTranscript, onGenerateEbook, onDownloadEbook, onGenerateAudio, onGeneratePodcast, onOpenPublisher, onHeroImage }) => {
    const title = String(course?.title || 'Course').trim();
    const [art, setArt] = useState('');
    const onHeroRef = useRef(onHeroImage);
    onHeroRef.current = onHeroImage;
    useEffect(() => {
        const id = course?.courseId || course?._id;
        const courseTitle = String(course?.title || '').trim();
        const cached = course?.heroImageUrl && course?.heroImageTitle === courseTitle ? course.heroImageUrl : '';
        setArt(heroSrc(cached));
        if (cached || !id || !courseTitle) return;
        let cancelled = false;
        (async () => {
            try {
                const token = localStorage.getItem('token');
                const resp = await fetch(`${API_BASE}/courses/hero-image`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ courseId: id }),
                });
                const data = await resp.json().catch(() => ({}));
                if (cancelled || !resp.ok || !data?.heroImageUrl) return;
                setArt(heroSrc(data.heroImageUrl));
                onHeroRef.current?.({ heroImageUrl: data.heroImageUrl, heroImageTitle: data.heroImageTitle || courseTitle });
            } catch {

            }
        })();
        return () => { cancelled = true; };
    }, [course?._id, course?.courseId, course?.title, course?.heroImageUrl, course?.heroImageTitle]);
    const words = title.split(/\s+/);
    const last = words.length > 1 ? words.pop() : '';
    const first = words.join(' ');
    const level = String(course?.level || 'Beginner').trim();
    const badge = standardsBadge(course?.standards);
    const { lead, body } = splitDescription(course);

    return (
        <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#070b12] text-white shadow-2xl animate-fadeInUp max-md:rounded-2xl">
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-[46%] max-lg:hidden">
                    {art ? (
                        <img src={art} alt="" className="h-full w-full object-cover object-right" />
                    ) : (
                        <div className="h-full w-full animate-pulse bg-[radial-gradient(circle_at_70%_40%,rgba(132,204,22,0.28),transparent_55%)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#070b12] via-[#070b12]/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#070b12] to-transparent" />
                </div>
                <div className="relative z-10 px-7 py-8 max-md:px-5 max-md:py-6">
                    <div className="max-w-[34rem]">
                        <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/60 bg-black/50 px-3 py-1.5 text-sm font-semibold text-lime-300 shadow-[0_0_18px_rgba(132,204,22,0.28)]">
                            <GraduationCap className="h-4 w-4" />
                            {level.toLowerCase().endsWith('level') ? level : `${level} Level`}
                        </span>
                        <h2 className="mt-5 text-5xl font-black leading-none tracking-tight max-md:text-4xl">
                            {last ? <><span className="text-white">{first} </span><span className="text-lime-400 drop-shadow-[0_0_18px_rgba(163,230,53,0.85)]">{last}</span></> : <span className="text-white">{first}</span>}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-white/75">{lead}</p>
                    </div>
                    <div className="mt-6">
                        <CourseActions course={course} isGeneratingEbook={generation?.isGeneratingEbook} isGeneratingAudio={generation?.isGeneratingAudio} isGeneratingPodcast={generation?.isGeneratingPodcast} showTranscript={showTranscript} showAudioPlayer={showAudioPlayer} showPodcastTranscript={showPodcastTranscript} showPodcastPlayer={showPodcastPlayer} onGenerateEbook={course?.ebookUrl ? onGenerateEbook : onOpenPublisher} onDownloadEbook={onDownloadEbook} onGenerateAudio={onGenerateAudio} onGeneratePodcast={onGeneratePodcast} onToggleTranscript={() => { setShowTranscript(!showTranscript); if (!showTranscript) setShowPodcastTranscript(false); }} onToggleAudio={() => { setShowAudioPlayer(!showAudioPlayer); if (!showAudioPlayer) setShowPodcastPlayer(false); }} onTogglePodcastTranscript={() => { setShowPodcastTranscript(!showPodcastTranscript); if (!showPodcastTranscript) setShowTranscript(false); }} onTogglePodcast={() => { setShowPodcastPlayer(!showPodcastPlayer); if (!showPodcastPlayer) setShowAudioPlayer(false); }} />
                    </div>
                </div>
            </div>
            <div className="space-y-4 px-5 pb-5 max-md:px-4 max-md:pb-4">
                <div className="rounded-[1.35rem] border border-white/10 bg-[#0c121c] px-6 py-6 max-md:px-4">
                    <div className="flex items-start justify-between gap-4 max-md:flex-col">
                        <div>
                            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                                <BookOpen className="h-5 w-5 text-lime-400" />
                                About This Course
                            </h3>
                            <span className="ml-7 mt-2 block h-[3px] w-16 rounded-full bg-lime-400" />
                        </div>
                        {badge && (
                            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-lime-400/50 bg-black/40 px-3 py-1.5 text-xs font-semibold text-lime-300">
                                <Shield className="h-3.5 w-3.5" />
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="mt-5 text-sm leading-7 text-white/75">{body}</p>
                </div>
                <CourseInfoCards course={course} />
                {showAudioPlayer && <div className="mt-2"><AudioBookPlayer audioUrl={course.audioUrl} player={audioPlayer} /></div>}
                {showPodcastPlayer && <div className="mt-2"><PodcastPlayer podcastUrl={course.podcastUrl} player={podcastPlayer} /></div>}
                {showTranscript && <AudioTranscript transcript={course.audioTranscript} onGenerate={onGenerateAudio} />}
                {showPodcastTranscript && <PodcastTranscript course={course} activeIndex={podcastPlayer.getActivePodcastBubbleIndex()} onGenerate={onGeneratePodcast} />}
            </div>
        </section>
    );
};
