import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCourseData } from './courseAPI';
import { API_BASE } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { GAMMA_THEMES } from '../utils/themes';
import type { ModuleState } from '../pages/Modules/ModuleGen';
import { hasAudience, formatAudience } from '../utils/courseHelpers';
import { INDUSTRIES, AUDIENCE_OPTIONS } from '../utils/courseHelpers';
import type { PreviewLesson, PreviewModule } from '../utils/courseTypes';
import { isStepComplete } from '../utils/courseValidation';
import { handleCreditApiFailure, handleCreditThrowable } from '../utils/creditErrors';
import { containerVariants, itemVariants, stepVariants } from './courseCreatorAnimations';
import { useCredits } from './CreditsContext';
import { ensure20AssessmentQuestions } from '../utils/defaultAssessment';
export const CourseCreatorContext = createContext<any>(null);
export const useCourseCreator = () => {
    const context = useContext(CourseCreatorContext);
    if (!context) {
        return {} as any;
    }
    return context;
};
export const CourseCreatorProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const creatorSession = (() => {
        try {
            if (sessionStorage.getItem('resetCourseData') === 'true')
                return null;
            const raw = sessionStorage.getItem('orion_creator_session');
            return raw ? JSON.parse(raw) : null;
        }
        catch {
            return null;
        }
    })();
    const [step, setStepState] = useState(() => {
        const saved = Number(creatorSession?.step);
        return [1, 2, 4, 5].includes(saved) ? saved : 1;
    });
    const setStep = (value: number | ((prev: number) => number)) => {
        setStepState((prev) => typeof value === 'function' ? value(prev) : value);
    };
    const [showValidation, setShowValidation] = useState(false);
    const { courseData, updateCourseData, resetCourseData } = useCourseData();
    const { refreshWallet } = useCredits();
    const [formStatus] = useState<'draft' | 'editing' | 'preview' | 'outcomes' | 'submitting' | 'success'>('editing');
    const [savedCourseId, setSavedCourseId] = useState<string | null>(null);
    const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isBlueprinting, setIsBlueprinting] = useState(false);
    const [courseForgeBusy, setCourseForgeBusy] = useState('');
    const [hasBlueprint, setHasBlueprint] = useState(Boolean(creatorSession?.hasBlueprint));
    const [previewModules, setPreviewModules] = useState<PreviewModule[]>(Array.isArray(creatorSession?.previewModules) ? creatorSession.previewModules : []);
    const [selectedModule, setSelectedModule] = useState<ModuleState | null>(null);
    const [selectedSlide, setSelectedSlide] = useState<ModuleState | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [isDescriptionEditable, setIsDescriptionEditable] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [isRefiningDescription, setIsRefiningDescription] = useState(false);
    const [refinePromptOpen, setRefinePromptOpen] = useState(false);
    const [refinePromptText, setRefinePromptText] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [urlError, setUrlError] = useState<string | null>(null);
    const [prefetchedContentMap, setPrefetchedContentMap] = useState<Record<number, any>>(creatorSession?.prefetchedContentMap || {});
    const [prefetchedSlidesMap, setPrefetchedSlidesMap] = useState<Record<number, any>>(creatorSession?.prefetchedSlidesMap || {});
    const [orionUrlByModule, setOrionUrlByModule] = useState<Record<number, string>>(creatorSession?.orionUrlByModule || {});
    const [generatingSlidesModuleId, setGeneratingSlidesModuleId] = useState<number | null>(null);
    const [blueprintingProgress, setBlueprintingProgress] = useState(0);
    const [completedModules, setCompletedModules] = useState(0);
    const [slideGenerationProgress, setSlideGenerationProgress] = useState(0);
    const [isBatchGenerating, setIsBatchGenerating] = useState(false);
    const [batchSlidesProgress, setBatchSlidesProgress] = useState({ completed: 0, total: 0 });
    const [batchSlidesDisplayProgress, setBatchSlidesDisplayProgress] = useState(0);
    const [batchGeneratingModuleId, setBatchGeneratingModuleId] = useState<number | null>(null);
    const [batchSelectedModuleIdForPreview, setBatchSelectedModuleIdForPreview] = useState<number | null>(null);
    const [refineProgress, setRefineProgress] = useState(0);
    const [themeFilter, setThemeFilter] = useState('All');
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [themeByModule, setThemeByModule] = useState<Record<number, string>>(creatorSession?.themeByModule || {});
    const [selectedModuleForTheme, setSelectedModuleForTheme] = useState<number | null>(null);
    const [isCustomAudience, setIsCustomAudience] = useState(false);
    const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
    const [customAudienceInput, setCustomAudienceInput] = useState('');
    const audienceDropdownRef = useRef<HTMLDivElement>(null);
    const [isCustomIndustry, setIsCustomIndustry] = useState(false);
    const [isCustomCountry, setIsCustomCountry] = useState(false);
    const [downloadingModuleId, setDownloadingModuleId] = useState<number | null>(null);
    const [isLaunchingCourse, setIsLaunchingCourse] = useState(false);
    const [isExitingArchitect, setIsExitingArchitect] = useState(false);
    const [isContinuing, setIsContinuing] = useState(false);
    const [showScrollArrow, setShowScrollArrow] = useState(false);
    const [showScrollArrowModules, setShowScrollArrowModules] = useState(false);
    const [showGenerateWarning, setShowGenerateWarning] = useState(false);
    const [highlightedModuleId, setHighlightedModuleId] = useState<number | null>(null);
    const moduleRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const scrollRefGuidance = useRef<HTMLDivElement>(null);
    const scrollRefModules = useRef<HTMLDivElement>(null);
    const notifDropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
            if (audienceDropdownRef.current && !audienceDropdownRef.current.contains(event.target as Node)) {
                setIsAudienceDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem('avatar'));
    const [userInfo, setUserInfo] = useState<{
        username: string;
        email: string;
    } | null>(null);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token)
            return;
        try {
            const res = await fetch(`${API_BASE}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        }
        catch (e) {
            console.error("Notifications fetch failed", e);
        }
    };
    const markAllRead = async () => {
        const token = localStorage.getItem('token');
        if (!token)
            return;
        try {
            const res = await fetch(`${API_BASE}/notifications/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchNotifications();
            }
        }
        catch (e) {
            console.error(e);
            toast.error("Failed to mark notifications as read");
        }
    };
    const removeAllNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token)
            return;
        try {
            const res = await fetch(`${API_BASE}/notifications`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchNotifications();
            }
        }
        catch (e) {
            console.error(e);
            toast.error("Failed to clear notifications");
        }
    };
    const removeSingleNotification = async (id: string) => {
        const token = localStorage.getItem('token');
        if (!token || !id)
            return;
        try {
            setNotifications((prev) => prev.filter((n: any) => n._id !== id));
            const res = await fetch(`${API_BASE}/notifications/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                window.dispatchEvent(new CustomEvent('notifications-updated'));
            } else {
                fetchNotifications();
            }
        }
        catch (e) {
            console.error(e);
            toast.error("Failed to remove notification");
            fetchNotifications();
        }
    };
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        const handleUpdate = () => fetchNotifications();
        window.addEventListener('notifications-updated', handleUpdate);
        return () => {
            clearInterval(interval);
            window.removeEventListener('notifications-updated', handleUpdate);
        };
    }, []);
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token)
                return;
            try {
                const res = await fetch(`${API_BASE}/user`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const user = await res.json();
                    setUserInfo({ username: user.username, email: user.email });
                    if (user.avatar) {
                        setAvatarUrl(user.avatar);
                        localStorage.setItem('avatar', user.avatar);
                    }
                }
            }
            catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };
        fetchUserProfile();
    }, []);
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('courseStatus');
        localStorage.removeItem('avatar');
        localStorage.removeItem('username');
        navigate('/login');
    };
    const handleGuidanceScroll = () => {
        if (scrollRefGuidance.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRefGuidance.current;
            setShowScrollArrow(scrollTop + clientHeight < scrollHeight - 20);
        }
    };
    const handleModulesScroll = () => {
        if (scrollRefModules.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRefModules.current;
            setShowScrollArrowModules(scrollTop + clientHeight < scrollHeight - 20);
        }
    };
    useEffect(() => {
        if ((step === 4 || step === 5) && scrollRefGuidance.current) {
            const { scrollHeight, clientHeight } = scrollRefGuidance.current;
            setShowScrollArrow(scrollHeight > clientHeight);
        }
        if (step === 4 && scrollRefModules.current) {
            const { scrollHeight, clientHeight } = scrollRefModules.current;
            setShowScrollArrowModules(scrollHeight > clientHeight);
        }
    }, [hasBlueprint, step, isBlueprinting]);
    useEffect(() => {
        let interval: any;
        if (generatingSlidesModuleId !== null) {
            setSlideGenerationProgress(0);
            interval = setInterval(() => {
                setSlideGenerationProgress(prev => {
                    if (prev < 95) {
                        const inc = Math.random() * 2 + 1;
                        return Math.min(95, prev + inc);
                    }
                    return prev;
                });
            }, 300);
        }
        else {
            setSlideGenerationProgress(0);
        }
        return () => clearInterval(interval);
    }, [generatingSlidesModuleId]);
    useEffect(() => {
        if (highlightedModuleId !== null && moduleRefs.current[highlightedModuleId] && scrollRefModules.current) {
            const timer = setTimeout(() => {
                const container = scrollRefModules.current;
                const element = moduleRefs.current[highlightedModuleId];
                if (container && element) {
                    const containerRect = container.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();
                    const relativeTop = elementRect.top - containerRect.top;
                    container.scrollTo({
                        top: container.scrollTop + relativeTop - (container.clientHeight / 2) + (element.clientHeight / 2),
                        behavior: 'smooth'
                    });
                }
                const clearTimer = setTimeout(() => {
                    setHighlightedModuleId(null);
                }, 4000);
                return () => clearTimeout(clearTimer);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [highlightedModuleId]);
    useEffect(() => {
        if (!isBlueprinting) {
            setCompletedModules(0);
            return;
        }
        const interval = setInterval(() => {
            setBlueprintingProgress(prev => {
                const total = Number(courseData.module) || 1;
                const targetPercent = Math.min(100, (completedModules / total) * 100);
                if (prev < targetPercent) {
                    return Math.min(targetPercent, prev + 2);
                }
                const nextStepTarget = Math.min(99, ((completedModules + 0.95) / total) * 100);
                if (prev < nextStepTarget) {
                    return prev + 1;
                }
                return prev;
            });
        }, 250);
        return () => clearInterval(interval);
    }, [isBlueprinting, completedModules, courseData.module]);
    useEffect(() => {
        if (!isBatchGenerating) {
            setBatchSlidesDisplayProgress(0);
            return;
        }
        const interval = setInterval(() => {
            setBatchSlidesDisplayProgress(prev => {
                const total = batchSlidesProgress.total || 1;
                const targetPercent = Math.min(100, (batchSlidesProgress.completed / total) * 100);
                if (prev < targetPercent) {
                    return Math.min(targetPercent, prev + 2);
                }
                const nextStepTarget = Math.min(99, ((batchSlidesProgress.completed + 0.95) / total) * 100);
                if (prev < nextStepTarget) {
                    return prev + 1;
                }
                return prev;
            });
        }, 250);
        return () => clearInterval(interval);
    }, [isBatchGenerating, batchSlidesProgress]);
    const moduleCredits = React.useMemo(() => {
        const n = previewModules.length;
        if (n === 0)
            return {};
        let credits: number[] = [];
        if (n <= 2) {
            const base = Math.floor(100 / n);
            credits = Array(n).fill(base);
        }
        else {
            const d = 2;
            const a = (100 - (n * (n - 1) * d) / 2) / n;
            if (a < 5) {
                const base = Math.floor(100 / n);
                credits = Array(n).fill(base);
            }
            else {
                credits = Array.from({ length: n }, (_, i) => Math.round(a + i * d));
            }
        }
        const currentSum = credits.reduce((sum, c) => sum + c, 0);
        if (currentSum !== 100) {
            credits[credits.length - 1] += (100 - currentSum);
        }
        const map: Record<number, number> = {};
        previewModules.forEach((mod, idx) => {
            map[mod.id] = credits[idx];
        });
        return map;
    }, [previewModules]);
    const navigate = useNavigate();
    const totalSteps = 5;
    useEffect(() => {
        return () => setSavedCourseId(null);
    }, []);
    useEffect(() => {
        const shouldReset = sessionStorage.getItem('resetCourseData') === 'true';
        if (shouldReset) {
            resetCourseData();
            setSavedCourseId(null);
            setStepState(1);
            setHasBlueprint(false);
            setPreviewModules([]);
            sessionStorage.removeItem('resetCourseData');
            sessionStorage.removeItem('orion_creator_session');
        }
    }, [resetCourseData]);
    useEffect(() => {
        if (sessionStorage.getItem('resetCourseData') === 'true')
            return;
        try {
            const current = JSON.parse(sessionStorage.getItem('orion_creator_session') || '{}');
            sessionStorage.setItem('orion_creator_session', JSON.stringify({
                ...current,
                step,
                hasBlueprint,
                previewModules,
                orionUrlByModule,
                prefetchedContentMap,
                prefetchedSlidesMap,
                themeByModule
            }));
        }
        catch {

        }
    }, [step, hasBlueprint, previewModules, orionUrlByModule, prefetchedContentMap, prefetchedSlidesMap, themeByModule]);
    useEffect(() => {
        const updates: any = {};
        if (!courseData.standards)
            updates.standards = 'Global (ISO/IEC)';
        if (!courseData.duration?.unit || courseData.duration.unit.toLowerCase() === 'hours') {
            if (courseData.duration?.unit !== 'Hours') {
                updates.duration = { ...courseData.duration, unit: 'Hours' };
            }
        }
        if (Object.keys(updates).length > 0)
            updateCourseData(updates);
    }, [
        courseData.standards,
        courseData.level,
        courseData.duration?.unit,
        updateCourseData
    ]);
    const goToNextStep = async () => {
        const complete = isStepComplete(step);
        if (!complete) {
            setShowValidation(true);
            if (step === 1) {
                if (!courseData.title?.trim()) {
                    toast.warn("Please enter a course title.");
                }
                else if (!hasAudience(courseData.audience)) {
                    toast.warn("Please specify your target audience.");
                }
                else if (!courseData.level) {
                    toast.warn("Please select an experience level.");
                }
                else if (!courseData.standards) {
                    toast.warn("Please select an industry standard.");
                }
                else if (courseData.standards === 'Regional' && !courseData.country) {
                    toast.warn("Please select a specific region or country.");
                }
                else if (courseData.standards === 'Industry Specific' && !courseData.industry) {
                    toast.warn("Please select an industry.");
                }
                else if (!String(courseData.courseForge?.language || '').trim() && !(Array.isArray(courseData.courseForge?.languages) && courseData.courseForge.languages.length)) {
                    toast.warn("Please select at least one language.");
                }
                else if (!String(courseData.courseForge?.purpose || '').trim()) {
                    toast.warn("Please write the primary purpose.");
                }
                else if (!String(courseData.courseForge?.approvedOutcomes || '').trim()) {
                    toast.warn("Please write the professional outcome.");
                }
            }
            else if (step === 2) {
                const wordCount = courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0;
                if (!courseData.description?.trim() || wordCount < 50) {
                    toast.warn("Description must be at least 50 words.");
                }
                else if (!courseData.duration?.value || courseData.duration.value <= 0) {
                    toast.warn("Please set a valid course duration.");
                }
                else if (!courseData.module || courseData.module <= 0) {
                    toast.warn("Please specify at least one module to generate.");
                }
            }
            else if (step === 4) {
                if (previewModules.length === 0) {
                    toast.warn("Please generate modules before continuing.");
                    return;
                }
                const forge = courseData.courseForge || {};
                const scriptReady = Boolean(forge.narrationApproved);
                const workbookReady = Boolean(forge.workbook || forge.workbookApproved);
                const assessmentApproved = Boolean(forge.assessmentApproved);
                if (!scriptReady || !workbookReady || !assessmentApproved) {
                    const missing: string[] = [];
                    if (!scriptReady) missing.push('Trainer script');
                    if (!workbookReady) missing.push('E-workbook');
                    if (!assessmentApproved) missing.push('Assessment');
                    toast.warn(`Please create and approve all Orion Production steps (${missing.join(', ')}) before continuing.`);
                    return;
                }
                const missingSlides = previewModules.some(m => !orionUrlByModule[m.id]);
                if (missingSlides) {
                    setIsContinuing(true);
                    try {
                        await triggerBatchSlideGeneration();
                    } finally {
                        setIsContinuing(false);
                    }
                    return;
                }
            }
            return;
        }
        setShowValidation(false);
        if (step < totalSteps) {
            if (step === 1) {
                await handleAutoGenerateDescription();
            }
            else if (step === 2) {
                setStep(4);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            else {
                const nextStep = step + 1;
                setStep(nextStep);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };
    const isValidUrl = (url: string) => {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        }
        catch {
            return false;
        }
    };
    const handleAddUrl = () => {
        if (!urlInput.trim())
            return;
        if (!isValidUrl(urlInput)) {
            setUrlError('Please enter a valid, genuine URL (e.g., https://example.com)');
            toast.error('Invalid URL format.');
            return;
        }
        const currentUrls = courseData.urls || [];
        if (currentUrls.includes(urlInput)) {
            setUrlError('This URL has already been added.');
            toast.warn('Duplicate URL.');
            return;
        }
        setUrlError(null);
        updateCourseData({ urls: [...currentUrls, urlInput] });
        setUrlInput('');
    };
    const handleRemoveUrl = (urlToRemove: string) => {
        const currentUrls = courseData.urls || [];
        updateCourseData({ urls: currentUrls.filter(u => u !== urlToRemove) });
    };
    const goToPrevStep = () => {
        if (isBlueprinting || hasBlueprint) {
            toast.warn("Once the course generation process begins, navigation to previous steps is not allowed.");
            return;
        }
        setShowValidation(false);
        if (step > 1) {
            if (step === 4) {
                setStep(2);
            }
            else {
                setStep(prev => prev - 1);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const handleAutoGenerateDescription = async () => {
        setIsGeneratingDescription(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const resp = await fetch(`${API_BASE}/generate-course-description`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    courseData: {
                        title: courseData.title,
                        audience: courseData.audience,
                        type: courseData.type,
                        standards: courseData.standards,
                        country: courseData.country,
                        industry: courseData.industry,
                        level: courseData.level
                    }
                })
            });
            if (resp.ok) {
                const { description } = await resp.json();
                if (description) {
                    let autoModules = 10;
                    let autoDuration = 2;
                    if (courseData.level === 'Intermediate') {
                        autoModules = 24;
                        autoDuration = 6;
                    }
                    else if (courseData.level === 'Advanced') {
                        autoModules = 64;
                        autoDuration = 16;
                    }
                    else if (courseData.level === 'Professional') {
                        autoModules = 96;
                        autoDuration = 24;
                    }
                    updateCourseData({
                        description,
                        module: autoModules,
                        duration: { value: autoDuration, unit: 'hours' },
                    });
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
            else {
                const errData = await resp.json().catch(() => ({}));
                if (!handleCreditApiFailure(resp.status, errData)) {
                    toast.error('Could not generate description automatically.');
                }
            }
        }
        catch {
            toast.error('Could not generate description. Please fill it manually.');
        }
        finally {
            setIsGeneratingDescription(false);
        }
    };
    const handleRefineDescription = async () => {
        if (!refinePromptText.trim() || !courseData.description)
            return;
        setIsRefiningDescription(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const resp = await fetch(`${API_BASE}/refine-course-description`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    currentDescription: courseData.description,
                    prompt: refinePromptText
                })
            });
            if (resp.ok) {
                const { refinedDescription } = await resp.json();
                if (refinedDescription) {
                    updateCourseData({ description: refinedDescription });
                    toast.success("Description refined successfully!");
                    setRefinePromptOpen(false);
                }
            }
            else {
                const errData = await resp.json().catch(() => ({}));
                if (!handleCreditApiFailure(resp.status, errData)) {
                    toast.error('Could not refine description.');
                }
            }
        }
        catch {
            toast.error('Error connecting to the refinement service.');
        }
        finally {
            setIsRefiningDescription(false);
            setRefinePromptText('');
        }
    };
    const patchForge = (partial: Record<string, any>) => {
        updateCourseData({
            courseForge: { ...(courseData.courseForge || {}), ...partial }
        });
    };
    const forgeRequest = async (path: string, body: any) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return null;
        }
        const resp = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
            if (!handleCreditApiFailure(resp.status, data)) {
                toast.error(data.message || 'Orion request failed');
            }
            return null;
        }
        return data;
    };
    const generateResearchDossier = async () => {
        setCourseForgeBusy('research');
        try {
            const data = await forgeRequest('/generate-research-dossier', { courseData });
            if (data?.dossier) {
                patchForge({ researchDossier: data.dossier, researchApproved: false, blueprint: null, blueprintApproved: false });
                toast.success('Research dossier is ready for review.');
            }
        }
        finally {
            setCourseForgeBusy('');
        }
    };
    const approveResearchDossier = () => {
        if (!courseData.courseForge?.researchDossier) {
            toast.error('Generate the research dossier first.');
            return;
        }
        patchForge({ researchApproved: true });
        toast.success('Research dossier approved.');
    };
    const saveResearchDossier = (dossier: any) => {
        if (!dossier)
            return;
        patchForge({ researchDossier: dossier, researchApproved: false });
        toast.success('Course scope and dossier updated.');
    };
    const generateCourseBlueprint = async () => {
        setCourseForgeBusy('blueprint');
        try {
            const data = await forgeRequest('/generate-course-blueprint', { courseData });
            if (data?.blueprint) {
                patchForge({ blueprint: data.blueprint, blueprintApproved: false });
                toast.success('Course blueprint is ready for review.');
            }
        }
        finally {
            setCourseForgeBusy('');
        }
    };
    const approveCourseBlueprint = () => {
        if (!courseData.courseForge?.blueprint) {
            toast.error('Generate the blueprint first.');
            return;
        }
        patchForge({ blueprintApproved: true });
        toast.success('Blueprint approved. Slides can be generated.');
    };
    const uploadCourseSource = async (file: File | null, meta: { title: string; level: string; text: string; forbidden: boolean; url?: string }) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setCourseForgeBusy('source');
        try {
            const form = new FormData();
            if (file)
                form.append('file', file);
            form.append('title', meta.title);
            form.append('level', meta.level);
            form.append('date', '');
            form.append('text', meta.text || '');
            form.append('url', meta.url || '');
            form.append('forbidden', meta.forbidden ? 'true' : 'false');
            const resp = await fetch(`${API_BASE}/course-sources`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: form
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                toast.error(data.message || 'Could not read that source');
                return null;
            }
            const course = data.course && typeof data.course === 'object' ? data.course : {};
            const source = data.source || {};
            const filled = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
            const audience = Array.isArray(course.audience) ? course.audience.map((item: unknown) => String(item || '').trim()).filter(Boolean) : [];
            const moduleCount = Number(course.moduleCount);
            const hours = Number(course.durationHours);
            const sources = Array.isArray(courseData.courseForge?.sources) ? courseData.courseForge.sources : [];
            const forge = { ...(courseData.courseForge || {}) };
            if (filled(course.purpose))
                forge.purpose = String(course.purpose).trim();
            if (filled(course.approvedOutcomes))
                forge.approvedOutcomes = String(course.approvedOutcomes).trim();
            if (filled(course.language)) {
                forge.language = String(course.language).trim();
                forge.languages = String(course.language).split(',').map((part: string) => part.trim()).filter(Boolean);
            }
            if (filled(course.archetype))
                forge.archetype = String(course.archetype).trim();
            if (filled(course.deliveryMode))
                forge.deliveryMode = String(course.deliveryMode).trim();
            forge.sources = [...sources, { ...source, profile: course }];
            const next: Record<string, unknown> = { courseForge: forge };
            if (filled(course.title))
                next.title = String(course.title).trim();
            if (filled(course.description))
                next.description = String(course.description).trim();
            if (audience.length)
                next.audience = audience;
            if (filled(course.level))
                next.level = String(course.level).trim();
            if (moduleCount > 0)
                next.module = Math.min(20, Math.max(1, Math.round(moduleCount)));
            if (filled(course.industry))
                next.industry = String(course.industry).trim();
            if (filled(course.country))
                next.country = String(course.country).trim();
            if (filled(course.standards))
                next.standards = String(course.standards).trim();
            else if (filled(course.country))
                next.standards = 'Regional';
            else if (filled(course.industry))
                next.standards = 'Industry Specific';
            if (filled(course.courseStyle))
                next.courseStyle = String(course.courseStyle).trim();
            if (hours > 0)
                next.duration = { value: hours, unit: 'Hours' };
            updateCourseData(next);
            toast.success('Course details imported.');
            return { source, course };
        }
        catch {
            toast.error('Could not read that source');
            return null;
        }
        finally {
            setCourseForgeBusy('');
        }
    };
    const generateNarration = async () => {
        setCourseForgeBusy('narration');
        try {
            let approved = true;
            for (const mod of previewModules) {
                const deck = prefetchedSlidesMap[mod.id];
                const slides = deck?.Slides || [];
                if (!slides.length)
                    continue;
                const data = await forgeRequest('/generate-narration', {
                    courseData,
                    moduleNumber: mod.id,
                    slides
                });
                if (!data?.slides) {
                    approved = false;
                    break;
                }
                const merged = slides.map((slide: any) => {
                    const match = data.slides.find((item: any) => Number(item.SlideNumber) === Number(slide.SlideNumber));
                    return match ? { ...slide, Transcript: match.Transcript || '', CueCard: match.CueCard || [] } : slide;
                });
                setPrefetchedSlidesMap((prev) => ({
                    ...prev,
                    [mod.id]: { ...(prev[mod.id] || {}), Slides: merged }
                }));
            }
            if (approved) {
                patchForge({ narrationApproved: true });
                toast.success('Trainer narration is ready.');
            }
        }
        finally {
            setCourseForgeBusy('');
        }
    };
    const generateAssessment = async () => {
        setCourseForgeBusy('assessment');
        try {
            const modules = previewModules.map((mod) => ({
                id: mod.id,
                title: mod.title,
                content: prefetchedContentMap[mod.id] || null
            }));
            const data = await forgeRequest('/generate-assessment', { courseData, modules });
            if (data?.assessment) {
                const completeAssessment = ensure20AssessmentQuestions(data.assessment, courseData, previewModules);
                patchForge({ assessment: completeAssessment, assessmentApproved: false });
                toast.success(`${completeAssessment.items.length} assessment questions ready for review (20 per module).`);
            }
        }
        finally {
            setCourseForgeBusy('');
        }
    };
    const approveAssessment = () => {
        if (!courseData.courseForge?.assessment) {
            toast.error('Generate the assessment first.');
            return;
        }
        patchForge({ assessmentApproved: true });
        toast.success('Assessment approved.');
    };
    const saveAssessment = (assessment: any) => {
        if (!assessment)
            return;
        patchForge({ assessment });
        toast.success('Assessment updated.');
    };
    const generateWorkbook = async () => {
        setCourseForgeBusy('workbook');
        try {
            const chapters: any[] = [];
            for (const mod of previewModules) {
                const data = await forgeRequest('/generate-workbook', {
                    courseData,
                    moduleNumber: mod.id,
                    moduleContent: prefetchedContentMap[mod.id] || null
                });
                if (!data?.workbook) {
                    return;
                }
                chapters.push({ moduleNumber: mod.id, ...data.workbook });
            }
            patchForge({ workbook: { chapters }, workbookApproved: true });
            toast.success('E-workbook chapters are ready.');
        }
        finally {
            setCourseForgeBusy('');
        }
    };
    const runCourseAudit = async () => {
        setCourseForgeBusy('audit');
        try {
            const modules = previewModules.map((mod) => ({
                id: mod.id,
                title: mod.title,
                content: prefetchedContentMap[mod.id] || null,
                slides: prefetchedSlidesMap[mod.id] || null
            }));
            const data = await forgeRequest('/audit-course', {
                courseData,
                modules,
                assessment: courseData.courseForge?.assessment || null,
                workbook: courseData.courseForge?.workbook || null
            });
            if (data?.audit) {
                patchForge({ audit: data.audit, auditDecision: data.audit.decision || 'DO NOT APPROVE' });
                toast.success(`Audit decision: ${data.audit.decision}`);
            }
        }
        finally {
            setCourseForgeBusy('');
        }
    };
    const generateOrionPreview = async () => {
        setIsBlueprinting(true);
        setHasBlueprint(false);
        setBlueprintingProgress(0);
        setCompletedModules(0);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const moduleCount = Number(courseData.module) || 0;
            const coursePayload = {
                title: courseData.title,
                description: courseData.description,
                audience: courseData.audience,
                level: courseData.level,
                standards: courseData.standards,
                country: courseData.country,
                industry: courseData.industry,
                courseStyle: courseData.courseStyle || 'Academic / Formal Style',
                courseForge: courseData.courseForge
            };
            const contentMap: Record<number, any> = {};
            const slidesMap: Record<number, any> = {};
            const preview: PreviewModule[] = [];
            const initialThemes: Record<number, string> = {};
            const modulesToGenerate = [];
            for (let i = 1; i <= moduleCount; i++) {
                const moduleTheme = GAMMA_THEMES[Math.floor(Math.random() * GAMMA_THEMES.length)].id;
                initialThemes[i] = moduleTheme;
                modulesToGenerate.push({
                    moduleNumber: i,
                    courseData: coursePayload,
                    previousModules: [],
                    themeId: moduleTheme
                });
            }
            const resp = await fetch(`${API_BASE}/generate-all-modules-draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ modules: modulesToGenerate })
            });
            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                if (handleCreditApiFailure(resp.status, errData))
                    return;
                throw new Error(errData.message || 'Module generation failed');
            }
            const { modules: generatedModules } = await resp.json();
            for (const mod of generatedModules) {
                const id = mod.moduleNumber;
                setCompletedModules(id);
                const content = mod.content;
                const slides = mod.slides;
                const nc = content ? normalizeModuleContent(content, id) : null;
                if (nc)
                    contentMap[id] = nc;
                if (slides && Array.isArray(slides.Slides) && slides.Slides.length) {
                    slidesMap[id] = { Module: `Module ${id}`, Slides: slides.Slides };
                }
                const title = nc?.Title || content?.Title || content?.title || `Module ${id}`;
                const tc = nc?.TeachingContent || content?.TeachingContent || [];
                const lessons: PreviewLesson[] = Array.isArray(tc) && tc.length > 0
                    ? tc.map((t: any, idx: number) => ({
                        id: `l${idx + 1}`,
                        title: String(t.Topics || t.title || `Lesson ${idx + 1}`).trim()
                    }))
                    : (Array.isArray(nc?.Objectives) ? nc.Objectives : []).slice(0, 5).map((obj: any, idx: number) => ({
                        id: `l${idx + 1}`,
                        title: String(obj).slice(0, 80)
                    }));
                preview.push({
                    id,
                    title: String(title).trim() || `Module ${id}`,
                    lessons: lessons.length > 0 ? lessons : [{ id: 'l1', title: 'Overview' }]
                });
            }
            setPrefetchedContentMap(prev => ({ ...prev, ...contentMap }));
            setPrefetchedSlidesMap(prev => ({ ...prev, ...slidesMap }));
            setPreviewModules(preview);
            setThemeByModule(initialThemes);
            setHasBlueprint(true);
            const currentAssessment = courseData?.courseForge?.assessment;
            const updatedAssessment = ensure20AssessmentQuestions(currentAssessment, courseData, preview);
            patchForge({ assessment: updatedAssessment });
        }
        catch (err) {
            if (!handleCreditThrowable(err)) {
                toast.error(err instanceof Error ? err.message : 'Generation failed');
            }
        }
        finally {
            setIsBlueprinting(false);
        }
    };
    const regenerateSingleModule = async (moduleId: number) => {
        setIsPreviewLoading(true);
        setHighlightedModuleId(moduleId);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const coursePayload = {
                title: courseData.title,
                description: courseData.description,
                audience: courseData.audience,
                level: courseData.level,
                standards: courseData.standards,
                country: courseData.country,
                industry: courseData.industry,
                courseStyle: courseData.courseStyle || 'Academic / Formal Style',
                courseForge: courseData.courseForge
            };
            const moduleTheme = themeByModule[moduleId] || GAMMA_THEMES[Math.floor(Math.random() * GAMMA_THEMES.length)].id;
            if (!themeByModule[moduleId]) {
                setThemeByModule(prev => ({ ...prev, [moduleId]: moduleTheme }));
            }
            const resp = await fetch(`${API_BASE}/generate-module-draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseData: coursePayload,
                    moduleNumber: moduleId,
                    previousModules: previewModules
                        .filter(m => m.id !== moduleId)
                        .map(m => ({
                            moduleNumber: m.id,
                            title: m.title,
                            lessons: m.lessons.map(l => l.title)
                        })),
                    themeId: moduleTheme
                })
            });
            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                if (handleCreditApiFailure(resp.status, errData))
                    return;
                toast.error('Failed to regenerate module');
                return;
            }
            const { content, slides } = await resp.json();
            const nc = content ? normalizeModuleContent(content, moduleId) : null;
            if (nc)
                setPrefetchedContentMap(prev => ({ ...prev, [moduleId]: nc }));
            if (slides && Array.isArray(slides.Slides) && slides.Slides.length) {
                setPrefetchedSlidesMap(prev => ({ ...prev, [moduleId]: { Module: `Module ${moduleId}`, Slides: slides.Slides } }));
            }
            const title = nc?.Title || content?.Title || content?.title || `Module ${moduleId}`;
            const tc = nc?.TeachingContent || content?.TeachingContent || [];
            const lessons: PreviewLesson[] = Array.isArray(tc) && tc.length > 0
                ? tc.map((t: any, idx: number) => ({
                    id: `l${idx + 1}`,
                    title: String(t.Topics || t.title || `Lesson ${idx + 1}`).trim()
                }))
                : (Array.isArray(nc?.Objectives) ? nc.Objectives : []).slice(0, 5).map((obj: any, idx: number) => ({
                    id: `l${idx + 1}`,
                    title: String(obj).slice(0, 80)
                }));
            setPreviewModules(prev => prev.map(m => m.id === moduleId ? { ...m, title: String(title).trim() || m.title, lessons: lessons.length > 0 ? lessons : m.lessons } : m));
            const randomTheme = GAMMA_THEMES[Math.floor(Math.random() * GAMMA_THEMES.length)].id;
            setThemeByModule(prev => ({ ...prev, [moduleId]: randomTheme }));
            setHighlightedModuleId(null);
            setTimeout(() => setHighlightedModuleId(moduleId), 50);
        }
        catch (err) {
            if (!handleCreditThrowable(err)) {
                toast.error('Regeneration failed');
            }
        }
        finally {
            setIsPreviewLoading(false);
            setRefineProgress(0);
        }
    };
    const deleteModule = (moduleId: number) => {
        if (previewModules.length <= 1) {
            toast.error('A course must have at least one module.');
            return;
        }
        const remaining = previewModules.filter(m => m.id !== moduleId);
        const reindexed = remaining.map((m, idx) => ({
            ...m,
            id: idx + 1,
        }));
        const newContentMap: Record<number, any> = {};
        const newSlidesMap: Record<number, any> = {};
        const newOrionMap: Record<number, string> = {};
        const newThemeMap: Record<number, string> = {};
        remaining.forEach((m, idx) => {
            const newId = idx + 1;
            const oldId = m.id;
            if (prefetchedContentMap[oldId]) newContentMap[newId] = prefetchedContentMap[oldId];
            if (prefetchedSlidesMap[oldId]) newSlidesMap[newId] = prefetchedSlidesMap[oldId];
            if (orionUrlByModule[oldId]) newOrionMap[newId] = orionUrlByModule[oldId];
            if (themeByModule[oldId]) newThemeMap[newId] = themeByModule[oldId];
        });
        setPrefetchedContentMap(newContentMap);
        setPrefetchedSlidesMap(newSlidesMap);
        setOrionUrlByModule(newOrionMap);
        setThemeByModule(newThemeMap);
        setPreviewModules(reindexed);
        updateCourseData({ module: reindexed.length });
        toast.success(`Module ${moduleId} deleted`);
    };
    const triggerBatchSlideGeneration = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setIsContinuing(true);
        let courseId = savedCourseId || courseData.courseId;
        if (!courseId) {
            try {
                const courseResp = await fetch(`${API_BASE}/courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ courseData })
                });
                if (!courseResp.ok) {
                    const errData = await courseResp.json().catch(() => ({}));
                    throw new Error(errData.message || 'Failed to save course');
                }
                const courseResult = await courseResp.json();
                courseId = courseResult.course?.courseId;
                if (!courseId)
                    throw new Error('No courseId returned');
                setSavedCourseId(courseId);
                updateCourseData({ courseId });
            }
            catch (err) {
                toast.error('Could not create course. Please try again.');
                setIsBatchGenerating(false);
                setIsContinuing(false);
                return;
            }
        }
        const modulesToGenerate = previewModules
            .filter(m => !orionUrlByModule[m.id])
            .map(m => ({
                moduleNumber: m.id,
                moduleContent: prefetchedContentMap[m.id],
                slideContent: prefetchedSlidesMap[m.id],
                gammaTheme: themeByModule[m.id] || 'aurora'
            }));
        if (modulesToGenerate.length === 0) {
            setIsContinuing(false);
            setStep(5);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setIsBatchGenerating(true);
        setBatchSlidesProgress({ completed: 0, total: modulesToGenerate.length });
        setBatchGeneratingModuleId(modulesToGenerate[0]?.moduleNumber || null);
        setBatchSelectedModuleIdForPreview(null);
        try {
            const newUrls: Record<number, string> = { ...orionUrlByModule };
            let completedCount = 0;
            let creditBlocked = false;
            for (const mod of modulesToGenerate) {
                setBatchGeneratingModuleId(mod.moduleNumber);
                try {
                    const resp = await fetch(`${API_BASE}/generate-module-slides-gamma`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            courseId,
                            moduleNumber: mod.moduleNumber,
                            moduleContent: mod.moduleContent,
                            slideContent: mod.slideContent,
                            gammaTheme: mod.gammaTheme
                        })
                    });
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data.gammaUrl) {
                            newUrls[mod.moduleNumber] = data.gammaUrl;
                            completedCount++;
                            setBatchSelectedModuleIdForPreview(mod.moduleNumber);
                        }
                    }
                    else {
                        const errData = await resp.json().catch(() => ({}));
                        console.error(`Module ${mod.moduleNumber} failed:`, errData);
                        if (handleCreditApiFailure(resp.status, errData)) {
                            creditBlocked = true;
                            break;
                        }
                    }
                }
                catch (err) {
                    console.error(`Module ${mod.moduleNumber} error:`, err);
                }
                setBatchSlidesProgress({ completed: completedCount, total: modulesToGenerate.length });
                setOrionUrlByModule({ ...newUrls });
            }
            if (creditBlocked) {
            }
            else if (completedCount === modulesToGenerate.length) {
                toast.success("All module slides have been generated successfully!");
            }
            else if (completedCount > 0) {
                toast.warn(`${completedCount}/${modulesToGenerate.length} slides generated. You can retry individual modules in the next step.`);
            }
            else {
                toast.error("Slide generation failed for all modules.");
            }
        }
        catch (error: any) {
            console.error('Batch slide generation error:', error);
            if (!handleCreditThrowable(error)) {
                toast.error(error.message || "An unexpected error occurred.");
            }
        }
        finally {
            setIsBatchGenerating(false);
            setBatchGeneratingModuleId(null);
            setBatchSelectedModuleIdForPreview(null);
            setIsContinuing(false);
            setStep(5);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const refineSingleModule = async (moduleId: number, prompt: string, history: {
        role: 'user' | 'assistant';
        content: string;
    }[]): Promise<string> => {
        setIsPreviewLoading(true);
        setHighlightedModuleId(moduleId);
        setRefineProgress(5);
        const progressInterval = setInterval(() => {
            setRefineProgress(prev => {
                if (prev >= 90)
                    return prev;
                return prev + Math.random() * 5;
            });
        }, 400);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return "You must be logged in to refine this module.";
            }
            const coursePayload = {
                title: courseData.title,
                description: courseData.description,
                audience: courseData.audience,
                level: courseData.level,
                standards: courseData.standards,
                country: courseData.country,
                industry: courseData.industry,
                courseStyle: courseData.courseStyle || 'Academic / Formal Style',
                courseForge: courseData.courseForge
            };
            const resp = await fetch(`${API_BASE}/generate-module-draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseData: coursePayload,
                    moduleNumber: moduleId,
                    refinePrompt: prompt,
                    previousModules: previewModules
                        .filter(m => m.id !== moduleId)
                        .map(m => ({
                            moduleNumber: m.id,
                            title: m.title,
                            lessons: m.lessons.map(l => l.title)
                        }))
                })
            });
            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                if (handleCreditApiFailure(resp.status, errData)) {
                    return "I encountered an error while trying to refine the module.";
                }
                toast.error('Failed to refine module');
                return "I encountered an error while trying to refine the module.";
            }
            const { content, slides } = await resp.json();
            setRefineProgress(100);
            const nc = content ? normalizeModuleContent(content, moduleId) : null;
            if (nc)
                setPrefetchedContentMap(prev => ({ ...prev, [moduleId]: nc }));
            if (slides && Array.isArray(slides.Slides) && slides.Slides.length) {
                setPrefetchedSlidesMap(prev => ({ ...prev, [moduleId]: { Module: `Module ${moduleId}`, Slides: slides.Slides } }));
            }
            const title = nc?.Title || content?.Title || content?.title || `Module ${moduleId}`;
            const tc = nc?.TeachingContent || content?.TeachingContent || [];
            const lessons: PreviewLesson[] = Array.isArray(tc) && tc.length > 0
                ? tc.map((t: any, idx: number) => ({
                    id: `l${idx + 1}`,
                    title: String(t.Topics || t.title || `Lesson ${idx + 1}`).trim()
                }))
                : (Array.isArray(nc?.Objectives) ? nc.Objectives : []).slice(0, 5).map((obj: any, idx: number) => ({
                    id: `l${idx + 1}`,
                    title: String(obj).slice(0, 80)
                }));
            setPreviewModules(prev => prev.map(m => m.id === moduleId ? { ...m, title: String(title).trim() || m.title, lessons: lessons.length > 0 ? lessons : m.lessons } : m));
            if (selectedModule && selectedModule.id === moduleId) {
                const updatedModule: ModuleState = {
                    ...selectedModule,
                    Content: nc || selectedModule.Content,
                    slide: slides ? { Module: `Module ${moduleId}`, Slides: slides.Slides } : selectedModule.slide
                };
                setSelectedModule(updatedModule);
            }
            setHighlightedModuleId(null);
            setTimeout(() => setHighlightedModuleId(moduleId), 50);
            return "I've successfully refined the module architecture based on your directives.";
        }
        catch (err) {
            if (!handleCreditThrowable(err)) {
                toast.error('Refinement failed');
            }
            return "Something went wrong during the refinement process.";
        }
        finally {
            clearInterval(progressInterval);
            setTimeout(() => {
                setIsPreviewLoading(false);
                setRefineProgress(0);
            }, 500);
        }
    };
    const normalizeModuleContent = (input: any, moduleId: number) => {
        if (!input || typeof input !== 'object')
            return null;
        const Title = String(input.Title || input.title || `Module ${moduleId}`);
        const Objectives = Array.isArray(input.Objectives)
            ? input.Objectives
            : Array.isArray(input.objectives) ? input.objectives : [];
        const TeachingContent = Array.isArray(input.TeachingContent)
            ? input.TeachingContent
            : Array.isArray(input.teachingContent)
                ? input.teachingContent.map((tc: any) => ({
                    Topics: tc.Topics || tc.title || '',
                    StandardsReference: tc.StandardsReference || tc.standard || 'AI Generated',
                    ContentPoints: Array.isArray(tc.ContentPoints)
                        ? tc.ContentPoints
                        : Array.isArray(tc.points)
                            ? tc.points
                            : (tc.description ? [tc.description] : [])
                }))
                : [];
        let CaseStudy = input.CaseStudy;
        if (!CaseStudy && input.caseStudy) {
            const cs = input.caseStudy;
            const questions = Array.isArray(cs.questions) ? cs.questions : [];
            const qTexts = questions.map((q: any) => q?.question || String(q));
            const answers = questions.map((q: any) => q?.modelAnswer || '');
            CaseStudy = {
                CaseStudyDescription: cs.description || cs.title || '',
                Questions: qTexts,
                ModelAnswers: answers
            };
        }
        let Quizzes = Array.isArray(input.Quizzes) ? input.Quizzes : null;
        if (!Quizzes && input.quizzes) {
            const qz = input.quizzes;
            const qs = Array.isArray(qz.questions) ? qz.questions : [];
            Quizzes = [{
                QuizDescription: qz.title || 'Module Quiz',
                Questions: qs.map((q: any) => q?.question || ''),
                Answers: qs.map((q: any) => q?.answer || '')
            }];
        }
        let VisualDescriptions = Array.isArray(input.VisualDescriptions) ? input.VisualDescriptions : null;
        if (!VisualDescriptions && input.visualDescriptions) {
            const vd = Array.isArray(input.visualDescriptions) ? input.visualDescriptions : [];
            VisualDescriptions = vd.map((v: any) => {
                if (typeof v === 'string')
                    return v;
                return v?.description || v?.title || v?.link || v?.content || '';
            }).filter(Boolean);
        }
        if (!VisualDescriptions && input.visualDescriptions && typeof input.visualDescriptions === 'object' && !Array.isArray(input.visualDescriptions)) {
            const vdObj = input.visualDescriptions;
            if (Array.isArray(vdObj.items)) {
                VisualDescriptions = vdObj.items.map((v: any) => v?.description || v?.title || v?.link || v?.content || '').filter(Boolean);
            }
            else if (vdObj.description || vdObj.title || vdObj.link) {
                VisualDescriptions = [vdObj.description || vdObj.title || vdObj.link || ''];
            }
        }
        if (VisualDescriptions === null) {
            VisualDescriptions = [];
        }
        let FurtherStudy = input.FurtherStudy;
        if (!FurtherStudy) {
            const ext = Array.isArray(input.externalLinks) ? input.externalLinks : [];
            const books = Array.isArray(input.bookReferences) ? input.bookReferences : [];
            FurtherStudy = {
                ExternalLinks: ext.map((e: any) => e?.url || e).filter(Boolean),
                BookReferences: books.map((b: any) => {
                    if (typeof b === 'string')
                        return b;
                    const parts = [b?.title, b?.author, b?.publisher, b?.year].filter(Boolean);
                    return parts.join(' - ');
                })
            };
        }
        return {
            Title,
            Objectives,
            TeachingContent,
            CaseStudy: CaseStudy || { CaseStudyDescription: '', Questions: [], ModelAnswers: [] },
            Quizzes: Quizzes || [],
            VisualDescriptions: VisualDescriptions || [],
            FurtherStudy: FurtherStudy || { ExternalLinks: [], BookReferences: [] }
        };
    };
    const openContentPreview = async (moduleId: number) => {
        setIsPreviewLoading(true);
        let courseId = savedCourseId || courseData.courseId;
        const token = localStorage.getItem('token');
        if (!courseId) {
            try {
                const courseResp = await fetch(`${API_BASE}/courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ courseData })
                });
                if (!courseResp.ok) {
                    const errData = await courseResp.json().catch(() => ({}));
                    throw new Error(errData.message || 'Failed to save course');
                }
                const courseResult = await courseResp.json();
                courseId = courseResult.course?.courseId;
                if (!courseId)
                    throw new Error('No courseId returned');
                setSavedCourseId(courseId);
                updateCourseData({ courseId });
            }
            catch {
                toast.warn('Could not create course. Please try launching first.');
                setIsPreviewLoading(false);
                return;
            }
        }
        try {
            const localContent = prefetchedContentMap[moduleId];
            if (localContent) {
                const ms: ModuleState = {
                    id: moduleId,
                    Module: `Module ${moduleId}`,
                    Content: localContent,
                    slide: { Module: `Module ${moduleId}`, Slides: Array.isArray(prefetchedSlidesMap[moduleId]?.Slides) ? prefetchedSlidesMap[moduleId].Slides : [] },
                    isGenerating: false,
                    isGenerated: true,
                    error: null,
                    viewMode: 'module'
                };
                setSelectedModule(ms);
                setIsPreviewLoading(false);
                return;
            }
            const resp = await fetch(`${API_BASE}/module-contents?courseId=${encodeURIComponent(String(courseId))}&moduleNumber=${moduleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.status === 401 || resp.status === 403) {
                localStorage.removeItem('token');
                toast.error('Session expired. Please login again.');
                navigate('/login');
                setIsPreviewLoading(false);
                return;
            }
            if (resp.ok) {
                const docs = await resp.json();
                console.log('[DEBUG] module-contents GET result (content)', docs);
                const latest = Array.isArray(docs) && docs.length ? docs[0] : null;
                if (latest) {
                    const baseModuleNumber = Number(latest.moduleNumber);
                    let nc = null as any;
                    if (latest.content && typeof latest.content === 'object') {
                        nc = normalizeModuleContent(latest.content, baseModuleNumber);
                    }
                    else {
                        nc = normalizeModuleContent(latest, baseModuleNumber);
                    }
                    if (nc) {
                        setPrefetchedContentMap(prev => ({ ...prev, [baseModuleNumber]: nc }));
                    }
                    if (latest.gammaUrl && typeof latest.gammaUrl === 'string') {
                        setOrionUrlByModule(prev => ({ ...prev, [baseModuleNumber]: latest.gammaUrl }));
                    }
                    const ms: ModuleState = {
                        id: baseModuleNumber,
                        Module: `Module ${baseModuleNumber}`,
                        Content: nc || {
                            Title: '',
                            Objectives: [],
                            TeachingContent: [],
                            CaseStudy: { CaseStudyDescription: '', Questions: [], ModelAnswers: [] },
                            Quizzes: [],
                            VisualDescriptions: [],
                            FurtherStudy: { ExternalLinks: [], BookReferences: [] }
                        },
                        slide: { Module: `Module ${baseModuleNumber}`, Slides: Array.isArray(latest.slides) ? latest.slides : [] },
                        isGenerating: false,
                        isGenerated: true,
                        error: null,
                        viewMode: 'module'
                    };
                    setSelectedModule(ms);
                    setIsPreviewLoading(false);
                    return;
                }
            }
            console.warn('[DEBUG] Content generation returned empty; using blueprint fallback');
            const blueprint = previewModules.find(m => m.id === moduleId);
            if (blueprint) {
                setSelectedModule({
                    id: moduleId,
                    Module: `Module ${moduleId}`,
                    Content: {
                        Title: blueprint.title || `Module ${moduleId}`,
                        Objectives: blueprint.lessons.map(l => `Objective: ${l.title}`),
                        TeachingContent: blueprint.lessons.map(l => ({
                            Topics: l.title,
                            StandardsReference: 'AI Generated',
                            ContentPoints: ['Overview', 'Key Points', 'Examples']
                        })),
                        CaseStudy: { CaseStudyDescription: '', Questions: [], ModelAnswers: [] },
                        Quizzes: [],
                        VisualDescriptions: [],
                        FurtherStudy: { ExternalLinks: [], BookReferences: [] }
                    },
                    slide: { Module: `Module ${moduleId}`, Slides: [] },
                    isGenerating: false,
                    isGenerated: false,
                    error: null,
                    viewMode: 'module'
                });
                setIsPreviewLoading(false);
                return;
            }
        }
        catch (error) {
            console.error('Failed to fetch module content:', error);
            toast.error('Failed to fetch module content.');
        }
        finally {
            setIsPreviewLoading(false);
        }
    };
    const downloadModulePPTX = async (moduleId: number) => {
        try {
            setDownloadingModuleId(moduleId);
            const token = localStorage.getItem('token');
            const courseId = savedCourseId || courseData.courseId;
            if (!courseId || !token) {
                toast.warn("Course must be saved or launched before downloading PPTX.");
                setDownloadingModuleId(null);
                return;
            }
            const toastId = toast.loading("Preparing your PPTX for download...");
            const resp = await fetch(`${API_BASE}/courses/${courseId}/modules/${moduleId}/download-pptx`, { headers: { Authorization: `Bearer ${token}` } });
            if (!resp.ok) {
                toast.dismiss(toastId);
                const err = await resp.json().catch(() => ({}));
                if (handleCreditApiFailure(resp.status, err))
                    return;
                throw new Error(err.message || 'Failed to download PPTX');
            }
            const blob = await resp.blob();
            toast.dismiss(toastId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${courseData.title || 'Course'}_Module_${moduleId}.pptx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        catch (e: any) {
            console.error('Download error:', e);
            if (!handleCreditThrowable(e)) {
                toast.error(e.message || 'Failed to download PPTX');
            }
        }
        finally {
            setDownloadingModuleId(null);
        }
    };
    const handleGenerateSlidesOrion = async (moduleId: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const slideContent = prefetchedSlidesMap[moduleId];
        const moduleContent = prefetchedContentMap[moduleId];
        if (!slideContent && !moduleContent) {
            toast.warn('Generate modules first (Orion creates content + slides), then try Generate Slides.');
            return;
        }
        setGeneratingSlidesModuleId(moduleId);
        try {
            let courseId = savedCourseId || courseData.courseId;
            if (!courseId) {
                const courseResp = await fetch(`${API_BASE}/courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ courseData })
                });
                if (!courseResp.ok) {
                    const errData = await courseResp.json().catch(() => ({}));
                    toast.error(errData.message || 'Could not create course before generating slides.');
                    return;
                }
                const result = await courseResp.json();
                courseId = result.course?.courseId;
                if (!courseId) {
                    toast.error('Could not resolve courseId for slide generation.');
                    return;
                }
                setSavedCourseId(courseId);
                updateCourseData({ courseId });
            }
            const resp = await fetch(`${API_BASE}/generate-module-slides-gamma`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseId: courseId || undefined,
                    moduleNumber: moduleId,
                    slideContent: slideContent || undefined,
                    moduleContent: moduleContent || undefined,
                    gammaTheme: themeByModule[moduleId] || courseData.orionTheme || 'aurora',
                    courseStyle: courseData.courseStyle || 'Academic / Formal Style',
                    courseForge: courseData.courseForge
                })
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                if (handleCreditApiFailure(resp.status, data))
                    return;
                toast.error(data.message || 'Slide generation failed');
                return;
            }
            if (data.gammaUrl) {
                setOrionUrlByModule(prev => ({ ...prev, [moduleId]: data.gammaUrl }));
            }
            else {
            }
        }
        catch (err) {
            if (!handleCreditThrowable(err)) {
                toast.error(err instanceof Error ? err.message : 'Slide generation failed');
            }
        }
        finally {
            setGeneratingSlidesModuleId(null);
        }
    };
    const openSlidesPreview = async (moduleId: number, showOrion = false) => {
        setIsPreviewLoading(true);
        let courseId = savedCourseId || courseData.courseId;
        const token = localStorage.getItem('token');
        if (!courseId) {
            try {
                const courseResp = await fetch(`${API_BASE}/courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ courseData })
                });
                if (!courseResp.ok) {
                    const errData = await courseResp.json().catch(() => ({}));
                    throw new Error(errData.message || 'Failed to save course');
                }
                const courseResult = await courseResp.json();
                courseId = courseResult.course?.courseId;
                if (!courseId)
                    throw new Error('No courseId returned');
                setSavedCourseId(courseId);
                updateCourseData({ courseId });
            }
            catch {
                toast.warn('Could not create course. Please try launching first.');
                setIsPreviewLoading(false);
                return;
            }
        }
        try {
            const localSlides = prefetchedSlidesMap[moduleId];
            if (localSlides) {
                const ms: ModuleState = {
                    id: Number(moduleId),
                    Module: `Module ${moduleId}`,
                    Content: {
                        Title: '',
                        Objectives: [],
                        TeachingContent: [],
                        CaseStudy: { CaseStudyDescription: '', Questions: [], ModelAnswers: [] },
                        Quizzes: [],
                        VisualDescriptions: [],
                        FurtherStudy: { ExternalLinks: [], BookReferences: [] }
                    },
                    slide: { Module: `Module ${moduleId}`, Slides: Array.isArray(localSlides.Slides) ? localSlides.Slides : [] },
                    isGenerating: false,
                    isGenerated: true,
                    orionUrl: orionUrlByModule[moduleId],
                    showOrion,
                    error: null,
                    viewMode: 'slide'
                };
                setSelectedSlide(ms);
                setIsPreviewLoading(false);
                return;
            }
            const resp = await fetch(`${API_BASE}/module-contents?courseId=${encodeURIComponent(String(courseId))}&moduleNumber=${moduleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.status === 401 || resp.status === 403) {
                localStorage.removeItem('token');
                toast.error('Session expired. Please login again.');
                navigate('/login');
                setIsPreviewLoading(false);
                return;
            }
            if (resp.ok) {
                const docs = await resp.json();
                const latest = Array.isArray(docs) && docs.length ? docs[0] : null;
                if (latest) {
                    if (latest.gammaUrl && typeof latest.gammaUrl === 'string') {
                        setOrionUrlByModule(prev => ({ ...prev, [Number(latest.moduleNumber)]: latest.gammaUrl }));
                    }
                    const contentFromLatest = latest.content && typeof latest.content === 'object' ? latest.content : latest;
                    const ms: ModuleState = {
                        id: Number(latest.moduleNumber),
                        Module: `Module ${latest.moduleNumber}`,
                        Content: {
                            Title: String(contentFromLatest.Title || contentFromLatest.title || ''),
                            Objectives: Array.isArray(contentFromLatest.Objectives) ? contentFromLatest.Objectives :
                                Array.isArray(contentFromLatest.objectives) ? contentFromLatest.objectives : [],
                            TeachingContent: Array.isArray(contentFromLatest.TeachingContent) ? contentFromLatest.TeachingContent :
                                Array.isArray(contentFromLatest.teachingContent) ? contentFromLatest.teachingContent : [],
                            CaseStudy: contentFromLatest.CaseStudy || contentFromLatest.caseStudy || { CaseStudyDescription: '', Questions: [], ModelAnswers: [] },
                            Quizzes: Array.isArray(contentFromLatest.Quizzes) ? contentFromLatest.Quizzes :
                                Array.isArray(contentFromLatest.quizzes) ? contentFromLatest.quizzes : [],
                            VisualDescriptions: Array.isArray(contentFromLatest.VisualDescriptions) ? contentFromLatest.VisualDescriptions :
                                Array.isArray(contentFromLatest.visualDescriptions) ? contentFromLatest.visualDescriptions : [],
                            FurtherStudy: contentFromLatest.FurtherStudy || contentFromLatest.furtherStudy || { ExternalLinks: [], BookReferences: [] }
                        },
                        slide: {
                            Module: `Module ${latest.moduleNumber}`,
                            Slides: Array.isArray(latest.slides?.Slides) ? latest.slides.Slides :
                                Array.isArray(latest.slides) ? latest.slides : []
                        },
                        isGenerating: false,
                        isGenerated: true,
                        orionUrl: latest.gammaUrl || orionUrlByModule[Number(latest.moduleNumber)],
                        showOrion,
                        error: null,
                        viewMode: 'slide'
                    };
                    setSelectedSlide(ms);
                    setIsPreviewLoading(false);
                    return;
                }
            }
            console.warn('[DEBUG] Slides generation returned empty; using blueprint fallback');
            const blueprint = previewModules.find(m => m.id === moduleId);
            if (blueprint) {
                setSelectedSlide({
                    id: moduleId,
                    Module: `Module ${moduleId}`,
                    Content: {
                        Title: blueprint.title || `Module ${moduleId}`,
                        Objectives: [],
                        TeachingContent: [],
                        CaseStudy: { CaseStudyDescription: '', Questions: [], ModelAnswers: [] },
                        Quizzes: [],
                        VisualDescriptions: [],
                        FurtherStudy: { ExternalLinks: [], BookReferences: [] }
                    },
                    slide: {
                        Module: `Module ${moduleId}`,
                        Slides: blueprint.lessons.map((l, i) => ({
                            SlideNumber: i + 1,
                            title: l.title,
                            VisualPrompt: '',
                            Content: ''
                        }))
                    } as any,
                    isGenerating: false,
                    isGenerated: false,
                    error: null,
                    viewMode: 'slide'
                });
                setIsPreviewLoading(false);
                return;
            }
        }
        catch {
            toast.error('Failed to fetch module slides.');
        }
        finally {
            setIsPreviewLoading(false);
        }
    };
    const handleLaunchCourse = async () => {
        const forge = courseData.courseForge;
        if (forge?.auditDecision === 'DO NOT APPROVE') {
            toast.error('Quality audit did not approve this course. Correct it and run the audit again.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setIsLaunchingCourse(true);
        try {
            const mCount = courseData.module ?? 0;
            const hasDraft = mCount > 0 && previewModules.length >= mCount &&
                previewModules.every(m => prefetchedContentMap[m.id] || prefetchedSlidesMap[m.id]?.Slides?.length || orionUrlByModule[m.id]);
            if (hasDraft) {
                const completeAssessment = ensure20AssessmentQuestions(
                    courseData.courseForge?.assessment,
                    courseData,
                    previewModules
                );
                const finalCourseData = {
                    ...courseData,
                    courseForge: {
                        ...(courseData.courseForge || {}),
                        assessment: completeAssessment
                    }
                };
                let courseId = savedCourseId || courseData.courseId;
                if (!courseId) {
                    const courseResp = await fetch(`${API_BASE}/courses`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ courseData: finalCourseData })
                    });
                    if (!courseResp.ok) {
                        const errData = await courseResp.json().catch(() => ({}));
                        if (handleCreditApiFailure(courseResp.status, errData))
                            return;
                        toast.error(`Course could not be launched successfully. ${errData.message || 'Please try again.'}`);
                        return;
                    }
                    const result = await courseResp.json();
                    courseId = result.course?.courseId;
                    if (courseId) {
                        setSavedCourseId(courseId);
                        updateCourseData({ courseId });
                    }
                }
                if (!courseId) {
                    toast.error('Course could not be launched successfully. Could not create course record.');
                    return;
                }
                for (const mod of previewModules) {
                    const content = prefetchedContentMap[mod.id];
                    const slides = prefetchedSlidesMap[mod.id];
                    if (!content && !slides?.Slides?.length)
                        continue;
                    const saveResp = await fetch(`${API_BASE}/module-contents`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                            courseId,
                            moduleNumber: mod.id,
                            content: content || undefined,
                            slides: slides || undefined,
                            gammaUrl: orionUrlByModule[mod.id] || undefined
                        })
                    });
                    if (!saveResp.ok) {
                        const errData = await saveResp.json().catch(() => ({}));
                        if (handleCreditApiFailure(saveResp.status, errData))
                            return;
                        toast.error(`Course could not be launched successfully. Module ${mod.id} failed to save.`);
                        return;
                    }
                }
                toast.success('Course launched and saved.');
                refreshWallet().catch(() => { });
                fetch(`${API_BASE}/notifications/course-launched`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ courseTitle: courseData.title }),
                }).catch(() => { });
                resetCourseData();
                setSavedCourseId(null);
                navigate('/course-dashboard', { replace: true });
                return;
            }
            await handleGenerateContent('content');
        } catch (err: any) {
            if (!handleCreditThrowable(err)) {
                toast.error(`Course could not be launched successfully. ${err?.message || 'An unexpected error occurred. Please try again.'}`);
            }
        } finally {
            setIsLaunchingCourse(false);
        }
    };
    const handleExitArchitect = async () => {
        setIsExitingArchitect(true);
        const courseId = savedCourseId || courseData.courseId;
        if (courseId) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    await fetch(`${API_BASE}/courses/${courseId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            }
            catch (e) {
                console.error("Cleanup error:", e);
            }
        }
        resetCourseData();
        setSavedCourseId(null);
        setIsExitingArchitect(false);
        navigate('/course-dashboard');
    };
    const handleGenerateContent = async (mode: 'slides' | 'content') => {
        if (mode === 'slides')
            setIsGeneratingSlides(true);
        else
            setIsGeneratingContent(true);
        const startTime = Date.now();
        const MINIMUM_LOADING_TIME = 1000;
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            let courseId = savedCourseId || courseData.courseId;
            if (!courseId) {
                const courseResp = await fetch(`${API_BASE}/courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ courseData })
                });
                if (courseResp.status === 401 || courseResp.status === 403) {
                    localStorage.removeItem('token');
                    toast.error('Session expired. Please login again.');
                    navigate('/login');
                    return;
                }
                if (!courseResp.ok) {
                    const errData = await courseResp.json().catch(() => ({}));
                    console.error('Save course error details:', errData);
                    if (handleCreditApiFailure(courseResp.status, errData))
                        return;
                    throw new Error(errData.message || 'Failed to save course');
                }
                const courseResult = await courseResp.json();
                courseId = courseResult.course?.courseId;
                if (!courseId) {
                    throw new Error('No courseId returned');
                }
                setSavedCourseId(courseId);
                updateCourseData({ courseId });
            }
            const mCount = courseData.module ?? 0;
            for (let i = 1; i <= mCount; i++) {
                const bodyPrompt: any = {};
                if (mode === 'content') {
                    bodyPrompt.prompt1 = `Create detailed content for Module [${i}] of the course titled "${courseData.title}". Audience: "${formatAudience(courseData.audience)}". Course type: "${courseData.type}". Teaching Style: "${courseData.courseStyle || 'Academic / Formal Style'}" (Ensure the module output, teaching context, case studies, and quiz questions deeply reflect this specific style. e.g. for storytelling use narrative flow, for scenario-based use fictional characters/scenarios throughout the content). Standards: "${courseData.standards}". Description: "${courseData.description}". Include objectives, teaching content with standards references, a case study with questions and model answers, quizzes with questions and answers, visual descriptions, and relevant external links or book references for further study. Respond ONLY with a valid JSON object matching the expected module content schema.`;
                }
                try {
                    const chatResp = await fetch(`${API_BASE}/chat`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(bodyPrompt),
                    });
                    if (chatResp.status === 401 || chatResp.status === 403) {
                        localStorage.removeItem('token');
                        toast.error('Session expired. Please login again.');
                        navigate('/login');
                        return;
                    }
                    if (chatResp.ok) {
                        const result = await chatResp.json();
                        let content = result && typeof result.reply1 === 'object' ? result.reply1 : null;
                        console.log('content:', content);
                        if (content && !content.Title && content.rawText) {
                            content = {
                                Title: `Module ${i}`,
                                Objectives: [],
                                TeachingContent: [
                                    {
                                        Topics: "Generated Module Content",
                                        StandardsReference: "AI Generated",
                                        ContentPoints: [content.rawText]
                                    }
                                ],
                                CaseStudy: {
                                    CaseStudyDescription: "",
                                    Questions: [],
                                    ModelAnswers: []
                                },
                                Quizzes: [],
                                VisualDescriptions: [],
                                FurtherStudy: {
                                    ExternalLinks: [],
                                    BookReferences: []
                                }
                            };
                        }
                        else if (content && !content.Title) {
                            content = normalizeModuleContent(content, i);
                        }
                        if (content) {
                            content = normalizeModuleContent(content, i);
                        }
                        const payload: any = {
                            courseId,
                            moduleNumber: i
                        };
                        if (mode === 'content') {
                            if (content)
                                payload.content = content;
                        }
                        if (payload.content || payload.slides) {
                            const saveResponse = await fetch(`${API_BASE}/module-contents`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(payload)
                            });
                            if (!saveResponse.ok) {
                                const errorData = await saveResponse.json().catch(() => ({}));
                                console.error(`Failed to save module ${i}:`, saveResponse.status, errorData);
                                throw new Error(`Failed to save module ${i}: ${errorData.message || saveResponse.statusText}`);
                            }
                            const saveResult = await saveResponse.json();
                            console.log(`Module ${i} saved successfully:`, saveResult);
                        }
                    }
                }
                catch (err) {
                    if (handleCreditThrowable(err))
                        return;
                    console.error(`Failed to generate content for module ${i}`, err);
                }
            }
            if (mode === 'content') {
                const elapsed = Date.now() - startTime;
                if (elapsed < MINIMUM_LOADING_TIME) {
                    await new Promise(resolve => setTimeout(resolve, MINIMUM_LOADING_TIME - elapsed));
                }
                resetCourseData();
                setSavedCourseId(null);
                setIsGeneratingContent(false);
                setTimeout(() => {
                    navigate('/course-dashboard', { replace: true });
                }, 0);
            }
            else {
                toast.success('Slides generated successfully!');
                setIsGeneratingSlides(false);
                refreshWallet().catch(() => { });
            }
        }
        catch (error) {
            console.error('Generation failed:', error);
            setIsGeneratingSlides(false);
            setIsGeneratingContent(false);
            navigate('/course-dashboard', { replace: true });
        }
    };
    const isStepComplete = (s: number) => {
        switch (s) {
            case 1: {
                const forge = courseData.courseForge || {};
                const languageList = Array.isArray(forge.languages) && forge.languages.length
                    ? forge.languages
                    : String(forge.language || '').split(',').map((part: string) => part.trim()).filter(Boolean);
                const baseComplete = !!(courseData.title?.trim() && hasAudience(courseData.audience) && courseData.level && courseData.standards && String(forge.purpose || '').trim() && String(forge.approvedOutcomes || '').trim() && languageList.length);
                if (courseData.standards === 'Regional') {
                    return baseComplete && !!courseData.country;
                }
                if (courseData.standards === 'Industry Specific') {
                    return baseComplete && !!courseData.industry;
                }
                return baseComplete;
            }
            case 2: {
                const wordCount = courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0;
                return !!(wordCount >= 50 && (courseData.duration?.value ?? 0) > 0 && (courseData.module ?? 0) > 0);
            }
            case 3:
                return true;
            case 4: {
                const forge = courseData?.courseForge || {};
                const scriptReady = Boolean(forge.narrationApproved);
                const workbookReady = Boolean(forge.workbook || forge.workbookApproved);
                const assessmentApproved = Boolean(forge.assessmentApproved);
                const forgeComplete = scriptReady && workbookReady && assessmentApproved;
                return previewModules.length > 0 && forgeComplete && Object.keys(orionUrlByModule).length === previewModules.length;
            }
            default:
                return true;
        }
    };
    if (formStatus === 'outcomes') {
    }
    const handleStepClick = (targetStep: number) => {
        if (targetStep === step)
            return;
        if (targetStep === 3)
            return;
        if (targetStep < step) {
            if (isBlueprinting || hasBlueprint) {
                toast.warn("Once the course is generated you cannot navigate to previous steps.");
                return;
            }
            setStep(targetStep);
        }
        else {
            let canProceed = true;
            for (let i = step; i < targetStep; i++) {
                if (!isStepComplete(i)) {
                    setShowValidation(true);
                    canProceed = false;
                    break;
                }
            }
            if (canProceed)
                setStep(targetStep);
        }
    };
    return (<CourseCreatorContext.Provider value={{
        step,
        setStep,
        showValidation,
        setShowValidation,
        courseData,
        updateCourseData,
        resetCourseData,
        formStatus,
        savedCourseId,
        setSavedCourseId,
        isGeneratingSlides,
        setIsGeneratingSlides,
        isGeneratingContent,
        setIsGeneratingContent,
        isBlueprinting,
        setIsBlueprinting,
        hasBlueprint,
        setHasBlueprint,
        previewModules,
        setPreviewModules,
        selectedModule,
        setSelectedModule,
        selectedSlide,
        setSelectedSlide,
        isPreviewLoading,
        setIsPreviewLoading,
        isGeneratingDescription,
        setIsGeneratingDescription,
        isDescriptionEditable,
        setIsDescriptionEditable,
        isDescriptionModalOpen,
        setIsDescriptionModalOpen,
        isRefiningDescription,
        setIsRefiningDescription,
        refinePromptOpen,
        setRefinePromptOpen,
        refinePromptText,
        setRefinePromptText,
        urlInput,
        setUrlInput,
        urlError,
        setUrlError,
        prefetchedContentMap,
        setPrefetchedContentMap,
        prefetchedSlidesMap,
        setPrefetchedSlidesMap,
        orionUrlByModule,
        setOrionUrlByModule,
        generatingSlidesModuleId,
        setGeneratingSlidesModuleId,
        blueprintingProgress,
        setBlueprintingProgress,
        completedModules,
        setCompletedModules,
        slideGenerationProgress,
        setSlideGenerationProgress,
        isBatchGenerating,
        setIsBatchGenerating,
        batchSlidesProgress,
        setBatchSlidesProgress,
        batchSlidesDisplayProgress,
        setBatchSlidesDisplayProgress,
        batchGeneratingModuleId,
        setBatchGeneratingModuleId,
        batchSelectedModuleIdForPreview,
        setBatchSelectedModuleIdForPreview,
        refineProgress,
        setRefineProgress,
        themeFilter,
        setThemeFilter,
        isThemeModalOpen,
        setIsThemeModalOpen,
        themeByModule,
        setThemeByModule,
        selectedModuleForTheme,
        setSelectedModuleForTheme,
        isCustomAudience,
        setIsCustomAudience,
        isAudienceDropdownOpen,
        setIsAudienceDropdownOpen,
        customAudienceInput,
        setCustomAudienceInput,
        audienceDropdownRef,
        isCustomIndustry,
        setIsCustomIndustry,
        isCustomCountry,
        setIsCustomCountry,
        downloadingModuleId,
        setDownloadingModuleId,
        showScrollArrow,
        setShowScrollArrow,
        showScrollArrowModules,
        setShowScrollArrowModules,
        showGenerateWarning,
        setShowGenerateWarning,
        highlightedModuleId,
        setHighlightedModuleId,
        moduleRefs,
        scrollRefGuidance,
        scrollRefModules,
        notifDropdownRef,
        avatarUrl,
        setAvatarUrl,
        userInfo,
        setUserInfo,
        notifOpen,
        setNotifOpen,
        notifications,
        setNotifications,
        containerVariants,
        itemVariants,
        stepVariants,
        navigate,
        totalSteps,
        moduleCredits,
        fetchNotifications,
        markAllRead,
        removeAllNotifications,
        removeSingleNotification,
        handleLogout,
        handleGuidanceScroll,
        handleModulesScroll,
        goToNextStep,
        isValidUrl,
        handleAddUrl,
        handleRemoveUrl,
        goToPrevStep,
        handleAutoGenerateDescription,
        handleRefineDescription,
        generateOrionPreview,
        generateResearchDossier,
        approveResearchDossier,
        saveResearchDossier,
        generateCourseBlueprint,
        approveCourseBlueprint,
        uploadCourseSource,
        generateNarration,
        generateAssessment,
        approveAssessment,
        saveAssessment,
        generateWorkbook,
        runCourseAudit,
        courseForgeBusy,
        regenerateSingleModule,
        triggerBatchSlideGeneration,
        refineSingleModule,
        normalizeModuleContent,
        openContentPreview,
        downloadModulePPTX,
        handleGenerateSlidesOrion,
        openSlidesPreview,
        handleLaunchCourse,
        isLaunchingCourse,
        handleExitArchitect,
        isExitingArchitect,
        isContinuing,
        setIsContinuing,
        handleGenerateContent,
        isStepComplete,
        handleStepClick,
        hasAudience,
        formatAudience,
        AUDIENCE_OPTIONS,
        INDUSTRIES,
        GAMMA_THEMES,
        deleteModule
    }}>
        {children}
    </CourseCreatorContext.Provider>);
};
