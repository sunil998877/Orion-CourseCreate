import { useEffect, useRef } from 'react';

/**
 * Animation function for counter
 */
const animateCounter = (el, targetValue, duration) => {
  let start = null;

  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * targetValue);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      el.textContent = targetValue;
    }
  };

  window.requestAnimationFrame(step);
};

/**
 * Custom hook for animated counter
 * Animates a number from 0 to target value when element is visible
 */
export const useCounter = (target, duration = 1500) => {
  const counterRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = counterRef.current;
    if (!element || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animateCounter(element, target, duration);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [target, duration]);

  return counterRef;
};

