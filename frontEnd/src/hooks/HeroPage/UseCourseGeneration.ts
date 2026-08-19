import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-toastify';
import { API_BASE } from '../../utils/api';
import type { Course } from '../../types/Course.types';

type Args = {
  courseData: Course;
  setCourseData: Dispatch<SetStateAction<Course>>;
  setCourses: Dispatch<SetStateAction<Course[]>>;
  publisherName: string;
  setShowPublisherModal: Dispatch<SetStateAction<boolean>>;
  setPublisherName: Dispatch<SetStateAction<string>>;
};

export const useCourseGeneration = ({ courseData, setCourseData, setCourses, publisherName, setShowPublisherModal, setPublisherName }: Args) => {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [podcastProgress, setPodcastProgress] = useState(0);
  const [isGeneratingEbook, setIsGeneratingEbook] = useState(false);

  const updateCourse = (courseId: string, patch: Partial<Course>) => {
    setCourseData(prev => ({ ...prev, ...patch }));
    setCourses(prev => prev.map(c => (c._id === courseId || c.courseId === courseId) ? { ...c, ...patch } : c));
  };

  const handleGenerateAudio = async () => {
    const courseId = courseData.courseId || courseData._id;
    if (!courseId) return;
    setIsGeneratingAudio(true); setAudioProgress(0);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/courses/${courseId}/generate-audio`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Audio generation failed');
      }
      const data = await resp.json(); setAudioProgress(100);
      setTimeout(() => {
        updateCourse(courseId, { audioUrl: data.audioUrl, audioTranscript: data.audioTranscript });
        setIsGeneratingAudio(false); toast.success('Audio book generated successfully!');
      }, 800);
    } catch (err: any) {
      console.error('Audio generation error:', err); toast.error(`Generation failed: ${err.message || 'Something went wrong'}`); setIsGeneratingAudio(false);
    }
  };

  const handleGeneratePodcast = async () => {
    const courseId = courseData.courseId || courseData._id;
    if (!courseId) return;
    setIsGeneratingPodcast(true); setPodcastProgress(0);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/courses/${courseId}/generate-podcast`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const msg = err.message || 'Unknown error';
        if (msg.toLowerCase().includes('multiple voice') || msg.toLowerCase().includes('retry shortly')) throw new Error('Transient API error — please try again in a few seconds.');
        throw new Error(msg);
      }
      const data = await resp.json(); setPodcastProgress(100);
      setTimeout(() => {
        updateCourse(courseId, { podcastUrl: data.podcastUrl, podcastScript: data.podcastScript, podcastTranscript: data.podcastTranscript });
        setIsGeneratingPodcast(false); toast.success('Podcast generated successfully!');
      }, 800);
    } catch (err: any) {
      console.error('Podcast generation error:', err); toast.error(`Generation failed: ${err.message || 'Something went wrong'}`); setIsGeneratingPodcast(false);
    }
  };

  const handleGenerateEbook = async () => {
    const courseId = courseData.courseId || courseData._id;
    if (!courseId) return;
    setIsGeneratingEbook(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/courses/${courseId}/generate-ebook`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisherName })
      });
      if (!resp.ok) { const err = await resp.json().catch(() => ({})); throw new Error(err.message || 'Failed to generate ebook'); }
      const data = await resp.json();
      updateCourse(courseId, { ebookUrl: data.ebookUrl, ebookStatus: data.ebookStatus || 'completed' });
      toast.success('Ebook generated successfully!');
    } catch (err: any) {
      console.error('Ebook generation error:', err); toast.error(`Ebook generation failed: ${err.message || 'Unknown error'}`);
    } finally { setIsGeneratingEbook(false); setShowPublisherModal(false); setPublisherName(''); }
  };

  useEffect(() => {
    if (!isGeneratingAudio) { setAudioProgress(0); return; }
    const interval = setInterval(() => setAudioProgress(prev => prev < 98 ? Math.min(98, prev + Math.random() * 2 + 1) : prev), 500);
    return () => clearInterval(interval);
  }, [isGeneratingAudio]);

  useEffect(() => {
    if (!isGeneratingPodcast) { setPodcastProgress(0); return; }
    const interval = setInterval(() => setPodcastProgress(prev => prev < 98 ? Math.min(98, prev + Math.random() * 1.5 + 0.5) : prev), 600);
    return () => clearInterval(interval);
  }, [isGeneratingPodcast]);

  return { isGeneratingAudio, audioProgress, isGeneratingPodcast, podcastProgress, isGeneratingEbook, handleGenerateAudio, handleGeneratePodcast, handleGenerateEbook };
};
