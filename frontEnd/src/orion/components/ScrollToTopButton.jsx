import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  
  useEffect(() => {
    const toggleVisibility = () => {
      
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    
    window.addEventListener('scroll', toggleVisibility);

    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' 
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-4 sm:right-6 z-50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
        
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-6 h-6 text-white" />
    </button>
  );
};

export default ScrollToTopButton;