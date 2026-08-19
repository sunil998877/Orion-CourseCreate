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
  modules?: { gammaUrl?: string }[];
};

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [toDelete, setToDelete] = useState<Course | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showPodcastPlayer, setShowPodcastPlayer] = useState(false);
  const [showPodcastTranscript, setShowPodcastTranscript] = useState(false);
  const [showPublisherModal, setShowPublisherModal] = useState(false);
  const [publisherName, setPublisherName] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const q = searchParams.get('q');
        const url = q
          ? `${API_BASE}/courses/search?q=${encodeURIComponent(q)}`
          : `${API_BASE}/courses/get-user-courses`;
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) {
          console.error('Fetch courses failed:', resp.status, resp.statusText);
          return;
        }
        const data = await resp.json();
        const fetched = (Array.isArray(data) ? data : []).filter(
          (c: Course) => c.modules?.length && c.modules.every((m) => m.gammaUrl),
        );
        setCourses(fetched);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchCourses();
  }, [searchParams]);

  const generation = useCourseGeneration({
    courseData,
    setCourseData,
    setCourses,
    publisherName,
    setShowPublisherModal,
    setPublisherName,
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
    if (!courseId) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const resp = await fetch(`${API_BASE}/courses/delete-course/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Delete failed');
      const data = await resp.json();
      if (data?.deleted || data?.success) {
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
        if (courseData._id === courseId) {
          setView('list');
          setCourseData(emptyCourse);
        }
        toast.success('Course deleted successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete course');
    } finally {
      setShowDelete(false);
      setToDelete(null);
    }
  };

  const handleCreateNew = () => {
    sessionStorage.setItem('resetCourseData', 'true');
    navigate('/create-course');
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-auto">
        <main className="px-6 py-8 max-md:px-0 max-md:py-2">
          {view === 'list' ? (
            <CourseList
              courses={courses}
              isSearching={isSearching}
              onCourseClick={handleCourseClick}
              onDelete={(c: Course) => {
                setToDelete(c);
                setShowDelete(true);
              }}
              onCreateNew={handleCreateNew}
            />
          ) : (
            <div className="animate-fadeIn">
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 min-h-[600px] items-start">
                <div className="w-full xl:flex-[0_0_66.6%]">
                  <CourseDetails
                    course={courseData}
                    generation={generation}
                    audioPlayer={audioPlayer}
                    podcastPlayer={podcastPlayer}
                    showAudioPlayer={showAudioPlayer}
                    setShowAudioPlayer={setShowAudioPlayer}
                    showTranscript={showTranscript}
                    setShowTranscript={setShowTranscript}
                    showPodcastPlayer={showPodcastPlayer}
                    setShowPodcastPlayer={setShowPodcastPlayer}
                    showPodcastTranscript={showPodcastTranscript}
                    setShowPodcastTranscript={setShowPodcastTranscript}
                    onGenerateEbook={generation.handleGenerateEbook}
                    onDownloadEbook={() => downloads.downloadEbook(courseData.ebookUrl, courseData.title)}
                    onGenerateAudio={generation.handleGenerateAudio}
                    onGeneratePodcast={generation.handleGeneratePodcast}
                    onOpenPublisher={() => setShowPublisherModal(true)}
                  />
                  <section className="mt-16">
                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 shadow-lg ring-1 ring-lime-400/10">
                      <ModuleGen />
                    </div>
                  </section>
                </div>
                <OrionGuidance />
              </div>
            </div>
          )}
        </main>

        {showDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 max-md:p-4">
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
                  onClick={() => {
                    setShowDelete(false);
                    setToDelete(null);
                  }}
                  className="px-4 py-2 rounded-md border border-white/20 text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showPublisherModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] max-md:p-4">
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
                  <label htmlFor="publisher" className="block text-sm font-medium text-white/60 mb-2">
                    Publisher Name
                  </label>
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
                  onClick={generation.handleGenerateEbook}
                  disabled={!publisherName.trim() || generation.isGeneratingEbook}
                  className="px-6 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-black transition-all shadow-lg shadow-lime-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generation.isGeneratingEbook ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
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
