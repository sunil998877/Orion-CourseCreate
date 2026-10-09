import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Edit3, Loader2, RotateCcw, Sparkles, X, CheckCircle2, AlertCircle, FileText, Layers, ListChecks, ChevronRight } from 'lucide-react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import { API_BASE } from '../../utils/api';
import { toast } from 'react-toastify';

const CourseForgeGates: React.FC<{ stage: 'build' | 'review'; open?: boolean; onToggle?: () => void }> = ({ stage, open, onToggle }) => {
    const {
        courseData, updateCourseData, courseForgeBusy, generateResearchDossier, approveResearchDossier,
        saveResearchDossier, generateCourseBlueprint, approveCourseBlueprint, generateNarration,
        generateAssessment, approveAssessment, saveAssessment, generateWorkbook, runCourseAudit,
        hasBlueprint
    } = useCourseCreator();
    const forge = courseData.courseForge || {};
    const busy = Boolean(courseForgeBusy);
    const findings = Array.isArray(forge.audit?.findings) ? forge.audit.findings : [];
    const action = 'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all';
    const quiet = `${action} bg-gray-800/70 border border-gray-700 text-gray-200 hover:border-lime-500/40 hover:text-white`;
    const solid = `${action} bg-lime-500 text-black hover:bg-lime-400`;
    const done = `${action} cursor-not-allowed bg-lime-500 text-black`;
    const sealed = `${action} cursor-not-allowed border border-white/10 bg-gray-800/40 text-gray-500`;
    const locked = `${action} cursor-not-allowed border border-white/5 bg-gray-900/50 text-gray-600`;
    const [localOpen, setLocalOpen] = useState(true);
    const [blueprintOpen, setBlueprintOpen] = useState(false);
    const [editingBlueprint, setEditingBlueprint] = useState(false);
    const [blueprintDraft, setBlueprintDraft] = useState<any>(null);
    const [editingScope, setEditingScope] = useState(false);
    const [scopeDraft, setScopeDraft] = useState('');
    const [fixingScope, setFixingScope] = useState(false);
    const [fixExplanation, setFixExplanation] = useState<string | null>(null);

    const startScopeEdit = () => {
        setScopeDraft(String(forge.researchDossier?.scope || ''));
        setFixExplanation(null);
        setEditingScope(true);
    };

    const cancelScopeEdit = () => {
        setEditingScope(false);
        setScopeDraft('');
        setFixExplanation(null);
    };

    const saveScopeEdit = () => {
        const trimmed = scopeDraft.trim();
        if (!trimmed) return;
        saveResearchDossier({
            ...(forge.researchDossier || {}),
            scope: trimmed
        });
        setEditingScope(false);
        setFixExplanation(null);
    };

    const handleAIFixScope = async () => {
        setFixingScope(true);
        setFixExplanation(null);
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${API_BASE}/fix-scope-with-audit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || ''}`,
                },
                body: JSON.stringify({
                    currentScope: scopeDraft || forge.researchDossier?.scope,
                    findings,
                    courseData,
                }),
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                toast.error(data?.message || 'Could not auto-fix scope with AI');
                return;
            }
            if (data?.correctedScope) {
                setScopeDraft(data.correctedScope);
                setFixExplanation(data.explanation || 'Scope corrected by AI based on audit observations.');
                toast.success('Scope automatically corrected by AI based on audit findings!');
            }
        } catch (err: any) {
            console.error('AI Fix scope error:', err);
            toast.error('AI auto-fix failed. Please check network.');
        } finally {
            setFixingScope(false);
        }
    };

    const closeBlueprint = () => {
        setBlueprintOpen(false);
        setEditingBlueprint(false);
        setBlueprintDraft(null);
    };
    const startBlueprintEdit = () => {
        setBlueprintDraft(JSON.parse(JSON.stringify(forge.assessment || {})));
        setEditingBlueprint(true);
    };
    const saveBlueprintEdit = () => {
        saveAssessment(blueprintDraft);
        setEditingBlueprint(false);
        setBlueprintDraft(null);
    };
    const expanded = open ?? localOpen;
    const toggle = onToggle ?? (() => setLocalOpen((value) => !value));
    const dossierReady = Boolean(forge.researchDossier);
    const dossierApproved = Boolean(forge.researchApproved);
    const blueprintReady = Boolean(forge.blueprint);
    const blueprintApproved = Boolean(forge.blueprintApproved);
    const scriptReady = Boolean(forge.narrationApproved);
    const workbookReady = Boolean(forge.workbook || forge.workbookApproved);
    const assessmentReady = Boolean(forge.assessment);
    const assessmentApproved = Boolean(forge.assessmentApproved);
    const auditReady = Boolean(forge.auditDecision);
    const steps = stage === 'build'
        ? [
            { label: 'Research dossier', state: dossierApproved ? 'Approved' : dossierReady ? 'Ready to approve' : 'Create' },
            { label: 'Blueprint', state: blueprintApproved ? 'Approved' : blueprintReady ? 'Ready to approve' : 'Create' },
            ...(hasBlueprint ? [
                { label: 'Trainer script', state: scriptReady ? 'Approved' : 'Create' },
                { label: 'E-workbook', state: workbookReady ? 'Approved' : 'Create' },
                { label: 'Assessment', state: assessmentApproved ? 'Approved' : assessmentReady ? 'Ready to approve' : 'Create' }
            ] : [])
        ]
        : [
            { label: 'Assessment', state: assessmentApproved ? 'Approved' : assessmentReady ? 'Ready to approve' : 'Create' },
            { label: 'Quality audit', state: auditReady ? 'Approved' : 'Create' }
        ];
    const buttons = stage === 'build'
        ? [
            { label: 'Research dossier', done: dossierReady, open: !dossierReady, onClick: generateResearchDossier, kind: 'create' as const },
            { label: dossierApproved ? 'Dossier approved' : 'Approve dossier', done: dossierApproved, open: dossierReady && !dossierApproved, onClick: approveResearchDossier, kind: 'approve' as const },
            { label: 'Blueprint', done: blueprintReady, open: dossierApproved && !blueprintReady, onClick: generateCourseBlueprint, kind: 'create' as const },
            { label: blueprintApproved ? 'Blueprint approved' : 'Approve blueprint', done: blueprintApproved, open: blueprintReady && !blueprintApproved, onClick: approveCourseBlueprint, kind: 'approve' as const },
            ...(hasBlueprint ? [
                { label: 'Trainer script', done: scriptReady, open: blueprintApproved && !scriptReady, onClick: generateNarration, kind: 'create' as const },
                { label: 'E-workbook', done: workbookReady, open: scriptReady && !workbookReady, onClick: generateWorkbook, kind: 'create' as const },
                { label: 'Assessment', done: assessmentReady, open: workbookReady && !assessmentReady, onClick: generateAssessment, kind: 'create' as const },
                { label: assessmentApproved ? 'Assessment approved' : 'Approve assessment', done: assessmentApproved, open: assessmentReady && !assessmentApproved, onClick: approveAssessment, kind: 'approve' as const }
            ] : [])
        ]
        : [
            { label: 'Assessment', done: assessmentReady, open: workbookReady && !assessmentReady, onClick: generateAssessment, kind: 'create' as const },
            { label: assessmentApproved ? 'Assessment approved' : 'Approve assessment', done: assessmentApproved, open: assessmentReady && !assessmentApproved, onClick: approveAssessment, kind: 'approve' as const },
            { label: 'Quality audit', done: auditReady, open: assessmentApproved && !auditReady, onClick: runCourseAudit, kind: 'create' as const }
        ];
    const approvedCount = steps.filter((item) => item.state === 'Approved').length;
    return (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03]">
            {/* DESKTOP HEADER */}
            <button type="button" data-expand-toggle onClick={toggle} className="hidden md:flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
                <span>
                    <span className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold uppercase tracking-wider text-lime-400">Orion production</span>
                        {approvedCount < steps.length ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse">
                                {steps.length - approvedCount} Pending
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-lime-500/20 border border-lime-500/40 text-lime-400">
                                Approved
                            </span>
                        )}
                    </span>
                    <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-gray-500">{steps.length} steps to create and approve · {approvedCount} approved</span>
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {/* MOBILE HEADER */}
            <button type="button" data-expand-toggle onClick={toggle} className="flex md:hidden w-full flex-col gap-2 px-5 py-4 text-left relative">
                <div className="flex items-center gap-2.5">
                    <span className="text-[15px] font-black uppercase tracking-widest text-white">Orion production</span>
                    {approvedCount < steps.length ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 border border-amber-500/40 text-amber-300">
                            {steps.length - approvedCount} Pending
                        </span>
                    ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-lime-500/20 border border-lime-500/40 text-lime-400">
                            Approved
                        </span>
                    )}
                </div>
                <span className="block text-xs font-normal text-gray-400">{steps.length} steps to create and approve · {approvedCount} approved</span>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                    <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {!expanded && (
                <ul className="space-y-2 px-5 pb-4">
                    {steps.map((item) => {
                        const actionButton = buttons.find((button) => button.open && !busy && (button.label === item.label || (item.state === 'Ready to approve' && button.kind === 'approve' && button.label.toLowerCase().includes(item.label === 'Research dossier' ? 'dossier' : item.label.toLowerCase()))));
                        const openPanel = () => {
                            if (onToggle) onToggle();
                            else setLocalOpen(true);
                            if (actionButton) {
                                actionButton.onClick();
                            } else if (item.state !== 'Approved') {
                                toast.info(`Please complete previous steps in order before ${item.label}.`);
                            }
                        };
                        return (
                            <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-gray-200">{item.label}</span>
                                {item.state === 'Approved' ? (
                                    <span className="text-xs font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1">
                                        <CheckCircle2 size={13} className="text-lime-400 inline" /> Approved
                                    </span>
                                ) : (
                                    <button type="button" onClick={openPanel} className={`text-xs font-bold uppercase tracking-wider transition-all px-2.5 py-0.5 rounded-lg border ${item.state === 'Ready to approve' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30' : actionButton ? 'bg-lime-500/10 border-lime-500/30 text-lime-400 hover:bg-lime-500/20' : 'border-transparent text-gray-500 hover:text-gray-400'}`}>
                                        {item.state}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            {expanded && <div className="space-y-4 px-5 pb-5">
                {/* DESKTOP BUTTONS */}
                <div className="hidden md:flex flex-wrap gap-2">
                    {buttons.map((item) => {
                        const canClick = item.open && !busy;
                        const className = item.done ? (item.kind === 'approve' ? done : sealed) : canClick ? (item.kind === 'approve' ? solid : quiet) : locked;
                        return (
                            <button key={item.label} type="button" disabled={!canClick} onClick={item.onClick} className={className}>
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* MOBILE LIST */}
                <div className="flex md:hidden flex-col gap-2.5">
                    {steps.map((step) => {
                        const isApproved = step.state === 'Approved';
                        const isCurrent = step.state === 'Create' || step.state === 'Ready to approve';
                        const actionButton = buttons.find((button) => button.open && !busy && (button.label === step.label || (step.state === 'Ready to approve' && button.kind === 'approve' && button.label.toLowerCase().includes(step.label === 'Research dossier' ? 'dossier' : step.label.toLowerCase()))));
                        const runStep = () => {
                            if (isApproved || busy) return;
                            if (actionButton) {
                                actionButton.onClick();
                                return;
                            }
                            toast.info(`Please complete previous steps in order before ${step.label}.`);
                        };
                        return (
                            <button
                                key={step.label}
                                type="button"
                                onClick={runStep}
                                disabled={isApproved || busy}
                                className="flex w-full items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-[#12131a] text-left disabled:opacity-70"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-gray-400">
                                        {step.label.toLowerCase().includes('assessment') ? <ListChecks size={18} /> : step.label.toLowerCase().includes('blueprint') ? <Layers size={18} /> : <FileText size={18} />}
                                    </div>
                                    <span className="text-[13px] font-bold text-white">{step.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${isApproved ? 'bg-[#152010] border border-lime-500/20 text-lime-400' : isCurrent ? 'bg-[#1a1710] border border-amber-500/20 text-amber-400' : 'bg-transparent text-gray-500'}`}>
                                        {isApproved && <CheckCircle2 size={14} className="text-lime-400" />}
                                        {busy && actionButton ? 'Working' : step.state}
                                    </span>
                                    <ChevronRight size={16} className="text-gray-600" />
                                </div>
                            </button>
                        );
                    })}
                </div>
                {courseForgeBusy && <p className="text-xs text-lime-400">Orion is working on {courseForgeBusy}...</p>}
                {forge.researchDossier?.scope && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 transition-all">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
                                Scope
                            </span>
                            {!editingScope && (
                                <button
                                    type="button"
                                    onClick={startScopeEdit}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-lime-500/30 bg-lime-500/10 px-2.5 py-1 text-xs font-semibold text-lime-300 hover:border-lime-500/60 hover:bg-lime-500/20 hover:text-lime-200 transition-all"
                                >
                                    <Edit3 className="h-3 w-3" />
                                    Edit scope
                                </button>
                            )}
                        </div>
                        {editingScope ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-400">
                                        Let AI analyze the auditor findings and rewrite the scope:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleAIFixScope}
                                        disabled={fixingScope}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-lime-400/40 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 px-3 py-1.5 text-xs font-bold text-lime-300 hover:from-lime-500/30 hover:to-emerald-500/30 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {fixingScope ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-lime-400" />
                                                <span>AI analyzing problems & correcting…</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-3.5 w-3.5 text-lime-400" />
                                                <span>AI Auto-Fix Scope (Resolve Audit Problems)</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {fixExplanation && (
                                    <div className="rounded-xl border border-lime-500/30 bg-lime-500/10 p-3 text-xs text-lime-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                                        <Sparkles className="h-4 w-4 shrink-0 text-lime-400 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-lime-300">Auditor Observations Resolved by AI:</p>
                                            <p className="mt-0.5 leading-relaxed text-gray-200">{fixExplanation}</p>
                                        </div>
                                    </div>
                                )}

                                <textarea
                                    value={scopeDraft}
                                    onChange={(e) => setScopeDraft(e.target.value)}
                                    rows={5}
                                    className="w-full rounded-xl border border-gray-700 bg-gray-900/90 p-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-lime-400 focus:ring-1 focus:ring-lime-400 leading-relaxed"
                                    placeholder="Edit course scope..."
                                />
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={cancelScopeEdit}
                                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={saveScopeEdit}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-lime-500 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-400 transition-all shadow-sm"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        Save scope
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {forge.researchDossier.scope}
                            </p>
                        )}
                    </div>
                )}
                {forge.blueprint?.empowermentPromise && (
                    <p className="text-sm text-gray-300 leading-relaxed"><span className="text-lime-400 font-semibold">Promise. </span>{String(forge.blueprint.empowermentPromise).slice(0, 420)}</p>
                )}
                {assessmentReady && (
                    <button type="button" onClick={() => setBlueprintOpen(true)} className={quiet}>
                        View assessment blueprint
                    </button>
                )}
                {forge.auditDecision && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                <span>Audit decision:</span>
                                <span className={forge.auditDecision === 'APPROVED' ? 'text-lime-400 font-black' : 'text-amber-400 font-black'}>
                                    {forge.auditDecision}
                                </span>
                            </p>
                            {forge.auditDecision === 'DO NOT APPROVE' && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={runCourseAudit}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800/80 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:border-lime-500/40 hover:text-white transition-all"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Re-run Audit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            updateCourseData({
                                                courseForge: {
                                                    ...(courseData.courseForge || {}),
                                                    auditDecision: 'APPROVED'
                                                }
                                            });
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-lime-500 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-400 transition-all shadow-sm"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        Approve & Unlock Launch
                                    </button>
                                </div>
                            )}
                        </div>
                        {findings.length > 0 && (
                            <div className="space-y-1.5 pt-1 border-t border-white/5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Auditor Observations:</p>
                                {findings.slice(0, 6).map((item: any, index: number) => (
                                    <p key={index} className="text-xs text-gray-300 leading-relaxed">
                                        <span className={item.severity === 'Critical' ? 'text-red-400 font-bold' : item.severity === 'Major' ? 'text-amber-400 font-bold' : 'text-yellow-300 font-medium'}>
                                            {item.severity}.{' '}
                                        </span>
                                        <span className="text-gray-400">{item.location}: </span>
                                        {item.problem}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>}
            {blueprintOpen && assessmentReady && createPortal(
                <div className="fixed inset-0 z-[230] flex items-center justify-center px-4 py-6">
                    <button type="button" aria-label="Close assessment blueprint" className="absolute inset-0 bg-black/70" onClick={closeBlueprint} />
                    <div className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0c1018] shadow-2xl">
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
                            <h3 className="text-lg font-black text-white">{editingBlueprint ? 'Edit assessment blueprint' : 'Assessment blueprint'}</h3>
                            <div className="flex items-center gap-2">
                                {editingBlueprint ? (
                                    <>
                                        <button type="button" onClick={saveBlueprintEdit} className="rounded-xl bg-lime-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-400">Save</button>
                                        <button type="button" onClick={() => { setEditingBlueprint(false); setBlueprintDraft(null); }} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white">Cancel</button>
                                    </>
                                ) : (
                                    <button type="button" onClick={startBlueprintEdit} className="rounded-xl border border-lime-400/40 px-4 py-2 text-xs font-black uppercase tracking-wider text-lime-300 hover:bg-lime-400/10">Edit</button>
                                )}
                                <button type="button" onClick={closeBlueprint} className="rounded-xl border border-white/10 p-2 text-gray-300 hover:text-white">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto px-6 py-5">
                            {editingBlueprint ? <AssessmentEditor draft={blueprintDraft} onChange={setBlueprintDraft} /> : <AssessmentView assessment={forge.assessment} />}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CourseForgeGates;

const lines = (value: unknown) => Array.isArray(value) ? value : [];
const fieldClass = 'mt-1 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-lime-500';

const AssessmentEditor = ({ draft, onChange }: { draft: any; onChange: (next: any) => void }) => {
    const blueprint = lines(draft?.blueprint);
    const items = lines(draft?.items);
    const task = draft?.practicalTask && typeof draft.practicalTask === 'object' ? draft.practicalTask : {};
    const setBlueprint = (index: number, key: string, value: string) => {
        const next = blueprint.map((row: any, rowIndex: number) => rowIndex === index ? { ...row, [key]: value } : row);
        onChange({ ...draft, blueprint: next });
    };
    const setItem = (index: number, key: string, value: unknown) => {
        const next = items.map((row: any, rowIndex: number) => rowIndex === index ? { ...row, [key]: value } : row);
        onChange({ ...draft, items: next });
    };
    return (
        <div className="space-y-6">
            {blueprint.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">Assessment blueprint</p>
                    {blueprint.map((row: any, index: number) => (
                        <div key={index} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs font-black text-white">{index + 1}</p>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Item<input value={row?.item || ''} onChange={(event) => setBlueprint(index, 'item', event.target.value)} className={fieldClass} /></label>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Outcome<input value={row?.outcome || ''} onChange={(event) => setBlueprint(index, 'outcome', event.target.value)} className={fieldClass} /></label>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Topic<input value={row?.topic || ''} onChange={(event) => setBlueprint(index, 'topic', event.target.value)} className={fieldClass} /></label>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Type<input value={row?.type || ''} onChange={(event) => setBlueprint(index, 'type', event.target.value)} className={fieldClass} /></label>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Difficulty<input value={row?.difficulty || ''} onChange={(event) => setBlueprint(index, 'difficulty', event.target.value)} className={fieldClass} /></label>
                            </div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Evidence<textarea value={row?.evidence || ''} onChange={(event) => setBlueprint(index, 'evidence', event.target.value)} className={`${fieldClass} min-h-16`} /></label>
                        </div>
                    ))}
                </div>
            )}
            {items.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">Questions</p>
                    {items.map((item: any, index: number) => (
                        <div key={index} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Question {index + 1}<textarea value={item?.stem || ''} onChange={(event) => setItem(index, 'stem', event.target.value)} className={`${fieldClass} min-h-16`} /></label>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Options, one per line<textarea value={lines(item?.options).join('\n')} onChange={(event) => setItem(index, 'options', event.target.value.split('\n'))} className={`${fieldClass} min-h-20`} /></label>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Correct answer<input value={item?.answer || ''} onChange={(event) => setItem(index, 'answer', event.target.value)} className={fieldClass} /></label>
                        </div>
                    ))}
                </div>
            )}
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">Practical task</p>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Task<textarea value={task?.prompt || ''} onChange={(event) => onChange({ ...draft, practicalTask: { ...task, prompt: event.target.value } })} className={`${fieldClass} min-h-20`} /></label>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Pass mark<input value={task?.threshold || ''} onChange={(event) => onChange({ ...draft, practicalTask: { ...task, threshold: event.target.value } })} className={fieldClass} /></label>
            </div>
        </div>
    );
};

const AssessmentView = ({ assessment }: { assessment: any }) => {
    if (!assessment || typeof assessment !== 'object')
        return null;
    const blueprint = lines(assessment.blueprint);
    const items = lines(assessment.items);
    const task = assessment.practicalTask && typeof assessment.practicalTask === 'object' ? assessment.practicalTask : null;
    return (
        <div className="space-y-4">
            {blueprint.length > 0 && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">Assessment blueprint</p>
                    <div className="mt-2 space-y-2">
                        {blueprint.map((row: any, index: number) => (
                            <div key={`${row?.item || 'item'}-${index}`} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                                <p className="text-sm font-semibold text-white">{row?.item || `Item ${index + 1}`}</p>
                                <p className="mt-1 text-xs text-gray-400">{[row?.outcome, row?.cognitiveDemand, row?.type, row?.difficulty, row?.topic].filter(Boolean).join(' · ')}</p>
                                {row?.evidence && <p className="mt-1 text-sm text-gray-300">{row.evidence}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {items.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">Questions ({items.length})</p>
                        <span className="text-[10px] font-bold text-lime-300 bg-lime-500/10 px-2.5 py-0.5 rounded-full border border-lime-500/20">
                            {items.length >= 20 ? '20 Assessment Questions' : `${items.length} Questions`}
                        </span>
                    </div>
                    {items.map((item: any, index: number) => (
                        <div key={`${item?.stem || 'question'}-${index}`} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[10px] font-black uppercase text-lime-400">Question {index + 1}</span>
                                {item?.topic && <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{item.topic}</span>}
                            </div>
                            <p className="text-sm font-semibold text-white">{item?.stem}</p>
                            <ul className="mt-2 space-y-1">
                                {lines(item?.options).map((option: unknown) => {
                                    const text = String(option || '');
                                    const correct = text && text === String(item?.answer || '');
                                    return <li key={text} className={`text-sm ${correct ? 'font-semibold text-lime-300' : 'text-gray-400'}`}>{text}</li>;
                                })}
                            </ul>
                            {item?.whyCorrect && <p className="mt-2 text-xs leading-relaxed text-gray-300">{item.whyCorrect}</p>}
                            {item?.remediation && <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.remediation}</p>}
                        </div>
                    ))}
                </div>
            )}
            {task?.prompt && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">Practical task</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-200">{task.prompt}</p>
                    {task.threshold && <p className="mt-2 text-xs text-gray-400">Pass mark: {task.threshold}</p>}
                    {lines(task.rubric).length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {lines(task.rubric).map((line: any, index: number) => (
                                <li key={index} className="text-sm text-gray-300">{typeof line === 'string' ? line : [line?.criterion, line?.level, line?.description].filter(Boolean).join(' — ')}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
