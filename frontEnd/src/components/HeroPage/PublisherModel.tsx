import React from 'react';
import { BookText, Loader2, Zap } from 'lucide-react';
export const PublisherModal: React.FC<{ open:boolean; publisherName:string; setPublisherName:(v:string)=>void; loading:boolean; onClose:()=>void; onGenerate:()=>void }> = ({open,publisherName,setPublisherName,loading,onClose,onGenerate}) => !open ? null :
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
  <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 w-full max-w-md text-white shadow-2xl">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center border border-lime-500/30">
        <BookText className="w-6 h-6 text-lime-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold">
          Publisher Details
        </h3>
        <p className="text-white/40 text-xs uppercase tracking-wider">
          eBook Branding
        </p>
      </div>
    </div>
    <div className="space-y-4 mb-8">
      <label htmlFor="publisher" className="block text-sm font-medium text-white/60 mb-2">
        Publisher Name
      </label>
      <input id="publisher" type="text" value={publisherName} onChange={e=>
        setPublisherName(e.target.value)} placeholder="Enter publisher name..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-lime-500/50" autoFocus />
        <p className="mt-2 text-[10px] text-white/30 italic">
          This name will appear on the cover and copyright section of your eBook.
        </p>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 font-bold text-sm">
          Cancel
        </button>
        <button type="button" onClick={onGenerate} disabled={!publisherName.trim()||loading} className="px-6 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {loading?
          <Loader2 className="w-4 h-4 animate-spin" />
          :
          <Zap className="w-4 h-4" />
          }
          <span>
            Generate
          </span>
        </button>
      </div>
    </div>
  </div>
  ;
