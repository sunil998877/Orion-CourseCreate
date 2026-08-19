import React from 'react';
import { useCourseCreator } from '../../contextAPI/CourseCreatorContext';
import { ModuleViewer } from '../../pages/Modules/ModuleViewer';
import { SlideContent } from '../../pages/Modules/SlideContent';

const ModulePreview: React.FC = () => {
    const {
        selectedModule, setSelectedModule, regenerateSingleModule,
        refineSingleModule, isPreviewLoading, refineProgress, moduleCredits,
        courseData, selectedSlide, setSelectedSlide
    } = useCourseCreator();

    return (
        <>
            {selectedModule && (
                <ModuleViewer
                    moduleData={selectedModule}
                    onClose={() => setSelectedModule(null)}
                    onRegenerate={() => regenerateSingleModule(selectedModule.id)}
                    onRefine={(prompt, history) => refineSingleModule(selectedModule.id, prompt, history)}
                    isRegenerating={isPreviewLoading}
                    refineProgress={refineProgress}
                    credit={moduleCredits[selectedModule.id]}
                    duration={`${courseData.duration?.value ?? 0} ${courseData.duration?.unit ?? 'Hours'}`}
                />
            )}

            {selectedSlide && (
                <SlideContent
                    moduleData={selectedSlide}
                    onClose={() => setSelectedSlide(null)}
                />
            )}
        </>
    );
};

export default ModulePreview;
