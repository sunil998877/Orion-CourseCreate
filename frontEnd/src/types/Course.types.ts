export type Course = {
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
  
  export const emptyCourse: Course = {
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
    createdAt: '',
  };
  