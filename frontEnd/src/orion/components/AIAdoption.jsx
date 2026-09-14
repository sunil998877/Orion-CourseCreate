import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';

const AIAdoption = () => {
  const sectionRef = useScrollAnimation();

  return (
    <section id="ai-adoption" className="py-20 bg-[#0A0A0A] overflow-hidden">
      <div ref={sectionRef} className="container mx-auto px-6 animate-on-scroll fade-in-up">
        <div className="text-center max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white max-w-3xl mx-auto">
            Shape the Future of Learning with <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">ORION</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mt-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Start with an <strong>AI Architect</strong> that transforms raw knowledge into structured curriculum—instantly.
            <br /><br />
            Create premium slide decks, cinematic audiobooks, and elegant ebooks—all within one intelligent creation engine.
            <br /><br />
            <strong>"Less Complexity, More Creation, Greater Impact."</strong>
          </p>
        </div>
      </div>
    </section>
  );
};

export default AIAdoption;