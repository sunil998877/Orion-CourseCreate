import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookText, Loader2, Trash2, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageTransition from '../components/PageTransition';
import ModuleGen from './Modules/ModuleGen';
import { API_BASE } from '../utils/api';
import { useCourseData } from '../contextAPI/courseAPI';
import { useCourseGeneration } from '../hooks/HeroPage/UseCourseGeneration';
import { useAudioPlayer } from '../hooks/HeroPage/UseAudioPlayer';
import { usePodcastPlayer } from '../hooks/HeroPage/UsePodcastPlayer';
import { useCourseDownloads } from '../hooks/HeroPage/UseCourseDownloads';
import { CourseList } from '../components/HeroPage/CourseList';
import { CourseDetails } from '../components/HeroPage/CourseDetails';
import { OrionGuidance } from '../components/HeroPage/OrienGuidance';
import GeneratePodcastModal from '../components/HeroPage/GeneratePodcastModal';
import GenerateAudioModal from '../components/HeroPage/GenerateAudioModal';

type Course = {
    _id?: string;
    title: string;
    description?: string;
    audience?: string;
    type?: string;
    module?: number;
    level?: string;
    duration?: {
        value: number;
        unit: string;
    };
    country?: string;
    standards?: string;
    audioUrl?: string;
    audioTranscript?: string;
    ebookUrl?: string;
    ebookStatus?: 'idle' | 'generating' | 'completed' | 'failed';
    podcastUrl?: string;
    podcastTranscript?: string;
    podcastScript?: {
        speaker: string;
        text: string;
    }[];
    podcastStatus?: 'idle' | 'generating' | 'completed' | 'failed';
    courseId?: string;
    createdAt?: string;
    modules?: {
        gammaUrl?: string;
    }[];
};

const COURSES_CACHE_KEY = 'orion_user_courses_cache';

function readCachedCourses(): Course[] {
    try {
        const raw = sessionStorage.getItem(COURSES_CACHE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeCachedCourses(list: Course[]) {
    try {
        sessionStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(list));
    } catch {
        /* ignore quota errors */
    }
}

const emptyCourse: Course = {
    title: '',
    description: '',
    audience: '',
    type: '',
    module: 0,
    level: '',
    duration: { value: 0, unit: 'hours' },
    country: '',
    standards: '',
};
export const HeroPage: React.FC = () => {
    const [view, setView] = useState<'list' | 'details'>('list');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isSearching = Boolean(searchParams.get('q'));
    const { updateCourseData } = useCourseData();
    const [courseData, setCourseData] = useState<Course>(emptyCourse);
    const [courses, setCourses] = useState<Course[]>(() => (isSearching ? [] : readCachedCourses()));
    const [coursesLoading, setCoursesLoading] = useState(() => {
        if (isSearching) return true;
        return readCachedCourses().length === 0;
    });
    const [toDelete, setToDelete] = useState<Course | null>(null);
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);
    const [showPodcastPlayer, setShowPodcastPlayer] = useState(false);
    const [showPodcastTranscript, setShowPodcastTranscript] = useState(false);
    const [showPublisherModal, setShowPublisherModal] = useState(false);
    const [publisherName, setPublisherName] = useState(() => localStorage.getItem('username') || '');
    const [userEmail, setUserEmail] = useState(() => localStorage.getItem('email') || '');
    const [showPodcastModal, setShowPodcastModal] = useState(false);
    const [showAudioModal, setShowAudioModal] = useState(false);
    useEffect(() => {
        let cancelled = false;
        const fetchCourses = async () => {
            const token = localStorage.getItem('token');
            const q = searchParams.get('q');
            const hasCache = !q && readCachedCourses().length > 0;
            if (!hasCache) setCoursesLoading(true);
            if (!token) {
                if (!cancelled) {
                    setCourses([]);
                    setCoursesLoading(false);
                }
                return;
            }
            try {
                const url = q
                    ? `${API_BASE}/courses/search?q=${encodeURIComponent(q)}`
                    : `${API_BASE}/courses/get-user-courses`;
                const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                if (!resp.ok) {
                    console.error('Fetch courses failed:', resp.status, resp.statusText);
                    if (!cancelled) setCoursesLoading(false);
                    return;
                }
                const data = await resp.json();
                const fetched = (Array.isArray(data) ? data : []).filter(
                    (c: Course) => c.modules?.length && c.modules.every((m) => m.gammaUrl)
                );
                if (cancelled) return;
                setCourses(fetched);
                if (!q) writeCachedCourses(fetched);
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                if (!cancelled) setCoursesLoading(false);
            }
        };
        fetchCourses();
        return () => {
            cancelled = true;
        };
    }, [searchParams]);
    const generation = useCourseGeneration({
        courseData,
        setCourseData,
        setCourses,
        publisherName,
        userEmail,
        setShowPublisherModal,
        setPublisherName,
        setUserEmail,
    });
    const audioPlayer = useAudioPlayer({
        audioUrl: courseData.audioUrl,
        courseId: courseData.courseId || courseData._id,
    });
    const downloads = useCourseDownloads();
    const podcastPlayer = usePodcastPlayer({
        podcastUrl: courseData.podcastUrl,
        courseId: courseData.courseId || courseData._id,
        podcastScript: courseData.podcastScript,
    });
    const handleCourseClick = (course: Course) => {
        setShowTranscript(false);
        setShowPodcastTranscript(false);
        setShowAudioPlayer(false);
        setShowPodcastPlayer(false);
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
                unit: course.duration?.unit || 'hours',
            },
            country: course.country || '',
            standards: course.standards || '',
            courseId: course.courseId || course._id,
        });
        setView('details');
    };
    const confirmDelete = async () => {
        const courseId = toDelete?._id;
        if (!courseId || isDeleting)
            return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token)
                return;
            const resp = await fetch(`${API_BASE}/courses/delete-course/${courseId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!resp.ok)
                throw new Error('Delete failed');
            const data = await resp.json();
            if (data?.deleted || data?.success) {
                setCourses((prev) => {
                    const next = prev.filter((c) => c._id !== courseId);
                    writeCachedCourses(next);
                    return next;
                });
                if (courseData._id === courseId) {
                    setView('list');
                    setCourseData(emptyCourse);
                }
                toast.success('Course deleted successfully');
            }
        }
        catch (err) {
            console.error(err);
            toast.error('Failed to delete course');
        }
        finally {
            setIsDeleting(false);
            setShowDelete(false);
            setToDelete(null);
        }
    };
    const handleCreateNew = () => {
        sessionStorage.setItem('resetCourseData', 'true');
        navigate('/create-course');
    };
    return (<PageTransition>
      <div className="relative min-h-screen overflow-auto">
        <main className="px-6 py-8 max-md:px-0 max-md:py-2">
          {view === 'list' ? (<CourseList courses={courses} loading={coursesLoading} isSearching={isSearching} onCourseClick={handleCourseClick} onDelete={(c: Course) => {
                setToDelete(c);
                setShowDelete(true);
            }} onCreateNew={handleCreateNew}/>) : (<div className="animate-fadeIn">
              <button type="button" onClick={() => {
                setView('list');
              }} className="flex items-center gap-2 text-white/60 hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4"/>
                Back to Dashboard
              </button>
              <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 min-h-[600px] items-start">
                <div className="w-full xl:flex-[0_0_66.6%]">
                  <CourseDetails course={courseData} generation={generation} audioPlayer={audioPlayer} podcastPlayer={podcastPlayer} showAudioPlayer={showAudioPlayer} setShowAudioPlayer={setShowAudioPlayer} showTranscript={showTranscript} setShowTranscript={setShowTranscript} showPodcastPlayer={showPodcastPlayer} setShowPodcastPlayer={setShowPodcastPlayer} showPodcastTranscript={showPodcastTranscript} setShowPodcastTranscript={setShowPodcastTranscript} onGenerateEbook={generation.handleGenerateEbook} onDownloadEbook={() => downloads.downloadEbook(courseData.ebookUrl, courseData.title)} onGenerateAudio={() => setShowAudioModal(true)} onGeneratePodcast={() => setShowPodcastModal(true)} onOpenPublisher={() => {
                    if (!publisherName) setPublisherName(localStorage.getItem('username') || '');
                    if (!userEmail) setUserEmail(localStorage.getItem('email') || '');
                    setShowPublisherModal(true);
                  }}/>
                  <section className="mt-16">
                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 shadow-lg ring-1 ring-lime-400/10 max-md:p-3">
                      <ModuleGen />
                    </div>
                  </section>
                </div>
                <OrionGuidance />
              </div>
            </div>)}
        </main>

        {showAudioModal && (<GenerateAudioModal courseTitle={courseData.title || ''} progress={generation.audioProgress} isGenerating={generation.isGeneratingAudio} error={generation.audioError} hasAudio={Boolean(courseData.audioUrl)} onGenerate={generation.handleGenerateAudio} onListen={() => {
                setShowAudioModal(false);
                setShowAudioPlayer(true);
                setShowPodcastPlayer(false);
            }} onClose={() => {
                if (!generation.isGeneratingAudio)
                    setShowAudioModal(false);
            }}/>)}

        {showPodcastModal && (<GeneratePodcastModal courseTitle={courseData.title || ''} progress={generation.podcastProgress} isGenerating={generation.isGeneratingPodcast} error={generation.podcastError} hasPodcast={Boolean(courseData.podcastUrl)} onGenerate={generation.handleGeneratePodcast} onListen={() => {
                setShowPodcastModal(false);
                setShowPodcastPlayer(true);
                setShowAudioPlayer(false);
            }} onClose={() => {
                if (!generation.isGeneratingPodcast)
                    setShowPodcastModal(false);
            }}/>)}

        {showDelete && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 max-md:p-4">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-600/30 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400"/>
                </div>
                <h3 className="text-lg font-semibold">Delete Course</h3>
              </div>
              <p className="text-white/70 mb-6">
                {toDelete?.title ? `Delete "${toDelete.title}"?` : 'Delete this course?'}
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" disabled={isDeleting} onClick={() => {
                if (isDeleting)
                    return;
                setShowDelete(false);
                setToDelete(null);
            }} className="px-4 py-2 rounded-md border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
                  Cancel
                </button>
                <button type="button" disabled={isDeleting} onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white disabled:opacity-70 disabled:cursor-not-allowed min-w-[7.5rem]">
                  {isDeleting ? 'Please wait...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>)}

        {showPublisherModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] max-md:p-4">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 w-full max-w-md text-white shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center border border-lime-500/30">
                  <BookText className="w-6 h-6 text-lime-400"/>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Publisher Details</h3>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider">eBook Branding</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="publisher" className="block text-sm font-medium text-white/70 mb-1.5">
                    Publisher / Author Name <span className="text-lime-400">*</span>
                  </label>
                  <input
                    id="publisher"
                    type="text"
                    value={publisherName}
                    onChange={(e) => setPublisherName(e.target.value)}
                    placeholder="Enter author or publisher name..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all text-sm"
                    autoFocus
                  />
                  <p className="mt-1 text-[11px] text-white/40 italic">
                    This name will appear on the cover and copyright section of your eBook.
                  </p>
                </div>

                <div>
                  <label htmlFor="userEmail" className="block text-sm font-medium text-white/70 mb-1.5">
                    User / Author Email <span className="text-lime-400">*</span>
                  </label>
                  <input
                    id="userEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all text-sm"
                  />
                  <p className="mt-1 text-[11px] text-white/40 italic">
                    This email will be recorded with your eBook generation and stored in the database.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowPublisherModal(false)} className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-all font-bold text-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={generation.handleGenerateEbook}
                  disabled={!publisherName.trim() || !userEmail.trim() || !userEmail.includes('@') || generation.isGeneratingEbook}
                  className="px-6 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-black transition-all shadow-lg shadow-lime-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generation.isGeneratingEbook ? (<Loader2 className="w-4 h-4 animate-spin"/>) : (<Zap className="w-4 h-4"/>)}
                  <span>Generate</span>
                </button>
              </div>
            </div>
          </div>)}
      </div>
    </PageTransition>);
};
export default HeroPage;
