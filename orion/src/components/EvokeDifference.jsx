import React, { useState } from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';

/**
 * EvokeDifference Component
 * Interactive section explaining the EVOKE difference
 */
const EvokeDifference = () => {
  const [activeDifference, setActiveDifference] = useState('executive');
  const titleRef = useScrollAnimation();
  const containerRef = useScrollAnimation();

  const differenceData = {
    executive: {
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
      image: 'https://placehold.co/500x300/1A1A1A/4AF2A1?text=Executive+AI',
      alt: 'Executive-Grade AI',
      title: 'Executive-Grade AI',
      description:
        'Smarter than experts, ORION leverages hundreds of thousands of data points for reliable, fast, and accurate performance. Experience AI that truly understands your business needs.',
    },
    collaboration: {
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      image: 'https://placehold.co/500x300/4AF2A1/0A0A0A?text=Team+Collaboration',
      alt: 'Seamless Collaboration',
      title: 'Seamless Collaboration',
      description:
        'Assign, manage, and complete tasks across distributed teams, boosting productivity and reducing manual workloads. ORION works seamlessly with your existing workflow.',
    },
    security: {
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
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ),
      image: 'https://placehold.co/500x300/0A0A0A/FFFFFF?text=Data+Security',
      alt: 'Data Privacy & Security',
      title: 'Data Privacy & Security',
      description:
        'Role-based access and powerful safeguards protect your sensitive information at every step. Your data is encrypted and secure, giving you peace of mind.',
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
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      image: 'https://placehold.co/500x300/1A1A1A/4AF2A1?text=Power-Ups',
      alt: 'Power-Up the Experience',
      title: 'Power-Up the Experience',
      description:
        'Expand capabilities and automate complex workflows with Power-Ups—perfect for scaling digital operations. Customize ORION to match your unique business needs.',
    },
  };

  const currentDifference = differenceData[activeDifference];

  return (
    <section id="evoke" className="py-20 bg-[#0A0A0A] overflow-hidden">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Why Choose <span className="section-title">ORION</span>?
          </h2>
          <p className="mt-4 text-gray-400">
            ORION combines executive-grade AI with seamless collaboration and enterprise security to deliver unmatched productivity.
          </p>
        </div>

        <div ref={containerRef} className="mt-20 max-w-6xl mx-auto animate-on-scroll fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Difference List */}
            <div className="lg:col-span-5 animate-on-scroll fade-in-left delay-100">
              <div className="space-y-4" id="difference-list">
                {Object.keys(differenceData).map((key) => {
                  const difference = differenceData[key];
                  return (
                    <button
                      key={key}
                      className={`feature-item ${activeDifference === key ? 'active' : ''}`}
                      onClick={() => setActiveDifference(key)}
                    >
                      {difference.icon}
                      <span className="font-semibold">{difference.title.split(':')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Content Display */}
            <div className="lg:col-span-7 animate-on-scroll fade-in-right delay-100">
              <div className="feature-content-wrapper min-h-[450px] lg:min-h-[400px]">
                <div className="transition-opacity duration-500 ease-in-out">
                  <img
                    src={currentDifference.image}
                    alt={currentDifference.alt}
                    className="w-full h-auto object-cover rounded-xl mb-6 shadow-lg"
                  />
                  <h3 className="text-2xl font-bold text-white">{currentDifference.title}</h3>
                  <p className="mt-4 text-gray-300">{currentDifference.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EvokeDifference;

