const fs = require('fs');
const path = require('path');

const wrapComponent = (name, props, extraImports, localState, jsxPath) => {
  const jsxContent = fs.readFileSync(path.join(__dirname, `frontEnd/src/components/CourseCreator/${jsxPath}.tsx`), 'utf-8');
  
  // Find where the actual step starts. For Step 1, it starts at `<motion.div key="step1"`
  let cleanJsx = jsxContent;
  const match = jsxContent.match(/<motion\.div\s+key="step\d"/);
  if (match) {
    cleanJsx = jsxContent.slice(match.index);
  }
  
  // Also remove trailing `)}` from the end of the file
  cleanJsx = cleanJsx.trim();
  if (cleanJsx.endsWith(')}')) {
    cleanJsx = cleanJsx.slice(0, -2);
  }

  const fileContent = `
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Zap, ChevronRight, ChevronLeft, ChevronDown, 
  FileText, Target, Globe, Plus, Palette, Sparkles, Layers,
  AlertCircle, AlertTriangle, Pencil, Loader2, BookOpen, Eye, Monitor,
  Construction, Lightbulb, RefreshCw, Book, Download
} from 'lucide-react';
${extraImports}

const INDUSTRIES = [
  "Technology & Software", "Healthcare & Medicine", "Finance & Banking", 
  "Education & E-Learning", "Manufacturing", "Retail & E-Commerce", 
  "Legal", "Real Estate", "Marketing & Advertising"
];

const AUDIENCE_OPTIONS: Record<string, string[]> = {
  'Beginner': ['Students', 'Career Changers', 'Enthusiasts', 'General Public', 'Junior Staff'],
  'Intermediate': ['Practitioners', 'Mid-level Professionals', 'Specialists', 'Managers', 'Consultants'],
  'Advanced': ['Senior Experts', 'Directors', 'Researchers', 'Strategists', 'Architects'],
  'Professional': ['C-Level Executives', 'Industry Leaders', 'Principal Engineers', 'Fellows', 'Regulators']
};

interface ${name}Props {
  ${props.join('\n  ')}
}

export const ${name}: React.FC<${name}Props> = ({
  ${props.map(p => p.split(':')[0].replace('?', '')).join(',\n  ')}
}) => {
  ${localState}
  
  return (
    ${cleanJsx}
  );
};
`;

  fs.writeFileSync(path.join(__dirname, `frontEnd/src/components/CourseCreator/${name}.tsx`), fileContent, 'utf-8');
};

const basicInfoProps = [
  "courseData: any;",
  "updateCourseData: (data: any) => void;",
  "showValidation: boolean;",
  "hasAudience: (audience?: string | string[]) => boolean;",
  "goToNextStep: () => void;",
  "isGeneratingDescription: boolean;",
  "containerVariants: any;",
  "itemVariants: any;",
  "stepVariants: any;",
  "WarningSign: React.FC;",
  "avatar: string;"
];

const basicInfoLocalState = `
  const [isCustomCountry, setIsCustomCountry] = useState(false);
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [isCustomAudience, setIsCustomAudience] = useState(false);
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [customAudienceInput, setCustomAudienceInput] = useState('');
  const audienceDropdownRef = useRef<HTMLDivElement>(null);
`;

const detailsProps = [
  "courseData: any;",
  "updateCourseData: (data: any) => void;",
  "showValidation: boolean;",
  "goToNextStep: () => void;",
  "goToPrevStep: () => void;",
  "containerVariants: any;",
  "itemVariants: any;",
  "stepVariants: any;",
  "WarningSign: React.FC;",
  "avatar: string;",
  "setIsDescriptionModalOpen: (val: boolean) => void;"
];

const detailsLocalState = `
  const [isDescriptionEditable, setIsDescriptionEditable] = useState(false);
  const [isRefiningDescription, setIsRefiningDescription] = useState(false);
  const [refinePromptOpen, setRefinePromptOpen] = useState(false);
  const [refinePromptText, setRefinePromptText] = useState('');
  const handleRefineDescription = () => {};
`;

const previewProps = [
  "courseData: any;",
  "hasBlueprint: boolean;",
  "isBlueprinting: boolean;",
  "showGenerateWarning: boolean;",
  "setShowGenerateWarning: (val: boolean) => void;",
  "generateOrionPreview: () => void;",
  "blueprintingProgress: number;",
  "previewModules: any[];",
  "moduleRefs: any;",
  "moduleCredits: any;",
  "highlightedModuleId: number | null;",
  "GAMMA_THEMES: any[];",
  "themeByModule: any;",
  "setSelectedModuleForTheme: (val: number) => void;",
  "setIsThemeModalOpen: (val: boolean) => void;",
  "openContentPreview: (id: number) => void;",
  "isPreviewLoading: boolean;",
  "openSlidesPreview: (id: number, orion: boolean) => void;",
  "orionUrlByModule: any;",
  "handleGenerateSlidesOrion: (id: number) => void;",
  "generatingSlidesModuleId: number | null;",
  "slideGenerationProgress: number;",
  "goToNextStep: () => void;",
  "containerVariants: any;",
  "itemVariants: any;",
  "stepVariants: any;",
  "avatar: string;",
  "scrollRefModules: any;",
  "handleModulesScroll: (e: any) => void;"
];

const previewLocalState = ``;

const launchProps = [
  "courseData: any;",
  "previewModules: any[];",
  "moduleCredits: any;",
  "prefetchedSlidesMap: any;",
  "orionUrlByModule: any;",
  "openSlidesPreview: (id: number, orion: boolean) => void;",
  "isPreviewLoading: boolean;",
  "downloadModulePPTX: (id: number) => void;",
  "downloadingModuleId: number | null;",
  "goToPrevStep: () => void;",
  "handleLaunchCourse: () => void;",
  "isGeneratingSlides: boolean;",
  "isGeneratingContent: boolean;",
  "containerVariants: any;",
  "itemVariants: any;",
  "stepVariants: any;",
  "avatar: string;",
  "formatAudience: (aud: any) => string;"
];
const launchLocalState = ``;

wrapComponent('StepBasicInfo', basicInfoProps, '', basicInfoLocalState, 'StepBasicInfoJSX');
wrapComponent('StepDetails', detailsProps, '', detailsLocalState, 'StepDetailsJSX');
wrapComponent('StepPreview', previewProps, '', previewLocalState, 'StepPreviewJSX');
wrapComponent('StepLaunch', launchProps, '', launchLocalState, 'StepLaunchJSX');

console.log("Components created.");
