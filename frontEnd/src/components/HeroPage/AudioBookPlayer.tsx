import React from 'react';
import { Download, Zap } from 'lucide-react';
import { ORIGIN } from '../../utils/api';

type Props = { audioUrl?: string; player: any };
export const AudioBookPlayer: React.FC<Props> = ({ audioUrl, player }) =>
<div className="animate-fadeInRight flex flex-col gap-4 p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl w-80 lg:w-96 mt-3">
  <audio ref={player.audioRef} src={`${ORIGIN}${audioUrl || ''}`} onTimeUpdate={player.handleTimeUpdate} onLoadedMetadata={player.handleLoadedMetadata} onEnded={() =>
    player.setIsPlaying(false)} />
    <div className="flex items-center gap-4">
      <button onClick={player.togglePlay} className="w-12 h-12 flex items-center justify-center rounded-full bg-lime-500 hover:bg-lime-400 text-black transition-all shadow-lg active:scale-90">
        {player.isPlaying ?
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
            {player.formatTime(player.currentTime)}
          </span>
          <span>
            {player.formatTime(player.duration)}
          </span>
        </div>
        <input type="range" min="0" max={player.duration || 0} value={player.currentTime} onChange={player.handleSeek} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-lime-500" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-white/5">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button onClick={() =>
            player.setShowSpeedMenu(!player.showSpeedMenu)} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-white/40 hover:text-lime-400">
            <Zap className="w-3 h-3" />
            <span className="text-[10px] font-bold">
              {player.playbackSpeed}x
            </span>
          </button>
          {player.showSpeedMenu &&
          <div className="absolute bottom-full left-0 mb-2 p-1 bg-[#0b1220]/95 border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col">
            {[0.5,1,1.25,1.5,2].map((s:number)=>
            <button key={s} onClick={()=>
              player.selectSpeed(s)} className="px-4 py-1.5 text-[10px] text-white/60 hover:bg-white/10 text-left">{s===1?'Normal':`${s}x`}
            </button>
            )}
          </div>
          }
        </div>
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
          Audio Ready
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
