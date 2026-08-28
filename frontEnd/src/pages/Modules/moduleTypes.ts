export type ModuleState = {
  id: number;
  Module: string;
  Content: any;
  slide: any;
  isGenerating: boolean;
  isGenerated: boolean;
  viewMode: 'module' | 'slide';
  error?: string | null;
  orionUrl?: string;
  orionGenerationId?: string;
  showOrion?: boolean;
  progress?: number;
};

export const cleanTitle = (title: string) => {
  if (!title) return '';
  const cleaned = title.replace(/^Module\s+\d+[:\-\s]*/i, '').replace(/^Chapter\s+\d+[:\-\s]*/i, '').trim();
  return cleaned || title;
};
