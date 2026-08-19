import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 max-md:bottom-4 max-md:right-4 z-50 p-3 rounded-full bg-lime-500/20 text-lime-400 border border-lime-500/30 hover:bg-lime-500/30 hover:border-lime-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(132,204,22,0.2)] hover:shadow-[0_0_25px_rgba(132,204,22,0.4)] transition-all duration-300 transform hover:-translate-y-1"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
}
