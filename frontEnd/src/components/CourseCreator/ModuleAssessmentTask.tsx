import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import {
    Check,
    CheckSquare,
    Download,
    Edit3,
    FileText,
    HelpCircle,
    Loader2,
    Maximize2,
    Minimize2,
    Plus,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import { CourseCreatorContext } from '../../contextAPI/CourseCreatorContext';
import { useCourseData } from '../../contextAPI/courseAPI';
import { API_BASE } from '../../utils/api';
import { toast } from 'react-toastify';
import { generateAssessmentPdfBlob } from '../../utils/pdfGenerator';
import { useCredits } from '../../contextAPI/CreditsContext';
import { handleCreditApiFailure } from '../../utils/creditErrors';

const lines = (value: unknown) => (Array.isArray(value) ? value : []);

type Props = {
    assessment?: any;
    moduleIndex: number;
    moduleCount: number;
    moduleTitle?: string;
    moduleContent?: any;
};

export const ModuleAssessmentTask: React.FC<Props> = ({
    assessment: assessmentProp,
    moduleIndex,
    moduleCount,
    moduleTitle,
    moduleContent,
}) => {
    const creatorContext = useContext(CourseCreatorContext);
    const { courseData: courseDataContext, updateCourseData } = useCourseData();
    const { refreshWallet } = useCredits();

    const courseData = creatorContext?.courseData || courseDataContext;
    const saveAssessment =
        creatorContext?.saveAssessment ||
        ((newAssessment: any) => {
            if (!newAssessment) return;
            updateCourseData({
                courseForge: {
                    ...(courseData?.courseForge || {}),
                    assessment: newAssessment,
                },
            });
            toast.success('Assessment updated.');
        });

    const assessment = courseData?.courseForge?.assessment || assessmentProp;

    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [addingType, setAddingType] = useState<'quiz' | 'practical' | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const [quizStem, setQuizStem] = useState('');
    const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
    const [quizAnswerIdx, setQuizAnswerIdx] = useState(0);
    const [quizTopic, setQuizTopic] = useState('');
    const [quizDifficulty, setQuizDifficulty] = useState('Medium');

    const [practicalTitle, setPracticalTitle] = useState('');
    const [practicalPrompt, setPracticalPrompt] = useState('');
    const [practicalEvidence, setPracticalEvidence] = useState('');
    const [practicalThreshold, setPracticalThreshold] = useState('80% accuracy or complete deployment');

    const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);

    const [viewScope, setViewScope] = useState<'module' | 'all'>('module');

    const allItems = lines(assessment?.items);
    const effectiveModuleCount = Math.max(
        1,
        moduleCount ||
        (Array.isArray(courseData?.modules) && courseData.modules.length > 0 ? courseData.modules.length : 0) ||
        (Array.isArray(courseData?.previewModules) && courseData.previewModules.length > 0 ? courseData.previewModules.length : 0) ||
        Number(courseData?.module) ||
        Number(courseData?.moduleCount) ||
        1
    );

    // Detect if items are collapsed entirely onto 1 module (e.g. moduleIndex 0) when moduleCount > 1
    const isCollapsedOnModuleZero = effectiveModuleCount > 1 && allItems.length > 0 &&
        allItems.every((it: any) => Number(it?.moduleIndex ?? 0) === 0 && Number(it?.moduleNumber ?? 1) === 1);

    const getItemModuleIndex = (item: any, globalIdx: number): number => {
        if (!isCollapsedOnModuleZero) {
            if (item?.moduleIndex !== undefined && Number.isFinite(Number(item.moduleIndex))) {
                return Number(item.moduleIndex) % effectiveModuleCount;
            }
            if (item?.moduleNumber !== undefined && Number.isFinite(Number(item.moduleNumber))) {
                return (Number(item.moduleNumber) - 1) % effectiveModuleCount;
            }
        }
        return Math.min(effectiveModuleCount - 1, Math.floor((globalIdx * effectiveModuleCount) / Math.max(1, allItems.length)));
    };

    const moduleItemsWithIndices = allItems
        .map((item: any, globalIdx: number) => ({ item, globalIdx }))
        .filter(({ item, globalIdx }) => getItemModuleIndex(item, globalIdx) === moduleIndex);

    const displayedItems = viewScope === 'all'
        ? allItems.map((item: any, globalIdx: number) => ({ item, globalIdx }))
        : moduleItemsWithIndices;

    const allBlueprint = lines(assessment?.blueprint);
    const blueprintRow =
        allBlueprint.find(
            (b: any, idx: number) =>
                b?.moduleIndex === moduleIndex ||
                b?.moduleNumber === moduleIndex + 1 ||
                idx === moduleIndex
        ) || null;

    const allPracticalTasks = lines(assessment?.practicalTasks);
    const modulePracticalTasks = allPracticalTasks
        .map((t: any, idx: number) => ({ task: t, idx }))
        .filter(({ task, idx }) => {
            const tMod = task?.moduleIndex !== undefined
                ? Number(task.moduleIndex)
                : (task?.moduleNumber !== undefined ? Number(task.moduleNumber) - 1 : idx % effectiveModuleCount);
            return tMod === moduleIndex;
        });

    const legacyPracticalTask =
        assessment?.practicalTask &&
        typeof assessment.practicalTask === 'object'
            ? assessment.practicalTask
            : null;

    const defaultModulePracticalTask = modulePracticalTasks.length === 0 ? {
        item: `${moduleTitle || `Module ${moduleIndex + 1}`} Practical Assignment`,
        prompt: moduleIndex === effectiveModuleCount - 1 && legacyPracticalTask?.prompt
            ? legacyPracticalTask.prompt
            : `Apply the core methodologies learned in ${moduleTitle || `Module ${moduleIndex + 1}`}. Construct, document, and validate a working implementation of ${moduleTitle || `Module ${moduleIndex + 1}`} aligned with course standards.`,
        evidence: `Verified deployment repository, architecture documentation, or execution artifact demonstrating mastery of ${moduleTitle || `Module ${moduleIndex + 1}`}.`,
        threshold: moduleIndex === effectiveModuleCount - 1 && legacyPracticalTask?.threshold
            ? legacyPracticalTask.threshold
            : '80% accuracy or complete verified practical deployment'
    } : null;

    const totalTasksCount =
        moduleItemsWithIndices.length +
        modulePracticalTasks.length +
        (defaultModulePracticalTask ? 1 : 0);

    const resetForms = () => {
        setAddingType(null);
        setEditingItemIdx(null);
        setQuizStem('');
        setQuizOptions(['', '', '', '']);
        setQuizAnswerIdx(0);
        setQuizTopic('');
        setQuizDifficulty('Medium');
        setPracticalTitle('');
        setPracticalPrompt('');
        setPracticalEvidence('');
        setPracticalThreshold('80% accuracy or complete deployment');
    };

    const handleSaveQuizTask = () => {
        const stem = quizStem.trim();
        const validOptions = quizOptions.map((o) => o.trim()).filter(Boolean);
        if (!stem) {
            toast.warn('Please enter a question stem.');
            return;
        }
        if (validOptions.length < 2) {
            toast.warn('Please provide at least 2 options.');
            return;
        }

        const answer = quizOptions[quizAnswerIdx]?.trim() || validOptions[0];
        const newItem = {
            stem,
            options: quizOptions.map((o) => o.trim() || 'Option'),
            answer,
            topic: quizTopic.trim() || moduleTitle || `Module ${moduleIndex + 1}`,
            difficulty: quizDifficulty,
            moduleIndex,
            moduleNumber: moduleIndex + 1,
        };

        let currentItems = lines(assessment?.items).map((it: any, gIdx: number) => ({
            ...it,
            moduleIndex: getItemModuleIndex(it, gIdx),
            moduleNumber: getItemModuleIndex(it, gIdx) + 1
        }));
        if (editingItemIdx !== null && editingItemIdx >= 0) {
            currentItems[editingItemIdx] = newItem;
        } else {
            currentItems.push(newItem);
        }

        const updatedAssessment = {
            ...(assessment || {}),
            items: currentItems,
        };

        saveAssessment(updatedAssessment);
        resetForms();
        toast.success(editingItemIdx !== null ? 'Task updated!' : 'New quiz task added to module!');
    };

    const handleSavePracticalTask = () => {
        const prompt = practicalPrompt.trim();
        if (!prompt) {
            toast.warn('Please enter task instructions.');
            return;
        }

        const newPractical = {
            item: practicalTitle.trim() || `${moduleTitle || `Module ${moduleIndex + 1}`} Practical Task`,
            prompt,
            evidence: practicalEvidence.trim() || 'Submission of completed project / test output',
            threshold: practicalThreshold.trim() || 'Complete implementation',
            moduleIndex,
            moduleNumber: moduleIndex + 1,
        };

        let currentPractical = [...lines(assessment?.practicalTasks)];
        if (currentPractical.length === 0 && effectiveModuleCount > 1) {
            currentPractical = Array.from({ length: effectiveModuleCount }, (_, mIdx) => ({
                item: `Module ${mIdx + 1} Practical Assignment`,
                prompt: `Apply the core competencies learned in Module ${mIdx + 1}. Construct, document, and validate a practical implementation demonstrating mastery.`,
                evidence: `Completed assignment artifact for Module ${mIdx + 1}.`,
                threshold: '80% accuracy or complete verified assignment submission',
                moduleIndex: mIdx,
                moduleNumber: mIdx + 1
            }));
            currentPractical[moduleIndex] = newPractical;
        } else {
            currentPractical.push(newPractical);
        }

        const updatedAssessment = {
            ...(assessment || {}),
            practicalTasks: currentPractical,
        };

        saveAssessment(updatedAssessment);
        resetForms();
        toast.success('Practical task added to module!');
    };

    const handleDeleteQuizTask = (globalIdx: number) => {
        const currentItems = lines(assessment?.items)
            .map((it: any, gIdx: number) => ({
                ...it,
                moduleIndex: getItemModuleIndex(it, gIdx),
                moduleNumber: getItemModuleIndex(it, gIdx) + 1
            }))
            .filter((_, idx) => idx !== globalIdx);
        saveAssessment({
            ...(assessment || {}),
            items: currentItems,
        });
        toast.success('Task removed.');
    };

    const handleDeletePracticalTask = (pIdx: number) => {
        const currentTasks = lines(assessment?.practicalTasks).filter((_, idx) => idx !== pIdx);
        saveAssessment({
            ...(assessment || {}),
            practicalTasks: currentTasks,
        });
        toast.success('Practical task removed.');
    };

    const handleGenerateAITask = async (type: 'quiz' | 'practical') => {
        setIsGeneratingAI(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${API_BASE}/generate-module-task`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || ''}`,
                },
                body: JSON.stringify({
                    moduleTitle: moduleTitle || `Module ${moduleIndex + 1}`,
                    moduleContent: moduleContent || null,
                    taskType: type,
                    courseData,
                }),
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok || !data?.task) {
                if (handleCreditApiFailure(resp.status, data)) {
                    return;
                }
                toast.error(data?.message || 'Could not generate task with AI');
                return;
            }

            // Immediately refresh user's wallet balance across the UI
            refreshWallet().catch(() => {});

            const t = data.task;
            const creditsUsed = data.creditsDeducted ? ` (${data.creditsDeducted} credits deducted)` : '';
            if (type === 'quiz') {
                setAddingType('quiz');
                setQuizStem(t.stem || '');
                const opts = Array.isArray(t.options) && t.options.length ? t.options : ['', '', '', ''];
                while (opts.length < 4) opts.push('');
                setQuizOptions(opts.slice(0, 4));
                const ansIdx = opts.findIndex((o: string) => o.trim() === String(t.answer || '').trim());
                setQuizAnswerIdx(ansIdx >= 0 ? ansIdx : 0);
                setQuizTopic(t.topic || moduleTitle || `Module ${moduleIndex + 1}`);
                setQuizDifficulty(t.difficulty || 'Medium');
                toast.success(`AI generated quiz task!${creditsUsed} Review and click Save.`);
            } else {
                setAddingType('practical');
                setPracticalTitle(t.item || `Hands-on Deployment Challenge`);
                setPracticalPrompt(t.prompt || '');
                setPracticalEvidence(t.evidence || '');
                setPracticalThreshold(t.threshold || '80% accuracy or complete implementation');
                toast.success(`AI generated practical task!${creditsUsed} Review and click Save.`);
            }
        } catch (err: any) {
            console.error('AI generate task error:', err);
            toast.error('AI generation failed. Please check network.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleDownloadAssessment = () => {
        if (totalTasksCount === 0) {
            toast.warn('No assessment items to download.');
            return;
        }

        try {
            const currentCourseTitle = courseData?.title || 'Course';
            const currentModuleTitle = moduleTitle || `Module ${moduleIndex + 1}`;

            const itemsForPdf = (viewScope === 'all' ? allItems : moduleItemsWithIndices.map(m => m.item)).map((item: any) => ({
                stem: item.stem || '',
                options: lines(item.options).map(String),
                answer: item.answer || '',
                topic: item.topic || '',
                difficulty: item.difficulty || '',
            }));

            const pdfBlob = generateAssessmentPdfBlob({
                courseTitle: currentCourseTitle,
                moduleIndex: viewScope === 'all' ? 0 : moduleIndex,
                moduleTitle: viewScope === 'all' ? 'Complete Course Assessment (20 MCQs)' : currentModuleTitle,
                blueprint: blueprintRow,
                items: itemsForPdf,
                practicalTasks: modulePracticalTasks.map(({ task }) => ({
                    item: task.item || '',
                    prompt: task.prompt || '',
                    evidence: task.evidence || '',
                    threshold: task.threshold || '',
                })),
                legacyPracticalTask: legacyPracticalTask
                    ? {
                          prompt: legacyPracticalTask.prompt || '',
                          threshold: legacyPracticalTask.threshold || '',
                      }
                    : null,
            });

            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            const safeCourse = currentCourseTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
            const safeModule = currentModuleTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
            link.href = url;
            link.download = `${safeCourse}_Mod${moduleIndex + 1}_Assessment_MCQs.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            toast.success('Assessment PDF downloaded successfully!');
        } catch (err: any) {
            console.error('PDF generation error:', err);
            toast.error('Failed to generate PDF. Please try again.');
        }
    };

    return (
        <>

            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="group/btn flex items-center px-5 py-3 text-lime-400 hover:text-white hover:bg-lime-500/10 rounded-2xl border border-lime-500/10 hover:border-lime-500/40 transition-all font-bold text-xs uppercase tracking-widest active:scale-95 shadow-[0_10px_30px_-10px_rgba(132,204,22,0.1)]"
                title="View & Add Module Assessment MCQs for this module"
            >
                <CheckSquare size={14} className="mr-3 group-hover/btn:scale-110 transition-transform" />
                Module Assessment MCQs
                {totalTasksCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-lime-500/20 text-[10px] text-lime-300 font-black">
                        {totalTasksCount}
                    </span>
                )}
            </button>

            {isOpen &&
                createPortal(
                    <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4 sm:p-6'}`}>
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => {
                                setIsOpen(false);
                                setIsFullscreen(false);
                                resetForms();
                            }}
                        />

                        <div className={`relative z-10 flex flex-col overflow-hidden bg-[#0d121d] shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95 ${isFullscreen
                            ? 'w-full h-full max-w-none max-h-none rounded-none border-none'
                            : 'w-full max-w-3xl max-h-[90vh] rounded-3xl border border-white/10'
                            }`}>

                            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="h-5 w-5 text-lime-400" />
                                        <h3 className="text-lg font-black text-white">
                                            Module {moduleIndex + 1} Assessment MCQs
                                        </h3>
                                        <span className="rounded-full bg-lime-500/10 border border-lime-500/30 px-2.5 py-0.5 text-[11px] font-bold text-lime-300">
                                            {allItems.length >= 20 ? '20 Questions' : `${allItems.length} Questions`}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {moduleTitle || `Module ${moduleIndex + 1}`} · {allItems.length} assessment questions available across course.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsFullscreen((prev) => !prev)}
                                        className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                        title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                                        aria-label={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 className="h-4 w-4" />
                                        ) : (
                                            <Maximize2 className="h-4 w-4" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsOpen(false);
                                            setIsFullscreen(false);
                                            resetForms();
                                        }}
                                        className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-white/5 bg-black/20 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setViewScope('module')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        viewScope === 'module'
                                            ? 'bg-lime-500/20 text-lime-300 border border-lime-500/30 shadow-sm'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    Module {moduleIndex + 1} MCQs ({moduleItemsWithIndices.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewScope('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        viewScope === 'all'
                                            ? 'bg-lime-500/20 text-lime-300 border border-lime-500/30 shadow-sm'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    All Course Assessment Questions ({allItems.length})
                                </button>
                            </div>

                            <div className="overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">

                                {blueprintRow && (
                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-lime-400">
                                            Learning Competency Blueprint
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-white">{blueprintRow.item}</p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {[
                                                blueprintRow.outcome,
                                                blueprintRow.cognitiveDemand,
                                                blueprintRow.type,
                                                blueprintRow.difficulty,
                                                blueprintRow.topic,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                        {blueprintRow.evidence && (
                                            <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                                                <span className="font-semibold text-gray-400">Required Evidence: </span>
                                                {blueprintRow.evidence}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-lime-400 flex items-center gap-1.5">
                                            <FileText className="h-3.5 w-3.5" />
                                            {viewScope === 'all'
                                                ? `All Course Assessment Questions (${allItems.length})`
                                                : `Tasks & Questions in Module ${moduleIndex + 1} (${moduleItemsWithIndices.length})`}
                                        </h4>
                                    </div>

                                    {displayedItems.length === 0 && !addingType && (
                                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center">
                                            <HelpCircle className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                                            <p className="text-sm font-semibold text-gray-300">No assessment MCQs in this module yet.</p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Click "Add Quiz Task" or "Generate with AI" below to add knowledge checks and questions.
                                            </p>
                                        </div>
                                    )}

                                    {displayedItems.map(({ item, globalIdx }, localIdx) => (
                                        <div
                                            key={globalIdx}
                                            className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:border-lime-500/30 p-4 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded-md bg-lime-500/10 border border-lime-500/20 px-2 py-0.5 text-[10px] font-black text-lime-400 uppercase tracking-wider">
                                                            {viewScope === 'all'
                                                                ? `Q${globalIdx + 1} · Mod ${item.moduleNumber || ((globalIdx % Math.max(1, moduleCount)) + 1)}`
                                                                : `Quiz Q${localIdx + 1}`}
                                                        </span>
                                                        {item.difficulty && (
                                                            <span className="text-[10px] text-gray-400 font-semibold uppercase">
                                                                {item.difficulty}
                                                            </span>
                                                        )}
                                                        {item.topic && (
                                                            <span className="text-[10px] text-gray-500">
                                                                · {item.topic}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-bold text-white leading-relaxed">
                                                        {item.stem}
                                                    </p>
                                                    {lines(item.options).length > 0 && (
                                                        <ul className="mt-2 space-y-1.5 pl-1">
                                                            {lines(item.options).map((opt: unknown, oIdx: number) => {
                                                                const text = String(opt || '');
                                                                const isCorrect =
                                                                    text.trim() === String(item.answer || '').trim();
                                                                return (
                                                                    <li
                                                                        key={oIdx}
                                                                        className={`flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 ${isCorrect
                                                                            ? 'bg-lime-500/10 border border-lime-500/30 font-bold text-lime-300'
                                                                            : 'bg-white/[0.02] text-gray-300'
                                                                            }`}
                                                                    >
                                                                        <span
                                                                            className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${isCorrect
                                                                                ? 'bg-lime-500 text-black'
                                                                                : 'bg-white/10 text-gray-400'
                                                                                }`}
                                                                        >
                                                                            {String.fromCharCode(65 + oIdx)}
                                                                        </span>
                                                                        <span>{text}</span>
                                                                        {isCorrect && (
                                                                            <span className="ml-auto text-[10px] font-black uppercase text-lime-400">
                                                                                Correct Answer
                                                                            </span>
                                                                        )}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingItemIdx(globalIdx);
                                                            setAddingType('quiz');
                                                            setQuizStem(item.stem || '');
                                                            const opts = lines(item.options).map(String);
                                                            while (opts.length < 4) opts.push('');
                                                            setQuizOptions(opts.slice(0, 4));
                                                            const ansIdx = opts.findIndex(
                                                                (o) => o.trim() === String(item.answer || '').trim()
                                                            );
                                                            setQuizAnswerIdx(ansIdx >= 0 ? ansIdx : 0);
                                                            setQuizTopic(item.topic || '');
                                                            setQuizDifficulty(item.difficulty || 'Medium');
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-lime-300 rounded-lg hover:bg-white/5 transition-colors"
                                                        title="Edit this task"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteQuizTask(globalIdx)}
                                                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                                        title="Delete this task"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {modulePracticalTasks.map(({ task, idx }) => (
                                        <div
                                            key={idx}
                                            className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:border-lime-500/30 p-4 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1.5 flex-1">
                                                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                                                        Practical Assignment
                                                    </span>
                                                    {task.item && (
                                                        <p className="text-sm font-bold text-white mt-1">{task.item}</p>
                                                    )}
                                                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                                                        {task.prompt}
                                                    </p>
                                                    {task.evidence && (
                                                        <p className="text-xs text-gray-400">
                                                            <span className="font-semibold text-gray-300">Deliverable: </span>
                                                            {task.evidence}
                                                        </p>
                                                    )}
                                                    {task.threshold && (
                                                        <p className="text-xs text-lime-400 font-medium">
                                                            Pass standard: {task.threshold}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePracticalTask(idx)}
                                                    className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                                    title="Delete this practical task"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {modulePracticalTasks.length === 0 && defaultModulePracticalTask && (
                                        <div className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:border-lime-500/30 p-4 transition-all">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1.5 flex-1">
                                                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                                                        Practical Assignment
                                                    </span>
                                                    <p className="text-sm font-bold text-white mt-1">{defaultModulePracticalTask.item}</p>
                                                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                                                        {defaultModulePracticalTask.prompt}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        <span className="font-semibold text-gray-300">Deliverable: </span>
                                                        {defaultModulePracticalTask.evidence}
                                                    </p>
                                                    <p className="text-xs text-lime-400 font-medium">
                                                        Pass standard: {defaultModulePracticalTask.threshold}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {addingType === 'quiz' && (
                                    <div className="rounded-2xl border border-lime-500/40 bg-black/40 p-5 space-y-4 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-xs font-black uppercase tracking-wider text-lime-400">
                                                {editingItemIdx !== null ? 'Edit Quiz Question' : 'Add New Quiz Question'}
                                            </h5>
                                            <button
                                                type="button"
                                                onClick={resetForms}
                                                className="text-xs text-gray-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 mb-1">
                                                Question Stem:
                                            </label>
                                            <textarea
                                                value={quizStem}
                                                onChange={(e) => setQuizStem(e.target.value)}
                                                rows={2}
                                                className="w-full rounded-xl border border-gray-700 bg-gray-900/90 p-3 text-sm text-white placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                                                placeholder="e.g. Which command initializes a repository?"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 mb-2">
                                                Answer Options (Select the correct option with radio):
                                            </label>
                                            <div className="space-y-2">
                                                {quizOptions.map((opt, oIdx) => (
                                                    <div key={oIdx} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name="quizCorrectAnswer"
                                                            checked={quizAnswerIdx === oIdx}
                                                            onChange={() => setQuizAnswerIdx(oIdx)}
                                                            className="h-4 w-4 text-lime-500 focus:ring-lime-400 cursor-pointer accent-lime-500"
                                                        />
                                                        <span className="text-xs font-bold text-gray-400 w-4">
                                                            {String.fromCharCode(65 + oIdx)}.
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const updated = [...quizOptions];
                                                                updated[oIdx] = e.target.value;
                                                                setQuizOptions(updated);
                                                            }}
                                                            className="flex-1 rounded-lg border border-gray-700 bg-gray-900/90 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-lime-400 focus:outline-none"
                                                            placeholder={`Option ${String.fromCharCode(65 + oIdx)} text...`}
                                                        />
                                                        {quizAnswerIdx === oIdx && (
                                                            <span className="text-[10px] font-black uppercase text-lime-400 shrink-0">
                                                                Correct
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                                                    Topic / Category:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={quizTopic}
                                                    onChange={(e) => setQuizTopic(e.target.value)}
                                                    className="w-full rounded-lg border border-gray-700 bg-gray-900/90 px-3 py-1.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                                                    placeholder="e.g. Deployment"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                                                    Difficulty:
                                                </label>
                                                <select
                                                    value={quizDifficulty}
                                                    onChange={(e) => setQuizDifficulty(e.target.value)}
                                                    className="w-full rounded-lg border border-gray-700 bg-gray-900/90 px-3 py-1.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                                                >
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                                            <button
                                                type="button"
                                                onClick={resetForms}
                                                className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveQuizTask}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-lime-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-400 transition-all shadow-md"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                Save Question
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {addingType === 'practical' && (
                                    <div className="rounded-2xl border border-emerald-500/40 bg-black/40 p-5 space-y-4 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                                                Add Practical Assignment Task
                                            </h5>
                                            <button
                                                type="button"
                                                onClick={resetForms}
                                                className="text-xs text-gray-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 mb-1">
                                                Task Title:
                                            </label>
                                            <input
                                                type="text"
                                                value={practicalTitle}
                                                onChange={(e) => setPracticalTitle(e.target.value)}
                                                className="w-full rounded-xl border border-gray-700 bg-gray-900/90 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none"
                                                placeholder="e.g. Build and Deploy a Sample Service"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 mb-1">
                                                Instructions & Challenge Prompt:
                                            </label>
                                            <textarea
                                                value={practicalPrompt}
                                                onChange={(e) => setPracticalPrompt(e.target.value)}
                                                rows={4}
                                                className="w-full rounded-xl border border-gray-700 bg-gray-900/90 p-3 text-sm text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none"
                                                placeholder="Detail what the learner needs to do step-by-step..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                                                    Required Deliverable / Evidence:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={practicalEvidence}
                                                    onChange={(e) => setPracticalEvidence(e.target.value)}
                                                    className="w-full rounded-lg border border-gray-700 bg-gray-900/90 px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                                                    placeholder="e.g. GitHub link or live URL"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                                                    Pass Standard / Criteria:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={practicalThreshold}
                                                    onChange={(e) => setPracticalThreshold(e.target.value)}
                                                    className="w-full rounded-lg border border-gray-700 bg-gray-900/90 px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                                                    placeholder="e.g. Functional deployment"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                                            <button
                                                type="button"
                                                onClick={resetForms}
                                                className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSavePracticalTask}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-emerald-400 transition-all shadow-md"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                Save Practical Task
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!addingType && (
                                    <div className="pt-2 border-t border-white/10 space-y-3">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                            Add More Tasks to this Module:
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    resetForms();
                                                    setAddingType('quiz');
                                                }}
                                                className="inline-flex items-center gap-2 rounded-xl border border-lime-500/30 bg-lime-500/10 px-4 py-2.5 text-xs font-bold text-lime-300 hover:bg-lime-500/20 hover:text-white transition-all shadow-sm"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Quiz Task
                                            </button>


                                            <button
                                                type="button"
                                                disabled={isGeneratingAI}
                                                onClick={() => handleGenerateAITask('quiz')}
                                                className="inline-flex items-center gap-2 rounded-xl border border-lime-400/40 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 px-4 py-2.5 text-xs font-bold text-lime-300 hover:from-lime-500/30 hover:to-emerald-500/30 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                            >
                                                {isGeneratingAI ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin text-lime-400" />
                                                        Generating with AI…
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-4 w-4 text-lime-400" />
                                                        AI Generate Quiz Task
                                                    </>
                                                )}
                                            </button>


                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-white/[0.02]">
                                <button
                                    type="button"
                                    onClick={handleDownloadAssessment}
                                    disabled={totalTasksCount === 0}
                                    className="group/btn inline-flex items-center gap-2 rounded-xl border border-lime-500/30 bg-lime-500/10 px-4 py-2.5 text-xs font-bold text-lime-400 hover:bg-lime-500/20 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Download assessment MCQs as a PDF file"
                                >
                                    <Download className="h-4 w-4 text-lime-400 group-hover/btn:translate-y-0.5 transition-transform" />
                                    Download Assessment PDF
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsFullscreen(false);
                                        resetForms();
                                    }}
                                    className="rounded-xl bg-lime-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-400 transition-all shadow-md active:scale-95"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};
