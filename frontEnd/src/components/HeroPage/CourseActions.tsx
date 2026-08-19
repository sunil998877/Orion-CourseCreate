import React from 'react';
import { BookOpen, BookText, Headphones, Loader2, Sparkles } from 'lucide-react';
import type { Course } from '../../types/Course.types';
export const CourseActions: React.FC<any> = ({ course, isGeneratingEbook, isGeneratingAudio, isGeneratingPodcast, showTranscript, showAudioPlayer, showPodcastTranscript, showPodcastPlayer, onGenerateEbook, onDownloadEbook, onGenerateAudio, onGeneratePodcast, onToggleTranscript, onToggleAudio, onTogglePodcastTranscript, onTogglePodcast }) =>
<div className="flex flex-wrap items-center justify-end gap-3 max-md:justify-start">
  {course.ebookUrl ?
  <button onClick={onDownloadEbook} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border border-emerald-400/30 text-emerald-300 hover:text-white hover:bg-emerald-500/20">
    <BookText className="w-5 h-5" />
    <span>
      Download Ebook
    </span>
  </button>
  :
  <button onClick={onGenerateEbook} disabled={isGeneratingEbook} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border border-emerald-400/30 text-emerald-300 hover:text-white hover:bg-emerald-500/20 disabled:opacity-50">
    {isGeneratingEbook?
    <Loader2 className="w-5 h-5 animate-spin"/>
    :
    <BookText className="w-5 h-5"/>
    }
    <span>
      {isGeneratingEbook?'Generating Ebook...':'Generate Ebook'}
    </span>
  </button>
  }
  {course.audioUrl ?
  <>
    <button onClick={onToggleTranscript} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border ${showTranscript?'bg-white/10 border-white/20 text-white':'border-white/10 text-white/60 hover:text-white'}`}>
      <BookOpen className="w-5 h-5"/>
      <span>
        {showTranscript?'Hide Transcript':'View Transcript'}
      </span>
    </button>
    <button onClick={onToggleAudio} className="flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-black rounded-xl font-bold">
      <Headphones className="w-5 h-5"/>
      <span>
        {showAudioPlayer?'Hide Player':'Listen Audio Book'}
      </span>
    </button>
  </>
  :
  <button disabled={isGeneratingAudio} onClick={onGenerateAudio} className="flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-black rounded-xl font-bold disabled:opacity-50">
    {isGeneratingAudio?
    <Loader2 className="w-5 h-5 animate-spin"/>
    :
    <Headphones className="w-5 h-5"/>
    }
    <span>
      {isGeneratingAudio?'Generating...':'Generate Audio Book'}
    </span>
  </button>
  }
  {course.podcastUrl ?
  <>
    <button onClick={onTogglePodcastTranscript} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border border-white/10 text-white/60 hover:text-white">
      <Sparkles className="w-5 h-5 text-lime-400"/>
      <span>
        {showPodcastTranscript?'Hide Podcast Chat':'View Podcast Chat'}
      </span>
    </button>
    <button onClick={onTogglePodcast} className="flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-black rounded-xl font-bold">
      <Headphones className="w-5 h-5"/>
      <span>
        {showPodcastPlayer?'Hide Podcast':'Listen Podcast'}
      </span>
    </button>
  </>
  :
  <button disabled={isGeneratingPodcast} onClick={onGeneratePodcast} className="flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-black rounded-xl font-bold disabled:opacity-50">
    {isGeneratingPodcast?
    <Loader2 className="w-5 h-5 animate-spin"/>
    :
    <Sparkles className="w-5 h-5 text-lime-400"/>
    }
    <span>
      {isGeneratingPodcast?'Generating...':'Generate Podcast'}
    </span>
  </button>
  }
</div>
;
