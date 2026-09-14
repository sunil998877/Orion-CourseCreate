/**
 * Scroll reveal animation utility
 * Observes elements with 'animate-on-scroll' class and adds 'is-visible' when in viewport
 */
export const initScrollAnimations = () => {
  const animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  const revealElements = document.querySelectorAll('.animate-on-scroll');
  revealElements.forEach((el) => animationObserver.observe(el));

  return () => {
    revealElements.forEach((el) => animationObserver.unobserve(el));
  };
};

/**
 * Animated counter utility
 * Animates a number from 0 to target value
 */
export const animateCounter = (element, target, duration = 1500) => {
  let start = null;

  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    element.textContent = Math.floor(progress * target);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = target;
    }
  };

  window.requestAnimationFrame(step);
};

/**
 * Counter observer utility
 * Observes counter elements and animates them when visible
 */
export const initCounterAnimations = () => {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  const counters = document.querySelectorAll('.counter');
  counters.forEach((el) => counterObserver.observe(el));

  return () => {
    counters.forEach((el) => counterObserver.unobserve(el));
  };
};

