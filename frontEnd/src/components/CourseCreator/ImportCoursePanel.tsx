import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, FileUp, Link2, Loader2, Pencil, Sparkles, Trash2, Type, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import { API_BASE } from '../../utils/api';

type ImportedCourse = {
    title?: string;
    description?: string;
    audience?: string[];
    level?: string;
    moduleCount?: number;
    industry?: string;
    country?: string;
    standards?: string;
    courseStyle?: string;
    purpose?: string;
    approvedOutcomes?: string;
    language?: string;
    archetype?: string;
    deliveryMode?: string;
    topics?: string[];
    modules?: { title?: string; lessons?: string[] }[];
    summary?: string;
    durationHours?: number;
};

type ImportDetail = {
    course: ImportedCourse;
    source: { title?: string; text?: string; url?: string; kind?: string; profile?: ImportedCourse };
};

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
const STANDARDS = ['Global (ISO/IEC)', 'Regional', 'Industry Specific'];
const STYLES = ['Academic / Formal Style', 'Storytelling Style', 'Interactive Coaching Style', 'Humanized Teaching Style', 'Modern Edutainment Style', 'Scenario-Based Style'];
const ARCHETYPES = ['Let AI select', 'Awareness', 'Standard-compliance', 'Auditor-verifier', 'Procedural', 'Conceptual', 'Software', 'Leadership', 'Exam-preparation'];
const DELIVERY = ['Self-paced', 'Live virtual', 'Classroom', 'Blended'];
const fieldClass = 'w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-lime-500';

const kindLabel = (kind?: string) => kind === 'url' ? 'Link' : kind === 'text' ? 'Pasted text' : 'Uploaded file';

const DetailRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value?.trim())
        return null;
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">{label}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-200">{value}</p>
        </div>
    );
};

const EditField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block">
        <span className="text-[10px] font-black uppercase tracking-wider text-lime-400">{label}</span>
        <div className="mt-1.5">{children}</div>
    </label>
);

const SelectField = ({ value, options, onChange }: { value?: string; options: string[]; onChange: (value: string) => void }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div ref={ref} className={`relative ${open ? 'z-30' : 'z-10'}`}>
            <div
                onClick={() => setOpen((prev) => !prev)}
                className={`w-full rounded-xl border bg-gray-800/50 px-4 py-3 text-sm flex items-center justify-between cursor-pointer transition-all ${
                    open
                        ? 'border-lime-500 ring-2 ring-lime-500/20'
                        : value
                        ? 'border-lime-500/80 ring-1 ring-lime-500/20 text-white'
                        : 'border-gray-700 hover:border-gray-600 text-gray-400'
                }`}
            >
                <span className="truncate">{value || 'Select'}</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 bg-[#111827] border border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                    >
                        <div className="p-2 space-y-1">
                            {options.map((opt) => {
                                const isSelected = value === opt;
                                return (
                                    <div
                                        key={opt}
                                        onClick={() => {
                                            onChange(opt);
                                            setOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${
                                            isSelected ? 'bg-lime-500/20 text-lime-400 font-medium' : 'text-gray-300 hover:bg-white/5'
                                        }`}
                                    >
                                        <span>{opt}</span>
                                        {isSelected && <Check size={16} className="text-lime-500 shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ImportDetailModal = ({ detail, onClose, onSave }: { detail: ImportDetail; onClose: () => void; onSave: (course: ImportedCourse) => void }) => {
    const course = detail.course || {};
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<ImportedCourse>(course);
    const [audienceText, setAudienceText] = useState('');
    const [topicsText, setTopicsText] = useState('');
    const modules = Array.isArray((editing ? draft : course).modules) ? (editing ? draft : course).modules || [] : [];
    const topics = Array.isArray(course.topics) ? course.topics : [];
    const audience = Array.isArray(course.audience) ? course.audience.filter(Boolean) : [];
    const setDraftField = (patch: Partial<ImportedCourse>) => setDraft((current) => ({ ...current, ...patch }));
    const startEdit = () => {
        setAudienceText(audience.join(', '));
        setTopicsText(topics.join(', '));
        setDraft({
            ...course,
            audience: [...audience],
            topics: [...topics],
            modules: modules.map((mod) => ({ title: mod.title || '', lessons: [...(mod.lessons || [])] }))
        });
        setEditing(true);
    };
    const save = () => {
        const nextAudience = audienceText.split(',').map((part) => part.trim()).filter(Boolean);
        const nextTopics = topicsText.split(',').map((part) => part.trim()).filter(Boolean);
        onSave({
            ...draft,
            title: String(draft.title || '').trim(),
            audience: nextAudience,
            topics: nextTopics,
            modules: (draft.modules || []).map((mod) => ({
                title: String(mod.title || '').trim(),
                lessons: (mod.lessons || []).map((lesson) => String(lesson || '').trim()).filter(Boolean)
            })).filter((mod) => mod.title)
        });
        setEditing(false);
    };
    return createPortal(
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0c0e14] shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0c0e14] px-6 py-4 md:px-8">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">{kindLabel(detail.source?.kind)} imported</p>
                        <h3 className="mt-1 text-lg font-black leading-snug text-white">{editing ? 'Edit imported details' : (course.title || detail.source?.title || 'Imported course')}</h3>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {editing ? (
                            <>
                                <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white">Cancel</button>
                                <button type="button" onClick={save} className="rounded-xl bg-lime-500 px-3 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-400">Save</button>
                            </>
                        ) : (
                            <button type="button" onClick={startEdit} className="inline-flex items-center gap-1.5 rounded-xl border border-lime-500/30 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-lime-400 hover:bg-lime-500/10">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="px-6 py-6 md:px-8">
                    {editing ? (
                        <div className="space-y-5">
                            <EditField label="Course title">
                                <input value={draft.title || ''} onChange={(event) => setDraftField({ title: event.target.value })} className={fieldClass} />
                            </EditField>
                            <EditField label="Summary">
                                <textarea value={draft.summary || ''} rows={3} onChange={(event) => setDraftField({ summary: event.target.value })} className={`${fieldClass} resize-y`} />
                            </EditField>
                            <EditField label="Description">
                                <textarea value={draft.description || ''} rows={5} onChange={(event) => setDraftField({ description: event.target.value })} className={`${fieldClass} resize-y`} />
                            </EditField>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <EditField label="Level"><SelectField value={draft.level} options={LEVELS} onChange={(level) => setDraftField({ level })} /></EditField>
                                <EditField label="Language"><input value={draft.language || ''} onChange={(event) => setDraftField({ language: event.target.value })} className={fieldClass} /></EditField>
                                <EditField label="Audience"><input value={audienceText} onChange={(event) => setAudienceText(event.target.value)} placeholder="Separate audiences with commas" className={fieldClass} /></EditField>
                                <EditField label="Industry"><input value={draft.industry || ''} onChange={(event) => setDraftField({ industry: event.target.value })} className={fieldClass} /></EditField>
                                <EditField label="Region"><input value={draft.country || ''} onChange={(event) => setDraftField({ country: event.target.value })} className={fieldClass} /></EditField>
                                <EditField label="Standard"><SelectField value={draft.standards} options={STANDARDS} onChange={(standards) => setDraftField({ standards })} /></EditField>
                                <EditField label="Teaching style"><SelectField value={draft.courseStyle} options={STYLES} onChange={(courseStyle) => setDraftField({ courseStyle })} /></EditField>
                                <EditField label="Delivery"><SelectField value={draft.deliveryMode} options={DELIVERY} onChange={(deliveryMode) => setDraftField({ deliveryMode })} /></EditField>
                                <EditField label="Archetype"><SelectField value={draft.archetype} options={ARCHETYPES} onChange={(archetype) => setDraftField({ archetype })} /></EditField>
                                <EditField label="Modules"><input type="number" min={1} max={20} value={draft.moduleCount || ''} onChange={(event) => setDraftField({ moduleCount: Number(event.target.value) || 0 })} className={fieldClass} /></EditField>
                                <EditField label="Duration (hours)"><input type="number" min={1} value={draft.durationHours || ''} onChange={(event) => setDraftField({ durationHours: Number(event.target.value) || 0 })} className={fieldClass} /></EditField>
                            </div>
                            <EditField label="Primary purpose">
                                <textarea value={draft.purpose || ''} rows={3} onChange={(event) => setDraftField({ purpose: event.target.value })} className={`${fieldClass} resize-y`} />
                            </EditField>
                            <EditField label="Professional outcome">
                                <textarea value={draft.approvedOutcomes || ''} rows={3} onChange={(event) => setDraftField({ approvedOutcomes: event.target.value })} className={`${fieldClass} resize-y`} />
                            </EditField>
                            <EditField label="Topics">
                                <input value={topicsText} onChange={(event) => setTopicsText(event.target.value)} placeholder="Separate topics with commas" className={fieldClass} />
                            </EditField>
                            {modules.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">Module outline</p>
                                    {modules.map((mod, index) => (
                                        <div key={`edit-module-${index}`} className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                            <input value={mod.title || ''} onChange={(event) => {
                                                const next = modules.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item);
                                                setDraftField({ modules: next });
                                            }} className={fieldClass} />
                                            <textarea value={(mod.lessons || []).join('\n')} rows={3} onChange={(event) => {
                                                const next = modules.map((item, itemIndex) => itemIndex === index ? { ...item, lessons: event.target.value.split('\n') } : item);
                                                setDraftField({ modules: next });
                                            }} placeholder="One lesson per line" className={`${fieldClass} resize-y`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <DetailRow label="Summary" value={course.summary} />
                            <DetailRow label="Description" value={course.description} />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <DetailRow label="Level" value={course.level} />
                                <DetailRow label="Language" value={course.language} />
                                <DetailRow label="Audience" value={audience.join(', ')} />
                                <DetailRow label="Industry" value={course.industry} />
                                <DetailRow label="Region" value={course.country} />
                                <DetailRow label="Standard" value={course.standards} />
                                <DetailRow label="Teaching style" value={course.courseStyle} />
                                <DetailRow label="Delivery" value={course.deliveryMode} />
                                <DetailRow label="Archetype" value={course.archetype} />
                                <DetailRow label="Modules" value={course.moduleCount ? String(course.moduleCount) : ''} />
                                <DetailRow label="Duration" value={course.durationHours ? `${course.durationHours} hours` : ''} />
                            </div>
                            <DetailRow label="Primary purpose" value={course.purpose} />
                            <DetailRow label="Professional outcome" value={course.approvedOutcomes} />
                            {topics.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">Topics</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {topics.map((topic) => <span key={topic} className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200">{topic}</span>)}
                                    </div>
                                </div>
                            )}
                            {modules.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">Module outline</p>
                                    <ol className="mt-3 space-y-3">
                                        {modules.map((mod, index) => (
                                            <li key={`${mod.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                                <p className="text-sm font-bold text-white">Module {index + 1}. {mod.title}</p>
                                                {Array.isArray(mod.lessons) && mod.lessons.length > 0 && (
                                                    <ul className="mt-2 space-y-1">
                                                        {mod.lessons.map((lesson) => <li key={lesson} className="text-sm text-gray-400">• {lesson}</li>)}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                            {detail.source?.url && <DetailRow label="Link" value={detail.source.url} />}
                            {detail.source?.text && <DetailRow label="Source text" value={detail.source.text.slice(0, 1400)} />}
                        </div>
                    )}
                    <p className="mt-6 text-xs text-gray-500">{editing ? 'Save writes these details into the course form.' : 'These details are now in the course title, audience, level, and professional brief.'}</p>
                </div>
            </div>
        </div>,
        document.body
    );
};

type Mode = 'file' | 'url' | 'text';

const MODES: { id: Mode; label: string; icon: typeof FileUp }[] = [
    { id: 'file', label: 'Upload file', icon: FileUp },
    { id: 'url', label: 'From a link', icon: Link2 },
    { id: 'text', label: 'Paste text', icon: Type },
];

const ImportCoursePanel: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void }> = ({ open: openProp, onOpenChange }) => {
    const { courseData, updateCourseData, uploadCourseSource, courseForgeBusy } = useCourseCreator();
    const [mode, setMode] = useState<Mode>('file');
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [localOpen, setLocalOpen] = useState(true);
    const open = openProp ?? localOpen;
    const setOpen = (next: boolean | ((value: boolean) => boolean)) => {
        const resolved = typeof next === 'function' ? next(open) : next;
        if (onOpenChange)
            onOpenChange(resolved);
        else
            setLocalOpen(resolved);
    };
    const [detail, setDetail] = useState<ImportDetail | null>(null);
    const [detailIndex, setDetailIndex] = useState(-1);
    const busy = courseForgeBusy === 'source';
    const sources = Array.isArray(courseData.courseForge?.sources) ? courseData.courseForge.sources : [];

    const importSource = async () => {
        let result: ImportDetail | null | undefined = null;
        if (mode === 'file') {
            if (!file)
                return;
            result = await uploadCourseSource(file, { title: file.name, level: 'Level 4 — General explanation', text: '', forbidden: false });
            if (result)
                setFile(null);
        }
        else if (mode === 'url') {
            const next = url.trim();
            if (!/^https?:\/\//i.test(next))
                return;
            result = await uploadCourseSource(null, { title: next, level: 'Level 4 — General explanation', text: '', forbidden: false, url: next });
            if (result)
                setUrl('');
        }
        else {
            const pasted = text.trim();
            if (!pasted)
                return;
            const title = pasted.split(/\s+/).slice(0, 8).join(' ');
            result = await uploadCourseSource(null, { title, level: 'Level 4 — General explanation', text: pasted, forbidden: false });
            if (result)
                setText('');
        }
        if (result?.course) {
            setDetailIndex(sources.length);
            setDetail(result);
        }
    };

    const saveImportedDetail = (course: ImportedCourse) => {
        const filled = (value?: string) => typeof value === 'string' && value.trim().length > 0;
        const audience = Array.isArray(course.audience) ? course.audience.map((item) => String(item || '').trim()).filter(Boolean) : [];
        const forge = { ...(courseData.courseForge || {}) };
        forge.purpose = String(course.purpose || '').trim();
        forge.approvedOutcomes = String(course.approvedOutcomes || '').trim();
        forge.language = String(course.language || '').trim();
        forge.languages = forge.language.split(',').map((part: string) => part.trim()).filter(Boolean);
        forge.archetype = String(course.archetype || '').trim();
        forge.deliveryMode = String(course.deliveryMode || '').trim();
        const list = Array.isArray(forge.sources) ? [...forge.sources] : [];
        if (list[detailIndex])
            list[detailIndex] = { ...list[detailIndex], title: course.title || list[detailIndex].title, profile: { ...course, audience } };
        forge.sources = list;
        const moduleCount = Number(course.moduleCount);
        const hours = Number(course.durationHours);
        const next: Record<string, unknown> = {
            courseForge: forge,
            title: String(course.title || '').trim(),
            description: String(course.description || '').trim(),
            audience
        };
        if (filled(course.level))
            next.level = course.level;
        if (moduleCount > 0)
            next.module = Math.min(20, Math.max(1, Math.round(moduleCount)));
        if (filled(course.industry))
            next.industry = course.industry;
        if (filled(course.country))
            next.country = course.country;
        if (filled(course.standards))
            next.standards = course.standards;
        else if (filled(course.country))
            next.standards = 'Regional';
        else if (filled(course.industry))
            next.standards = 'Industry Specific';
        if (filled(course.courseStyle))
            next.courseStyle = course.courseStyle;
        if (hours > 0)
            next.duration = { value: hours, unit: 'Hours' };
        updateCourseData(next);
        setDetail({ course: { ...course, audience }, source: { ...(detail?.source || {}), title: course.title, profile: { ...course, audience } } });
        toast.success('Imported details updated.');
    };

    const ready = mode === 'file' ? Boolean(file) : mode === 'url' ? /^https?:\/\//i.test(url.trim()) : text.trim().length > 0;

    return (
        <div data-import-panel className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <button type="button" data-expand-toggle onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-300">Import course</p>
                    <p className="mt-1 text-xs text-gray-500">
                        Orion can also read a file, a link, or pasted notes. Skip this section if you don't want to import any file{' '}
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.stopPropagation();
                                    setOpen(false);
                                }
                            }}
                            className="group relative inline-block cursor-pointer font-semibold text-lime-400 select-none pb-0.5"
                        >
                            skip
                            <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-lime-400 transition-all duration-300 ease-out group-hover:w-full" />
                        </span>
                    </p>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">Optional</span>
                    <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                </span>
            </button>
            {open && (
                <div className="mt-4">
                    <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {MODES.map((item) => {
                            const Icon = item.icon;
                            const selected = mode === item.id;
                            return (
                                <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all ${selected ? 'border-lime-500 bg-lime-500 text-black' : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/25'}`}>
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                    {mode === 'file' && (
                        <label onDragOver={(event) => { event.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(event) => { event.preventDefault(); setDragOver(false); setFile(event.dataTransfer.files?.[0] || null); }} className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center ${dragOver ? 'border-lime-400 bg-lime-500/10' : 'border-white/15 bg-white/[0.02]'}`}>
                            <FileUp className="mb-2 h-5 w-5 text-lime-400" />
                            <span className="text-sm text-gray-300">{file ? file.name : 'Drop a PDF, DOCX, PPTX, XLSX, CSV, or TXT file'}</span>
                            <span className="mt-1 text-xs text-gray-500">{file ? `${Math.max(1, Math.round(file.size / 1024))} KB` : 'or click to browse'}</span>
                            <input type="file" accept=".pdf,.docx,.ppt,.pptx,.txt,.md,.xlsx,.xls,.csv" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                        </label>
                    )}
                    {mode === 'url' && (
                        <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/syllabus" className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-lime-500" />
                    )}
                    {mode === 'text' && (
                        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} placeholder="Paste a syllabus, outline, notes, or curriculum" className="w-full resize-y rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-lime-500" />
                    )}
                    <div className="mt-4 flex items-center gap-3">
                        <button type="button" disabled={busy || !ready} onClick={importSource} className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {busy ? 'Importing' : 'Import'}
                        </button>
                        {mode === 'file' && file && (
                            <button type="button" onClick={() => setFile(null)} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white">
                                <Trash2 className="h-3.5 w-3.5" /> Remove file
                            </button>
                        )}
                    </div>
                    {sources.length > 0 && (
                        <ul className="mt-4 space-y-2">
                            {sources.map((source: { title?: string; text?: string; url?: string; kind?: string; profile?: ImportedCourse }, index: number) => (
                                <li key={`${source.title || 'source'}-${index}`}>
                                    <button type="button" onClick={() => { setDetailIndex(index); setDetail({ course: source.profile || { title: source.title, description: source.text, summary: source.text }, source }); }} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-gray-200 hover:border-lime-500/40">
                                        {source.title || `Source ${index + 1}`}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {detail && <ImportDetailModal detail={detail} onClose={() => setDetail(null)} onSave={saveImportedDetail} />}
        </div>
    );
};

const inputClass = 'w-full rounded-xl border bg-gray-800/50 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-lime-500';

const Field = ({ label, action, required = false, invalid = false, children }: { label: string; action?: React.ReactNode; required?: boolean; invalid?: boolean; children: React.ReactNode }) => (
    <div className="p-0.5">
        <div className="mb-2 flex w-full items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                {label}
                {required && <span className={`text-sm font-bold leading-none ${invalid ? 'text-red-400' : 'text-red-500'}`}>*</span>}
            </span>
            {action}
        </div>
        {children}
    </div>
);

const Area = ({ value, placeholder, onChange, invalid = false, errorMessage }: { value: string; placeholder: string; onChange: (value: string) => void; invalid?: boolean; errorMessage?: string }) => {
    const isFilled = Boolean(value?.trim());
    return (
        <div className="p-0.5">
            <textarea
                value={value}
                rows={3}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className={`${inputClass} resize-y transition-all ${
                    invalid
                        ? 'border-red-500 ring-1 ring-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)] focus:ring-red-500'
                        : isFilled
                        ? 'border-lime-500/80 ring-1 ring-lime-500/20 focus:ring-lime-500'
                        : 'border-gray-700 focus:ring-lime-500'
                }`}
            />
            {invalid ? (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errorMessage || 'Please fill out this field.'}</p>
            ) : isFilled ? (
                <p className="mt-1.5 text-xs text-lime-400 font-medium">Looks good!</p>
            ) : null}
        </div>
    );
};

const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Arabic', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Urdu', 'Russian', 'Italian', 'Dutch', 'Turkish', 'Indonesian'];

const LanguageSelect = ({ value, onChange, invalid = false }: { value: string[]; onChange: (next: string[]) => void; invalid?: boolean }) => {
    const [open, setOpen] = useState(false);
    const [custom, setCustom] = useState('');
    const [box, setBox] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const place = () => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect)
            return;
        setBox({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    };
    const toggle = (language: string) => {
        onChange(value.includes(language) ? value.filter((item) => item !== language) : [...value, language]);
    };
    const addCustom = () => {
        const label = custom.trim();
        if (!label)
            return;
        const next = label.charAt(0).toUpperCase() + label.slice(1);
        if (!value.includes(next))
            onChange([...value, next]);
        setCustom('');
    };
    return (
        <div className="relative p-0.5">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => { place(); setOpen((current) => !current); }}
                className={`${inputClass} flex min-h-[50px] w-full flex-wrap items-center gap-2 pr-10 text-left transition-all ${
                    invalid
                        ? 'border-red-500 ring-1 ring-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                        : value.length > 0
                        ? 'border-lime-500/80 ring-1 ring-lime-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                }`}
            >
                {value.length > 0 ? value.map((language) => (
                    <span key={language} className="inline-flex items-center gap-1 rounded-md border border-lime-500/30 bg-lime-500/20 px-2 py-1 text-xs text-lime-400">
                        {language}
                        <span role="button" onClick={(event) => { event.stopPropagation(); onChange(value.filter((item) => item !== language)); }} className="hover:text-lime-300">
                            <X className="h-3 w-3" />
                        </span>
                    </span>
                )) : <span className="text-gray-500">Select languages</span>}
            </button>
            <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            {invalid ? (
                <p className="mt-1.5 text-xs text-red-500 font-medium">Please select at least one language.</p>
            ) : value.length > 0 ? (
                <p className="mt-1.5 text-xs text-lime-400 font-medium">Looks good!</p>
            ) : null}
            {open && createPortal(
                <div className="fixed z-[90] overflow-hidden rounded-xl border border-gray-700 bg-[#111827] shadow-xl" style={{ top: box.top, left: box.left, width: box.width }}>
                    <div className="max-h-60 space-y-1 overflow-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {[...LANGUAGES, ...value.filter((language) => !LANGUAGES.includes(language))].map((language) => {
                            const selected = value.includes(language);
                            return (
                                <button key={language} type="button" onClick={() => toggle(language)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${selected ? 'bg-lime-500/20 text-lime-400' : 'text-gray-300 hover:bg-white/5'}`}>
                                    {language}
                                    {selected && <Check className="h-4 w-4 text-lime-400" />}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex gap-2 border-t border-gray-700 bg-gray-900/50 p-2">
                        <input value={custom} onChange={(event) => setCustom(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustom(); } }} placeholder="Add a language" className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-lime-500" />
                        <button type="button" onClick={addCustom} className="rounded-lg bg-lime-500 px-3 py-2 text-xs font-bold uppercase tracking-wider text-black">Add</button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

const Choice = ({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = options.includes(value) ? value : options[0];

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div ref={ref} className={`relative p-0.5 ${open ? 'z-30' : 'z-10'}`}>
            <div
                onClick={() => setOpen((prev) => !prev)}
                className={`w-full min-h-[50px] bg-gray-800/50 border rounded-xl py-3 px-4 pr-10 flex items-center justify-between cursor-pointer transition-all ${
                    open
                        ? 'border-lime-500 ring-2 ring-lime-500/20'
                        : selected
                        ? 'border-lime-500/80 ring-1 ring-lime-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                }`}
            >
                <span className="text-sm text-white select-none truncate">{selected}</span>
                <ChevronDown
                    className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-transform ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 bg-[#111827] border border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                    >
                        <div className="p-2 space-y-1">
                            {options.map((option) => {
                                const isSelected = selected === option;
                                return (
                                    <div
                                        key={option}
                                        onClick={() => {
                                            onChange(option);
                                            setOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 max-md:py-3 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${
                                            isSelected ? 'bg-lime-500/20 text-lime-400 font-medium' : 'text-gray-300 hover:bg-white/5'
                                        }`}
                                    >
                                        <span>{option}</span>
                                        {isSelected && <Check size={16} className="text-lime-500 shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selected && <p className="mt-1.5 text-xs text-lime-400 font-medium">Looks good!</p>}
        </div>
    );
};

export const CourseOptionsExpand: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void }> = ({ open: openProp, onOpenChange }) => {
    const { courseData, updateCourseData, showValidation } = useCourseCreator();
    const forge = courseData.courseForge || {};
    const [localOpen, setLocalOpen] = useState(true);
    const open = openProp ?? localOpen;
    const setOpen = (next: boolean) => {
        if (onOpenChange)
            onOpenChange(next);
        else
            setLocalOpen(next);
    };
    const setForge = (partial: Record<string, unknown>) => {
        updateCourseData({ courseForge: { ...forge, ...partial } });
    };
    const text = (key: string) => String(forge[key] || '');
    const purpose = text('purpose');
    const outcomes = text('approvedOutcomes');
    const selectedLanguages = Array.isArray(forge.languages) && forge.languages.length
        ? forge.languages.map((item: unknown) => String(item)).filter(Boolean)
        : String(forge.language || '').split(',').map((part) => part.trim()).filter(Boolean);
    const [writing, setWriting] = useState<'purpose' | 'outcome' | ''>('');
    const writeWithAi = async (field: 'purpose' | 'outcome') => {
        if (!String(courseData.title || '').trim()) {
            toast.error('Add a course title first.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token)
            return;
        setWriting(field);
        try {
            const resp = await fetch(`${API_BASE}/generate-brief-field`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    field,
                    courseData: {
                        title: courseData.title,
                        audience: courseData.audience,
                        level: courseData.level,
                        industry: courseData.industry,
                        standards: courseData.standards
                    }
                })
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok || !data.text) {
                toast.error(data.message || 'Orion could not write that field');
                return;
            }
            setForge(field === 'purpose' ? { purpose: data.text } : { approvedOutcomes: data.text });
        }
        catch {
            toast.error('Orion could not write that field');
        }
        finally {
            setWriting('');
        }
    };
    const writeButton = (field: 'purpose' | 'outcome') => (
        <button type="button" disabled={Boolean(writing)} onClick={() => writeWithAi(field)} className="ml-auto inline-flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-lime-400 transition-colors hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-50">
            {writing === field ? <Loader2 className="h-2 w-2 animate-spin" /> : <Sparkles className="h-2 w-2" />}
            Write with AI
        </button>
    );
    useEffect(() => {
        if (purpose || outcomes)
            setOpen(true);
    }, [purpose, outcomes]);
    return (
        <div>
            <button type="button" data-expand-toggle onClick={() => setOpen(!open)} className="flex w-full items-center justify-between rounded-xl border border-gray-700 bg-gray-800/40 px-4 py-3 text-left hover:border-gray-600">
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-300">Professional brief</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="mt-6 p-1">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field label="Course archetype">
                            <Choice value={text('archetype') || 'Let AI select'} options={ARCHETYPES} onChange={(value) => setForge({ archetype: value })} />
                        </Field>
                        <Field label="Delivery">
                            <Choice value={text('deliveryMode') || 'Self-paced'} options={DELIVERY} onChange={(value) => setForge({ deliveryMode: value })} />
                        </Field>
                        <div className="md:col-span-2">
                            <Field label="Language" required invalid={showValidation && selectedLanguages.length === 0}>
                                <LanguageSelect value={selectedLanguages} invalid={showValidation && selectedLanguages.length === 0} onChange={(next) => setForge({ languages: next, language: next.join(', ') })} />
                            </Field>
                        </div>
                        <div className="md:col-span-2">
                            <Field label="Primary purpose" required invalid={showValidation && !text('purpose').trim()} action={writeButton('purpose')}>
                                <Area invalid={showValidation && !text('purpose').trim()} errorMessage="Please provide a primary purpose." value={text('purpose')} placeholder="The professional job this course must do" onChange={(value) => setForge({ purpose: value })} />
                            </Field>
                        </div>
                        <div className="md:col-span-2">
                            <Field label="Professional outcome" required invalid={showValidation && !text('approvedOutcomes').trim()} action={writeButton('outcome')}>
                                <Area invalid={showValidation && !text('approvedOutcomes').trim()} errorMessage="Please provide professional outcomes." value={text('approvedOutcomes')} placeholder="What a professional must be able to do after this course" onChange={(value) => setForge({ approvedOutcomes: value })} />
                            </Field>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportCoursePanel;
