import React, { createContext, useContext, useState, ReactNode } from 'react';
type Duration = {
    value: number;
    unit: string;
};
export type CourseData = {
    _id?: string;
    title: string;
    description?: string;
    audience?: string | string[];
    type?: string;
    module?: number;
    level?: string;
    duration?: Duration;
    country?: string;
    standards?: string;
    industry?: string;
    urls?: string[];
    createdAt?: string;
    orionTheme?: string;
    courseStyle?: string;
    [key: string]: any;
};
type CourseContextType = {
    courseData: CourseData;
    updateCourseData: (data: Partial<CourseData>) => void;
    resetCourseData: () => void;
};
const CourseContext = createContext<CourseContextType | undefined>(undefined);
const initialCourseData: CourseData = {
    title: '',
    description: '',
    audience: '',
    type: '',
    module: 5,
    level: '',
    duration: { value: 1, unit: 'Hours' },
    country: '',
    standards: '',
    industry: '',
    urls: [],
    createdAt: '',
    orionTheme: 'aurora',
    courseStyle: 'Academic / Formal Style'
};
export const CourseDataProvider: React.FC<{
    children: ReactNode;
}> = ({ children }) => {
    const [courseData, setCourseData] = useState<CourseData>(initialCourseData);
    const updateCourseData = (data: Partial<CourseData>) => {
        setCourseData((prev) => ({
            ...prev,
            ...data
        }));
    };
    const resetCourseData = () => {
        setCourseData(initialCourseData);
    };
    return (<CourseContext.Provider value={{ courseData, updateCourseData, resetCourseData }}>
      {children}
    </CourseContext.Provider>);
};
export const useCourseData = () => {
    const context = useContext(CourseContext);
    if (context === undefined) {
        throw new Error('useCourseData must be used within a CourseDataProvider');
    }
    return context;
};
