import React from 'react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import ModuleCard from './ModuleCard';
const ModuleList: React.FC = () => {
    const { previewModules, scrollRefModules, handleModulesScroll } = useCourseCreator();
    return (<div className="relative flex-1 min-h-0">
            <div ref={scrollRefModules} onScroll={handleModulesScroll} className="grid grid-cols-1 gap-8 overflow-y-auto max-h-[550px] pr-4 custom-scrollbar scroll-smooth max-md:gap-4 max-md:pr-1 max-md:max-h-none">
                {previewModules.map((mod: any) => (<ModuleCard key={mod.id} mod={mod}/>))}
            </div>
        </div>);
};
export default ModuleList;
