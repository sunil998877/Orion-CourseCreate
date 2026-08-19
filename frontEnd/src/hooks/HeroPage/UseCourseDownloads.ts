import { toast } from 'react-toastify';
import { ORIGIN } from '../../utils/api';

const downloadBlob = async (path: string, filename: string) => {
  const resp = await fetch(`${ORIGIN}${path}`);
  if (!resp.ok) throw new Error('Failed to fetch file');
  const blob = await resp.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url);
};

export const useCourseDownloads = () => ({
  downloadAudio: async (url?: string, id?: string) => { if (!url) return; try { await downloadBlob(url, `audio-${id || 'course'}.mp3`); } catch (e) { console.error(e); toast.error('Download failed. Please try again.'); } },
  downloadPodcast: async (url?: string, id?: string) => { if (!url) return; try { await downloadBlob(url, `podcast-${id || 'course'}.mp3`); } catch (e) { console.error(e); toast.error('Download failed. Please try again.'); } },
  downloadEbook: async (url?: string, title?: string) => { if (!url) return; try { await downloadBlob(url, `${(title || 'course-ebook').replace(/\s+/g, '-').toLowerCase()}.pdf`); } catch (e) { console.error(e); toast.error('Failed to download ebook'); } },
});
