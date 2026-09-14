import React, { useState } from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';

const Features = () => {
  const [activeFeature, setActiveFeature] = useState('automate');
  const titleRef = useScrollAnimation();
  const containerRef = useScrollAnimation();

  const featureData = {
    automate: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      image: 'https://placehold.co/600x400/4AF2A1/0A0A0A?text=Automate+Your+Day',
      alt: 'Task Automation Interface',
      overline: 'FEATURE 1',
      title: 'Automate Your Day',
      description: 'Instantly complete routine activities—enhancing images, planning trips, organizing reports, and more—so you stay focused on what matters.',
      points: [
        { title: 'Routine Task Automation:', text: 'Handle over 10,000 daily tasks with ease.' },
        { title: 'Image Enhancement:', text: 'Upgrade visuals and remove backgrounds instantly.' },
        { title: 'Report Organization:', text: 'Automate complex reporting—no spreadsheets required.' },
      ],
    },
    alwaysReady: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      image: 'https://placehold.co/600x400/0A0A0A/4AF2A1?text=24%2F7+Availability',
      alt: '24/7 Availability',
      overline: 'FEATURE 2',
      title: 'Always Ready',
      description: 'ORION is available 24/7, providing precise, creative responses in over 100 languages to suit every global business need.',
      points: [
        { title: '24/7 Availability:', text: 'Never miss a task or opportunity.' },
        { title: '100+ Languages:', text: 'Global business support in any language.' },
        { title: 'Precise Responses:', text: 'Creative and accurate answers every time.' },
      ],
    },
    naturalInteractions: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      image: 'https://placehold.co/600x400/1A1A1A/FFFFFF?text=Natural+Interactions',
      alt: 'Natural Language Processing',
      overline: 'FEATURE 3',
      title: 'Natural Interactions',
      description: 'Powered by natural language processing and advanced deep learning, ORION understands and executes requests as naturally as a human colleague.',
      points: [
        { title: 'Advanced NLP:', text: 'Understands context and intent naturally.' },
        { title: 'Deep Learning:', text: 'Continuously improves with every interaction.' },
        { title: 'Human-Like Execution:', text: 'Works as naturally as a human colleague.' },
      ],
    },
    powerUps: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      ),
      image: 'https://placehold.co/600x400/4AF2A1/0A0A0A?text=Power-Ups',
      alt: 'Integrated Power-Ups',
      overline: 'FEATURE 4',
      title: 'Integrated Power-Ups',
      description: 'Unlock specialized functions like background removal, image generation, financial breakdowns, itinerary planning, and automated event organization.',
      points: [
        {
          title: 'Specialized Functions:',
          text: 'Background removal, image generation, and more.',
        },
        {
          title: 'Financial Analysis:',
          text: 'Generate and interpret financial summaries automatically.',
        },
        { title: 'Event Planning:', text: 'Automated event organization and itinerary planning.' },
      ],
    },
    personalized: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      image: 'https://placehold.co/600x400/0A0A0A/4AF2A1?text=Personalized+Results',
      alt: 'Personalized Course Creator',
      overline: 'FEATURE 5',
      title: 'Personalized Results',
      description: 'Feed ORION your files, brand info, and custom instructions—the more you share, the smarter ORION gets, delivering answers tailored to your unique requirements.',
      points: [
        { title: 'File Integration:', text: 'Securely upload documents to train ORION on your data.' },
        {
          title: 'Brand Customization:',
          text: 'Personalize responses with your brand voice and style.',
        },
        { title: 'Continuous Learning:', text: 'Gets smarter with every interaction and file shared.' },
      ],
    },
  };

  const currentFeature = featureData[activeFeature];

  return (
    <section id="features" className="py-20 bg-[#101010] overflow-hidden">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            What Makes <span className="section-title">ORION</span> Different?
          </h2>
          <p className="mt-4 text-gray-400">
            ORION brings creativity, efficiency, and deep expertise to every challenge, transforming how you work.
          </p>
        </div>

        <div ref={containerRef} className="mt-20 max-w-6xl mx-auto animate-on-scroll fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            <div className="lg:col-span-4 animate-on-scroll fade-in-left delay-100">
              <div className="space-y-3" id="feature-list">
                {Object.keys(featureData).map((key) => {
                  const feature = featureData[key];
                  return (
                    <button
                      key={key}
                      className={`feature-item ${activeFeature === key ? 'active' : ''}`}
                      onClick={() => setActiveFeature(key)}
                    >
                      {feature.icon}
                      <span className="font-semibold">{feature.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            
            <div className="lg:col-span-8 animate-on-scroll fade-in-right delay-100">
              <div className="feature-content-wrapper min-h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="relative">
                    <img
                      src={currentFeature.image}
                      alt={currentFeature.alt}
                      className="w-full h-auto object-cover rounded-xl shadow-lg transition-opacity duration-300 ease-in-out"
                      style={{ opacity: 1 }}
                    />
                  </div>
                  <div className="transition-opacity duration-300 ease-in-out" style={{ opacity: 1 }}>
                    <span className="text-sm font-bold text-lime-500">
                      {currentFeature.overline}
                    </span>
                    <h3 className="mt-2 text-2xl font-bold text-white">{currentFeature.title}</h3>
                    <p className="mt-3 text-gray-400">{currentFeature.description}</p>
                    <ul className="mt-6 space-y-4">
                      {currentFeature.points.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-lime-500 mr-3 mt-1">&#10003;</span>
                          <div>
                            <h4 className="font-semibold text-white">{point.title}</h4>
                            <p className="text-gray-400 text-sm">{point.text}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

