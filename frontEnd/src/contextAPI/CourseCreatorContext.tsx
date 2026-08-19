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
import { isStepComplete } from '../utils/courseValidation'

export const CourseCreatorContext = createContext<any>(null);

export const useCourseCreator = () => {
    const context = useContext(CourseCreatorContext);
    if (!context) {
        throw new Error('useCourseCreator must be used inside CourseCreatorProvider');
    }
    return context;
};

export const CourseCreatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 50, filter: 'blur(10px)', scale: 0.95 },
        visible: {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 20,
                mass: 1
            }
        },
        exit: {
            opacity: 0,
            x: -50,
            filter: 'blur(10px)',
            scale: 0.95,
            transition: {
                duration: 0.4,
                ease: "anticipate" as const
            }
        }
    };

    const [step, setStep] = useState(1);
    const [showValidation, setShowValidation] = useState(false);
    const { courseData, updateCourseData, resetCourseData } = useCourseData();
    const [formStatus] = useState<'draft' | 'editing' | 'preview' | 'outcomes' | 'submitting' | 'success'>('editing');
    const [savedCourseId, setSavedCourseId] = useState<string | null>(null);
    const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isBlueprinting, setIsBlueprinting] = useState(false);
    const [hasBlueprint, setHasBlueprint] = useState(false);
    const [previewModules, setPreviewModules] = useState<PreviewModule[]>([]);
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
    const [prefetchedContentMap, setPrefetchedContentMap] = useState<Record<number, any>>({});
    const [prefetchedSlidesMap, setPrefetchedSlidesMap] = useState<Record<number, any>>({});
    const [orionUrlByModule, setOrionUrlByModule] = useState<Record<number, string>>({});
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
    const [themeByModule, setThemeByModule] = useState<Record<number, string>>({});
    const [selectedModuleForTheme, setSelectedModuleForTheme] = useState<number | null>(null);
    const [isCustomAudience, setIsCustomAudience] = useState(false);
    const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
    const [customAudienceInput, setCustomAudienceInput] = useState('');
    const audienceDropdownRef = useRef<HTMLDivElement>(null);
    const [isCustomIndustry, setIsCustomIndustry] = useState(false);
    const [isCustomCountry, setIsCustomCountry] = useState(false);
    const [downloadingModuleId, setDownloadingModuleId] = useState<number | null>(null);
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
    const [userInfo, setUserInfo] = useState<{ username: string; email: string } | null>(null);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');

        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) {
            console.error("Notifications fetch failed", e);
        }
    };

    const markAllRead = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/notifications/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchNotifications();
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to mark notifications as read");
        }
    };

    const removeAllNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/notifications`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchNotifications();
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to clear notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
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
            } catch (error) {
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
        } else {
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
        if (n === 0) return {};

        let credits: number[] = [];
        if (n <= 2) {
            const base = Math.floor(100 / n);
            credits = Array(n).fill(base);
        } else {
            const d = 2; // increment
            const a = (100 - (n * (n - 1) * d) / 2) / n;

            if (a < 5) {
                const base = Math.floor(100 / n);
                credits = Array(n).fill(base);
            } else {
                credits = Array.from({ length: n }, (_, i) => Math.round(a + i * d));
            }
        }

        // Adjust last one to ensure 100%
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
            sessionStorage.removeItem('resetCourseData');
        }
    }, [resetCourseData]);

    useEffect(() => {
        const updates: any = {};
        if (!courseData.standards) updates.standards = 'Global (ISO/IEC)';
        // Use a case-insensitive check to avoid infinite loops and unnecessary updates
        if (!courseData.duration?.unit || courseData.duration.unit.toLowerCase() === 'hours') {
            if (courseData.duration?.unit !== 'Hours') {
                updates.duration = { ...courseData.duration, unit: 'Hours' };
            }
        }
        if (Object.keys(updates).length > 0) updateCourseData(updates);
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
                } else if (!hasAudience(courseData.audience)) {
                    toast.warn("Please specify your target audience.");
                } else if (!courseData.level) {
                    toast.warn("Please select an experience level.");
                } else if (courseData.standards === 'Regional (EU/US Standards)' && !courseData.country) {
                    toast.warn("Please select a specific region/country.");
                }
            } else if (step === 2) {
                const wordCount = courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0;
                if (!courseData.description?.trim() || wordCount < 50) {
                    toast.warn("Description must be at least 50 words.");
                } else if (!courseData.duration?.value || courseData.duration.value <= 0) {
                    toast.warn("Please set a valid course duration.");
                } else if (!courseData.module || courseData.module <= 0) {
                    toast.warn("Please specify at least one module to generate.");
                }
            } else if (step === 4) {
                if (previewModules.length === 0) {
                    toast.warn("Please generate modules before continuing.");
                    return;
                }

                // Auto-trigger batch slide generation if any are missing
                const missingSlides = previewModules.some(m => !orionUrlByModule[m.id]);
                if (missingSlides) {
                    await triggerBatchSlideGeneration();
                    return;
                }
            }
            return;
        }

        setShowValidation(false);
        if (step < totalSteps) {
            if (step === 1) {
                await handleAutoGenerateDescription();
            } else if (step === 2) {
                // Skip step 3 (Resources) and go directly to step 4
                setStep(4);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
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
        } catch {
            return false;
        }
    };

    const handleAddUrl = () => {
        if (!urlInput.trim()) return;

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
                // Skip step 3 (Resources) and go directly to step 2
                setStep(2);
            } else {
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
                    // Auto-populate based on level (default: 1 hour, 5 modules)
                    let autoModules = 5;
                    let autoDuration = 1;

                    if (courseData.level === 'Intermediate') {
                        autoModules = 6;
                        autoDuration = 2;
                    } else if (courseData.level === 'Advanced') {
                        autoModules = 8;
                        autoDuration = 3;
                    } else if (courseData.level === 'Professional') {
                        autoModules = 10;
                        autoDuration = 4;
                    }

                    updateCourseData({
                        description,
                        module: autoModules,
                        duration: { value: autoDuration, unit: 'Hours' },
                    });
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                toast.error('Could not generate description automatically.');
            }
        } catch {
            toast.error('Could not generate description. Please fill it manually.');
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleRefineDescription = async () => {
        if (!refinePromptText.trim() || !courseData.description) return;
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
            } else {
                toast.error('Could not refine description.');
            }
        } catch {
            toast.error('Error connecting to the refinement service.');
        } finally {
            setIsRefiningDescription(false);
            setRefinePromptText('');
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
            // Generate in memory only (draft) — nothing saved until user clicks "Launch Course"
            const coursePayload = {
                title: courseData.title,
                description: courseData.description,
                audience: courseData.audience,
                level: courseData.level,
                standards: courseData.standards,
                country: courseData.country,
                industry: courseData.industry,
                courseStyle: courseData.courseStyle || 'Academic / Formal Style'
            };

            // generation started — no toast needed, progress bar handles feedback

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
                throw new Error(errData.message || 'Module generation failed');
            }

            const { modules: generatedModules } = await resp.json();

            for (const mod of generatedModules) {
                const id = mod.moduleNumber;
                setCompletedModules(id);

                const content = mod.content;
                const slides = mod.slides;

                const nc = content ? normalizeModuleContent(content, id) : null;
                if (nc) contentMap[id] = nc;
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

            // Update theme state with the randomized themes used during generation
            setThemeByModule(initialThemes);

            setHasBlueprint(true);
            // draft ready — UI updates visually, no toast needed
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Generation failed');
        } finally {
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
                courseStyle: courseData.courseStyle || 'Academic / Formal Style'
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
                toast.error('Failed to regenerate module');
                return;
            }

            const { content, slides } = await resp.json();
            const nc = content ? normalizeModuleContent(content, moduleId) : null;
            if (nc) setPrefetchedContentMap(prev => ({ ...prev, [moduleId]: nc }));
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

            setPreviewModules(prev =>
                prev.map(m => m.id === moduleId ? { ...m, title: String(title).trim() || m.title, lessons: lessons.length > 0 ? lessons : m.lessons } : m)
            );

            // Randomize theme for the regenerated module
            const randomTheme = GAMMA_THEMES[Math.floor(Math.random() * GAMMA_THEMES.length)].id;
            setThemeByModule(prev => ({ ...prev, [moduleId]: randomTheme }));

            // Success! Trigger scroll/highlight again to ensure it shows the final result
            setHighlightedModuleId(null);
            setTimeout(() => setHighlightedModuleId(moduleId), 50);
            // module regenerated — UI already reflects the update
        } catch (err) {
            toast.error('Regeneration failed');
        } finally {
            setIsPreviewLoading(false);
            setRefineProgress(0);
        }
    };

    const triggerBatchSlideGeneration = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Ensure course is saved to DB before batch generation
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
                if (!courseId) throw new Error('No courseId returned');
                setSavedCourseId(courseId);
                updateCourseData({ courseId });
            } catch (err) {
                toast.error('Could not create course. Please try again.');
                setIsBatchGenerating(false);
                return;
            }
        }

        // Identify modules that need slide generation
        const modulesToGenerate = previewModules
            .filter(m => !orionUrlByModule[m.id])
            .map(m => ({
                moduleNumber: m.id,
                moduleContent: prefetchedContentMap[m.id],
                slideContent: prefetchedSlidesMap[m.id],
                gammaTheme: themeByModule[m.id] || 'aurora'
            }));

        if (modulesToGenerate.length === 0) {
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
                    } else {
                        const errData = await resp.json().catch(() => ({}));
                        console.error(`Module ${mod.moduleNumber} failed:`, errData);
                    }
                } catch (err) {
                    console.error(`Module ${mod.moduleNumber} error:`, err);
                }
                setBatchSlidesProgress({ completed: completedCount, total: modulesToGenerate.length });
                setOrionUrlByModule({ ...newUrls });
            }

            if (completedCount === modulesToGenerate.length) {
                toast.success("All module slides have been generated successfully!");
            } else if (completedCount > 0) {
                toast.warn(`${completedCount}/${modulesToGenerate.length} slides generated. You can retry individual modules in the next step.`);
            } else {
                toast.error("Slide generation failed for all modules.");
            }
        } catch (error: any) {
            console.error('Batch slide generation error:', error);
            toast.error(error.message || "An unexpected error occurred.");
        } finally {
            setIsBatchGenerating(false);
            setBatchGeneratingModuleId(null);
            setBatchSelectedModuleIdForPreview(null);
            setStep(5);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const refineSingleModule = async (moduleId: number, prompt: string, history: { role: 'user' | 'assistant'; content: string }[]): Promise<string> => {
        setIsPreviewLoading(true);
        setHighlightedModuleId(moduleId);
        setRefineProgress(5);
        const progressInterval = setInterval(() => {
            setRefineProgress(prev => {
                if (prev >= 90) return prev;
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
                courseStyle: courseData.courseStyle || 'Academic / Formal Style'
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
                toast.error('Failed to refine module');
                return "I encountered an error while trying to refine the module.";
            }

            const { content, slides } = await resp.json();
            setRefineProgress(100);
            const nc = content ? normalizeModuleContent(content, moduleId) : null;
            if (nc) setPrefetchedContentMap(prev => ({ ...prev, [moduleId]: nc }));
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

            setPreviewModules(prev =>
                prev.map(m => m.id === moduleId ? { ...m, title: String(title).trim() || m.title, lessons: lessons.length > 0 ? lessons : m.lessons } : m)
            );
            // Update selectedModule if it is the one being refined to show changes immediately in Viewer
            if (selectedModule && selectedModule.id === moduleId) {
                const updatedModule: ModuleState = {
                    ...selectedModule,
                    Content: nc || selectedModule.Content,
                    slide: slides ? { Module: `Module ${moduleId}`, Slides: slides.Slides } : selectedModule.slide
                };
                setSelectedModule(updatedModule);
            }
            // Success! Trigger scroll/highlight again to ensure it shows the final result
            setHighlightedModuleId(null);
            setTimeout(() => setHighlightedModuleId(moduleId), 50);

            return "I've successfully refined the module architecture based on your directives.";
        } catch (err) {
            toast.error('Refinement failed');
            return "Something went wrong during the refinement process.";
        } finally {
            clearInterval(progressInterval);
            setTimeout(() => {
                setIsPreviewLoading(false);
                setRefineProgress(0);
            }, 500);
        }
    };

    const normalizeModuleContent = (input: any, moduleId: number) => {
        if (!input || typeof input !== 'object') return null;
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
                if (typeof v === 'string') return v;
                return v?.description || v?.title || v?.link || v?.content || '';
            }).filter(Boolean);
        }
        // Handle case where visualDescriptions might be an object with items array
        if (!VisualDescriptions && input.visualDescriptions && typeof input.visualDescriptions === 'object' && !Array.isArray(input.visualDescriptions)) {
            const vdObj = input.visualDescriptions;
            if (Array.isArray(vdObj.items)) {
                VisualDescriptions = vdObj.items.map((v: any) => v?.description || v?.title || v?.link || v?.content || '').filter(Boolean);
            } else if (vdObj.description || vdObj.title || vdObj.link) {
                VisualDescriptions = [vdObj.description || vdObj.title || vdObj.link || ''];
            }
        }
        // Final fallback if still null
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
                    if (typeof b === 'string') return b;
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
        // console.log('[DEBUG] openContentPreview start', { moduleId, savedCourseId, courseData });
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
                if (!courseId) throw new Error('No courseId returned');
                setSavedCourseId(courseId);
                updateCourseData({ courseId });
            } catch {
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
            // console.log('[DEBUG] Fetching module-contents (content)', { courseId, moduleId });
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
                    // console.log("[DEBUG] Latest data from database:", JSON.stringify(latest, null, 2));

                    // Handle both response formats: direct module object or nested content object
                    if (latest.content && typeof latest.content === 'object') {
                        // console.log("[DEBUG] Database content before normalization (nested format):", JSON.stringify(latest.content, null, 2));
                        nc = normalizeModuleContent(latest.content, baseModuleNumber);
                    } else {
                        // console.log("[DEBUG] Database latest before normalization (direct format):", JSON.stringify(latest, null, 2));
                        nc = normalizeModuleContent(latest, baseModuleNumber);
                    }
                    if (nc) {
                        // console.log("[DEBUG] Normalized content result:", JSON.stringify(nc, null, 2));
                        setPrefetchedContentMap(prev => ({ ...prev, [baseModuleNumber]: nc }));
                    }
                    // Load orionUrl from database if available
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
            // console.log('[DEBUG] No saved content found; showing blueprint fallback without regenerating');
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
                // showing blueprint preview — no toast needed
                setIsPreviewLoading(false);
                return;
            }
            // no content — UI will display empty state
        } catch (error) {
            console.error('Failed to fetch module content:', error);
            toast.error('Failed to fetch module content.');
        } finally {
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

            const resp = await fetch(
                `${API_BASE}/courses/${courseId}/modules/${moduleId}/download-pptx`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!resp.ok) {
                toast.dismiss(toastId);
                const err = await resp.json().catch(() => ({}));
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

            // download triggered — browser handles the file, no toast needed
        } catch (e: any) {
            console.error('Download error:', e);
            toast.error(e.message || 'Failed to download PPTX');
        } finally {
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
                    courseStyle: courseData.courseStyle || 'Academic / Formal Style'
                })
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                toast.error(data.message || 'Slide generation failed');
                return;
            }
            if (data.gammaUrl) {
                setOrionUrlByModule(prev => ({ ...prev, [moduleId]: data.gammaUrl }));
                // window.open(data.gammaUrl, '_blank', 'noopener,noreferrer');
                // slide deck ready — button state updates to show preview option
            } else {
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Slide generation failed');
        } finally {
            setGeneratingSlidesModuleId(null);
        }
    };

    const openSlidesPreview = async (moduleId: number, showOrion = false) => {
        // console.log('[DEBUG] openSlidesPreview start', { moduleId, savedCourseId, courseData });
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
                if (!courseId) throw new Error('No courseId returned');
                setSavedCourseId(courseId);
                updateCourseData({ courseId });
            } catch {
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
            // console.log('[DEBUG] Fetching module-contents (slides)', { courseId, moduleId });
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
                // console.log('[DEBUG] module-contents GET result (slides)', docs);
                const latest = Array.isArray(docs) && docs.length ? docs[0] : null;
                if (latest) {

                    // Load orionUrl from database if available
                    if (latest.gammaUrl && typeof latest.gammaUrl === 'string') {
                        setOrionUrlByModule(prev => ({ ...prev, [Number(latest.moduleNumber)]: latest.gammaUrl }));
                    }

                    // Handle both response formats: direct module object or nested content object
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
            // console.log('[DEBUG] No saved slides found; showing blueprint fallback without regenerating');
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

        } catch {
            toast.error('Failed to fetch module slides.');
        } finally {
            setIsPreviewLoading(false);
        }
    };


    const handleLaunchCourse = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const mCount = courseData.module ?? 0;
        const hasDraft = mCount > 0 && previewModules.length >= mCount &&
            previewModules.every(m => prefetchedContentMap[m.id]);

        if (hasDraft) {
            // Save course first if not yet saved
            let courseId = savedCourseId || courseData.courseId;
            if (!courseId) {
                const courseResp = await fetch(`${API_BASE}/courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ courseData })
                });
                if (!courseResp.ok) {
                    const errData = await courseResp.json().catch(() => ({}));
                    toast.error(errData.message || 'Failed to create course');
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
                toast.error('Could not create course');
                return;
            }

            // Persist each module from draft (content + slides) to backend
            for (const mod of previewModules) {
                const content = prefetchedContentMap[mod.id];
                const slides = prefetchedSlidesMap[mod.id];
                if (!content && !slides?.Slides?.length) continue;
                const saveResp = await fetch(`${API_BASE}/module-contents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        courseId,
                        moduleNumber: mod.id,
                        content: content || undefined,
                        slides: slides || undefined,
                        orionUrl: orionUrlByModule[mod.id] || undefined
                    })
                });
                if (!saveResp.ok) {
                    const errData = await saveResp.json().catch(() => ({}));
                    toast.error(`Failed to save module ${mod.id}: ${errData.message || 'Unknown error'}`);
                    return;
                }
            }

            toast.success('Course launched and saved.');
            resetCourseData();
            setSavedCourseId(null);
            navigate('/course-dashboard', { replace: true });
            return;
        }

        // No draft: fallback to legacy flow (generate + save via /chat and module-contents)
        await handleGenerateContent('content');
    };

    const handleExitArchitect = async () => {
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
            } catch (e) {
                console.error("Cleanup error:", e);
            }
        }
        resetCourseData();
        setSavedCourseId(null);
        navigate('/course-dashboard');
    };

    const handleGenerateContent = async (mode: 'slides' | 'content') => {
        if (mode === 'slides') setIsGeneratingSlides(true);
        else setIsGeneratingContent(true);

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
                // ========== SLIDE GENERATION COMMENTED OUT ==========
                // if (mode === 'slides') {
                //   bodyPrompt.prompt2 = `Create detailed slide prompts for Module [${i}]...`;
                // }

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
                        // ========== SLIDE GENERATION COMMENTED OUT ==========
                        // let slides = result?.reply2;
                        console.log('content:', content);
                        // console.log('slides:', slides)

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
                        } else if (content && !content.Title) {
                            content = normalizeModuleContent(content, i);
                        }
                        if (content) {
                            content = normalizeModuleContent(content, i);
                        }

                        // ========== SLIDE GENERATION COMMENTED OUT ==========
                        // if (slides && !slides.Slides && slides.rawText) { slides = { Module: `Module ${i}`, Slides: [...] }; }

                        const payload: any = {
                            courseId,
                            moduleNumber: i
                        };

                        // if (mode === 'slides' && slides) payload.slides = slides;
                        if (mode === 'content') {
                            if (content) payload.content = content;
                            // if (slides) payload.slides = slides;
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
                } catch (err) {
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
            } else {
                toast.success('Slides generated successfully!');
                setIsGeneratingSlides(false);
            }

        } catch (error) {
            console.error('Generation failed:', error);
            setIsGeneratingSlides(false);
            setIsGeneratingContent(false);
            navigate('/course-dashboard', { replace: true });
        }
    };

    const isStepComplete = (s: number) => {
        switch (s) {
            case 1: {
                const baseComplete = !!(courseData.title?.trim() && hasAudience(courseData.audience) && courseData.level);
                if (courseData.standards === 'Regional') {
                    return baseComplete && !!courseData.country;
                }
                return baseComplete;
            }
            case 2: {
                const wordCount = courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0;
                return !!(wordCount >= 50 && (courseData.duration?.value ?? 0) > 0 && (courseData.module ?? 0) > 0);
            }
            case 3:
                return true; // Files are optional
            case 4:
                return previewModules.length > 0 && Object.keys(orionUrlByModule).length === previewModules.length;
            default:
                return true;
        }
    };

    if (formStatus === 'outcomes') {
        // deprecated
    }

    const handleStepClick = (targetStep: number) => {
        if (targetStep === step) return;
        if (targetStep === 3) return; // Skip step 3 as it is currently commented out/disabled
        if (targetStep < step) {
            if (isBlueprinting || hasBlueprint) {
                toast.warn("Once the course is generated you cannot navigate to previous steps.");
                return;
            }
            setStep(targetStep);
        } else {
            let canProceed = true;
            for (let i = step; i < targetStep; i++) {
                if (!isStepComplete(i)) {
                    setShowValidation(true);
                    canProceed = false;
                    break;
                }
            }
            if (canProceed) setStep(targetStep);
        }
    };

    return (
        <CourseCreatorContext.Provider value={{
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
            regenerateSingleModule,
            triggerBatchSlideGeneration,
            refineSingleModule,
            normalizeModuleContent,
            openContentPreview,
            downloadModulePPTX,
            handleGenerateSlidesOrion,
            openSlidesPreview,
            handleLaunchCourse,
            handleExitArchitect,
            handleGenerateContent,
            isStepComplete,
            handleStepClick,
            hasAudience,
            formatAudience,
            AUDIENCE_OPTIONS,
            INDUSTRIES,
            GAMMA_THEMES
        }}>
            {children}
        </CourseCreatorContext.Provider>
    );
};
