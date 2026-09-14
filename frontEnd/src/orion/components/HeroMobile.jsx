import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import Orb from '../utilities/orb';

const HeroMobile = () => {
  const titleRef = useScrollAnimation();
  const badgeRef = useScrollAnimation();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A0A0A] via-[#101010] to-[#0A0A0A] overflow-hidden pt-24 md:hidden">
      
      <div className="w-full h-[400px] absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-279px] z-0">
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
        />
      </div>
      
      

      <div className="container mx-auto px-6 relative z-20 mb-10">
        <div className="flex justify-center">
          <div className="text-center max-w-6xl">
            <h2
              ref={titleRef}
              className="animate-on-scroll fade-in-up text-4xl font-bold text-white leading-tight mb-20"
              style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}
            >
              <span className="bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 bg-clip-text text-transparent">ORION</span>
              <br />
              <span className="text-3xl font-semibold text-gray-300 mt-2 block" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Your First Step Towards
                <br />
                AI Adoption
              </span>
            </h2>

            
            <div className="mt-8 animate-on-scroll fade-in-up delay-200">
              <div className="flex items-center justify-center gap-4">
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
                  className="bg-gradient-to-r from-[#5BCB8A] to-[#3FAF7C] text-black font-semibold px-6 py-3 rounded-lg hover:from-[#4CB578] hover:to-[#5BCB8A] transition-all duration-300 shadow-lg shadow-[#5BCB8A]/30 hover:shadow-[#5BCB8A]/50 hover:scale-105 text-base flex items-center justify-center gap-2 group w-full whitespace-nowrap"
                >
                  GET Started
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </a>
                <a
                  href="#capabilities"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector('#capabilities');
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
                  className="bg-transparent border-2 border-[#5BCB8A]/50 text-[#5BCB8A] font-semibold px-6 py-3 rounded-lg hover:border-[#5BCB8A] hover:text-[#4CB578] hover:bg-[#5BCB8A]/10 transition-all duration-300 hover:scale-105 text-base w-full text-center"
                >
                  Know More
                </a>
              </div>
              <div
                ref={badgeRef}
                className="mt-6 inline-block"
              >
                <span className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#5BCB8A]/10 border border-[#5BCB8A]/30 text-[#5BCB8A] text-sm font-semibold backdrop-blur-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Powered By Evoke
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroMobile;