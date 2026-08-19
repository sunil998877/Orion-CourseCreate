import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ORIGIN } from '../../utils/api';
import { formatTime } from '../../utils/FormateTime';

type ScriptTurn = { speaker: string; text: string };

type Args = { podcastUrl?: string; courseId?: string; podcastScript?: ScriptTurn[] };

export const usePodcastPlayer = ({ podcastUrl, courseId, podcastScript = [] }: Args) => {
  const podcastAudioRef = useRef<HTMLAudioElement>(null);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [podcastCurrentTime, setPodcastCurrentTime] = useState(0);
  const [podcastDuration, setPodcastDuration] = useState(0);
  const [podcastSpeed, setPodcastSpeed] = useState(1);
  const [showPodcastSpeedMenu, setShowPodcastSpeedMenu] = useState(false);

  const togglePodcastPlay = async () => {
    if (!podcastAudioRef.current) return;
    try {
      if (isPodcastPlaying) await podcastAudioRef.current.pause();
      else await podcastAudioRef.current.play();
      setIsPodcastPlaying(!isPodcastPlaying);
    } catch (error) {
      console.error('Podcast playback error:', error);
      toast.error('Unable to play podcast. Please try again.');
    }
  };

  const selectPodcastSpeed = (speed: number) => {
    setPodcastSpeed(speed);
    setShowPodcastSpeedMenu(false);
    if (podcastAudioRef.current) podcastAudioRef.current.playbackRate = speed;
  };

  const handlePodcastTimeUpdate = () => {
    if (podcastAudioRef.current) setPodcastCurrentTime(podcastAudioRef.current.currentTime);
  };

  const handlePodcastLoadedMetadata = () => {
    if (podcastAudioRef.current) setPodcastDuration(podcastAudioRef.current.duration);
  };

  const handlePodcastSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (podcastAudioRef.current) {
      podcastAudioRef.current.currentTime = time;
      setPodcastCurrentTime(time);
    }
  };

  const handleDownload = async () => {
    if (!podcastUrl) return;
    try {
      const resp = await fetch(`${ORIGIN}${podcastUrl}`);
      if (!resp.ok) throw new Error('Failed to fetch podcast file');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `podcast-${courseId || 'course'}.mp3`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error('Download failed. Please try again.');
    }
  };

  const getActivePodcastBubbleIndex = () => {
    if (!podcastScript.length || !podcastDuration || !isPodcastPlaying) return -1;
    const totalChars = podcastScript.reduce((sum, turn) => sum + turn.text.length, 0);
    if (!totalChars) return -1;
    const targetCharIndex = (podcastCurrentTime / podcastDuration) * totalChars;
    let accumulatedChars = 0;
    for (let i = 0; i < podcastScript.length; i++) {
      accumulatedChars += podcastScript[i].text.length;
      if (targetCharIndex <= accumulatedChars) return i;
    }
    return podcastScript.length - 1;
  };

  return {
    podcastAudioRef, isPodcastPlaying, podcastCurrentTime, podcastDuration,
    podcastSpeed, showPodcastSpeedMenu, setIsPodcastPlaying,
    setShowPodcastSpeedMenu, togglePodcastPlay, selectPodcastSpeed,
    handlePodcastTimeUpdate, handlePodcastLoadedMetadata, handlePodcastSeek,
    handleDownload, getActivePodcastBubbleIndex, formatTime,
  };
};
