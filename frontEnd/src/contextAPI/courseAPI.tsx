import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { generateDefault20Assessment } from '../utils/defaultAssessment';
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
    level: 'Beginner',
    duration: { value: 1, unit: 'Hours' },
    country: '',
    standards: '',
    industry: '',
    urls: [],
    createdAt: '',
    orionTheme: 'aurora',
    courseStyle: 'Academic / Formal Style',
    courseForge: {
        subtitle: '',
        archetype: 'Let AI select',
        purpose: '',
        prerequisites: '',
        workplaceContext: '',
        learnerProblems: '',
        deliveryMode: 'Self-paced',
        approvedModulePlan: '',
        slideCount: '',
        language: 'English',
        readingLevel: 'General professional',
        trainerTone: '',
        presenterStyle: 'Full script',
        jurisdiction: '',
        applicableStandards: '',
        accreditation: '',
        forbiddenSources: '',
        factualRisks: '',
        approvedOutcomes: '',
        skillsToDemonstrate: '',
        caseContext: '',
        assessmentRequirements: '20 comprehensive multiple-choice assessment questions covering all modules',
        passingScore: '',
        retakeRules: '',
        practicalRequirement: '',
        workbookDepth: '',
        workbookRequirements: '',
        storytellingRequirement: '',
        researchRequirement: '',
        visualTool: 'Gamma',
        brandStyle: '',
        openingFormat: '',
        endingFormat: '',
        otherConstraints: '',
        sources: [],
        researchDossier: null,
        researchApproved: false,
        blueprint: null,
        blueprintApproved: false,
        narrationApproved: false,
        workbook: null,
        workbookApproved: false,
        assessment: generateDefault20Assessment({ title: 'Course', module: 5 }, [
            { moduleNumber: 1, Title: 'Module 1' },
            { moduleNumber: 2, Title: 'Module 2' },
            { moduleNumber: 3, Title: 'Module 3' },
            { moduleNumber: 4, Title: 'Module 4' },
            { moduleNumber: 5, Title: 'Module 5' }
        ]),
        assessmentApproved: false,
        audit: null,
        auditDecision: ''
    }
};
const CREATOR_SESSION_KEY = 'orion_creator_session';
const readCreatorSession = () => {
    try {
        if (sessionStorage.getItem('resetCourseData') === 'true')
            return null;
        const raw = sessionStorage.getItem(CREATOR_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
};
export const CourseDataProvider: React.FC<{
    children: ReactNode;
}> = ({ children }) => {
    const [courseData, setCourseData] = useState<CourseData>(() => {
        const saved = readCreatorSession()?.courseData;
        return saved && typeof saved === 'object' ? { ...initialCourseData, ...saved, level: saved.level || 'Beginner', courseForge: { ...initialCourseData.courseForge, ...(saved.courseForge || {}) } } : initialCourseData;
    });
    const updateCourseData = (data: Partial<CourseData>) => {
        setCourseData((prev) => ({
            ...prev,
            ...data
        }));
    };
    const resetCourseData = () => {
        sessionStorage.removeItem(CREATOR_SESSION_KEY);
        setCourseData(initialCourseData);
    };
    useEffect(() => {
        if (sessionStorage.getItem('resetCourseData') === 'true')
            return;
        try {
            const current = readCreatorSession() || {};
            sessionStorage.setItem(CREATOR_SESSION_KEY, JSON.stringify({ ...current, courseData }));
        }
        catch {

        }
    }, [courseData]);
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
