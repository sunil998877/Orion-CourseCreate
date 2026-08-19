import React from 'react';
import { Layers, Rocket, Sparkles } from 'lucide-react';
import avatar from '../../assests/avtar1.png';
export const OrionGuidance: React.FC = () =>
<div className="w-full xl:flex-[0_0_33.3%] bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8">
  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
  <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block bg-[#0A0A0E]">
    <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
  </div>
  <div className="relative z-10">
    <div className="mb-6 pr-24 min-h-[140px]">
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
        Welcome back to your course!
      </h3>
      <p className="text-gray-400 leading-relaxed text-sm">
        You've successfully architected this course. Now you can explore, listen, or even generate a full eBook for your curriculum.
      </p>
    </div>
    <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"/>
    <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
      <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700">
        <Layers className="w-4 h-4 text-lime-400" />
      </span>
      Your Learning Toolkit
    </h4>
    <div className="space-y-6">
      {[['Audio Book Experience','Click ‘Generate Audiobook’ to begin creating the complete course audiobook.'],['Generate specialized eBook','Want a portable version? Generate a PDF eBook that includes all the module content for offline reading.'],['Module Deep Dive','Scroll down to explore each module in detail. You can preview the slide deck, view and copy the generated voice script, and download the slides in PPT format for each module.']].map(([title,text],i)=>
      <div key={title} className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400">
          {i+1}
        </div>
        <div>
          <h5 className="text-white font-bold text-sm mb-1.5">
            {title}
          </h5>
          <p className="text-gray-400 text-xs leading-relaxed">
            {text}
          </p>
        </div>
      </div>
      )}
    </div>
    <div className="mt-8 p-4 rounded-xl bg-lime-500/5 border border-lime-500/10">
      <div className="flex items-start gap-3">
        <Rocket className="w-5 h-5 text-lime-400" />
        <div>
          <h6 className="text-lime-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">
            Orion Tip
          </h6>
          <p className="text-gray-300 text-xs italic">
            Review your modules periodically. AI refinement allows you to keep the content fresh and relevant.
          </p>
        </div>
      </div>
    </div>
    <div className="pt-8 text-center">
      <p className="text-gray-500 text-xs font-semibold">
        "Your knowledge ecosystem is ready. Let's start learning!"
        <Sparkles className="inline-block w-4 h-4 text-lime-400" />
      </p>
    </div>
  </div>
</div>
;
