import { useEffect, useRef } from 'react';

/**
 * Custom hook for scroll reveal animations
 * Adds 'is-visible' class when element enters viewport
 */
export const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (options.once !== false) {
              observer.unobserve(entry.target);
            }
          } else if (!options.once) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.once]);

  return elementRef;
};

