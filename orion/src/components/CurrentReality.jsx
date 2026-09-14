import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';

/**
 * CurrentReality Component
 * Section explaining problems and advantages
 */
const CurrentReality = () => {
  const titleRef = useScrollAnimation();
  const card1Ref = useScrollAnimation();
  const card2Ref = useScrollAnimation();
  const card3Ref = useScrollAnimation();
  const card4Ref = useScrollAnimation();

  const cards = [
    {
      title: 'Image Editing & Enhancement',
      description: 'Upgrade your visuals, remove backgrounds, and create stunning content for digital campaigns.',
    },
    {
      title: 'Travel & Event Planning',
      description: 'Plan holidays, parties, and business trips in seconds, complete with detailed itineraries and creative themes.',
    },
    {
      title: 'Financial Insights',
      description: 'Generate and interpret financial summaries, analyze cash flow, and automate complex reporting—no spreadsheets required.',
    },
    {
      title: 'File & Knowledge Integration',
      description: 'Securely upload documents to train ORION on your policies, procedures, and business data for company-specific answers.',
    },
  ];

  return (
    <section id="reality" className="py-20 bg-[#101010]">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Effortless <span className="section-title">Task Management</span>
          </h2>
          <p className="mt-4 text-gray-400">
            ORION handles everything from image editing to financial analysis, making complex tasks simple and automated.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, index) => {
            const refs = [card1Ref, card2Ref, card3Ref, card4Ref];
            const delays = ['', 'delay-100', 'delay-200', 'delay-300'];
            return (
              <div
                key={index}
                ref={refs[index]}
                className={`feature-card p-6 rounded-xl animate-on-scroll fade-in-up ${delays[index]}`}
              >
                <h3 className="font-bold text-lime-500 text-lg mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-300 mt-2 text-sm">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CurrentReality;

