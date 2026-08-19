import React from 'react';
import { GraduationCap } from 'lucide-react';
import type { Course } from '../../types/Course.types';
import { CourseActions } from './CourseActions';
import { CourseInfoCards } from './CourseInfoCards';
import { AudioBookPlayer } from './AudioBookPlayer';
import { PodcastPlayer } from './PodcastPlayer';
import { AudioTranscript } from './AudioTranscript';
import { PodcastTranscript } from './PodcastTranscript';

export const CourseDetails: React.FC<any> = ({ course, generation, audioPlayer, podcastPlayer, showAudioPlayer, setShowAudioPlayer, showTranscript, setShowTranscript, showPodcastPlayer, setShowPodcastPlayer, showPodcastTranscript, setShowPodcastTranscript, onGenerateEbook, onDownloadEbook, onGenerateAudio, onGeneratePodcast, onOpenPublisher }) =>
<section className="bg-[#0b1220] rounded-[2.5rem] max-md:rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fadeInUp">
  <div className="relative p-8 max-md:p-5 text-white">
    <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220] via-[#0a0f1a] to-black"/>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6 max-md:flex-col max-md:items-stretch max-md:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-7 h-7"/>
          </div>
          <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/20">
            Basic
          </span>
        </div>
        <div className="flex flex-col items-end gap-3 z-20">
          <CourseActions course={course} isGeneratingEbook={generation.isGeneratingEbook} isGeneratingAudio={generation.isGeneratingAudio} isGeneratingPodcast={generation.isGeneratingPodcast} showTranscript={showTranscript} showAudioPlayer={showAudioPlayer} showPodcastTranscript={showPodcastTranscript} showPodcastPlayer={showPodcastPlayer} onGenerateEbook={course.ebookUrl ? onGenerateEbook : onOpenPublisher} onDownloadEbook={onDownloadEbook} onGenerateAudio={onGenerateAudio} onGeneratePodcast={onGeneratePodcast} onToggleTranscript={()=>{setShowTranscript(!showTranscript);if(!showTranscript)setShowPodcastTranscript(false)}} onToggleAudio={()=>{setShowAudioPlayer(!showAudioPlayer);if(!showAudioPlayer)setShowPodcastPlayer(false)}} onTogglePodcastTranscript={()=>{setShowPodcastTranscript(!showPodcastTranscript);if(!showPodcastTranscript)setShowTranscript(false)}} onTogglePodcast={()=>{setShowPodcastPlayer(!showPodcastPlayer);if(!showPodcastPlayer)setShowAudioPlayer(false)}}/>{generation.isGeneratingAudio&&
          <div className="w-48 text-[8px] uppercase text-white/50">
            Audio Progress {Math.round(generation.audioProgress)}%
            <div className="bg-white/5 rounded-full h-1">
              <div className="bg-gradient-to-r from-lime-500 to-emerald-500 h-full rounded-full" style={{width:`${generation.audioProgress}%`}}/>
            </div>
          </div>
          }{generation.isGeneratingPodcast&&
          <div className="w-48 text-[8px] uppercase text-white/50">
            Podcast Progress {Math.round(generation.podcastProgress)}%
            <div className="bg-white/5 rounded-full h-1">
              <div className="bg-gradient-to-r from-lime-500 to-emerald-500 h-full rounded-full" style={{width:`${generation.podcastProgress}%`}}/>
            </div>
          </div>
          }{showAudioPlayer&&<AudioBookPlayer audioUrl={course.audioUrl} player={audioPlayer}/>} {showPodcastPlayer&&<PodcastPlayer podcastUrl={course.podcastUrl} player={podcastPlayer}/>}
        </div>
      </div>
      <h2 className="text-3xl lg:text-4xl font-semibold mb-2">
        {course.title||'Frontend development'}
      </h2>
      <p className="text-white/80 w-full mb-8">
        {course.description}
      </p>
      <CourseInfoCards course={course}/>{showTranscript&&<AudioTranscript transcript={course.audioTranscript} onGenerate={onGenerateAudio}/>} {showPodcastTranscript&&<PodcastTranscript course={course} activeIndex={podcastPlayer.getActivePodcastBubbleIndex()} onGenerate={onGeneratePodcast}/>}
    </div>
  </div>
</section>
;
