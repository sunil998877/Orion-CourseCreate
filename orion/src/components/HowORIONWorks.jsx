import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import {
  BarChart3,
  BookOpen,
  Palette,
  Rocket,
  Settings,
  Brain,
  Mail,
  Zap,
  Folder,
  Server,
  TrendingUp
} from 'lucide-react';

/**
 * How ORION Works Component
 * Roadmap section showing the 4-step process of how ORION works
 */
const HowORIONWorks = () => {
  const titleRef = useScrollAnimation();
  const step1Ref = useScrollAnimation();
  const step2Ref = useScrollAnimation();
  const step3Ref = useScrollAnimation();
  const step4Ref = useScrollAnimation();
  const step5Ref = useScrollAnimation();

  const steps = [
    {
      number: '1',
      title: 'Build',
      description: 'Choose a template or start from scratch using the visual builder.',
      icon: <BarChart3 className="w-8 h-8" />,
    },
    {
      number: '2',
      title: 'Train',
      description: 'Upload your data or connect your website for instant knowledge sync.',
      icon: <BookOpen className="w-8 h-8" />,
    },
    {
      number: '3',
      title: 'Customize',
      description: 'Set colors, brand voice, actions, and advanced logic.',
      icon: <Palette className="w-8 h-8" />,
    },
    {
      number: '4',
      title: 'Deploy',
      description: 'Copy-paste one script. Your bot goes live instantly.',
      icon: <Rocket className="w-8 h-8" />,
    },
    {
      number: '5',
      title: 'Optimize',
      description: 'Monitor performance and tune responses for maximum ROI.',
      icon: <TrendingUp className="w-8 h-8" />,
    },
  ];

  const refs = [step1Ref, step2Ref, step3Ref, step4Ref, step5Ref];

  return (
    <section id="working" className="py-20 bg-[#0A0A0A] relative overflow-hidden">
      {/* Floating revolving icons - positioned relative to section */}
      {/* Build icon - Top left corner */}
      <div className="absolute top-[10%] left-[3%] w-14 h-14 text-lime-500/50 animate-revolve-1 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <BarChart3 className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Train icon - Top right corner */}
      <div className="absolute top-[12%] right-[3%] w-12 h-12 text-lime-600/50 animate-revolve-2 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow-reverse">
          <Brain className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Customize icon - Bottom left */}
      <div className="absolute bottom-[10%] left-[4%] w-16 h-16 text-lime-500/45 animate-revolve-3 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Mail className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Deploy icon - Bottom right */}
      <div className="absolute bottom-[12%] right-[4%] w-13 h-13 text-lime-600/50 animate-revolve-4 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow-reverse">
          <Zap className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Folder icon - Top center-left */}
      <div className="absolute top-[8%] left-[20%] w-11 h-11 text-lime-500/40 animate-revolve-5 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Folder className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Database icon - Bottom center-right */}
      <div className="absolute bottom-[8%] right-[20%] w-14 h-14 text-lime-600/45 animate-revolve-6 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow-reverse">
          <Server className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Settings/Gear icon - Top center-right */}
      <div className="absolute top-[6%] right-[18%] w-12 h-12 text-lime-500/45 animate-revolve-7 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Settings className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Title Section */}
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            How <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">ORION</span> Works
          </h2>
          <p className="text-lg text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Get your Course Creator up and running in five simple steps
          </p>
        </div>

        {/* Horizontal Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Animated background glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-lime-500/5 blur-3xl rounded-full animate-pulse-slow"></div>

            {/* Horizontal connecting line with glow */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lime-500/30 to-lime-500/50 via-lime-500/30 to-transparent transform -translate-y-1/2 hidden md:block"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-lime-500 via-lime-500/50 to-lime-500 transform -translate-y-1/2 hidden md:block shadow-[0_0_20px_rgba(74,242,161,0.5)]"></div>

            {/* Horizontal shimmer line overlay */}
            <div className="absolute top-1/2 left-0 right-0 h-2 transform -translate-y-1/2 hidden md:block overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-lime-400/90 to-transparent animate-horizontal-shimmer shadow-[0_0_30px_rgba(74,242,161,0.8)]"></div>
            </div>

            {/* Steps in horizontal row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-6 relative z-10">
              {steps.map((step, index) => {
                const delay = `delay-${(index + 1) * 100}`;

                return (
                  <div
                    key={index}
                    ref={refs[index]}
                    className={`animate-on-scroll fade-in-up ${delay} group`}
                  >
                    <div className="flex flex-col items-center text-center h-full transform transition-all duration-500 hover:scale-105">
                      {/* Step Number Circle with enhanced animations */}


                      {/* Step Content Card with enhanced styling */}
                      <div className="relative bg-gradient-to-br from-[#121212] via-[#0F0F0F] to-[#121212] border border-gray-800 rounded-2xl p-6 md:p-8 hover:border-lime-500/70 transition-all duration-500 hover:shadow-2xl hover:shadow-lime-500/30 w-full flex-1 flex flex-col transform group-hover:-translate-y-2 overflow-hidden">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 via-transparent to-lime-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Animated border glow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-lime-500/0 via-lime-500/20 to-lime-600/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>

                        <div className="relative z-10">
                          {/* Icon */}
                          <div className="flex justify-center mb-4">
                            <div className="text-lime-500 group-hover:text-lime-400 transition-colors duration-300">
                              {step.icon}
                            </div>
                          </div>

                          {/* Step number badge */}
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-lime-500/20 to-lime-600/20 border border-lime-500/30 mb-4 text-lime-400 font-bold text-sm">
                            {step.number}
                          </div>

                          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-lime-400 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {step.title}
                          </h3>
                          <p className="text-gray-400 leading-relaxed text-sm md:text-base flex-grow group-hover:text-gray-300 transition-colors duration-300" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowORIONWorks;

