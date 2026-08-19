import { useCallback, useState } from 'react';
import {
  generateAllModulesDraft,
  generateModuleDraft,
  generateModuleSlides,
} from '../services/moduleService';

export const useModuleGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateAll = useCallback(async (modules: any[]) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    setIsGenerating(true);
    setProgress(0);

    try {
      const result = await generateAllModulesDraft(modules, token);
      setProgress(100);
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const regenerate = useCallback(async (payload: any) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    return generateModuleDraft(payload, token);
  }, []);

  const generateSlides = useCallback(async (payload: any) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    return generateModuleSlides(payload, token);
  }, []);

  return {
    isGenerating,
    progress,
    setProgress,
    generateAll,
    regenerate,
    generateSlides,
  };
};
