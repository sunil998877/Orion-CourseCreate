import React from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { ModuleState, cleanTitle } from './ModuleGen';

interface ModuleViewerProps {
  moduleData: ModuleState
  onClose: () => void;
  onRegenerate?: () => void;
  onRefine?: (prompt: string, history: { role: 'user' | 'assistant'; content: string }[]) => Promise<string>;
  isRegenerating?: boolean;
  refineProgress?: number;
  credit?: number;
  duration?: string;
}



export const ModuleViewer: React.FC<ModuleViewerProps> = ({ moduleData, onClose, onRegenerate, onRefine, isRegenerating, refineProgress, credit, duration }) => {
  const [customPrompt, setCustomPrompt] = React.useState('');
  const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isThinking, setIsThinking] = React.useState(false);

  // Use Portal to render at body level to avoid stacking context issues
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[9999] px-4 py-4 animate-in fade-in duration-300 bg-gray-950/40 backdrop-blur-xl">
      <div
        className="fixed inset-0 z-0 bg-transparent"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-gray-900/90 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden text-white z-10 animate-in zoom-in-95 duration-300 backdrop-blur-2xl">
        {/* Decorative Corner Glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-lime-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Integrated Header */}
        <div className="relative px-8 py-10 shrink-0 border-b border-white/5 bg-white/[0.02]">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative p-5 rounded-2xl bg-lime-500/10 border border-lime-500/20 group animate-in slide-in-from-left duration-500">
                <BookOpen className="w-10 h-10 text-lime-400 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-lime-500 animate-pulse shadow-[0_0_10px_rgba(132,204,22,0.5)]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 animate-in slide-in-from-left duration-500 delay-100">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-500/60">AI Course Architect</span>
                  <div className="h-px w-8 bg-lime-500/30" />
                </div>
                <h2 className="text-4xl font-black tracking-tight text-white mb-2 animate-in slide-in-from-left duration-500 delay-200">
                  Course Content
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
              <span className="font-black uppercase tracking-widest text-[10px] text-gray-400 group-hover:text-white transition-colors">back to desk</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-transparent">
          {!moduleData || !moduleData.Content ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-lime-500/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="w-16 h-16 animate-spin text-lime-400 relative z-10" />
              </div>
              <h3 className="text-2xl font-black text-white mt-8 mb-3 tracking-tight">Architecting Content...</h3>
              <p className="text-gray-500 text-center max-w-sm font-medium">
                Our AI is weaving comprehensive knowledge structures for this specific module.
              </p>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Status Indicator */}
              <div className="flex items-center gap-4 bg-lime-500/5 border border-lime-500/20 p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-lime-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Deployment Ready</h4>
                  <p className="text-xs text-lime-400/60 font-medium">Core knowledge base has been validated and generated.</p>
                </div>
              </div>

              {/* Module Metadata */}
              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div>
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Module Overview</div>
                  <h1 className="text-3xl font-black text-white">
                    {cleanTitle(moduleData.Content?.Title || moduleData.Module) || 'Untitled Module'}
                  </h1>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Session Credits</div>
                    <div className="text-xl font-black text-lime-400">{credit || 0}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Time Investment</div>
                    <div className="text-xl font-black text-lime-400">{duration?.split(' ')[0] || 'N/A'}<span className="text-xs ml-1 text-gray-500 uppercase">{duration?.split(' ')[1]}</span></div>
                  </div>
                </div>
              </div>

              {/* Main Content Sections */}
              <div className="grid grid-cols-1 gap-12">
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-lime-500 rounded-full" />
                    <h2 className="text-xl font-black uppercase tracking-widest text-white">Learning Directives</h2>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-4">
                    {moduleData.Content.Objectives?.map((obj: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 group">
                        <div className="w-2 h-2 rounded-full border border-lime-500/50 mt-2 bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.4)] transition-all group-hover:scale-125" />
                        <p className="text-gray-300 leading-relaxed font-medium">{obj}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-lime-500 rounded-full" />
                    <h2 className="text-xl font-black uppercase tracking-widest text-white">Knowledge Architecture</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {moduleData.Content.TeachingContent?.map((item: any, i: number) => (
                      <div key={i} className="group bg-white/[0.02] hover:bg-white/[0.05] p-6 rounded-3xl border border-white/5 hover:border-lime-500/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-black text-white tracking-tight">{item.Topics}</h3>
                          <Sparkles className="w-4 h-4 text-lime-500/40 group-hover:text-lime-400 transition-colors" />
                        </div>
                        <div className="space-y-3">
                          {item.ContentPoints?.slice(0, 3).map((pt: string, j: number) => (
                            <div key={j} className="flex items-start gap-3">
                              <span className="text-lime-500/60 font-black text-[10px] mt-1">0{j+1}</span>
                              <p className="text-sm text-gray-400 leading-relaxed font-medium group-hover:text-gray-300 transition-colors">{pt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-lime-500 rounded-full" />
                    <h2 className="text-xl font-black uppercase tracking-widest text-white">Contextual Case Study</h2>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all" />
                    <p className="text-gray-300 leading-relaxed italic text-lg font-medium relative z-10">
                      "{moduleData.Content?.CaseStudy?.CaseStudyDescription || "Connecting theoretical concepts to practical industry scenarios."}"
                    </p>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-lime-500 rounded-full" />
                      <h2 className="text-xl font-black uppercase tracking-widest text-white">Standards Compliance</h2>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                    {moduleData.Content.TeachingContent?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center px-8 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                        <span className="text-gray-300 font-bold">{item.Topics}</span>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-lime-500/40" />
                          <span className="text-[10px] font-black text-lime-400 uppercase tracking-[0.15em] py-1.5 px-3 rounded-lg bg-lime-500/10 border border-lime-500/20">
                            {item.StandardsReference || 'ISO/IEC (AI-Generated)'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-lime-500 rounded-full" />
                    <h2 className="text-lg font-black uppercase tracking-widest text-white">Progress Check</h2>
                  </div>
                  <div className="space-y-6">
                    {moduleData.Content.Quizzes?.map((quiz: any, i: number) => (
                      <div key={i}>
                        {quiz.QuizDescription && (
                          <p className="text-sm text-gray-500 font-medium mb-4 italic">{quiz.QuizDescription}</p>
                        )}
                        <div className="space-y-4">
                          {quiz.Questions?.map((q: string, j: number) => (
                            <div key={j} className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                              <p className="text-white font-bold mb-3 flex gap-3">
                                <span className="text-lime-500 italic">Q.</span>
                                {q}
                              </p>
                              <div className="pl-7 text-sm text-gray-500 font-medium">
                                <span className="text-gray-600 mr-2 font-black uppercase text-[9px] tracking-widest">Key Result:</span>
                                {quiz.Answers?.[j]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-8">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-6 bg-lime-500 rounded-full" />
                      <h2 className="text-xl font-black uppercase tracking-widest text-white">Practical Deployment Task</h2>
                    </div>
                  <div className="bg-gray-800/40 p-8 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative group">
                     <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-500/20 to-transparent" />
                    <p className="text-gray-200 leading-relaxed font-bold text-lg relative z-10">
                      {moduleData.Content?.CaseStudy?.Questions?.[0] || "Develop a comprehensive implementation plan based on the module's core principles."}
                    </p>
                  </div>
                </section>
              </div>

              {/* AI Interaction Zone */}
              {onRefine && (
                <div className="mt-20 pt-16 border-t border-white/5 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-white/5 px-6 py-2 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                    Intelligence Lab
                  </div>
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Refine Your Architecture</h3>
                      <p className="text-gray-500 font-medium">Instruction the AI to modify specific knowledge points or adjust the narrative style.</p>
                    </div>

                    {/* Chat History */}
                    {messages.length > 0 && (
                      <div className="space-y-6 max-h-[400px] overflow-y-auto px-4 custom-scrollbar">
                        {messages.map((msg: { role: 'user' | 'assistant'; content: string }, i: number) => (
                          <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                          >
                            <div
                              className={`max-w-[85%] p-5 rounded-2xl text-sm font-medium leading-relaxed ${
                                msg.role === 'user'
                                  ? 'bg-lime-500/10 border border-lime-500/20 text-lime-100'
                                  : 'bg-white/[0.03] border border-white/10 text-gray-300'
                              }`}
                            >
                              <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                                {msg.role === 'user' ? 'Expert Directives' : 'Architect Insights'}
                              </div>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {isThinking && (
                          <div className="flex justify-start animate-in fade-in duration-300">
                             <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl flex gap-3 items-center">
                                <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Architect is thinking...</span>
                             </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="relative group">
                      <div className="absolute inset-0 bg-lime-500/5 rounded-2xl blur-xl group-focus-within:bg-lime-500/10 transition-all" />
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Make this module more technical, focus on regulatory compliance, or add an advanced case study..."
                        className="relative w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-500/30 transition-all placeholder:text-gray-600 resize-none h-32 font-medium"
                        disabled={isThinking}
                      />
                    </div>

                    <div className="flex flex-col items-center gap-6 pb-10">
                      {isRegenerating && refineProgress !== undefined && (
                        <div className="w-full max-w-md space-y-3 animate-in fade-in zoom-in-95 duration-500">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">Processing Directives</span>
                            <span className="text-2xl font-black text-white">{Math.round(refineProgress)}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5 p-1">
                            <div
                              className="bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_20px_rgba(132,204,22,0.3)]"
                              style={{ width: `${refineProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={async () => {
                          if (customPrompt.trim() && onRefine) {
                            const userMsg = customPrompt.trim();
                            setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
                            setCustomPrompt('');
                            setIsThinking(true);
                            try {
                              // We pass the callback that returns a promise of the AI response
                              const aiResponse = await (onRefine as any)(userMsg, messages);
                              setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setIsThinking(false);
                            }
                          } else if (onRegenerate) {
                            onRegenerate();
                          }
                        }}
                        disabled={isRegenerating || isThinking}
                        className="group relative flex items-center gap-4 bg-white text-black px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(163,230,53,0.2)] hover:bg-lime-400 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-wait overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <div className="relative z-10 flex items-center gap-4">
                          {isRegenerating || isThinking ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              <span className="tracking-tight uppercase text-base">{isThinking ? 'Consulting Architect...' : 'Updating Knowledge...'}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                              <span className="tracking-tight uppercase text-base">{customPrompt.trim() ? 'Execute Refinement' : 'Regenerate Vision'}</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
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
