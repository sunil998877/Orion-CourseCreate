import React, { useState } from 'react';
import { ChevronDown, Loader2, Zap, Monitor, BookOpen, Eye, Trash2, Check, X } from 'lucide-react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import { GAMMA_THEMES } from '../../utils/themes';
import { ModuleAssessmentTask } from './ModuleAssessmentTask';

const ModuleCard: React.FC<{
  mod: any;
  expanded: boolean;
  onSelect: () => void;
}> = ({ mod, expanded, onSelect }) => {
  const {
    moduleRefs, highlightedModuleId, moduleCredits, courseData, previewModules, themeByModule,
    setSelectedModuleForTheme, setIsThemeModalOpen, openContentPreview,
    openSlidesPreview, isPreviewLoading, orionUrlByModule, handleGenerateSlidesOrion,
    generatingSlidesModuleId, slideGenerationProgress, deleteModule
  } = useCourseCreator();

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
                              <div
                                key={mod.id}
                                ref={(el) => (moduleRefs.current[mod.id] = el)}
                                className={`rounded-2xl border bg-gray-900/40 p-4 transition-all duration-300 ${expanded ? 'border-lime-500/40 shadow-lg shadow-lime-500/10' : 'border-gray-700/30 hover:border-lime-500/20'} ${highlightedModuleId === mod.id ? 'animate-blink-module' : ''}`}
                              >
                                <div className="flex w-full items-center justify-between gap-3 text-left">
                                  <button
                                    type="button"
                                    onClick={onSelect}
                                    className="flex-1 min-w-0 text-left focus:outline-none group/title"
                                  >
                                    <span className="flex items-center gap-3">
                                      <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-lime-500/10 px-2 text-sm font-black text-lime-400 ring-1 ring-lime-500/20">Module {mod.id}</span>
                                      <span className="truncate text-base font-bold text-white group-hover/title:text-lime-400 transition-colors">{mod.title}</span>
                                    </span>
                                    <span className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                      <Zap size={12} className="fill-lime-400 text-lime-400" /> {moduleCredits[mod.id] || 0} credits
                                      <span className="text-gray-700">·</span>
                                      {mod.lessons.length} lessons
                                    </span>
                                  </button>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {confirmDelete ? (
                                      <div
                                        className="flex items-center gap-2 bg-red-950/80 border border-red-500/40 rounded-xl px-2.5 py-1.5 shadow-lg shadow-red-950/50"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="text-[11px] font-black uppercase tracking-wider text-red-300">Delete?</span>
                                        <button
                                          type="button"
                                          aria-label="Confirm delete"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (deleteModule) {
                                              deleteModule(mod.id);
                                            }
                                            setConfirmDelete(false);
                                          }}
                                          className="p-1 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all active:scale-90"
                                          title="Yes, delete module"
                                        >
                                          <Check size={13} strokeWidth={3} />
                                        </button>
                                        <button
                                          type="button"
                                          aria-label="Cancel delete"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDelete(false);
                                          }}
                                          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90"
                                          title="Cancel"
                                        >
                                          <X size={13} strokeWidth={3} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        aria-label={`Delete Module ${mod.id}`}
                                        title="Delete module"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setConfirmDelete(true);
                                        }}
                                        className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-95"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={onSelect}
                                      aria-label={expanded ? 'Collapse module' : 'Expand module'}
                                      className="p-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
                                    >
                                      <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                    </button>
                                  </div>
                                </div>
                                {expanded && <>
                                <div className="mt-4 space-y-2">
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
                                        <ModuleAssessmentTask
                                          assessment={courseData.courseForge?.assessment}
                                          moduleIndex={Math.max(0, Number(mod.id) - 1)}
                                          moduleCount={previewModules.length || Number(courseData.module) || 0}
                                          moduleTitle={mod.title}
                                        />
                                      </div>
                                    </div>
                                  );
                                })()}
                                </>}
                              </div>
  );
};

export default ModuleCard;
