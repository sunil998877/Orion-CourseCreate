import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ORIGIN } from '../../utils/api';
import { formatTime } from '../../utils/FormateTime';

type Args = { audioUrl?: string; courseId?: string };

export const useAudioPlayer = ({ audioUrl, courseId }: Args) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) await audioRef.current.pause();
      else await audioRef.current.play();
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Audio playback error:', error);
      toast.error('Unable to play audio. Please try again.');
    }
  };

  const selectSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (audioRef.current) audioRef.current.playbackRate = speed;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = async () => {
    if (!audioUrl) return;
    try {
      const resp = await fetch(`${ORIGIN}${audioUrl}`);
      if (!resp.ok) throw new Error('Failed to fetch audio file');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audio-${courseId || 'course'}.mp3`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error('Download failed. Please try again.');
    }
  };

  return {
    audioRef, isPlaying, duration, currentTime, playbackSpeed, showSpeedMenu,
    setIsPlaying, setShowSpeedMenu, togglePlay, selectSpeed, handleTimeUpdate,
    handleLoadedMetadata, handleSeek, handleDownload, formatTime,
  };
};
