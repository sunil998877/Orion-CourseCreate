import React from 'react';
import { Download, Zap } from 'lucide-react';
import { ORIGIN } from '../../utils/api';
export const PodcastPlayer: React.FC<{ podcastUrl?: string; player: any }> = ({ podcastUrl, player }) =>
<div className="animate-fadeInRight flex flex-col gap-4 p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl w-80 lg:w-96 mt-3">
  <audio ref={player.podcastAudioRef} src={`${ORIGIN}${podcastUrl || ''}`} onTimeUpdate={player.handlePodcastTimeUpdate} onLoadedMetadata={player.handlePodcastLoadedMetadata} onEnded={() =>
    player.setIsPodcastPlaying(false)} />
    <div className="flex items-center gap-4">
      <button onClick={player.togglePodcastPlay} className="w-12 h-12 flex items-center justify-center rounded-full bg-lime-500 hover:bg-lime-400 text-black transition-all shadow-lg active:scale-90">
        {player.isPodcastPlaying ?
        <div className="flex gap-1 animate-pulse">
          <div className="w-1.5 h-4 bg-black rounded-full" />
          <div className="w-1.5 h-4 bg-black rounded-full" />
        </div>
        :
        <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-black border-b-[8px] border-b-transparent" />
        }
      </button>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-[10px] text-white/50 font-medium">
          <span>
            {player.formatTime(player.podcastCurrentTime)}
          </span>
          <span>
            {player.formatTime(player.podcastDuration)}
          </span>
        </div>
        <input type="range" min="0" max={player.podcastDuration || 0} value={player.podcastCurrentTime} onChange={player.handlePodcastSeek} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-lime-500" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-white/5">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button onClick={()=>
            player.setShowPodcastSpeedMenu(!player.showPodcastSpeedMenu)} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-white/40 hover:text-lime-400">
            <Zap className="w-3 h-3" />
            <span className="text-[10px] font-bold">
              {player.podcastSpeed}x
            </span>
          </button>
          {player.showPodcastSpeedMenu &&
          <div className="absolute bottom-full left-0 mb-2 p-1 bg-[#0b1220]/95 border border-white/10 rounded-lg z-50 flex flex-col">
            {[0.5,1,1.25,1.5,2].map((s:number)=>
            <button key={s} onClick={()=>
              player.selectPodcastSpeed(s)} className="px-4 py-1.5 text-[10px] text-white/60 hover:bg-white/10 text-left">{s===1?'Normal':`${s}x`}
            </button>
            )}
          </div>
          }
        </div>
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
          Podcast Ready
        </span>
      </div>
      <button onClick={player.handleDownload} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs">
        <Download className="w-3.5 h-3.5" />
        <span>
          Download MP3
        </span>
      </button>
    </div>
  </div>
  ;
