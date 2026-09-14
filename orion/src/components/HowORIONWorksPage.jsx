import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import Process from '../assets/Process3.png';
import Orion3 from '../assets/orion 3.png';
import ReportImage from '../assets/report.png';
import XyzImage from '../assets/xyz.png';
import {
  Upload,
  Brain,
  Rocket,
  Folder,
  Server,
  Cpu,
  Zap,
  FileText,
  BarChart3,
  Settings,
  Mail,

} from 'lucide-react';

/**
 * How ORION Works Page Component
 * Three-step process: Upload Knowledge Base, Knowledge Processing, Deploy
 */
const HowORIONWorksPage = () => {

  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const step1Ref = useScrollAnimation({ threshold: 0.15 });
  const step2Ref = useScrollAnimation({ threshold: 0.15 });
  const step3Ref = useScrollAnimation({ threshold: 0.15 });
  const step4Ref = useScrollAnimation({ threshold: 0.15 });

  const steps = [
    {
      number: '1',
      title: 'Deep Configuration',
      description: 'Creators input their course topic, target audience, and instructional level. Crucially, they select a Course Style, which directs the AI\'s tone, character personas, and visual aesthetics across all generated materials.',
      icon: <Upload className="w-8 h-8" />,
      image: XyzImage,
    },
    {
      number: '2',
      title: 'Curriculum Architecture',
      description: 'Orion\'s AI builds a logical, 10-15 minute instructional curriculum. It ensures that sub-topics follow a natural progression (e.g., Fundamentals → Strategy → Execution) without content overlap.',
      image: Process,
    },
    {
      number: '3',
      title: 'Asset Synthesis',
      description: 'Once the curriculum is set, creators can trigger the generation of specialized assets: Slides (High-impact visual decks), Voice Scripts (Detailed narration for video production), Audiobooks (Export-ready MP3s with transcripts), Ebooks (Narrative-driven PDFs for reading).',
      icon: <Rocket className="w-8 h-8" />,
      image: Orion3,
    },
    {
      number: '4',
      title: 'Review & Export',
      description: 'Assets are managed in a centralized dashboard where creators can refine content, regenerate modules, or download final files for distribution.',
      icon: <Settings className="w-8 h-8" />,
      image: ReportImage,
    },
  ];

  const refs = [step1Ref, step2Ref, step3Ref, step4Ref];



  return (
    <section id="working" className="py-20 bg-[#0A0A0A] relative overflow-hidden">
      {/* Floating revolving icons - positioned relative to section */}
      {/* Upload icon - Top left corner */}
      <div className="absolute top-[10%] left-[3%] w-14 h-14 text-lime-500/50 animate-revolve-1 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Upload className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Brain icon - Top right corner */}
      <div className="absolute top-[12%] right-[3%] w-12 h-12 text-lime-600/50 animate-revolve-2 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow-reverse">
          <Brain className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Folder icon - Bottom left */}
      <div className="absolute bottom-[10%] left-[4%] w-16 h-16 text-lime-500/45 animate-revolve-3 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Folder className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Rocket icon - Bottom right */}
      <div className="absolute bottom-[12%] right-[4%] w-13 h-13 text-lime-600/50 animate-revolve-4 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow-reverse">
          <Rocket className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* FileText icon - Top center-left */}
      <div className="absolute top-[8%] left-[20%] w-11 h-11 text-lime-500/40 animate-revolve-5 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <FileText className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Server icon - Bottom center-right */}
      <div className="absolute bottom-[8%] right-[20%] w-14 h-14 text-lime-600/45 animate-revolve-6 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow-reverse">
          <Server className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Cpu icon - Top center-right */}
      <div className="absolute top-[6%] right-[18%] w-12 h-12 text-lime-500/45 animate-revolve-7 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Cpu className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>
      {/* Floating icons with randomized positions */}
      {/* BarChart3 icon - Random position */}
      <div className="absolute top-[5%] left-[15%] w-12 h-12 text-lime-500/50 animate-revolve-1 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <BarChart3 className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Brain icon - Random position */}
      <div className="absolute top-[25%] right-[8%] w-14 h-14 text-lime-600/50 animate-revolve-2 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow-reverse">
          <Brain className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Mail icon - Random position */}
      <div className="absolute bottom-[22%] left-[8%] w-13 h-13 text-lime-500/45 animate-revolve-3 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Mail className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Zap icon - Random position */}
      <div className="absolute bottom-[8%] right-[12%] w-11 h-11 text-lime-600/50 animate-revolve-4 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow-reverse">
          <Zap className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Folder icon - Random position */}
      <div className="absolute top-[18%] left-[5%] w-10 h-10 text-lime-500/40 animate-revolve-5 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Folder className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Server icon - Random position */}
      <div className="absolute bottom-[15%] right-[25%] w-14 h-14 text-lime-600/45 animate-revolve-6 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow-reverse">
          <Server className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Settings icon - Random position */}
      <div className="absolute top-[35%] right-[5%] w-13 h-13 text-lime-500/45 animate-revolve-7 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Settings className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Title Section */}
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            How <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">ORION</span> Works
          </h2>
          <p className="text-base sm:text-lg text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Go from concept to course assets in four simple steps.
          </p>
        </div>

        {/* Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="relative">

            {/* Steps in horizontal row */}
            <div className="grid grid-cols-1 gap-8 md:gap-12 relative z-10">
              {steps.map((step, index) => {
                const delay = `delay-${(index + 1) * 100}`;
                const isEven = index % 2 === 1;
                // Animation direction: first and last from left, middle from right
                const animationClass = index === 1 ? 'fade-in-right' : 'fade-in-left';

                return (
                  <div
                    key={index}
                    ref={refs[index]}
                    className={`animate-on-scroll ${animationClass} ${delay} group`}
                    style={{
                      transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
                      transitionDelay: `${(index + 1) * 100}ms`,
                    }}
                  >
                    <div className="relative flex flex-col md:flex-row p-2 sm:p-4 md:p-6 lg:p-8 items-stretch h-full transform transition-all duration-500 gap-0 overflow-hidden rounded-2xl border border-gray-800 hover:border-lime-500/70 transition-all duration-500 hover:shadow-2xl hover:shadow-lime-500/30 bg-gradient-to-br from-[#121212] via-[#0F0F0F] to-[#121212]">
                      {/* Image Section - Full Size */}
                      <div className={`relative w-full md:w-1/2 h-[300px] sm:h-[300px] md:h-[300px] lg:h-[350px] overflow-hidden ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                        <>
                          <img
                            src={step.image}
                            alt={step.title}
                            className={`w-full h-full transition-transform duration-500 group-hover:scale-110 ${index === 0 ? 'object-cover object-left' : 'object-contain object-bottom'}`}
                          />
                        </>
                      </div>

                      {/* Vertical Emerald Line Separator */}
                      <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-3/4 bg-gradient-to-b from-lime-500 via-lime-400 to-lime-500 z-10"></div>

                      {/* Content Section */}
                      <div className="relative w-full md:w-1/2 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                        {/* Gradient overlay on hover */}
                        {/* <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div> */}

                        {/* Animated border glow */}
                        {/* <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/20 to-yellow-600/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div> */}

                        <div className="relative z-10">
                          {/* Step number badge */}
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-lime-500/20 to-lime-600/20 border border-lime-500/30 mb-4 text-lime-400 font-bold text-base">
                            {step.number}
                          </div>

                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 group-hover:text-lime-400 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {step.title}
                          </h3>
                          <p className="text-gray-400 leading-relaxed text-sm sm:text-base flex-grow group-hover:text-gray-300 transition-colors duration-300" style={{ fontFamily: "'Poppins', sans-serif" }}>
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

export default HowORIONWorksPage;