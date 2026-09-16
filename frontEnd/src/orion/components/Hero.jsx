import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import Orb from '../utilities/orb';
import HeroMobile from './HeroMobile';

const Hero = () => {
  const titleRef = useScrollAnimation();
  const badgeRef = useScrollAnimation();

  return (
    <>
      <HeroMobile />
      <section className="relative min-h-screen hidden md:flex items-center justify-center bg-gradient-to-b from-[#0A0A0A] via-[#101010] to-[#0A0A0A] overflow-hidden md:py-32">
        <div className="w-full h-[500px] lg:h-[650px] absolute top-1/2 left-1/2 z-0" style={{ transform: 'translateX(-50%) translateY(calc(-50% + 30px))' }}>
          <Orb
            hoverIntensity={0.5}
            rotateOnHover={true}
            hue={0}
            forceHoverState={false}
          />
        </div>

        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-20 translate-y-[20px]">
          <div className="flex justify-center">
            <div className="text-center max-w-6xl">
              <h2
                ref={titleRef}
                className="animate-on-scroll fade-in-up text-6xl lg:text-7xl font-bold text-white leading-tight mb-8"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}
              >
                <span className="bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 bg-clip-text text-transparent">ORION</span>
                <br />
                <span className="text-5xl lg:text-4xl font-semibold text-gray-300 mt-2 block" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  Your First Step Towards
                  <br />
                  AI Course Creation
                </span>
              </h2>

              <div className="mt-10 animate-on-scroll fade-in-up delay-200">
                <div className="flex flex-row items-center justify-center gap-4">
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
                    className="bg-gradient-to-r from-lime-500 to-lime-600 text-black font-semibold px-8 py-3.5 rounded-lg hover:from-lime-400 hover:to-lime-500 transition-all duration-300 shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 hover:scale-105 text-base flex items-center justify-center gap-2 group whitespace-nowrap"
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
                    className="bg-transparent border-2 border-lime-500/50 text-lime-400 font-semibold px-8 py-3.5 rounded-lg hover:border-lime-400 hover:text-lime-300 hover:bg-lime-500/10 transition-all duration-300 hover:scale-105 text-base"
                  >
                    Know More
                  </a>
                </div>
                <div
                  ref={badgeRef}
                  className="mt-10 inline-block"
                >
                  <span className="inline-flex items-center px-5 py-2.5 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-sm font-semibold backdrop-blur-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Powered By Evoke AI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
