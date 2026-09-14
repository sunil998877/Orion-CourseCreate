import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import proactiveEngagementImage from '../assets/Engagement.jpg';
import MultiLanguage from '../assets/Multilingualchat.png';
import Uploading from '../assets/uploading2.png';
import ZyxImage from '../assets/zyx.png';

import DeployImage from '../assets/Deploy3.png';
import PodcastImage from '../assets/podcast.png';
// import UploadImage from '../assets/Upload.png';

/**
 * Agent ORION Capabilities Component
 * "What Can Agent ORION Do?" section with animated cards
 */
const AgentORIONCapabilities = () => {
  const titleRef = useScrollAnimation();
  const card1Ref = useScrollAnimation();
  const card2Ref = useScrollAnimation();
  const card3Ref = useScrollAnimation();
  const card4Ref = useScrollAnimation();
  const card5Ref = useScrollAnimation();
  const card6Ref = useScrollAnimation();

  const capabilities = [
    {
      title: 'AI Slide Orchestration',
      description: 'Orion generate professional slide decks. Unlike generic generators, Orion intelligently selects themes and design layouts based on the Course Style (e.g., Storytelling, Academic, Scenario-based) to ensure your visuals match your message.',
      image: proactiveEngagementImage,
    },
    {
      title: 'Narrative Audiobooks',
      description: 'Orion generates high-fidelity audio courses. Every module features character-driven narration and comes with a perfectly aligned transcript, creating an immersive voicebook experience.',
      image: DeployImage,
    },
    {
      title: 'Polished Ebook Publishing',
      description: 'Our advanced narrative engine transforms fragmented module content into a smooth, human-readable book. Ebooks are generated as PDFs with Natural Chapter Flow, Automated Diagrams (Mermaid.js support), and Engaging Introductions.',
      image: MultiLanguage,
    },
    {
      title: 'Structured PPTX Exports',
      description: 'Download your slide decks in professional PowerPoint format. Orion enforces a specialized Split-Screen Layout: Left Side contains visual content and bullets, Right Side features the full voiceover script for presenters.',
      image: ZyxImage,
    },
  ];

  const refs = [card1Ref, card2Ref, card3Ref, card4Ref, card5Ref, card6Ref];

  return (
    <section id="capabilities" className="py-20 bg-[#0A0A0A] overflow-hidden">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Key features that<span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent"> power</span> your business.
          </h2>
          <p className="text-base sm:text-lg text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Everything you need to create professional courses at scale
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {capabilities.map((capability, index) => {
            const delay = `delay-${(index + 1) * 100}`;
            return (
              <div
                key={index}
                ref={refs[index]}
                className={`animate-on-scroll fade-in-up ${delay} group`}
              >
                <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-800 hover:border-lime-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lime-500/20 bg-[#1A1A1A]">
                  {/* Content Section - Top */}
                  <div className="p-4 sm:p-6 md:p-8 flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {capability.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {capability.description}
                    </p>
                  </div>

                  {/* Image Section - Bottom */}
                  <div className="relative h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] overflow-hidden">
                    <img
                      src={capability.image}
                      alt={capability.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Optional overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom row: Podcast Studio + Wizard Guidance side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mt-8">
          <div
            ref={card5Ref}
            className="animate-on-scroll fade-in-up delay-500 group"
          >
            <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-800 hover:border-lime-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lime-500/20 bg-[#1A1A1A] h-full">
              <div className="p-4 sm:p-6 md:p-8 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  AI-Powered Podcast Studio
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Transform course content into studio-quality podcast episodes in one click. Orion generates character-driven narration with perfectly synced transcripts — so you can reach audio-first learners and double your content impact without lifting a finger.
                </p>
              </div>
              <div className="relative h-[200px] sm:h-[250px] md:h-[300px] overflow-hidden">
                <img
                  src={PodcastImage}
                  alt="AI-Powered Podcast Studio"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            </div>
          </div>

          <div
            ref={card6Ref}
            className="animate-on-scroll fade-in-up delay-600 group"
          >
            <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-800 hover:border-lime-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lime-500/20 bg-[#1A1A1A] h-full">
              <div className="p-4 sm:p-6 md:p-8 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Procedural Wizard Guidance
                </h3>
                <p className="text-lime-400 text-sm sm:text-base font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Ship courses 10× faster — no guesswork, no friction.
                </p>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Orion's intelligent wizard handles audience analysis, module architecture, assessment generation, and smart scaling — from blank page to polished course in minutes, not days.
                </p>
              </div>
              <div className="relative h-[200px] sm:h-[250px] md:h-[300px] overflow-hidden">
                <img
                  src={Uploading}
                  alt="Procedural Wizard Guidance"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentORIONCapabilities;
