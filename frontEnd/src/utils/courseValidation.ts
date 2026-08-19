import { hasAudience } from "./courseHelpers";


export const isStepComplete = (
    step: number,
    courseData: any,
    previewModules: any[],
    orionUrlByModule: Record<number, string>
) => {
    switch (step) {
        case 1: {
            const baseComplete = !!(
                courseData.title?.trim() &&
                hasAudience(courseData.audience) &&
                courseData.level
            );

            if (courseData.standards === 'Regional') {
                return baseComplete && !!courseData.country;
            }

            return baseComplete;
        }

        case 2: {
            const wordCount =
                courseData.description?.trim().split(/\s+/).filter(Boolean).length || 0;

            return !!(
                wordCount >= 50 &&
                (courseData.duration?.value ?? 0) > 0 &&
                (courseData.module ?? 0) > 0
            );
        }

        case 3:
            return true;

        case 4:
            return (
                previewModules.length > 0 &&
                Object.keys(orionUrlByModule).length === previewModules.length
            );

        default:
            return true;
    }
};
