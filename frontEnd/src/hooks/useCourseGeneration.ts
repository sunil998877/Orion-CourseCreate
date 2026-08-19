import { useCallback, useState } from 'react';
import {
  createCourse,
  generateCourseDescription,
  refineCourseDescription,
} from '../services/courseService';

export const useCourseGeneration = () => {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateDescription = useCallback(async (courseData: any) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    setIsGeneratingDescription(true);
    try {
      return await generateCourseDescription(courseData, token);
    } finally {
      setIsGeneratingDescription(false);
    }
  }, []);

  const refineDescription = useCallback(
    async (currentDescription: string, prompt: string) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      return refineCourseDescription(currentDescription, prompt, token);
    },
    []
  );

  const saveCourse = useCallback(async (courseData: any) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    return createCourse(courseData, token);
  }, []);

  return {
    isGeneratingDescription,
    generateDescription,
    refineDescription,
    saveCourse,
  };
};
