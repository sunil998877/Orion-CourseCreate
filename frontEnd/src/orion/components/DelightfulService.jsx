import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import ServicesImage from '../assets/orion 2.png';
import { Brain, Zap, Palette, FolderOpen } from 'lucide-react';

const DelightfulService = () => {
  const titleRef = useScrollAnimation();
  const leftRef = useScrollAnimation();
  const rightRef = useScrollAnimation();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Structural Intelligence',
      description: 'Our AI architectures learning paths with logic-first design, ensuring comprehensive coverage without fluff.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Scalability',
      description: 'Generate modules, slide decks, and narration-ready scripts in minutes—not weeks.',
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Brand-Aligned Content',
      description: 'Content tailored to your brand voice and audience level—Academic, Professional, or Storytelling.',
    },
    {
      icon: <FolderOpen className="w-6 h-6" />,
      title: 'Multi-Format Export',
      description: 'Export to PPTX, MP3 audiobooks, and narrative PDFs—industry-standard formats students use.',
    },
  ];

  return (
    <section id="delightful-service" className="py-24 bg-gradient-to-b from-[#101010] to-[#0A0A0A] overflow-hidden">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Delightful Service Starts With  <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text  text-transparent">ORION</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Your knowledge, transformed into premium learning experiences
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          <div ref={leftRef} className="animate-on-scroll fade-in-left space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl bg-[#121212] border border-gray-800 hover:border-lime-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-gradient-to-br from-lime-500 to-lime-600 text-black group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          
          <div ref={rightRef} className="hidden lg:block animate-on-scroll fade-in-right delay-200 relative">
            <div className="relative">
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-2 border-lime-500/20 rounded-full animate-pulse"></div>

              
              <div className="relative z-10 flex items-center justify-center">
                
                <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#0A0A0A] border-2 border-gray-800 shadow-2xl">
                  
                  <div className="absolute inset-0 rounded-full" style={{
                    background: 'radial-gradient(circle, rgba(74, 242, 161, 0.1) 0%, rgba(74, 242, 161, 0.05) 50%, transparent 100%)'
                  }}></div>
                </div>
                
                <div className="relative z-10 w-[400px] h-[400px] rounded-full overflow-hidden border-4 border-lime-500/40 shadow-2xl shadow-lime-500/20">
                  <img
                    src={ServicesImage}
                    alt="Services"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DelightfulService;
