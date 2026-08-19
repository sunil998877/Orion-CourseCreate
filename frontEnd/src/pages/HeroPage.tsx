import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { API_BASE, ORIGIN } from '../utils/api';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  User,
  Clock,
  BookOpen,
  Shield,
  Plus,
  ArrowLeft,
  Trash2,
  Headphones,
  Loader2,
  Download,
  Zap,
  BookText,
  Sparkles,
  Layers,
  Rocket,
  Globe,
  MapPin,
  Wrench,
  ChevronRight,
  Eye,
  FileText,
  Camera
} from 'lucide-react';
import ModuleGen from './Modules/ModuleGen';
import { useCourseData } from '../contextAPI/courseAPI';
import avatar from '../assests/avatar.png';

export const HeroPage: React.FC = () => {
  type Course = {
    _id?: string;
    title: string;
    description?: string;
    audience?: string;
    type?: string;
    module?: number;
    level?: string;
    duration?: { value: number; unit: string };
    country?: string;
    standards?: string;
    audioUrl?: string;
    audioTranscript?: string;
    ebookUrl?: string;
    ebookStatus?: 'idle' | 'generating' | 'completed' | 'failed';
    podcastUrl?: string;
    podcastTranscript?: string;
    podcastScript?: { speaker: string; text: string }[];
    podcastStatus?: 'idle' | 'generating' | 'completed' | 'failed';
    courseId?: string;
    createdAt?: string;
  };
  const [view, setView] = useState<'list' | 'details'>('list');
  const navigate = useNavigate();

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const [courseData, setCourseData] = useState<Course>({
    title: '',
    description: '',
    audience: '',
    type: '',
    module: 0,
    level: '',
    duration: { value: 0, unit: 'hours' },
    country: '',
    standards: '',
    audioUrl: '',
    ebookUrl: '',
    ebookStatus: 'idle',
    podcastUrl: '',
    podcastScript: [],
    podcastStatus: 'idle',
    createdAt: ''
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchParams] = useSearchParams();
  const isSearching = Boolean(searchParams.get('q'));

  const { updateCourseData } = useCourseData();

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const q = searchParams.get('q');
        const url = q
          ? `${API_BASE}/courses/search?q=${encodeURIComponent(q)}`
          : `${API_BASE}/courses/get-user-courses`;
        const resp = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          console.log('Fetched courses:', data);
          let fetchedCourses = Array.isArray(data) ? data : [];
          fetchedCourses = fetchedCourses.filter(c => {
            if (!c.modules || c.modules.length === 0) return false;
            return c.modules.every((m: any) => m.gammaUrl);
          });
          setCourses(fetchedCourses);
        } else {
          console.error('Fetch courses failed:', resp.status, resp.statusText);
          const text = await resp.text();
          console.error('Response text:', text);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchCourses();
  }, [searchParams]);

  // Search query is controlled by the top bar component via URL ?q= param

  const [toDelete, setToDelete] = useState<Course | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Podcast States
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [podcastProgress, setPodcastProgress] = useState(0);
  const [showPodcastPlayer, setShowPodcastPlayer] = useState(false);
  const [showPodcastTranscript, setShowPodcastTranscript] = useState(false);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [podcastCurrentTime, setPodcastCurrentTime] = useState(0);
  const [podcastDuration, setPodcastDuration] = useState(0);
  const [podcastSpeed, setPodcastSpeed] = useState(1);
  const [showPodcastSpeedMenu, setShowPodcastSpeedMenu] = useState(false);

  const [isGeneratingEbook, setIsGeneratingEbook] = useState(false);
  const [showPublisherModal, setShowPublisherModal] = useState(false);
  const [publisherName, setPublisherName] = useState('');

  const handleGenerateAudio = async () => {
    const courseId = courseData.courseId || courseData._id;
    if (!courseId) return;

    setIsGeneratingAudio(true);
    setAudioProgress(0);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/courses/${courseId}/generate-audio`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setAudioProgress(100);

        // Add a slight delay so user sees the "100%" before it swaps to the "Listen" button
        setTimeout(() => {
          setCourseData(prev => ({ ...prev, audioUrl: data.audioUrl, audioTranscript: data.audioTranscript }));
          setCourses(prev => prev.map(c => (c._id === courseId || c.courseId === courseId) ? { ...c, audioUrl: data.audioUrl, audioTranscript: data.audioTranscript } : c));
          setIsGeneratingAudio(false);
          toast.success('Audio book generated successfully!');
        }, 800);
      } else {
        const err = await resp.json();
        console.error('Audio generation failed:', err.message);
        toast.error(`Generation failed: ${err.message}`);
        setIsGeneratingAudio(false);
      }
    } catch (err: any) {
      console.error('Audio generation error:', err);
      toast.error(`Error: ${err.message || 'Something went wrong'}`);
      setIsGeneratingAudio(false);
    }
  };

  const handleGeneratePodcast = async () => {
    const courseId = courseData.courseId || courseData._id;
    if (!courseId) return;

    setIsGeneratingPodcast(true);
    setPodcastProgress(0);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/courses/${courseId}/generate-podcast`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setPodcastProgress(100);

        setTimeout(() => {
          setCourseData(prev => ({
            ...prev,
            podcastUrl: data.podcastUrl,
            podcastScript: data.podcastScript,
            podcastTranscript: data.podcastTranscript
          }));
          setCourses(prev => prev.map(c => (c._id === courseId || c.courseId === courseId) ? {
            ...c,
            podcastUrl: data.podcastUrl,
            podcastScript: data.podcastScript,
            podcastTranscript: data.podcastTranscript
          } : c));
          setIsGeneratingPodcast(false);
          toast.success('Podcast generated successfully!');
        }, 800);
      } else {
        const err = await resp.json();
        console.error('Podcast generation failed:', err.message);
        const msg = err.message || 'Unknown error';
        if (msg.toLowerCase().includes('multiple voice') || msg.toLowerCase().includes('retry shortly')) {
          toast.error('Transient API error — please try again in a few seconds.');
        } else {
          toast.error(`Generation failed: ${msg}`);
        }
        setIsGeneratingPodcast(false);
      }
    } catch (err: any) {
      console.error('Podcast generation error:', err);
      toast.error(`Error: ${err.message || 'Something went wrong'}. Please try again.`);
      setIsGeneratingPodcast(false);
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const podcastAudioRef = React.useRef<HTMLAudioElement>(null);

  const togglePodcastPlay = () => {
    if (podcastAudioRef.current) {
      if (isPodcastPlaying) {
        podcastAudioRef.current.pause();
      } else {
        podcastAudioRef.current.play();
      }
      setIsPodcastPlaying(!isPodcastPlaying);
    }
  };

  const selectPodcastSpeed = (speed: number) => {
    setPodcastSpeed(speed);
    setShowPodcastSpeedMenu(false);
    if (podcastAudioRef.current) {
      podcastAudioRef.current.playbackRate = speed;
    }
  };

  const handlePodcastTimeUpdate = () => {
    if (podcastAudioRef.current) {
      setPodcastCurrentTime(podcastAudioRef.current.currentTime);
    }
  };

  const handlePodcastLoadedMetadata = () => {
    if (podcastAudioRef.current) {
      setPodcastDuration(podcastAudioRef.current.duration);
    }
  };

  const handlePodcastSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (podcastAudioRef.current) {
      podcastAudioRef.current.currentTime = time;
      setPodcastCurrentTime(time);
    }
  };

  const handleDownloadPodcast = async () => {
    if (!courseData.podcastUrl) return;
    try {
      const resp = await fetch(`${ORIGIN}${courseData.podcastUrl}`);
      if (!resp.ok) throw new Error('Failed to fetch podcast file');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `podcast-${courseData.courseId || 'course'}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error('Download failed. Please try again.');
    }
  };

  const getActivePodcastBubbleIndex = () => {
    if (!courseData.podcastScript || courseData.podcastScript.length === 0 || podcastDuration === 0 || !isPodcastPlaying) return -1;
    // Calculate character boundaries for each turn
    const characterCounts = courseData.podcastScript.map(turn => turn.text.length);
    const totalChars = characterCounts.reduce((a, b) => a + b, 0);
    if (totalChars === 0) return -1;

    let accumulatedChars = 0;
    const progressRatio = podcastCurrentTime / podcastDuration;
    const targetCharIndex = progressRatio * totalChars;

    for (let i = 0; i < courseData.podcastScript.length; i++) {
      accumulatedChars += characterCounts[i];
      if (targetCharIndex <= accumulatedChars) {
        return i;
      }
    }
    return courseData.podcastScript.length - 1;
  };

  const handleGenerateEbook = async () => {
    const courseId = courseData.courseId || courseData._id;
    if (!courseId) return;

    setIsGeneratingEbook(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/courses/${courseId}/generate-ebook`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publisherName })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to generate ebook');
      }

      const data = await resp.json();
      setCourseData(prev => ({ ...prev, ebookUrl: data.ebookUrl, ebookStatus: data.ebookStatus || 'completed' }));
      setCourses(prev => prev.map(c => (c._id === courseId || c.courseId === courseId)
        ? { ...c, ebookUrl: data.ebookUrl, ebookStatus: data.ebookStatus || 'completed' }
        : c));
      toast.success('Ebook generated successfully!');
    } catch (err: any) {
      console.error('Ebook generation error:', err);
      toast.error(`Ebook generation failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingEbook(false);
      setShowPublisherModal(false);
      setPublisherName('');
    }
  };

  const handleDownloadEbook = async () => {
    if (!courseData.ebookUrl) return;
    try {
      const resp = await fetch(`${ORIGIN}${courseData.ebookUrl}`);
      if (!resp.ok) throw new Error('Failed to fetch ebook file');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(courseData.title || 'course-ebook').replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ebook download failed:', err);
      toast.error('Failed to download ebook');
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const selectSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownloadAudio = async () => {
    if (!courseData.audioUrl) return;
    try {
      const resp = await fetch(`${ORIGIN}${courseData.audioUrl}`);
      if (!resp.ok) throw new Error('Failed to fetch audio file');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audio-${courseData.courseId || 'course'}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error('Download failed. Please try again.');
    }
  };

  useEffect(() => {
    let interval: any;
    if (isGeneratingAudio) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev < 98) {
            const inc = Math.random() * 2 + 1; // Faster for audio
            return Math.min(98, prev + inc);
          }
          return prev;
        });
      }, 500);
    } else {
      setAudioProgress(0);
    }
    return () => clearInterval(interval);
  }, [isGeneratingAudio]);

  useEffect(() => {
    let interval: any;
    if (isGeneratingPodcast) {
      interval = setInterval(() => {
        setPodcastProgress(prev => {
          if (prev < 98) {
            const inc = Math.random() * 1.5 + 0.5; // Realistic progress speed
            return Math.min(98, prev + inc);
          }
          return prev;
        });
      }, 600);
    } else {
      setPodcastProgress(0);
    }
    return () => clearInterval(interval);
  }, [isGeneratingPodcast]);

  const handleCourseClick = (course: Course) => {
    setShowTranscript(false);
    setCourseData(course);
    updateCourseData({
      title: course.title || '',
      description: course.description || '',
      audience: course.audience || '',
      type: course.type || '',
      module: Number(course.module) || 0,
      level: course.level || '',
      duration: {
        value: Number(course.duration?.value) || 0,
        unit: course.duration?.unit || 'hours'
      },
      country: course.country || '',
      standards: course.standards || '',
      courseId: course.courseId || course._id
    });
    setView('details');
  };

  const confirmDelete = async (courseId?: string) => {
    if (!courseId) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const resp = await fetch(`${API_BASE}/courses/delete-course/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) {
        setShowDelete(false);
        setToDelete(null);
        return;
      }
      const data = await resp.json();
      if (data?.deleted || data?.success) {
        setCourses(prev => prev.filter(c => c._id !== courseId));
        if (courseData._id === courseId) {
          setView('list');
          setCourseData({
            title: '',
            description: '',
            audience: '',
            type: '',
            module: 0,
            level: '',
            duration: { value: 0, unit: 'hours' },
            country: '',
            standards: '',
            ebookUrl: '',
            ebookStatus: 'idle',
            createdAt: ''
          });
        }
      }
      setShowDelete(false);
      setToDelete(null);
    } catch { void 0; }
  };

  const openDeleteModal = (course: Course) => {
    setToDelete(course);
    setShowDelete(true);
  };

  const cancelDelete = () => {
    setShowDelete(false);
    setToDelete(null);
  };

  const handleCreateNew = () => {
    sessionStorage.setItem('resetCourseData', 'true');
    // Also explicitly clear local state if needed, but navigation should handle it via CourseCreatorForm's useEffect
    navigate('/create-course');
  };


  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-auto">
        <main className="px-6 py-8">

          {view === 'list' ? (
            <div className="animate-fadeIn">
              <div className="mb-10 relative">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-lime-500/10 blur-[120px] rounded-full pointer-events-none" />
                <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
                  Course <span className="text-lime-400">Dashboard</span>
                </h1>
                <p className="text-white/40 font-medium tracking-wide uppercase text-[10px]">Manage your educational ecosystem</p>
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {courses.map((c, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    onClick={() => handleCourseClick(c)}
                    className="group relative bg-[#111827]/40 border border-white/5 rounded-3xl p-8 hover:border-lime-500/30 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md hover:shadow-[0_0_50px_-12px_rgba(132,204,22,0.15)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-400/20 to-emerald-600/20 flex items-center justify-center border border-lime-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                          <GraduationCap className="w-7 h-7 text-lime-400" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest group-hover:text-lime-400 transition-colors">
                            {c.level || 'Beginner'}
                          </span>
                          <button
                            type="button"
                            aria-label="Delete course"
                            onClick={(e) => { e.stopPropagation(); openDeleteModal(c); }}
                            className="p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-400/40 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-lime-400 transition-colors line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-white/40 text-sm mb-8 line-clamp-2 h-10 leading-relaxed font-medium">
                        {c.description || 'Architecting the future of specialized learning modules.'}
                      </p>

                      <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.1em] text-white/20 border-t border-white/5 pt-6 group-hover:text-white/40 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-lime-500/40" />
                          <span>{c.module || 0} Modules</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                          <span>{c.duration?.value || 0} {c.duration?.unit || 'hrs'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {!courses.length && (
                  isSearching ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center p-8 rounded-2xl text-white">
                      <p>there is no such course available</p>
                    </div>
                  ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center p-8 border border-white/10 rounded-2xl bg-white/5 text-white/70">
                      <GraduationCap className="w-8 h-8 mb-2 text-white/60" />
                      <p className="mb-4">No courses yet</p>
                    </div>
                  )
                )}

                {/* Create New Course Card */}
                {!isSearching && (
                  <motion.button
                    variants={itemVariants}
                    onClick={handleCreateNew}
                    className="group relative flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-white/10 rounded-3xl hover:border-lime-500/50 hover:bg-lime-500/5 transition-all duration-500 w-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lime-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 group-hover:bg-lime-500/20 border border-white/5 group-hover:border-lime-500/30">
                      <Plus className="w-10 h-10 text-white/20 group-hover:text-lime-400 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-white/40 group-hover:text-white transition-colors tracking-tight">
                      Architect New Course
                    </h3>
                  </motion.button>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>

              <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 min-h-[600px] items-start">
                <div className="w-full xl:flex-[0_0_66.6%]">

                  <section className="bg-[#0b1220] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-fadeInUp">
                    <div className="relative p-8 text-white">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220] via-[#0a0f1a] to-black" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center hover:-translate-y-1 hover:bg-white/20 transition">
                              <GraduationCap className="w-7 h-7" />
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/20 text-white/80">Basic</span>
                          </div>
                          <div className="flex flex-col items-end gap-3 z-20">
                            <div className="flex flex-wrap items-center justify-end gap-3">
                              {/* Ebook Control */}
                              {courseData.ebookUrl ? (
                                <button
                                  onClick={handleDownloadEbook}
                                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 border border-emerald-400/30 text-emerald-300 hover:text-white hover:bg-emerald-500/20"
                                >
                                  <BookText className="w-5 h-5" />
                                  <span>Download Ebook</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setShowPublisherModal(true)}
                                  disabled={isGeneratingEbook}
                                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 border border-emerald-400/30 text-emerald-300 hover:text-white hover:bg-emerald-500/20 ${isGeneratingEbook ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isGeneratingEbook ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookText className="w-5 h-5" />}
                                  <span>{isGeneratingEbook ? 'Generating Ebook...' : 'Generate Ebook'}</span>
                                </button>
                              )}

                              {/* Audiobook Control */}
                              {courseData.audioUrl ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setShowTranscript(!showTranscript);
                                      if (!showTranscript) setShowPodcastTranscript(false);
                                    }}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 border ${showTranscript ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5'}`}
                                  >
                                    <BookOpen className="w-5 h-5" />
                                    <span>{showTranscript ? 'Hide Transcript' : 'View Transcript'}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowAudioPlayer(!showAudioPlayer);
                                      if (!showAudioPlayer) setShowPodcastPlayer(false);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-black rounded-xl font-bold transition-all shadow-lg shadow-lime-500/20 active:scale-95 group/audio"
                                  >
                                    <Headphones className="w-5 h-5" />
                                    <span>{showAudioPlayer ? 'Hide Player' : 'Listen Audio Book'}</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  disabled={isGeneratingAudio}
                                  onClick={handleGenerateAudio}
                                  className={`flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-black rounded-xl font-bold transition-all shadow-lg shadow-lime-500/20 active:scale-95 group/audio ${isGeneratingAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isGeneratingAudio ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <Headphones className="w-5 h-5 transition-transform group-hover/audio:-translate-y-0.5" />
                                  )}
                                  <span>{isGeneratingAudio ? 'Generating...' : 'Generate Audio Book'}</span>
                                </button>
                              )}

                              {/* Podcast Control */}
                              {courseData.podcastUrl ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setShowPodcastTranscript(!showPodcastTranscript);
                                      if (!showPodcastTranscript) setShowTranscript(false);
                                    }}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 border ${showPodcastTranscript ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5'}`}
                                  >
                                    <Sparkles className="w-5 h-5 text-lime-400" />
                                    <span>{showPodcastTranscript ? 'Hide Podcast Chat' : 'View Podcast Chat'}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowPodcastPlayer(!showPodcastPlayer);
                                      if (!showPodcastPlayer) setShowAudioPlayer(false);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-black rounded-xl font-bold transition-all shadow-lg shadow-lime-500/20 active:scale-95 group/audio"
                                  >
                                    <Headphones className="w-5 h-5" />
                                    <span>{showPodcastPlayer ? 'Hide Podcast' : 'Listen Podcast'}</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  disabled={isGeneratingPodcast}
                                  onClick={handleGeneratePodcast}
                                  className={`flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-black rounded-xl font-bold transition-all shadow-lg shadow-lime-500/20 active:scale-95 group/audio ${isGeneratingPodcast ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isGeneratingPodcast ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-5 h-5 transition-transform group-hover/audio:-translate-y-0.5 text-lime-400 animate-pulse" />
                                  )}
                                  <span>{isGeneratingPodcast ? 'Generating...' : 'Generate Podcast'}</span>
                                </button>
                              )}
                            </div>

                            {/* Progress bars container */}
                            <div className="flex flex-col gap-2 mt-2">
                              {isGeneratingAudio && (
                                <div className="w-48 space-y-1.5 animate-fadeIn">
                                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/50 px-1">
                                    <span>Audio Progress</span>
                                    <span>{Math.round(audioProgress)}%</span>
                                  </div>
                                  <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/10 p-0.5">
                                    <div
                                      className="bg-gradient-to-r from-lime-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                                      style={{ width: `${audioProgress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {isGeneratingPodcast && (
                                <div className="w-48 space-y-1.5 animate-fadeIn">
                                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/50 px-1">
                                    <span>Podcast Progress</span>
                                    <span>{Math.round(podcastProgress)}%</span>
                                  </div>
                                  <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/10 p-0.5">
                                    <div
                                      className="bg-gradient-to-r from-lime-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                                      style={{ width: `${podcastProgress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Audiobook Player UI */}
                            {showAudioPlayer && (
                              <div className="animate-fadeInRight flex flex-col gap-4 p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl w-80 lg:w-96 mt-3">
                                <audio
                                  ref={audioRef}
                                  src={`${ORIGIN}${courseData.audioUrl}`}
                                  onTimeUpdate={handleTimeUpdate}
                                  onLoadedMetadata={handleLoadedMetadata}
                                  onEnded={() => setIsPlaying(false)}
                                />

                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={togglePlay}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-lime-500 hover:bg-lime-400 text-black transition-all shadow-lg active:scale-90"
                                  >
                                    {isPlaying ? (
                                      <div className="flex gap-1 animate-pulse">
                                        <div className="w-1.5 h-4 bg-black rounded-full" />
                                        <div className="w-1.5 h-4 bg-black rounded-full" />
                                      </div>
                                    ) : (
                                      <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-black border-b-[8px] border-b-transparent" />
                                    )}
                                  </button>

                                  <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[10px] text-white/50 font-medium">
                                      <span>{formatTime(currentTime)}</span>
                                      <span>{formatTime(duration)}</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0"
                                      max={duration || 0}
                                      value={currentTime}
                                      onChange={handleSeek}
                                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-lime-500 hover:accent-lime-400 transition-all"
                                      style={{
                                        background: `linear-gradient(to right, #84cc16 ${(currentTime / duration) * 100 || 0}%, rgba(255,255,255,0.1) 0%)`
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <button
                                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 transition-all border ${showSpeedMenu ? 'border-lime-500/50 bg-lime-500/10 text-lime-400' : 'border-transparent text-white/40 hover:bg-lime-500/10 hover:text-lime-400'}`}
                                      >
                                        <Zap className="w-3 h-3" />
                                        <span className="text-[10px] font-bold tracking-tighter uppercase">{playbackSpeed}x</span>
                                      </button>

                                      {showSpeedMenu && (
                                        <div className="absolute bottom-full left-0 mb-2 p-1 bg-[#0b1220]/95 backdrop-blur-2xl border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col gap-0.5 animate-fadeInUp">
                                          {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                                            <button
                                              key={speed}
                                              onClick={() => selectSpeed(speed)}
                                              className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all text-left whitespace-nowrap ${playbackSpeed === speed ? 'bg-lime-500 text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                                            >
                                              {speed === 1 ? 'Normal' : `${speed}x`}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-white/10 mx-1" />
                                    <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Audio Ready</span>
                                  </div>
                                  <button
                                    onClick={handleDownloadAudio}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all group"
                                  >
                                    <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                                    <span>Download MP3</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Podcast Player UI */}
                            {showPodcastPlayer && (
                              <div className="animate-fadeInRight flex flex-col gap-4 p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl w-80 lg:w-96 mt-3">
                                <audio
                                  ref={podcastAudioRef}
                                  src={`${ORIGIN}${courseData.podcastUrl}`}
                                  onTimeUpdate={handlePodcastTimeUpdate}
                                  onLoadedMetadata={handlePodcastLoadedMetadata}
                                  onEnded={() => setIsPodcastPlaying(false)}
                                />

                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={togglePodcastPlay}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-lime-500 hover:bg-lime-400 text-black transition-all shadow-lg active:scale-90"
                                  >
                                    {isPodcastPlaying ? (
                                      <div className="flex gap-1 animate-pulse">
                                        <div className="w-1.5 h-4 bg-black rounded-full" />
                                        <div className="w-1.5 h-4 bg-black rounded-full" />
                                      </div>
                                    ) : (
                                      <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-black border-b-[8px] border-b-transparent" />
                                    )}
                                  </button>

                                  <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[10px] text-white/50 font-medium">
                                      <span>{formatTime(podcastCurrentTime)}</span>
                                      <span>{formatTime(podcastDuration)}</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0"
                                      max={podcastDuration || 0}
                                      value={podcastCurrentTime}
                                      onChange={handlePodcastSeek}
                                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-lime-500 hover:accent-lime-400 transition-all"
                                      style={{
                                        background: `linear-gradient(to right, #84cc16 ${(podcastCurrentTime / podcastDuration) * 100 || 0}%, rgba(255,255,255,0.1) 0%)`
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <button
                                        onClick={() => setShowPodcastSpeedMenu(!showPodcastSpeedMenu)}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 transition-all border ${showPodcastSpeedMenu ? 'border-lime-500/50 bg-lime-500/10 text-lime-400' : 'border-transparent text-white/40 hover:bg-lime-500/10 hover:text-lime-400'}`}
                                      >
                                        <Zap className="w-3 h-3" />
                                        <span className="text-[10px] font-bold tracking-tighter uppercase">{podcastSpeed}x</span>
                                      </button>

                                      {showPodcastSpeedMenu && (
                                        <div className="absolute bottom-full left-0 mb-2 p-1 bg-[#0b1220]/95 backdrop-blur-2xl border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col gap-0.5 animate-fadeInUp">
                                          {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                                            <button
                                              key={speed}
                                              onClick={() => selectPodcastSpeed(speed)}
                                              className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all text-left whitespace-nowrap ${podcastSpeed === speed ? 'bg-lime-500 text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                                            >
                                              {speed === 1 ? 'Normal' : `${speed}x`}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-white/10 mx-1" />
                                    <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Podcast Ready</span>
                                  </div>
                                  <button
                                    onClick={handleDownloadPodcast}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all group"
                                  >
                                    <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                                    <span>Download MP3</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <h2 className="text-3xl lg:text-4xl font-semibold mb-2">
                          {courseData.title || 'Frontend development'}
                        </h2>

                        <p className="text-white/80 w-full mb-8">
                          {courseData.description}
                        </p>

                        {/* INFO CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                          {[
                            { icon: User, label: 'Audience', value: courseData.audience },
                            {
                              icon: Clock,
                              label: 'Duration',
                              value: `${courseData.duration?.value} ${courseData.duration?.unit}`,
                            },
                            {
                              icon: BookOpen,
                              label: 'Modules',
                              value: `${courseData.module} Modules`,
                            },
                            {
                              icon: Shield,
                              label: 'Standards',
                              value: courseData.standards,
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-white/10 p-4 rounded-lg hover:bg-white/20 hover:-translate-y-1 transition"
                            >
                              <item.icon className="w-5 h-5 opacity-80" />
                              <div>
                                <p className="text-xs uppercase text-white/70">
                                  {item.label}
                                </p>
                                <p className="font-medium">{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* TRANSCRIPT SECTION */}
                        {showTranscript && (
                          <div className="mt-10 animate-fadeInUp">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white/90">
                              <div className="w-1 h-6 bg-lime-500 rounded-full" />
                              Course Narrative Transcript
                            </h3>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative group overflow-hidden">
                              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Headphones className="w-16 h-16" />
                              </div>
                              {courseData.audioTranscript ? (
                                <p className="text-white/70 leading-relaxed font-serif text-lg italic whitespace-pre-line relative z-10">
                                  "{courseData.audioTranscript}"
                                </p>
                              ) : (
                                <div className="text-center py-6 relative z-10">
                                  <p className="text-white/40 italic mb-4">No transcript has been generated for this course yet.</p>
                                  <button
                                    onClick={handleGenerateAudio}
                                    className="text-xs font-bold text-lime-400 hover:text-lime-300 uppercase tracking-widest border border-lime-500/20 px-4 py-2 rounded-lg hover:bg-lime-500/5 transition-all"
                                  >
                                    Generate Audio & Transcript Now
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {showPodcastTranscript && (
                          <div className="mt-10 animate-fadeInUp">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white/90">
                              <div className="w-1 h-6 bg-lime-500 rounded-full" />
                              Course Dialogue: Podcast Edition
                            </h3>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative group overflow-hidden max-h-[500px] overflow-y-auto space-y-6">
                              {courseData.podcastScript && courseData.podcastScript.length > 0 ? (
                                courseData.podcastScript.map((turn, index) => {
                                  const isActive = index === getActivePodcastBubbleIndex();
                                  const isHostA = turn.speaker.toLowerCase().includes('hosta') || turn.speaker.toLowerCase().includes('alex');

                                  return (
                                    <div
                                      key={index}
                                      className={`flex gap-4 items-start transition-all duration-300 ${isHostA ? 'justify-start' : 'justify-end'
                                        }`}
                                    >
                                      {isHostA && (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex-shrink-0 flex items-center justify-center border border-blue-400/30 text-white font-black text-xs shadow-md">
                                          AL
                                        </div>
                                      )}

                                      <div
                                        className={`max-w-[70%] rounded-2xl px-5 py-3.5 transition-all duration-500 relative ${isHostA
                                          ? 'bg-slate-800/60 border border-slate-700/50 text-slate-100'
                                          : 'bg-emerald-950/50 border border-emerald-500/20 text-emerald-100'
                                          } ${isActive
                                            ? 'ring-2 ring-lime-400 border-lime-400/50 shadow-[0_0_20px_rgba(132,204,22,0.3)] scale-[1.02]'
                                            : ''
                                          }`}
                                      >
                                        <div className="flex justify-between items-center gap-2 mb-1">
                                          <span className="text-[10px] uppercase tracking-widest font-black opacity-60">
                                            {isHostA ? 'Alex (Co-host)' : 'Sam (Host)'}
                                          </span>
                                          {isActive && (
                                            <div className="flex gap-0.5 items-center">
                                              <span className="w-1 h-2 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                              <span className="w-1 h-3 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                              <span className="w-1 h-2 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                          {turn.text}
                                        </p>
                                      </div>

                                      {!isHostA && (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 text-white font-black text-xs shadow-md">
                                          SM
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-8 relative z-10">
                                  <p className="text-white/40 italic mb-4">No podcast has been generated for this course yet.</p>
                                  <button
                                    onClick={handleGeneratePodcast}
                                    className="text-xs font-bold text-lime-400 hover:text-lime-300 uppercase tracking-widest border border-lime-500/20 px-4 py-2 rounded-lg hover:bg-lime-500/5 transition-all"
                                  >
                                    Generate Podcast Now
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* MODULES */}
                  <section className="mt-16">
                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 shadow-lg ring-1 ring-lime-400/10">
                      <ModuleGen />
                    </div>
                  </section>
                </div>

                {/* Right Side: Orion Guidance */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full xl:flex-[0_0_33.3%] bg-gradient-to-br from-[#0D0D15] via-[#0A0A0E] to-[#050505] rounded-[2.5rem] p-6 sm:p-9 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group self-start sticky top-8"
                >
                  {/* Background glow lines */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-lime-500/10 pointer-events-none"></div>

                  <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-lime-500/30 overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.2)] z-20 hidden sm:block transition-all duration-700 group-hover:scale-110 group-hover:border-lime-500/50 group-hover:shadow-[0_0_60px_rgba(132,204,22,0.4)] bg-[#0A0A0E]">
                    <img src={avatar} alt="Orion" className="w-full h-full object-top object-cover" />
                  </div>

                  <div className="relative z-10">
                    <div className="mb-6 pr-24 text-left min-h-[140px]">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight flex items-center gap-2">
                        Welcome back to your course!
                        {/* <Sparkles className="text-lime-400 w-6 h-6 animate-pulse" /> */}
                      </h3>
                      <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                        {/* I'm <span className="text-lime-400 font-bold px-1 bg-lime-400/10 rounded">Orion</span>.  */}
                        You've successfully architected this course. <p>Now you can explore, listen, or even generate <p>a full eBook for your curriculum.
                        </p>
                        </p>
                      </p>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-lime-500/20 via-gray-700/50 to-transparent mb-6"></div>

                    <h4 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                      <span className="p-1.5 rounded bg-gray-800/80 border border-gray-700 shadow-sm text-sm">
                        <Layers className="w-4 h-4 text-lime-400" />
                      </span>
                      Your Learning Toolkit
                    </h4>

                    <div className="space-y-6">
                      <div className="flex gap-4 group/item">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">1</div>
                        <div>
                          <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Audio Book Experience</h5>
                          <p className="text-gray-400 text-xs leading-relaxed">Click ‘Generate Audiobook’ to begin creating the complete course audiobook. Generation time may vary depending on your course content and internet connection speed.</p>
                        </div>
                      </div>

                      <div className="flex gap-4 group/item">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">2</div>
                        <div>
                          <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Generate specialized eBook</h5>
                          <p className="text-gray-400 text-xs leading-relaxed">Want a portable version? Generate a PDF eBook that includes all the module content for offline reading.</p>
                        </div>
                      </div>

                      <div className="flex gap-4 group/item">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-black text-lime-400 shadow-inner group-hover/item:border-lime-500/50 transition-colors">3</div>
                        <div>
                          <h5 className="text-white font-bold text-sm mb-1.5 tracking-wide">Module Deep Dive</h5>
                          <p className="text-gray-400 text-xs leading-relaxed">Scroll down to explore each module in detail. You can preview the slide deck, view and copy the generated voice script, and download the slides in PPT format for each module.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-lime-500/5 border border-lime-500/10 backdrop-blur-sm relative overflow-hidden group-hover:bg-lime-500/10 transition-colors duration-500">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lime-400 to-emerald-600"></div>
                      <div className="flex items-start gap-3 pl-2">
                        <span className="text-lime-400 mt-0.5 text-lg"><Rocket className="w-5 h-5" /></span>
                        <div>
                          <h6 className="text-lime-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-1.5">Orion Tip</h6>
                          <p className="text-gray-300 text-xs italic opacity-90 leading-relaxed max-w-[90%]">Review your modules periodically. AI refinement allows you to keep the content fresh and relevant.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 text-center">
                      <p className="text-gray-500 text-xs font-semibold tracking-wide">
                        "Your knowledge ecosystem is ready. Let's start learning!" <Sparkles className="inline-block w-4 h-4 text-lime-400" />
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </main>
        {showDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-600/30 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold">Delete Course</h3>
              </div>
              <p className="text-white/70 mb-6">
                {toDelete?.title ? `Delete "${toDelete.title}"?` : 'Delete this course?'}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-md border border-white/20 text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(toDelete?._id)}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {showPublisherModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 w-full max-w-md text-white shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center border border-lime-500/30">
                  <BookText className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Publisher Details</h3>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider">eBook Branding</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label htmlFor="publisher" className="block text-sm font-medium text-white/60 mb-2">Publisher Name</label>
                  <input
                    id="publisher"
                    type="text"
                    value={publisherName}
                    onChange={(e) => setPublisherName(e.target.value)}
                    placeholder="Enter publisher name..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                    autoFocus
                  />
                  <p className="mt-2 text-[10px] text-white/30 italic">
                    This name will appear on the cover and copyright section of your eBook.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPublisherModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-all font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateEbook}
                  disabled={!publisherName.trim() || isGeneratingEbook}
                  className="px-6 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-black transition-all shadow-lg shadow-lime-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGeneratingEbook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>Generate</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};


export default HeroPage;