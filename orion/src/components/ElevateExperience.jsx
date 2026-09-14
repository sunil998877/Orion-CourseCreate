import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';

/**
 * Elevate Experience Component
 * "How Agent ORION Elevates Customer Experience" section
 */
const ElevateExperience = () => {
  const titleRef = useScrollAnimation();
  const card1Ref = useScrollAnimation();
  const card2Ref = useScrollAnimation();
  const card3Ref = useScrollAnimation();
  const card4Ref = useScrollAnimation();

  const benefits = [
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'On-Demand Help',
      description: 'Type a request—get instant, relevant solutions every time.',
      color: 'yellow',
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10m-7 4h7M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        </svg>
      ),
      title: 'Consistent Brand Voice',
      description: 'Ensures all responses match your company tone and values, reinforcing customer trust.',
      color: 'yellow',
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
        </svg>
      ),
      title: 'Continuous Improvement',
      description: 'Learns from each interaction and uses feedback to become smarter, faster, and even more precise.',
      color: 'gold',
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: '24/7 Customer Satisfaction',
      description: 'Supports your customers around the clock and around the globe, helping you stand out for service excellence.',
      color: 'amber',
    },
  ];

  const refs = [card1Ref, card2Ref, card3Ref, card4Ref];
  const colorClasses = {
    yellow: 'from-lime-500 to-lime-600',
    gold: 'from-lime-600 to-lime-700',
    amber: 'from-lime-500 to-lime-600',
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#0A0A0A] via-[#101010] to-[#0A0A0A] overflow-hidden">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            How Agent ORION <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Elevates</span> Customer Experience
          </h2>
          <p className="text-lg text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Transforming every customer interaction into a positive experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const delay = `delay-${(index + 1) * 100}`;
            const gradient = colorClasses[benefit.color];
            return (
              <div
                key={index}
                ref={refs[index]}
                className={`animate-on-scroll fade-in-up ${delay} group`}
              >
                <div className="relative h-full p-8 rounded-2xl bg-[#121212] border border-gray-800 hover:border-transparent transition-all duration-500 overflow-hidden">
                  {/* Animated gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute top-4 right-4 w-2 h-2 bg-gradient-to-br ${gradient} rounded-full opacity-0 group-hover:opacity-100 animate-ping`} style={{ animationDelay: `${index * 0.2}s` }}></div>
                    <div className={`absolute bottom-4 left-4 w-3 h-3 bg-gradient-to-br ${gradient} rounded-full opacity-0 group-hover:opacity-100 animate-ping`} style={{ animationDelay: `${index * 0.3}s` }}></div>
                  </div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} mb-6 text-black group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      {benefit.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-lime-400 group-hover:to-lime-600 transition-all duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {benefit.description}
                    </p>
                  </div>

                  {/* Shine effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ElevateExperience;
