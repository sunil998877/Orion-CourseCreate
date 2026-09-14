import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import { CheckCircle2 } from 'lucide-react';

const UseCasesCloud = () => {
  const titleRef = useScrollAnimation({ threshold: 0.2 });
  const cloudRef = useScrollAnimation({ threshold: 0.2 });

  const useCases = [
    "Contextualization",
    "Document to Course Conversion",
    "e-Learning Authoring",
    "Employee Training",
    "HR Training",
    "Instructional Design",
    "Microlearning Courses",
    "Online Course Creation",
    "Sales Training",
    "Start-ups & Small Businesses"
  ];

  return (
    <section className="py-20 bg-[#0A0A0A] relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-[100px] pointer-events-none -z-0"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Endless Possibilities. <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Built for Every Use Case.</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
            No matter your industry or goal, ORION adapts to deliver impactful learning experiences.
          </p>
        </div>

        <div 
          ref={cloudRef} 
          className="animate-on-scroll fade-in-up delay-200 max-w-5xl mx-auto flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5"
        >
          {useCases.map((useCase, index) => {
            const delay = `delay-${(index % 5 + 1) * 100}`;
            return (
              <div 
                key={index}
                className={`animate-on-scroll fade-in-up ${delay} flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[#121212] border border-gray-800 hover:border-lime-500 hover:shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all duration-300 group cursor-default`}
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-lime-400 transition-colors duration-300" />
                <span className="text-gray-300 group-hover:text-white text-sm sm:text-base font-medium transition-colors duration-300" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {useCase}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCasesCloud;
