import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import { MessageSquare, FileUp, Sparkles, Users, MonitorPlay, Palette } from 'lucide-react';

const CoreBenefits = () => {
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const card1Ref = useScrollAnimation({ threshold: 0.2 });
  const card2Ref = useScrollAnimation({ threshold: 0.2 });
  const card3Ref = useScrollAnimation({ threshold: 0.2 });
  const card4Ref = useScrollAnimation({ threshold: 0.2 });
  const card5Ref = useScrollAnimation({ threshold: 0.2 });
  const card6Ref = useScrollAnimation({ threshold: 0.2 });

  const benefits = [
    {
      title: 'Guided Course Creation',
      description: 'Start with a simple idea—our AI guides you from concept to complete course, helping shape topics, structure lessons, generate quizzes,generates AI powered Podcast and craft meaningful recaps.',
      icon: <MessageSquare className="w-8 h-8 text-lime-400" />,
      ref: card1Ref,
      delay: 'delay-100'
    },
    {
      title: 'Turn your documents into courses',
      description: 'Upload PowerPoints, Word files, PDFs, or notes, and transform existing material into structured, ready-to-teach courses in minutes—not hours.',
      icon: <FileUp className="w-8 h-8 text-lime-400" />,
      ref: card2Ref,
      delay: 'delay-200'
    },
    {
      title: 'Enhance and expand your course with AI',
      description: 'Refine clarity, deepen content, and grow your curriculum with intelligent suggestions, new sections, and learning pathways generated from context.',
      icon: <Sparkles className="w-8 h-8 text-lime-400" />,
      ref: card3Ref,
      delay: 'delay-300'
    },
    {
      title: 'Built for every kind of course creator',
      description: 'Whether you teach, train teams, coach clients, or sell knowledge, ORION adapts to your goals—making course creation faster, smarter, and more impactful.',
      icon: <Users className="w-8 h-8 text-lime-400" />,
      ref: card4Ref,
      delay: 'delay-400'
    },
    {
      title: 'Create your dream course',
      description: 'The AI engine for building interactive, engaging online learning experiences—designed to turn expertise into world-class courses.',
      icon: <MonitorPlay className="w-8 h-8 text-lime-400" />,
      ref: card5Ref,
      delay: 'delay-500'
    },
    {
      title: 'Custom branding from day one',
      description: 'Create a learning experience that feels fully yours. Customize logos, colors, typography, and your course platform identity for a seamless branded experience across web and mobile.',
      icon: <Palette className="w-8 h-8 text-lime-400" />,
      ref: card6Ref,
      delay: 'delay-600'
    }
  ];

  return (
    <section className="py-20 bg-[#0A0A0A] relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            The smartest way to <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">build courses</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Create, convert, and enhance your educational content effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              ref={benefit.ref}
              className={`animate-on-scroll fade-in-up ${benefit.delay} group h-full`}
            >
              <div className="flex flex-col h-full p-8 rounded-2xl bg-gradient-to-br from-[#121212] via-[#0F0F0F] to-[#121212] border border-gray-800 hover:border-lime-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lime-500/20">
                <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-gray-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-lime-500/50 transition-all duration-500">
                  {benefit.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-lime-400 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {benefit.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base flex-grow group-hover:text-gray-300 transition-colors duration-300" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreBenefits;
