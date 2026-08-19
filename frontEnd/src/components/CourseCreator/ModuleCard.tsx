import React from 'react';
import { Loader2, Zap, Monitor, BookOpen, Eye } from 'lucide-react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import { GAMMA_THEMES } from '../../utils/themes';

const ModuleCard: React.FC<{
  mod: any;
}> = ({ mod }) => {
  const {
    moduleRefs, highlightedModuleId, moduleCredits, courseData, themeByModule,
    setSelectedModuleForTheme, setIsThemeModalOpen, openContentPreview,
    openSlidesPreview, isPreviewLoading, orionUrlByModule, handleGenerateSlidesOrion,
    generatingSlidesModuleId, slideGenerationProgress
  } = useCourseCreator();

  return (
                              <div
                                key={mod.id}
                                ref={(el) => (moduleRefs.current[mod.id] = el)}
                                className={`bg-gray-900/40 backdrop-blur-md p-10 md:p-12 rounded-[2.5rem] border flex flex-col hover:border-lime-500/30 transition-all duration-300 group/card shadow-2xl hover:shadow-lime-500/10 ${highlightedModuleId === mod.id ? 'animate-blink-module' : 'border-gray-700/30'
                                  }`}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <h4 className="font-black text-3xl text-white flex items-center gap-4">
                                    <span className="px-5 h-12 rounded-2xl bg-lime-500/10 text-lime-500 flex items-center justify-center text-lg font-black ring-1 ring-lime-500/20 whitespace-nowrap">Module {mod.id}</span>
                                    {mod.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-4 mb-8">
                                  <div className="px-5 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 text-xs font-black text-lime-400 uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                    <Zap size={16} className="fill-lime-400" /> {moduleCredits[mod.id] || 0} Credits
                                  </div>
                                  <div className="px-5 py-2 rounded-full bg-gray-800/50 border border-gray-700/30 text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Monitor size={16} /> {mod.lessons.length} LESSONS
                                  </div>
                                </div>
                                <div className="space-y-2 mb-8 flex-1">
                                  {mod.lessons.map((lesson:any, idx:any) => (
                                    <p key={idx} className="text-base text-gray-400 flex items-center gap-4 group/lesson transition-colors hover:text-gray-200 py-1">
                                      <span className="w-2 h-2 bg-gray-700 rounded-full group-hover/lesson:bg-lime-500 transition-colors" /> {lesson.title}
                                    </p>
                                  ))}
                                </div>
                                {(() => {
                                  return (
                                    <div className="flex-1 flex flex-col">
                                     
                                      <div className="space-y-3 mb-6">
                                      
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-800/40 border border-gray-700/30 mb-4 transition-all">
                                          <div className="flex flex-col text-left">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Slide Theme</span>
                                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                              <div className={`w-3 h-3 rounded-full ${GAMMA_THEMES.find((t: any) => t.id === (themeByModule[mod.id] || courseData.orionTheme || 'aurora'))?.gradient || 'bg-gray-500'} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                                              {GAMMA_THEMES.find((t: any) => t.id === (themeByModule[mod.id] || courseData.orionTheme || 'aurora'))?.name || 'Aurora'}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() => {
                                              setSelectedModuleForTheme(mod.id);
                                              setIsThemeModalOpen(true);
                                            }}
                                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold text-white transition-colors"
                                            type="button"
                                          >
                                            Change
                                          </button>
                                        </div>

                                        <div className="flex gap-3">
                                          <button
                                            onClick={() => openContentPreview(mod.id)}
                                            disabled={isPreviewLoading}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-wider bg-gray-800/40 hover:bg-gray-800 border border-gray-700/30 hover:border-gray-600 rounded-2xl text-gray-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                            type="button"
                                          >
                                            <BookOpen size={14} className="text-lime-500 group-hover/btn:scale-110 transition-transform" /> View
                                          </button>
                                          <button
                                            onClick={() => openSlidesPreview(mod.id, false)}
                                            disabled={isPreviewLoading}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-wider bg-gray-800/40 hover:bg-gray-800 border border-gray-700/30 hover:border-gray-600 rounded-2xl text-gray-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                            type="button"
                                          >
                                            <Eye size={14} className="text-lime-500 group-hover/btn:scale-110 transition-transform" /> Slides
                                          </button>
                                        </div>
                                        <button
                                          onClick={() => orionUrlByModule[mod.id] ? openSlidesPreview(mod.id, true) : handleGenerateSlidesOrion(mod.id)}
                                          disabled={isPreviewLoading || generatingSlidesModuleId !== null}
                                          className={`w-full relative overflow-hidden flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ring-offset-2 ring-offset-black group shadow-xl ${orionUrlByModule[mod.id]
                                            ? 'bg-lime-500/10 border-lime-500/30 text-lime-400 hover:bg-lime-500/20 hover:border-lime-500/50'
                                            : 'bg-white text-black border-white hover:bg-lime-400 hover:border-lime-400'
                                            }`}
                                          type="button"
                                        >
                                          {generatingSlidesModuleId === mod.id && (
                                            <div
                                              className="absolute inset-0 bg-lime-500/20 transition-all duration-300 ease-out z-0"
                                              style={{ width: `${slideGenerationProgress}%` }}
                                            />
                                          )}
                                          <div className="relative z-10 flex items-center gap-2 justify-center">
                                            {generatingSlidesModuleId === mod.id ? (
                                              <>
                                                <Loader2 size={14} className="animate-spin shrink-0" />
                                                <span>GENERATING {Math.round(slideGenerationProgress)}%</span>
                                              </>
                                            ) : (
                                              <>
                                                <Monitor size={14} className="shrink-0 group-hover:scale-110 transition-transform" />
                                                <span>{orionUrlByModule[mod.id] ? 'PREVIEW ORION DECK' : 'GENERATE ORION SLIDES'}</span>
                                              </>
                                            )}
                                          </div>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
  );
};

export default ModuleCard;
