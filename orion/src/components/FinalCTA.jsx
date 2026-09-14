import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';

/**
 * FinalCTA Component
 * Final call-to-action section at the bottom of the page
 */
const FinalCTA = () => {
  const ref = useScrollAnimation();

  return (
    <section className="py-20 bg-gradient-to-t from-[#101010] to-[#0A0A0A]">
      <div ref={ref} className="container mx-auto px-6 text-center animate-on-scroll fade-in-up">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white max-w-3xl mx-auto">
          Start Creating with  <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">ORION</span>
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-base sm:text-lg text-gray-300">
          From solo creators to global training teams, ORION turns expertise into premium learning experiences—faster.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector('#contact');
              if (element) {
                const headerOffset = 100;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            }}
            className="cta-button bg-lime-500 text-black font-bold py-4 px-8 rounded-lg text-lg hover:bg-lime-600 glow-effect w-full sm:w-auto"
          >
            Try ORION Today
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector('#contact');
              if (element) {
                const headerOffset = 100;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            }}
            className="cta-button bg-transparent border-2 border-gray-600 text-gray-200 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-800 hover:border-gray-700 w-full sm:w-auto"
          >
            Transform the Way You Work
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
