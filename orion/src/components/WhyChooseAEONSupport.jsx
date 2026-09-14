import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import orionImage from '../assets/orion 2.png';
import orionMobileImage from '../assets/orion 2.png';

/**
 * Why Choose ORION Support Component
 * "Why Choose Agent ORION for Support?" section
 */
const WhyChooseORIONSupport = () => {
  const titleRef = useScrollAnimation();
  const containerRef = useScrollAnimation();

  const reasons = [
    {
      number: '01',
      title: 'Empowered by Deep Knowledge',
      description: "Imports your business's unique files, FAQs, policies, and guides so answers are always specific and accurate.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Flexible Automation',
      description: 'Supports custom workflow solutions (returns, appointments, onboarding, etc.) with intelligent power-ups.',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Integrated Customer Journey',
      description: 'Each chat contributes to your AI "brain," making future support even faster and more relevant.',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      number: '04',
      title: 'Reliable & Scalable',
      description: 'Easily serves growing businesses and busy teams, without ever compromising on speed or accuracy.',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-[#0A0A0A] overflow-hidden">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Why Choose <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Agent ORION</span> for Support?
          </h2>
          <p className="text-lg text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Built to elevate your customer support operations
          </p>
        </div>

        <div ref={containerRef} className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-1 gap-8">
            {reasons.map((reason, index) => {
              const delay = `delay-${(index + 1) * 100}`;
              return (
                <div
                  key={index}
                  className={`animate-on-scroll fade-in-up ${delay} group`}
                >
                  <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-[#121212] to-[#0A0A0A] border border-gray-800 hover:border-lime-500/50 transition-all duration-500 overflow-hidden">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/0 via-lime-500/5 to-lime-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                      {/* Number badge */}
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-6xl font-bold text-gray-800 group-hover:text-lime-500/20 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {reason.number}
                        </span>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 text-black group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <img
                            src={orionMobileImage}
                            alt="ORION Mobile"
                            className="w-full h-full object-contain"
                            style={{
                              filter: 'drop-shadow(0 0 20px rgba(74, 242, 161, 0.3))'
                            }}
                          />
                        </div>
                      </div>

                      {/* Desktop Robot Image */}
                      <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full z-0 transition-all duration-700 animate-float">
                        <img
                          src='orion 2.png'
                          alt="ORION Robot"
                        />
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-lime-400 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {reason.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {reason.description}
                      </p>
                    </div>

                    {/* Decorative line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-lime-500 via-lime-600 to-lime-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseORIONSupport;

