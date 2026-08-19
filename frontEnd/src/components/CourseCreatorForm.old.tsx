import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Clock,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Loader2,
  FileText,
  Target,
  Palette,
  Globe,
  Zap,
  Sparkles,
  Book,
  BookOpen,
  Monitor,
  Eye,
  CheckCircle2,
  Pencil,
  Link,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  X,
  Download,
  Layers,
  MapPin,
  Wrench,
  Rocket,
  AlertTriangle,
  Construction,
  Lightbulb,
  RefreshCw,
  Star,
  LogOut,
  User as UserIcon,
  Bell
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCourseData } from '../contextAPI/courseAPI';
import { API_BASE } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
import logo5 from '../assests/logo5.png';
import avatar from '../assests/avatar.png';
import { ModuleViewer } from '../pages/Modules/ModuleViewer';
import { SlideContent } from '../pages/Modules/SlideContent';
import type { ModuleState } from '../pages/Modules/ModuleGen';
import { GAMMA_THEMES, THEME_CATEGORIES } from '../utils/themes';


const hasAudience = (audience?: string | string[]) => {
  if (Array.isArray(audience)) return audience.length > 0;
  return !!audience?.trim();
};

const formatAudience = (audience?: string | string[]) => {
  if (Array.isArray(audience)) return audience.join(', ');
  return audience || '';
};

type PreviewLesson = { id: string; title: string };
type PreviewModule = { id: number; title: string; lessons: PreviewLesson[] };

// Theme constants moved to ../utils/themes.ts

const AUDIENCE_OPTIONS: Record<string, string[]> = {
  'Beginner': ['Students', 'Fresh Graduates', 'Entry-level employees', 'Working Professionals', 'Engineers', 'HR Staff', 'Senior Professionals', 'Consultants', 'Specialists', 'C-Level Executives (CEO, CFO, CTO, COO)',
    'Senior Executives',
    'Lead Implementers',
    'Industry Experts',],
  'Intermediate': ['Students', 'Fresh Graduates', 'Entry-level employees', 'Working Professionals', 'Engineers', 'HR Staff', 'Senior Professionals', 'Consultants', 'Specialists', 'C-Level Executives (CEO, CFO, CTO, COO)',
    'Senior Executives',
    'Lead Implementers',
    'Industry Experts',],
  'Advanced': ['Students', 'Fresh Graduates', 'Entry-level employees', 'Working Professionals', 'Engineers', 'HR Staff', 'Senior Professionals', 'Consultants', 'Specialists', 'C-Level Executives (CEO, CFO, CTO, COO)',
    'Senior Executives',
    'Lead Implementers',
    'Industry Experts',],
  'Professional': ['Students', 'Fresh Graduates', 'Entry-level employees', 'Working Professionals', 'Engineers', 'HR Staff', 'Senior Professionals', 'Consultants', 'Specialists', 'C-Level Executives (CEO, CFO, CTO, COO)',
    'Senior Executives',
    'Lead Implementers',
    'Industry Experts',

  ]
};

const INDUSTRIES = [
  "Healthcare & Medical",
  "Finance & Banking",
  "Information Security / Cybersecurity",
  "Manufacturing & Industrial",
  "Education & Academic",
  "Pharmaceutical & Life Sciences",
  "Hospitality & Tourism",
  "Environmental & Sustainability"
];

const CourseCreatorForm: React.FC = () => {
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
          // Auto-populate based on level
          let autoModules = 10;
          let autoDuration = 2;

          if (courseData.level === 'Intermediate') {
            autoModules = 24;
            autoDuration = 6;
          } else if (courseData.level === 'Advanced') {
            autoModules = 64;
            autoDuration = 16;
          } else if (courseData.level === 'Professional') {
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

  if (isGeneratingContent) {
    return <Loading />;
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

  const StepProgress = () => {
    // To restore the Resources section:
    // 1. Uncomment step 3 in the array below:
    const activeSteps = [1, 2, /* 3, */ 4, 5];

    return (
      <div className="flex items-center justify-between mb-12 max-w-4xl mx-auto px-4 relative">
        {activeSteps.map((num) => (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="relative group">
              {step === num && (
                <motion.div
                  layoutId="activeCircle"
                  className="absolute inset-0 rounded-full bg-lime-500/20 scale-150 blur-sm overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                />
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => handleStepClick(num)}
                className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${step >= num
                  ? 'bg-lime-500 border-lime-400 text-black shadow-lime-500/30'
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                  }`}
              >
                {step > num ? <Check size={20} strokeWidth={4} /> : (
                  <span className={`font-bold ${step === num ? 'text-black' : 'text-gray-500'}`}>
                    {activeSteps.indexOf(num) + 1}
                  </span>
                )}
              </motion.button>
              <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-lime-500/80">
                  {num === 1 && "Basics"}
                  {num === 2 && "Structure"}
                  {num === 3 && "Resources"}
                  {num === 4 && "Generate / Preview"}
                  {num === 5 && "Review & Launch"}
                </span>
              </div>
            </div>

            {num < 5 && (
              <div className="h-1.5 flex-1 mx-4 rounded-full bg-gray-900 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 shadow-[0_0_10px_rgba(132,204,22,0.3)]"
                  initial={false}
                  animate={{ width: step > num ? "100%" : "0%" }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );

  };

  const WarningSign = () => (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 animate-pulse">
      <Zap size={18} fill="currentColor" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-lime-500 selection:text-black">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-lime-900/10 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-[100] py-4 px-8 border-b border-white/10 backdrop-blur-xl bg-black/40">
        <div className="w-full flex justify-between items-center transition-all duration-500">
          {/* Left: Logo */}
          <div className="flex-1 flex justify-start">
            <div className="flex flex-col items-start gap-1">
              <img src={logo5} alt="ORION Logo" className="h-16 w-auto hover:rotate-3 transition-transform cursor-pointer" />
              <div className="flex items-center gap-2">
                <span className="text-lime-400 text-[9px] font-black uppercase tracking-[0.2em] leading-none">EVOKE AI</span>
              </div>
            </div>
          </div>

          {/* Middle: Title */}
          <div className="hidden lg:flex flex-col items-center flex-1 justify-center translate-x-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Course Creator <span className="text-lime-500/30">|</span> <span className="text-[10px] font-black uppercase tracking-widest text-lime-400/80">Architect Mode</span>
            </h2>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">Designing Precision Learning</p>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExitArchitect}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-lime-500/30 transition-all text-xs font-bold shadow-sm"
            >
              <ChevronLeft size={16} strokeWidth={2.5} className="text-lime-500" />
              Exit Architect
            </motion.button>

            <div className="h-8 w-px bg-white/10 hidden md:block" />

            {/* Notification Button */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                className={`p-2 rounded-full border transition-all relative group ${notifOpen ? 'bg-lime-500/25 border-lime-500/70' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
              >
                <Bell className={`w-5 h-5 transition-all ${notifOpen ? 'text-lime-400' : 'text-white/70 group-hover:text-lime-400 group-hover:rotate-12'}`} />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-lime-500 rounded-full ring-2 ring-black animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-80 bg-[#0A0F1A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] ring-1 ring-white/5"
                    >
                      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-widest opacity-80">Notifications</span>
                        <div className="flex gap-2">
                          <button
                            className="text-[10px] px-2 py-1 rounded-lg bg-lime-500/20 text-lime-300 hover:bg-lime-500/30 transition font-bold"
                            onClick={markAllRead}
                          >
                            Mark All Read
                          </button>
                          <button
                            className="text-[10px] px-2 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition font-bold"
                            onClick={removeAllNotifications}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-auto scrollbar-thin scrollbar-thumb-white/10">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-12 text-center flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                              <Bell className="w-6 h-6 text-white/40" />
                            </div>
                            <span className="text-sm text-white/60 font-medium">No new notifications</span>
                          </div>
                        ) : (
                          notifications.map((n, i) => (
                            <div
                              key={i}
                              className={`px-4 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors relative group ${!n.isRead ? 'bg-lime-500/[0.02]' : ''}`}
                            >
                              {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-400" />}
                              <p className="text-sm text-white font-medium leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-white/50 mt-2 font-bold uppercase tracking-wider">
                                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 transition-all duration-700 mx-auto py-12 px-6 max-w-[1600px]">
        <StepProgress />

        <div className="mt-12 flex flex-col lg:flex-row gap-8 items-start">
          {/* Form Content Area - Now separated into individual cards */}
          <div className="flex-1 min-h-[620px] relative z-10 transition-all duration-300">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="pt-6 flex flex-col xl:flex-row gap-8 xl:gap-12"
                >

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex-1 xl:w-[65%] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group/card shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/[0.02] to-transparent pointer-events-none" />
                    <motion.div variants={itemVariants} className="mb-12 text-center relative z-10">
                      <label className="block text-[10px] font-black text-white/40 mb-6 uppercase tracking-[0.3em] group-hover/card:text-lime-400 transition-colors">Cognitive complexity Level</label>
                      <div className="max-w-2xl mx-auto flex bg-black/40 p-2 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                        {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => {
                              updateCourseData({ level: lvl });
                              setIsCustomAudience(false);
                            }}
                            className={`flex-1 py-4 text-xs font-black rounded-2xl transition-all duration-500 uppercase tracking-widest ${courseData.level === lvl
                              ? 'bg-lime-500 text-black shadow-[0_0_30px_rgba(132,204,22,0.4)] scale-[1.05] z-10 font-black'
                              : 'text-white/20 hover:text-white/60 hover:bg-white/5'
                              }`}
                            type="button"
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider group-hover:text-lime-500 transition-colors">Course Title</label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                              className={`w-full bg-gray-800/50 border rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-lime-500 outline-none transition-all ${showValidation && !courseData.title?.trim() ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700'
                                }`}
                              placeholder="e.g. Masterclass in Quantum SEO"
                              value={courseData.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                                updateCourseData({ title: capitalized });
                              }}
                            />
                            {showValidation && !courseData.title?.trim() && <WarningSign />}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Target Audience</label>
                          <div className="relative">
                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            {!courseData.level ? (
                              <div className="relative group opacity-60">
                                <input
                                  disabled
                                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-gray-500 cursor-not-allowed transition-all"
                                  placeholder="Please select an Experience Level first..."
                                  value=""
                                />
                              </div>
                            ) : (
                              <div className="relative" ref={audienceDropdownRef}>
                                <div
                                  onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
                                  className={`w-full min-h-[50px] bg-gray-800/50 border rounded-xl py-2 pl-11 pr-10 flex flex-wrap items-center gap-2 cursor-pointer transition-all ${showValidation && !hasAudience(courseData.audience) ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700'}`}
                                >
                                  {Array.isArray(courseData.audience) && courseData.audience.length > 0 ? (
                                    courseData.audience.map((aud, idx) => (
                                      <span key={idx} className="bg-lime-500/20 text-lime-400 text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-lime-500/30">
                                        {aud}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newAud = (courseData.audience as string[]).filter(a => a !== aud);
                                            updateCourseData({ audience: newAud });
                                          }}
                                          className="hover:text-lime-300"
                                        >
                                          <X size={12} />
                                        </button>
                                      </span>
                                    ))
                                  ) : (typeof courseData.audience === 'string' && courseData.audience.trim() ? (
                                    <span className="bg-lime-500/20 text-lime-400 text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-lime-500/30">
                                      {courseData.audience}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateCourseData({ audience: [] });
                                        }}
                                        className="hover:text-lime-300"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ) : (
                                    <span className="text-gray-500 select-none py-1">Select Target Audiences...</span>
                                  ))}
                                </div>
                                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none transition-transform ${isAudienceDropdownOpen ? 'rotate-180' : ''}`} />

                                <AnimatePresence>
                                  {isAudienceDropdownOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                                    >
                                      <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                        {/* Select All Option */}
                                        {(() => {
                                          const allOptions = AUDIENCE_OPTIONS[courseData.level] || [];
                                          const currentAudience = Array.isArray(courseData.audience) ? courseData.audience : (courseData.audience ? [courseData.audience] : []);
                                          const allSelected = allOptions.length > 0 && allOptions.every(opt => currentAudience.includes(opt));
                                          return (
                                            <div
                                              onClick={() => {
                                                if (allSelected) {
                                                  updateCourseData({ audience: [] });
                                                } else {
                                                  updateCourseData({ audience: [...allOptions] });
                                                }
                                              }}
                                              className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between border-b border-white/5 mb-1 pb-2 ${allSelected ? 'bg-lime-500/10 text-lime-400' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                            >
                                              <span className="font-bold uppercase tracking-wider text-xs">Select All</span>
                                              {allSelected && <Check size={16} className="text-lime-500" />}
                                            </div>
                                          );
                                        })()}
                                        {AUDIENCE_OPTIONS[courseData.level]?.map(opt => {
                                          const isSelected = Array.isArray(courseData.audience)
                                            ? courseData.audience.includes(opt)
                                            : courseData.audience === opt;
                                          return (
                                            <div
                                              key={opt}
                                              onClick={() => {
                                                let current = Array.isArray(courseData.audience) ? [...courseData.audience] : (courseData.audience ? [courseData.audience] : []);
                                                if (isSelected) {
                                                  current = current.filter(a => a !== opt);
                                                } else {
                                                  current.push(opt);
                                                }
                                                updateCourseData({ audience: current });
                                              }}
                                              className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-lime-500/10 text-lime-400' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                            >
                                              {opt}
                                              {isSelected && <Check size={16} className="text-lime-500" />}
                                            </div>
                                          );
                                        })}
                                      </div>
                                      <div className="p-2 border-t border-gray-700 bg-gray-900/50">
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={customAudienceInput}
                                            onChange={(e) => setCustomAudienceInput(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (customAudienceInput.trim()) {
                                                  const capitalized = customAudienceInput.charAt(0).toUpperCase() + customAudienceInput.slice(1);
                                                  const current = Array.isArray(courseData.audience) ? [...courseData.audience] : (courseData.audience ? [courseData.audience] : []);
                                                  if (!current.includes(capitalized)) {
                                                    current.push(capitalized);
                                                    updateCourseData({ audience: current });
                                                  }
                                                  setCustomAudienceInput('');
                                                }
                                              }
                                            }}
                                            placeholder="Add custom audience..."
                                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-lime-500 outline-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              if (customAudienceInput.trim()) {
                                                const capitalized = customAudienceInput.charAt(0).toUpperCase() + customAudienceInput.slice(1);
                                                const current = Array.isArray(courseData.audience) ? [...courseData.audience] : (courseData.audience ? [courseData.audience] : []);
                                                if (!current.includes(capitalized)) {
                                                  current.push(capitalized);
                                                  updateCourseData({ audience: current });
                                                }
                                                setCustomAudienceInput('');
                                              }
                                            }}
                                            className="bg-lime-500/20 text-lime-400 p-2 rounded-lg hover:bg-lime-500/30 transition-colors"
                                          >
                                            <Plus size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                            {showValidation && !hasAudience(courseData.audience) && <WarningSign />}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">International/Regional Industry Standard</label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <select
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-lime-500 outline-none appearance-none cursor-pointer"
                              value={courseData.standards}
                              onChange={(e) => {
                                updateCourseData({ standards: e.target.value });
                                if (e.target.value !== 'Regional') {
                                  updateCourseData({ country: '' });
                                }
                              }}
                            >
                              <option>Global (ISO/IEC)</option>
                              <option>Regional</option>
                              <option>Industry Specific</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                          </div>
                          {courseData.standards === 'Regional' && (
                            <div className="mt-3 pl-4 border-l-2 border-lime-500/40 animate-in fade-in slide-in-from-top-2 duration-300">
                              <label className="block text-[11px] font-semibold text-lime-400 mb-1.5 uppercase tracking-wider">Specific Region/Country</label>
                              <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                {!isCustomCountry ? (
                                  <select
                                    className={`w-full bg-gray-800/30 border rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-2 focus:ring-lime-500 outline-none appearance-none cursor-pointer transition-all ${showValidation && !courseData.country ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700/50 hover:border-gray-600'
                                      }`}
                                    value={courseData.country}
                                    onChange={(e) => {
                                      if (e.target.value === 'Other') {
                                        setIsCustomCountry(true);
                                        updateCourseData({ country: '' });
                                      } else {
                                        updateCourseData({ country: e.target.value });
                                      }
                                    }}
                                  >
                                    <option value="">Select a region...</option>
                                    <option>Australia</option>
                                    <option>Canada</option>
                                    <option>India</option>
                                    <option>United States</option>
                                    <option>London (UK)</option>
                                    <option value="Other">Other / Custom...</option>
                                  </select>
                                ) : (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      autoFocus
                                      className="w-full bg-gray-800/30 border border-lime-500/50 rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-2 focus:ring-lime-500 outline-none"
                                      placeholder="Type custom region..."
                                      value={courseData.country}
                                      onChange={(e) => updateCourseData({ country: e.target.value })}
                                    />
                                    <button
                                      onClick={() => {
                                        setIsCustomCountry(false);
                                        updateCourseData({ country: '' });
                                      }}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                                {!isCustomCountry && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />}
                                {showValidation && !courseData.country && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 animate-pulse">
                                    <Zap size={18} fill="currentColor" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {courseData.standards === 'Industry Specific' && (
                            <div className="mt-3 pl-4 border-l-2 border-lime-500/40 animate-in fade-in slide-in-from-top-2 duration-300">
                              <label className="block text-[11px] font-semibold text-lime-400 mb-1.5 uppercase tracking-wider">Select Industry</label>
                              <div className="relative">
                                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                {!isCustomIndustry ? (
                                  <select
                                    className={`w-full bg-gray-800/30 border rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-2 focus:ring-lime-500 outline-none appearance-none cursor-pointer transition-all ${showValidation && !courseData.industry ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700/50 hover:border-gray-600'
                                      }`}
                                    value={courseData.industry}
                                    onChange={(e) => {
                                      if (e.target.value === 'Other') {
                                        setIsCustomIndustry(true);
                                        updateCourseData({ industry: '' });
                                      } else {
                                        updateCourseData({ industry: e.target.value });
                                      }
                                    }}
                                  >
                                    <option value="">Select an industry...</option>
                                    {INDUSTRIES.map(ind => (
                                      <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                    <option value="Other">Other / Custom...</option>
                                  </select>
                                ) : (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      autoFocus
                                      className="w-full bg-gray-800/30 border border-lime-500/50 rounded-xl py-2.5 pl-9 pr-10 text-sm focus:ring-2 focus:ring-lime-500 outline-none"
                                      placeholder="Type custom industry..."
                                      value={courseData.industry}
                                      onChange={(e) => updateCourseData({ industry: e.target.value })}
                                    />
                                    <button
                                      onClick={() => {
                                        setIsCustomIndustry(false);
                                        updateCourseData({ industry: '' });
                                      }}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                                {!isCustomIndustry && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />}
                                {showValidation && !courseData.industry && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 animate-pulse">
                                    <Zap size={18} fill="currentColor" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 transition-all duration-300">
                          <p className="text-[10px] leading-relaxed text-gray-400">
                            {courseData.standards === 'Global (ISO/IEC)' && (
                              <>
                                <span className="text-lime-400 font-bold tracking-wider uppercase mr-2 text-[9px]">Global Standard:</span>
                                High-level international standards ensure your course is recognized and consistent across all borders and countries.
                              </>
                            )}
                            {courseData.standards === 'Regional' && (
                              <>
                                <span className="text-lime-400 font-bold tracking-wider uppercase mr-2 text-[9px]">Regional Standard:</span>
                                Focuses on educational or professional requirements specific to a particular continent, region, or geographic area.
                              </>
                            )}
                            {courseData.standards === 'Industry Specific' && (
                              <>
                                <span className="text-lime-400 font-bold tracking-wider uppercase mr-2 text-[9px]">Industry Standard:</span>
                                Tailors content to meet stringent professional requirements in specialized fields like Medical, Legal, or Technical sectors.
                              </>
                            )}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Course Tone & Style</label>
                          <div className="relative">
                            <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <select
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-lime-500 outline-none appearance-none cursor-pointer"
                              value={courseData.courseStyle || 'Academic / Formal Style'}
                              onChange={(e) => updateCourseData({ courseStyle: e.target.value })}
                            >
                              <option>Academic / Formal Style</option>
                              <option>Storytelling Style</option>
                              <option>Interactive Coaching Style</option>
                              <option>Humanized Teaching Style</option>
                              <option>Modern Edutainment Style</option>
                              <option>Scenario-Based Style</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <div className="mt-12 flex justify-start">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={goToNextStep}
                        disabled={isGeneratingDescription}
                        className="flex items-center gap-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-wait disabled:transform-none"
                        type="button"
                      >
                        {isGeneratingDescription ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing Description...
                          </>
                        ) : (
                          <>
                            Next Step <ChevronRight size={20} strokeWidth={3} />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Right Side: Orion Guidance */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 xl:w-[38%] bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8"
                  >
                    {/* Background glow lines */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none"></div>

                    <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                      <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
                    </div>

                    <div className="relative z-10">
                      <div className="mb-6 pr-48 text-left min-h-[140px]">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight flex items-center gap-2">
                          Hey! Welcome to the first step <Sparkles className="text-lime-400 w-6 h-6 animate-pulse" />
                        </h3>
                        <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                          Hey! I'm <span className="text-lime-400 font-bold px-1 bg-lime-400/10 rounded">Orion</span> again, and I'll guide you in shaping the core of your course. Let's define a few key details so I can build everything exactly the way you need.
                        </p>
                      </div>

                      <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                      <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                        <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                          <Layers className="w-4 h-4 text-lime-400" />
                        </span>
                        Step-by-Step Guidance
                      </h4>

                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                      >
                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">1</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Choose Cognitive complexity Level</h5>
                            <p className="text-gray-400 text-xs leading-relaxed">Select the proficiency level of your students. I will automatically calibrate the complexity of the terminology and the depth of the concepts to match this choice.</p>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Course Title</h5>
                            <p className="text-gray-400 text-xs leading-relaxed">Enter a clear, professional title. I use this to determine the primary 'North Star' of your course content and to generate relevant imagery later.</p>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">3</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Define Target Audience</h5>
                            <p className="text-gray-400 text-xs leading-relaxed">Who is this for? Identifying the audience allows me to tailor the examples and case studies to their specific interests and needs.</p>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">4</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Select International/Regional Industry Standard</h5>
                            <div className="text-gray-400 text-[11px] leading-relaxed space-y-1">
                              <p>Choose your professional alignment:</p>
                              <p><span className="text-lime-400 font-bold flex items-center gap-1"><Globe className="w-3 h-3" /> Global (ISO/IEC):</span> High-level international standards for consistency across borders.</p>
                              <p><span className="text-lime-400 font-bold flex items-center gap-1"><MapPin className="w-3 h-3" /> Regional:</span> Standards specific to a geographic area or continent.</p>
                              <p><span className="text-lime-400 font-bold flex items-center gap-1"><Wrench className="w-3 h-3" /> Industry Specific:</span> Focused standards for fields like Medical, Legal, or Tech.</p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">5</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Course Tone & Style</h5>
                            <p className="text-gray-400 text-xs leading-relaxed">Choose whether the content should be academic/formal, storytelling, interactive coaching, humanized teaching modern Edutainment or scenario-based style. This sets the 'voice' for every slide I generate.</p>
                          </div>
                        </motion.div>

                      </motion.div>

                      <div className="mt-8 p-4 rounded-xl bg-lime-500/5 border border-lime-500/10 backdrop-blur-sm relative overflow-hidden group-hover:bg-lime-500/10 transition-colors duration-500">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lime-400 to-emerald-600"></div>
                        <div className="flex items-start gap-3 pl-2">
                          <span className="text-lime-400 mt-0.5 text-lg"><Rocket className="w-5 h-5" /></span>
                          <div>
                            <h6 className="text-lime-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Orion Insight</h6>
                            <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">The clearer your inputs, the smarter and more tailored your course will be.</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 text-center">
                        <p className="text-gray-500 text-xs font-semibold tracking-wide">
                          "Once you're ready, continue—I'll take care of the next step." <Sparkles className="inline-block w-4 h-4 text-lime-400" />
                        </p>
                      </div>

                    </div>
                  </motion.div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="pt-6 flex flex-col xl:flex-row gap-8 xl:gap-12 min-h-[600px]"
                >
                  <div className="flex-1 xl:w-[55%] bg-[#0A0A0B]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group space-y-8">
                    {/* Experience Level Removed from here */}

                    <div>
                      <div className="mb-2 flex justify-between items-center">
                        <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider">High-Level Description</label>
                        {showValidation && (courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0) >= 5000 && (
                          <span className="text-xs font-bold text-amber-500 animate-pulse uppercase tracking-widest flex items-center gap-1">
                            <Zap size={12} fill="currentColor" /> Maximum limit reached
                          </span>
                        )}
                      </div>
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => setIsDescriptionModalOpen(true)}
                          className="absolute left-3 top-4 z-10 p-1.5 rounded-lg transition-all bg-gray-800/80 text-gray-500 hover:text-white hover:bg-gray-700"
                          title="Edit description in full view"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <textarea
                          readOnly={!isDescriptionEditable || isRefiningDescription}
                          className={`w-full bg-gray-800/50 border rounded-2xl p-4 pl-12 min-h-[160px] ${isDescriptionEditable ? 'pb-16' : ''} focus:ring-2 focus:ring-lime-500 outline-none transition-all resize-none ${!isDescriptionEditable || isRefiningDescription ? 'cursor-default text-gray-400' : 'cursor-text text-white'} ${showValidation && (courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0) >= 5000
                            ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                            : showValidation && (!courseData.description?.trim() || courseData.description.trim().split(/\s+/).filter(Boolean).length < 50)
                              ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                              : 'border-gray-700'
                            }`}
                          placeholder="Describe the primary learning outcomes... (Minimum 50 words required)"
                          value={courseData.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                            const words = capitalized.trim().split(/\s+/).filter(Boolean);
                            if (words.length <= 5000) {
                              updateCourseData({ description: capitalized });
                            } else {
                              if (val.length < (courseData.description?.length || 0)) {
                                updateCourseData({ description: capitalized });
                              }
                            }
                          }}
                        />
                        {isRefiningDescription && (
                          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-lime-500/30 z-10">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
                              <span className="text-lime-400 text-sm font-semibold tracking-wide uppercase">Refining Description...</span>
                            </div>
                          </div>
                        )}
                        {showValidation && ((!courseData.description?.trim() || courseData.description.trim().split(/\s+/).filter(Boolean).length < 50) ||
                          (courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0) >= 5000) && (
                            <div className="absolute right-4 top-4 text-amber-500 animate-pulse pointer-events-none">
                              <Zap size={18} fill="currentColor" />
                            </div>
                          )}
                        {isDescriptionEditable && !isRefiningDescription && (
                          <div className="absolute right-4 bottom-4 animate-in fade-in zoom-in-95 duration-200 z-10">
                            <button
                              type="button"
                              onClick={() => setIsDescriptionEditable(false)}
                              className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-black px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-lime-500/30 transition-all uppercase tracking-wide"
                            >
                              <Check size={16} strokeWidth={3} /> SAVE
                            </button>
                          </div>
                        )}
                      </div>

                      {refinePromptOpen && (
                        <div className="mt-3 bg-gray-800/80 p-3 rounded-xl border border-lime-500/30 animate-in fade-in zoom-in-95 duration-200">
                          <label className="block text-xs font-semibold text-lime-400 uppercase tracking-wider mb-2">How should I refine this?</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={refinePromptText}
                              onChange={(e) => setRefinePromptText(e.target.value)}
                              placeholder="e.g., Make it shorter, focus more on beginners..."
                              className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRefineDescription();
                              }}
                            />
                            <button
                              onClick={handleRefineDescription}
                              disabled={isRefiningDescription || !refinePromptText.trim()}
                              className="bg-lime-500 hover:bg-lime-400 text-black px-4 py-2 rounded-lg text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                            >
                              {isRefiningDescription ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                              Refine
                            </button>
                            <button
                              onClick={() => { setRefinePromptOpen(false); setRefinePromptText(''); }}
                              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          Provide a detailed overview of the course goals and curriculum structure.
                        </p>
                        <button
                          type="button"
                          onClick={() => setRefinePromptOpen(!refinePromptOpen)}
                          className="flex items-center gap-1.5 text-xs text-lime-400 hover:text-lime-300 font-semibold uppercase tracking-wider transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Refine with AI
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider">Duration (Hours)</label>
                          {courseData.level && (
                            <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20 animate-in fade-in zoom-in duration-300 flex items-center gap-1">
                              <Sparkles size={10} /> RECOMMENDED BY ORION
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            className={`w-full bg-gray-800/50 border rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-lime-500 outline-none transition-all ${showValidation && (!(courseData.duration?.value) || (courseData.duration?.value ?? 0) <= 0) ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700'
                              }`}
                            placeholder="e.g. 10"
                            value={courseData.duration?.value === 0 ? '' : (courseData.duration?.value ?? '')}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value || 0));
                              // Recommended Modules: ~4-5 modules per hour
                              let recommendedModules = val * 4;
                              if (val <= 2) recommendedModules = val * 5; // Beginner level density

                              updateCourseData({
                                duration: { ...(courseData.duration || { value: 0, unit: 'Hours' }), value: val },
                                module: recommendedModules
                              });
                            }}
                          />
                          {showValidation && (!(courseData.duration?.value) || (courseData.duration?.value ?? 0) <= 0) && <WarningSign />}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider">Modules</label>
                          {courseData.level && (
                            <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20 animate-in fade-in zoom-in duration-300 flex items-center gap-1">
                              <Sparkles size={10} /> RECOMMENDED BY ORION
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            className={`w-full bg-gray-800/50 border rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-lime-500 outline-none transition-all ${showValidation && (courseData.module === undefined || courseData.module === null || courseData.module <= 0) ? 'border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-700'
                              }`}
                            placeholder="e.g. 4"
                            value={courseData.module === 0 ? '' : courseData.module}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                              updateCourseData({ module: val });
                            }}
                          />
                          {showValidation && (courseData.module === undefined || courseData.module === null || courseData.module <= 0) && <WarningSign />}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Each module is designed for 10-15 minutes of direct instructional content.
                        </p>
                      </div>
                    </div>

                    {courseData.level && (
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Duration and Modules are adjustable. Sticking near the recommended values ensures the AI can generate high-quality, balanced content for this specific Experience Level.
                        </p>
                      </div>
                    )}

                    <div className="mt-12 flex justify-between items-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={goToPrevStep}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10"
                        type="button"
                      >
                        <ChevronLeft size={20} /> Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToNextStep}
                        className="flex items-center gap-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 transform hover:-translate-y-0.5"
                        type="button"
                      >
                        Continue <ChevronRight size={20} strokeWidth={3} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Right Side: Orion Guidance for Step 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 xl:w-[45%] bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8"
                  >
                    {/* Background glow lines */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none"></div>

                    <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                      <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
                    </div>

                    <div className="relative z-10">
                      <div className="mb-6 pr-48 text-left min-h-[140px]">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight flex items-center gap-2">
                          Welcome to the second step <Sparkles className="text-lime-400 w-6 h-6 animate-pulse" />
                        </h3>
                        <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                          This step focuses on defining your course overview, <span className="text-lime-400 font-bold">structure</span>, and learning flow.
                        </p>
                      </div>

                      <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                      <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                        <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                          <Layers className="w-4 h-4 text-lime-400" />
                        </span>
                        Step-by-Step Guidance
                      </h4>

                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                      >
                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">1</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">High-Level Description</h5>
                            <p className="text-gray-400 text-xs leading-relaxed">I've generated a draft description for you. Review it to ensure it captures the essence of your course. <span className="text-lime-400">Pro Tip:</span> Use the edit tool to refine the focus—the more specific the description, the better the final modules.</p>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Total Course Duration</h5>
                            <p className="text-gray-400 text-xs leading-relaxed">
                              This value is <span className="text-lime-400 font-bold underline">recommended by me</span> based on your learner level.
                              <br /><br />
                              <span className="text-white font-medium">Scaling Logic:</span> My engine calculates an ideal learning density of <span className="text-lime-400">4–5 modules per hour</span>. Adjusting this duration will automatically recalculate the module count to ensure your course remains balanced and isn't too shallow or too overwhelming.
                            </p>
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 group/item">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">3</div>
                          <div>
                            <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Module Allocation</h5>
                            <p className="text-gray-400 text-xs leading-relaxed">
                              This allocation is <span className="text-lime-400 font-bold underline">recommended by me</span> for optimal content breakdown.
                              <br /><br />
                              <span className="text-white font-medium">Automatic Sync:</span> This number is dynamically calculated based on your <span className="text-lime-400">Duration</span> input. If you change the hours, I recalculate the modules so that each section remains focused on a single, digestible learning objective.
                            </p>
                          </div>
                        </motion.div>

                      </motion.div>

                      <div className="mt-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-sm relative overflow-hidden group-hover:bg-amber-500/10 transition-colors duration-500">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-600"></div>
                        <div className="flex items-start gap-3 pl-2">
                          <span className="text-amber-400 mt-0.5 text-lg"><AlertTriangle className="w-5 h-5" /></span>
                          <div>
                            <h6 className="text-amber-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Note</h6>
                            <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">You can adjust duration and modules, but staying close to the recommended values helps maintain content quality and structure.</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="pt-6 flex flex-col xl:flex-row gap-8 xl:gap-12 min-h-[600px] h-full"
                >
                  {/* Left Side: Form Content */}
                  <div className="flex-1 xl:w-[66%] bg-[#0A0A0B]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group flex flex-col h-full">
                    {!hasBlueprint && !isBlueprinting ? (
                      <div className="flex-1 flex flex-col h-full">
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                          <div className="bg-gray-800/50 p-8 rounded-full mb-6 border border-gray-700">
                            <Sparkles className="w-16 h-16 text-lime-400" />
                          </div>
                          <h2 className="text-3xl font-bold mb-4">Module Blueprinting</h2>
                          <p className="text-gray-400 max-w-lg mb-10 leading-relaxed">
                            Based on your inputs, ORION is ready to architect {courseData.module} specialized modules for <span className="text-lime-400">"{courseData.title || 'Your Course'}"</span>.
                          </p>
                          <div className="relative group">
                            {/* Confirmation Popup */}
                            <AnimatePresence>
                              {showGenerateWarning && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-72 bg-[#1a1c24] border border-red-500/30 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-xl"
                                >
                                  <div className="flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                                      <AlertTriangle className="text-red-500 w-6 h-6 animate-pulse" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Are you sure?</h4>
                                    <p className="text-gray-400 text-[11px] leading-relaxed mb-4">
                                      Once generation begins, <span className="text-red-400 font-bold underline">there's no turning back</span>. Your core settings will be locked in to architect the modules.
                                    </p>
                                    <div className="flex gap-2 w-full">
                                      <button
                                        onClick={() => setShowGenerateWarning(false)}
                                        className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-black uppercase tracking-widest transition-all"
                                      >
                                        No
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowGenerateWarning(false);
                                          generateOrionPreview();
                                        }}
                                        className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                                      >
                                        Yes
                                      </button>
                                    </div>
                                  </div>
                                  {/* Arrow */}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-[#1a1c24]"></div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <button
                              onClick={() => setShowGenerateWarning(true)}
                              className="flex items-center gap-3 bg-lime-500 hover:bg-lime-400 text-black px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-lime-500/20"
                              type="button"
                            >
                              <Zap size={24} /> Generate Modules
                            </button>
                          </div>
                        </div>
                        <div className="mt-auto pt-8 flex justify-start">
                          <button
                            onClick={goToPrevStep}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                            type="button"
                          >
                            <ChevronLeft size={20} /> Back
                          </button>
                        </div>
                      </div>
                    ) : isBlueprinting ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <div className="relative w-44 h-44 mb-10">
                          <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
                          <div
                            className="absolute inset-0 rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(132,204,22,0.15)]"
                            style={{
                              background: `conic-gradient(#84cc16 ${blueprintingProgress}%, transparent ${blueprintingProgress}%)`,
                              WebkitMask: 'radial-gradient(transparent 64%, black 65%)',
                              mask: 'radial-gradient(transparent 64%, black 65%)'
                            }}
                          />
                          <div className="absolute inset-0 border-4 border-lime-500/20 rounded-full border-t-transparent animate-spin" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Zap className="text-lime-400 w-12 h-12 animate-pulse mb-1 drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]" />
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-4xl font-black text-white tracking-tight">{Math.round(blueprintingProgress)}</span>
                              <span className="text-lg font-bold text-lime-500">%</span>
                            </div>
                          </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-3">Architecting Modules</h2>
                        <p className="text-gray-400 animate-pulse font-mono uppercase text-xs tracking-widest mb-10">Compiling datasets & structuring learning paths...</p>

                        <div className="w-full max-w-md">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 px-1">
                            <span>Progress</span>
                            <span>Module {Math.min(Math.floor((blueprintingProgress / 100) * (courseData.module || 1)) + 1, courseData.module || 1)} of {courseData.module}</span>
                          </div>
                          <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden border border-gray-700 p-0.5 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                              style={{ width: `${blueprintingProgress}%` }}
                            />
                          </div>
                          <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {Array.from({ length: courseData.module ?? 0 }).map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all duration-500 ${idx < Math.floor((blueprintingProgress / 100) * (courseData.module || 1)) ? 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.6)]' : 'bg-gray-800'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                          <div>
                            <h2 className="text-4xl font-black tracking-tight text-white mb-2">Curriculum Blueprint</h2>
                            <div className="flex items-center gap-2">
                              <p className="text-gray-400 text-sm font-medium">Here is your Curriculum Blueprint — review and finalize the course structure, modules.</p>
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                                <AlertTriangle size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Navigation Locked</span>
                              </div>
                            </div>
                            <p className="text-red-400/80 text-[11px] font-bold mt-1 uppercase tracking-widest italic">Once generated, you won’t be able to return to this section.</p>
                          </div>

                          <button
                            onClick={() => {
                              const shuffled: Record<number, string> = {};
                              previewModules.forEach(m => {
                                shuffled[m.id] = GAMMA_THEMES[Math.floor(Math.random() * GAMMA_THEMES.length)].id;
                              });
                              setThemeByModule(shuffled);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-lime-400 rounded-xl border border-white/10 transition-all font-bold text-[10px] uppercase tracking-widest group"
                            type="button"
                          >
                            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Shuffle Themes
                          </button>

                        </div>

                        {/* Theme Modal */}
                        {isThemeModalOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-[#12141a] border border-gray-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                              {/* Modal Header */}
                              <div className="flex justify-between items-center p-6 border-b border-gray-800">
                                <div>
                                  <h3 className="text-2xl font-bold text-white mb-1">
                                    {selectedModuleForTheme !== null ? `Choose Theme for Module ${selectedModuleForTheme}` : 'Choose Default Theme for Slides'}
                                  </h3>
                                  <p className="text-gray-400 text-sm">Select a visual style for your Orion generated presentation.</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setIsThemeModalOpen(false);
                                    setSelectedModuleForTheme(null);
                                  }}
                                  className="p-2 text-gray-500 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all"
                                  type="button"
                                >
                                  <X size={20} />
                                </button>
                              </div>

                              {/* Modal Body */}
                              <div className="p-6 overflow-y-auto custom-scrollbar">
                                {/* Category Filter */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                  {THEME_CATEGORIES.map(cat => (
                                    <button
                                      key={cat}
                                      onClick={() => setThemeFilter(cat)}
                                      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${themeFilter === cat ? 'bg-transparent text-white border border-gray-600' : 'bg-transparent text-gray-500 border border-gray-800 hover:border-gray-600 hover:text-gray-300'}`}
                                      type="button"
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>

                                {/* Theme Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                  {GAMMA_THEMES.filter(t => themeFilter === 'All' || t.category === themeFilter).map(theme => (
                                    <motion.button
                                      key={theme.id}
                                      whileHover={{ scale: 1.02, y: -2 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => {
                                        if (selectedModuleForTheme !== null) {
                                          setThemeByModule(prev => ({ ...prev, [selectedModuleForTheme]: theme.id }));
                                          setIsThemeModalOpen(false);
                                          setSelectedModuleForTheme(null);
                                        } else {
                                          updateCourseData({ orionTheme: theme.id });
                                          setIsThemeModalOpen(false);
                                        }
                                      }}
                                      className={`flex flex-col text-left rounded-[20px] p-4 border transition-all duration-300 ${(selectedModuleForTheme !== null ? (themeByModule[selectedModuleForTheme] || courseData.orionTheme) : courseData.orionTheme) === theme.id
                                        ? 'border-lime-500 bg-[#1e222b] shadow-[0_0_15px_rgba(132,204,22,0.1)]'
                                        : 'border-gray-800/80 hover:border-gray-600 bg-[#171a21]'}`}
                                      type="button"
                                    >
                                      <div className={`w-full h-20 rounded-xl mb-4 ${theme.gradient} shadow-inner flex items-center justify-center`}>
                                        <div className="flex gap-1.5">
                                          {theme.colors.slice(0, 3).map((c, i) => (
                                            <div key={i} className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c }} />
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex flex-col w-full">
                                        <div className="flex justify-between items-start mb-2">
                                          <span className="font-bold text-white text-base">{theme.name}</span>
                                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-lime-500/10 text-lime-400 font-black uppercase tracking-tighter">{theme.category}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {theme.style.split(', ').map(tag => (
                                            <span key={tag} className="px-1.5 py-0.5 rounded bg-black/40 text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </motion.button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="relative flex-1 min-h-0">
                          <div
                            ref={scrollRefModules}
                            onScroll={handleModulesScroll}
                            className="grid grid-cols-1 gap-8 overflow-y-auto max-h-[550px] pr-4 custom-scrollbar scroll-smooth"
                          >
                            {previewModules.map((mod) => (
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
                                  {mod.lessons.map((lesson, idx) => (
                                    <p key={idx} className="text-base text-gray-400 flex items-center gap-4 group/lesson transition-colors hover:text-gray-200 py-1">
                                      <span className="w-2 h-2 bg-gray-700 rounded-full group-hover/lesson:bg-lime-500 transition-colors" /> {lesson.title}
                                    </p>
                                  ))}
                                </div>
                                {(() => {
                                  return (
                                    <div className="flex-1 flex flex-col">
                                      {/* Action Hub - Moved from bottom */}
                                      <div className="space-y-3 mb-6">
                                        {/* Theme Selector inside Module Card */}
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
                            ))}
                          </div>
                        </div>

                        <div className="mt-auto pt-8 flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={goToNextStep}
                            className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-lime-500/20 transition-all"
                            type="button"
                          >
                            Looks Good, Continue <ChevronRight size={20} />
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Orion Guidance for Step 4 */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 xl:w-[30%] xl:ml-auto bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8"
                  >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none"></div>

                    <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                      <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full max-h-[80vh]">
                      {!hasBlueprint ? (
                        <>
                          <div className="mb-6 pr-48 text-left min-h-[140px]">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                              Design the Blueprint <Construction className="inline-block w-5 h-5 ml-1 text-lime-400" />
                            </h3>
                            <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                              In this section, I am going to architecture the modules for you. Please wait while I process the information.
                              <span className="block mt-2 text-red-400 font-bold italic">Once you click 'Generate Modules', you cannot change any setting by going back.</span>
                            </p>
                          </div>

                          <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                            <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                              <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                                <Lightbulb className="w-4 h-4 text-lime-400" />
                              </span>
                              Guidance
                            </h4>

                            <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                              className="space-y-6"
                            >
                              <motion.div variants={itemVariants} className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                                <h5 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">What Happens Here?</h5>
                                <ul className="text-gray-400 text-xs space-y-2 leading-relaxed">
                                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-lime-500"></div>Curating specialized lesson topics</li>
                                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-lime-500"></div>Balanced learning progression</li>
                                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-lime-500"></div>Content aligned with your selected style and level</li>
                                </ul>
                              </motion.div>

                              <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">1</div>
                                <div>
                                  <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Generate Module</h5>
                                  <p className="text-gray-400 text-xs leading-relaxed">Click Generate module and I will synthesize all your inputs—title, files, and description—to build a logical flow of modules.</p>
                                </div>
                              </motion.div>

                              <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                                <div>
                                  <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Review & Edit Blueprint</h5>
                                  <p className="text-gray-400 text-xs leading-relaxed">Once the curriculum appears, you can hover over any module to edit titles or reorder them. This is your chance to fine-tune the story before slide creation.</p>
                                </div>
                              </motion.div>
                            </motion.div>

                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-6 pr-48 text-left min-h-[140px]">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                              Curriculum Blueprint <Rocket className="inline-block w-5 h-5 ml-1 text-lime-400" />
                            </h3>
                            <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                              This step focuses on reviewing your course <span className="text-lime-400 font-bold">structure</span> and preparing your final module content for generation.
                              <span className="block mt-2 text-red-400 font-bold italic">Once the course is generated you cannot navigate to previous steps.</span>
                            </p>
                          </div>

                          <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                            <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                              <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                                <Layers className="w-4 h-4 text-lime-400" />
                              </span>
                              Advanced Blueprint Tools
                            </h4>

                            <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                              className="space-y-6"
                            >
                              <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">1</div>
                                <div>
                                  <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Review Generated Module content</h5>
                                  <p className="text-gray-400 text-xs leading-relaxed">Click view button inside each module and walk through the module wise content. I've logicaly organized your topics into a sequence that ensures a smooth learning curve for the students. But still You can adjust the module content by scrolling down at the buttom of that section which is named as "<span className="text-lime-400 font-bold">Refine Your Architecture</span>".</p>
                                </div>
                              </motion.div>

                              <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                                <div>
                                  <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Review Generated Module Slide Content</h5>
                                  <p className="text-gray-400 text-xs leading-relaxed">Click the Slides button inside each module to preview the automatically generated slide content. I have transformed your lesson structure into clear, engaging slides designed for effective learning delivery.</p>
                                </div>
                              </motion.div>
                              <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">3</div>
                                <div>
                                  <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Choose slide theme</h5>
                                  <p className="text-gray-400 text-xs leading-relaxed">Before generating slide i have added choose theme section in each module section by clicking change button you can select desired theme "<span className="text-lime-400 font-bold">note: you can change the theme for each slide seperately </span>"</p>
                                </div>
                              </motion.div>

                              <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">4</div>
                                <div>
                                  <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Final Slide Engine</h5>
                                  <p className="text-gray-400 text-xs leading-relaxed">Once satisfied, and choosed the theme click <span className="text-lime-400 font-bold">'Generate Orion Slides'</span> . and once you click Generate orion slide I'll start generating slides based on you input and"<span className="text-lime-400 font-bold"> please wait it may take some time based on the modules you have selected. </span>" </p>
                                </div>
                              </motion.div>



                              <motion.div variants={itemVariants} className="flex gap-4 group/item">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">5</div>
                                <div>
                                  <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Next (Final Review)</h5>
                                  <p className="text-gray-400 text-xs leading-relaxed">After generating slides, click 'Continue' to perform the final review before launching your course.</p>
                                </div>
                              </motion.div>
                            </motion.div>

                            {/* ── AUTO-GENERATE HIGHLIGHT CALLOUT ── */}
                            <motion.div
                              variants={itemVariants}
                              className="relative mt-6 rounded-2xl overflow-hidden border border-lime-500/40 bg-gradient-to-br from-lime-500/10 via-emerald-500/5 to-transparent p-4 shadow-[0_0_24px_rgba(132,204,22,0.12)]"
                              style={{ animation: 'pulse-lime-border 2.5s ease-in-out infinite' }}
                            >
                              {/* Glow blob */}
                              <div className="absolute -top-6 -right-6 w-24 h-24 bg-lime-500/20 rounded-full blur-2xl pointer-events-none" />

                              {/* Header row */}
                              <div className="flex items-center gap-2 mb-2 relative z-10">
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-lime-500/20 border border-lime-500/40 shadow-inner shrink-0">
                                  <Zap className="w-4 h-4 text-lime-400 fill-lime-400" />
                                </span>
                                <h5 className="text-lime-400 font-black text-[11px] uppercase tracking-[0.18em]">
                                  Auto-Generate on Continue
                                </h5>
                                {/* <span className="ml-auto px-2 py-0.5 rounded-full bg-lime-500/20 border border-lime-500/30 text-lime-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
                                  NEW
                                </span> */}
                              </div>

                              {/* Body */}
                              <p className="text-gray-300 text-xs leading-relaxed relative z-10">
                                Clicking{' '}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-lime-500 text-black font-black text-[10px] tracking-wide shadow-md shadow-lime-500/30 mx-0.5">
                                  Looks Good, Continue <ChevronRight className="w-3 h-3" />
                                </span>{' '}
                                will <span className="text-lime-400 font-bold">automatically start generating Orion Slides</span> for{' '}
                                <span className="text-white font-bold">all your modules at once</span> — no need to click{' '}
                                <span className="text-gray-200 font-semibold italic">"Generate Orion Slides"</span> individually on each module.
                              </p>

                              <div className="mt-3 flex items-center gap-1.5 relative z-10">
                                <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                                <p className="text-gray-400 text-[10px] italic">
                                  Sit back — batch generation will run automatically in the background.
                                </p>
                              </div>
                            </motion.div>

                          </div>
                        </>
                      )}


                      <div className="mt-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm relative overflow-hidden transition-colors duration-500 hover:bg-gray-800/50 mx-1 shrink-0">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-500 to-gray-700"></div>
                        <div className="flex items-start gap-4 pl-2">
                          <span className="text-gray-400 bg-gray-800/80 p-1.5 rounded-lg border border-gray-700"><Zap className="w-4 h-4 text-lime-400" /></span>
                          <div>
                            <h6 className="text-gray-300 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Tip</h6>
                            <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">Make sure your previous inputs are accurate, as the generated modules will directly depend on them.</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 pb-2 text-center shrink-0">
                        <p className="text-gray-500 text-xs font-semibold tracking-wide">
                          "Once you're ready, continue—I'll take care of the next step." <Sparkles className="inline-block w-4 h-4 text-lime-400" />
                        </p>
                      </div>

                    </div>
                  </motion.div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="pt-6 flex flex-col xl:flex-row gap-8 xl:gap-12 min-h-[600px] h-full"
                >
                  {/* Left Side: Form Content */}
                  <div className="flex-1 xl:w-[55%] bg-[#0A0A0B]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group flex flex-col h-full">
                    <div className="grid lg:grid-cols-3 gap-8 mb-10 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar flex-1">
                      <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-800">
                          <h4 className="text-xs font-black text-lime-500 uppercase tracking-widest mb-4">Specs Snapshot</h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs text-gray-500">TITLE</p>
                              <p className="font-bold text-white leading-tight">{courseData.title || 'Untitled Course'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500">LEVEL</p>
                                <p className="font-bold text-white">{courseData.level}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">DURATION</p>
                                <p className="font-bold text-white">{courseData.duration?.value ?? 0} {courseData.duration?.unit ?? 'Hours'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">AUDIENCE</p>
                              <p className="text-sm text-gray-300 italic">"{formatAudience(courseData.audience)}"</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-2 space-y-4">
                        {previewModules.map((mod) => (
                          <div key={mod.id} className="group bg-gray-800/30 hover:bg-gray-800/60 p-6 rounded-3xl border border-gray-800 transition-all">
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="font-bold text-lg text-white group-hover:text-lime-400 transition-colors">Module {mod.id}: {mod.title}</h5>
                              <span className="text-[10px] font-black bg-gray-700 px-2 py-1 rounded text-gray-400 tracking-tighter">CERTIFIED</span>
                            </div>
                            <div className="flex items-center gap-1.5 mb-4">
                              <div className="px-2 py-0.5 rounded-md bg-lime-500/10 border border-lime-500/20 text-[9px] font-black text-lime-400 uppercase tracking-wider flex items-center gap-1">
                                <Zap size={10} className="fill-lime-400" /> {moduleCredits[mod.id] || 0} Credits
                              </div>
                            </div>
                            {prefetchedSlidesMap[mod.id]?.Slides?.length > 0 && (
                              <div className="pt-2 flex gap-2">
                                {orionUrlByModule[mod.id] && (
                                  <button
                                    onClick={() => openSlidesPreview(mod.id, true)}
                                    disabled={isPreviewLoading}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase rounded-xl border border-lime-500/20 text-lime-400 bg-lime-500/10 hover:bg-lime-500/20 transition-all disabled:opacity-50"
                                    type="button"
                                  >
                                    <Book size={14} />
                                    View Deck
                                  </button>
                                )}
                                <button
                                  onClick={() => downloadModulePPTX(mod.id)}
                                  disabled={downloadingModuleId === mod.id}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase bg-lime-500/10 hover:bg-lime-500/20 rounded-xl border border-lime-500/20 text-lime-400 transition-all disabled:opacity-50"
                                  type="button"
                                >
                                  {downloadingModuleId === mod.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Download size={14} />
                                  )}
                                  {downloadingModuleId === mod.id ? 'Downloading...' : 'Download PPTX'}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-auto pt-6 border-t border-gray-800 flex justify-between items-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={goToPrevStep}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                        type="button"
                      >
                        <ChevronLeft size={20} /> Back to Blueprint
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLaunchCourse}
                        className="flex items-center gap-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
                        type="button"
                        disabled={isGeneratingSlides || isGeneratingContent}
                      >
                        {isGeneratingContent ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        Launch Course
                      </motion.button>
                    </div>
                  </div>

                  {/* Right Side: Orion Guidance for Step 5 */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 xl:w-[45%] bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8"
                  >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none"></div>

                    <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                      <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full max-h-[80vh]">
                      <div className="mb-6 pr-48 text-left min-h-[140px]">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                          Final Review & Launch <Rocket className="inline-block w-5 h-5 ml-1 text-lime-400" />
                        </h3>
                        <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                          You’re all set <CheckCircle2 className="inline-block w-5 h-5 ml-1 text-lime-400" /><br />This is the final step where you review your course and prepare to <span className="text-lime-400 font-bold">launch</span> it.
                        </p>
                      </div>

                      <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                          <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                            <Layers className="w-4 h-4 text-lime-400" />
                          </span>
                          What You Can Do Here
                        </h4>

                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-6"
                        >
                          <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">1</div>
                            <div>
                              <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Specs Snapshot</h5>
                              <p className="text-gray-400 text-xs leading-relaxed">Review the final metadata of your course—Learner level, Style, and Duration. This ensures all background settings are locked in correctly.</p>
                            </div>
                          </motion.div>

                          <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                            <div>
                              <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Asset Delivery</h5>
                              <p className="text-gray-400 text-xs leading-relaxed">Download your **PPTX** file directly or use the **Slide Deck** generator for advanced visual styling. All your generated content is bundled here.</p>
                            </div>
                          </motion.div>

                          <motion.div variants={itemVariants} className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">3</div>
                            <div>
                              <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Final Launch</h5>
                              <p className="text-gray-400 text-xs leading-relaxed">Hit **'Launch Course'** to finalize the project in the system. This saves all your work to your main dashboard.</p>
                            </div>
                          </motion.div>
                        </motion.div>

                        <div className="mt-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-sm relative overflow-hidden group-hover:bg-amber-500/10 transition-colors duration-500 mb-2">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-600"></div>
                          <div className="flex items-start gap-3 pl-2">
                            <span className="text-amber-400 mt-0.5 text-lg"><Zap className="w-5 h-5" /></span>
                            <div>
                              <h6 className="text-amber-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Final Note</h6>
                              <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">Your course is now fully structured and ready to deliver a complete learning experience.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm relative overflow-hidden transition-colors duration-500 hover:bg-gray-800/50 mx-1 shrink-0">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-500 to-gray-700"></div>
                        <div className="flex items-start gap-4 pl-2">
                          <span className="text-gray-400 bg-gray-800/80 p-1.5 rounded-lg border border-gray-700"><ChevronLeft size={16} /></span>
                          <div>
                            <h6 className="text-gray-300 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Navigation Help</h6>
                            <p className="text-gray-400 text-xs italic opacity-90 leading-relaxed max-w-[95%]">
                              Click <span className="text-gray-300 font-semibold">Exit Architect</span> at the top right to return back to the dashboard "<span className="text-red-500 font-semibold"> once you click the exit button you can can't return back to the course creator form</span> ."
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 pb-2 text-center shrink-0">
                        <p className="text-lime-400 text-xs font-bold tracking-wide uppercase">
                          “Launch your course and start sharing your knowledge →” <Rocket className="inline-block w-5 h-5 ml-1 text-lime-400" />
                        </p>
                      </div>

                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global AI Warning Footer */}
            <div className="mt-8 mb-4 flex flex-col items-center justify-center gap-1 opacity-80 animate-pulse">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <p className="text-[10px] sm:text-xs text-amber-500 uppercase tracking-widest font-black text-center">
                  Warning: AI can make mistakes. Please verify all generated content before launching.
                </p>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-[9px] sm:text-[10px] text-amber-500/60 uppercase tracking-[0.2em] font-bold">
                Internet connectivity may also affect the generation time
              </p>
            </div>

          </div>
        </div>
      </main>


      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4d7c0f; }
        
        @keyframes blink-lime {
          0%, 100% { border-color: rgba(132, 204, 22, 0.3); box-shadow: 0 0 0 rgba(132, 204, 22, 0); }
          50% { border-color: rgba(132, 204, 22, 0.8); box-shadow: 0 0 20px rgba(132, 204, 22, 0.2); }
        }
        .animate-blink-module {
          animation: blink-lime 1s ease-in-out infinite;
          border-width: 2px !important;
        }
        @keyframes pulse-lime-border {
          0%, 100% { border-color: rgba(132, 204, 22, 0.4); box-shadow: 0 0 24px rgba(132, 204, 22, 0.08); }
          50% { border-color: rgba(132, 204, 22, 0.75); box-shadow: 0 0 32px rgba(132, 204, 22, 0.22); }
        }
      `}</style>

      {/* Batch Slide Generation Progress Overlay / Dynamic Live Preview Dashboard */}
      <AnimatePresence>
        {isBatchGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#0B0C10] border border-white/[0.08] w-full max-w-7xl h-[88vh] rounded-[2.5rem] p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row gap-8 backdrop-blur-3xl"
            >
              {/* Left Side: Progress tracker and Scrollable Module list */}
              <div className="w-full md:w-[38%] flex flex-col h-full min-h-0 border-r border-white/5 pr-0 md:pr-8">
                <div className="relative shrink-0 flex items-center gap-5 mb-6">
                  {/* Progress Circle container */}
                  <div className="relative w-24 h-24 shrink-0">
                    <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
                    <div
                      className="absolute inset-0 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(132,204,22,0.15)]"
                      style={{
                        background: `conic-gradient(#84cc16 ${batchSlidesDisplayProgress}%, transparent ${batchSlidesDisplayProgress}%)`,
                        WebkitMask: 'radial-gradient(transparent 64%, black 65%)',
                        mask: 'radial-gradient(transparent 64%, black 65%)'
                      }}
                    />
                    <div className="absolute inset-0 border-4 border-lime-500/10 rounded-full border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Zap className="text-lime-400 w-6 h-6 animate-pulse mb-0.5" />
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-black text-white tracking-tight">{Math.round(batchSlidesDisplayProgress)}</span>
                        <span className="text-[10px] font-bold text-lime-500">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5 tracking-tight flex items-center gap-2">
                      Live Studio <Sparkles className="w-5 h-5 text-lime-400 animate-pulse" />
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
                      Orion is baking slide layouts. Click any <span className="text-lime-400 font-bold">Ready</span> module to watch the slides!
                    </p>
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="shrink-0 mb-6 bg-gray-900/40 border border-white/5 p-4 rounded-2xl">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    <span>Batch Generation</span>
                    <span>Module {Math.min(batchSlidesProgress.completed + 1, batchSlidesProgress.total)} of {batchSlidesProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-800/40 rounded-full h-2 overflow-hidden border border-gray-800 p-0.5">
                    <div
                      className="bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(132,204,22,0.4)]"
                      style={{ width: `${batchSlidesDisplayProgress}%` }}
                    />
                  </div>
                </div>

                <div className="shrink-0 text-xs font-black uppercase tracking-widest text-gray-500 mb-3 text-left">Modules status</div>

                {/* Module List scrollbox */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 custom-scrollbar min-h-0">
                  {previewModules.map((mod) => {
                    const isGenerated = !!orionUrlByModule[mod.id];
                    const isGenerating = batchGeneratingModuleId === mod.id;
                    const activePreviewId = batchSelectedModuleIdForPreview || batchGeneratingModuleId || (previewModules[0]?.id);
                    const isActive = activePreviewId === mod.id;

                    return (
                      <button
                        key={mod.id}
                        onClick={() => isGenerated && setBatchSelectedModuleIdForPreview(mod.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group/item ${isActive
                          ? 'border-lime-500/80 bg-lime-500/[0.07] shadow-[0_0_20px_rgba(132,204,22,0.05)]'
                          : isGenerated
                            ? 'border-gray-800/60 bg-gray-900/20 hover:border-gray-700 hover:bg-gray-800/30'
                            : 'border-gray-800/40 bg-gray-900/10 cursor-not-allowed opacity-60'
                          }`}
                        disabled={!isGenerated}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isActive
                            ? 'bg-lime-500 text-black'
                            : isGenerated
                              ? 'bg-lime-500/10 text-lime-400'
                              : 'bg-gray-800 text-gray-500'
                            }`}>
                            {mod.id}
                          </span>
                          <span className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-white' : 'text-gray-300 group-hover/item:text-white'
                            }`}>
                            {mod.title}
                          </span>
                        </div>

                        {/* Status indicators */}
                        <div className="shrink-0 flex items-center gap-2">
                          {isGenerated ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase text-emerald-400">
                              <Check className="w-3 h-3" /> Ready
                            </span>
                          ) : isGenerating ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-[9px] font-black uppercase text-lime-400 animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin" /> Baking
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-[9px] font-black uppercase text-gray-500">
                              <Clock className="w-3 h-3" /> Queued
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Interactive Slide Preview container */}
              <div className="flex-1 flex flex-col h-full min-h-0 bg-black/50 border border-white/[0.04] rounded-3xl overflow-hidden relative shadow-inner">
                {(() => {
                  const activePreviewId = batchSelectedModuleIdForPreview || batchGeneratingModuleId || (previewModules[0]?.id);
                  const activeUrl = activePreviewId ? orionUrlByModule[activePreviewId] : null;

                  if (activeUrl) {
                    return (
                      <div className="w-full h-full flex flex-col relative animate-in fade-in duration-500">
                        {/* Interactive floating indicator */}
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-lime-500/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-lime-400 shadow-lg">
                          <div className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                          <span>Previewing Module {activePreviewId} Generated Deck</span>
                        </div>
                        <iframe
                          src={activeUrl.replace('/docs/', '/embed/').replace('/view/', '/embed/')}
                          className="w-full h-full border-0 bg-transparent relative z-0"
                          allowFullScreen
                          title="Generated Slide deck preview"
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden h-full">
                        {/* Glow spots */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center max-w-sm">
                          <div className="relative p-6 bg-lime-500/10 border border-lime-500/20 rounded-full mb-6">
                            <Monitor className="w-10 h-10 text-lime-400 animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lime-500 animate-ping" />
                          </div>

                          <h3 className="text-lg font-black text-white tracking-wide mb-2">
                            Designing Module {activePreviewId} Slides
                          </h3>
                          <p className="text-gray-400 text-xs leading-relaxed mb-6 max-w-xs font-medium">
                            Orion is compiling layouts, templates, and interactive media segments in the background. The live deck will auto-load here in seconds.
                          </p>

                          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-lime-500/60 uppercase">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Working...
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedModule && (
        <ModuleViewer
          moduleData={selectedModule}
          onClose={() => setSelectedModule(null)}
          onRegenerate={() => regenerateSingleModule(selectedModule.id)}
          onRefine={(prompt, history) => refineSingleModule(selectedModule.id, prompt, history)}
          isRegenerating={isPreviewLoading}
          refineProgress={refineProgress}
          credit={moduleCredits[selectedModule.id]}
          duration={`${courseData.duration?.value ?? 0} ${courseData.duration?.unit ?? 'Hours'}`}
        />
      )}
      {selectedSlide && (
        <SlideContent
          moduleData={selectedSlide}
          onClose={() => setSelectedSlide(null)}
        />
      )}

      <footer className="relative z-10 py-8 px-6 text-center text-gray-600 text-xs border-t border-gray-900 mt-20">
      </footer>


      <AnimatePresence>
        {isDescriptionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsDescriptionModalOpen(false)}
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-3xl bg-[#0d0f1a] border border-white/10 rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20">
                    <Pencil className="w-4 h-4 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white tracking-wide">Edit High-Level Description</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">Write a detailed overview of your course goals and curriculum</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDescriptionModalOpen(false)}
                  className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-8 py-6 space-y-4">
                <div className="relative">
                  <textarea
                    autoFocus
                    className="w-full bg-gray-900/60 border border-gray-700 rounded-2xl p-5 min-h-[340px] text-white text-sm leading-relaxed focus:ring-2 focus:ring-lime-500 focus:border-lime-500/50 outline-none transition-all resize-none placeholder:text-gray-600"
                    placeholder="Describe the primary learning outcomes, target skills, curriculum structure, and what makes this course unique... (Minimum 50 words required)"
                    value={courseData.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                      const words = capitalized.trim().split(/\s+/).filter(Boolean);
                      if (words.length <= 5000) {
                        updateCourseData({ description: capitalized });
                      }
                    }}
                  />
                </div>

                {/* Refine with AI row inside modal */}
                {refinePromptOpen && (
                  <div className="bg-gray-800/60 p-4 rounded-xl border border-lime-500/20 animate-in fade-in zoom-in-95 duration-200">
                    <label className="block text-xs font-semibold text-lime-400 uppercase tracking-wider mb-2">How should Orion refine this?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={refinePromptText}
                        onChange={(e) => setRefinePromptText(e.target.value)}
                        placeholder="e.g., Make it shorter, focus more on beginners..."
                        className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRefineDescription(); }}
                      />
                      <button
                        onClick={handleRefineDescription}
                        disabled={isRefiningDescription || !refinePromptText.trim()}
                        className="bg-lime-500 hover:bg-lime-400 text-black px-4 py-2 rounded-lg text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                      >
                        {isRefiningDescription ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Refine
                      </button>
                      <button
                        onClick={() => { setRefinePromptOpen(false); setRefinePromptText(''); }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between px-8 py-5 border-t border-white/5 bg-white/[0.01]">
                <button
                  type="button"
                  onClick={() => setRefinePromptOpen(!refinePromptOpen)}
                  className="flex items-center gap-1.5 text-xs text-lime-400 hover:text-lime-300 font-semibold uppercase tracking-wider transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Refine with AI
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDescriptionModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDescriptionModalOpen(false)}
                    className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-black px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-lime-500/20 transition-all"
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                    Save Description
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default CourseCreatorForm;