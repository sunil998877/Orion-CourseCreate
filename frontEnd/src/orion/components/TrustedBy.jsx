import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import AstroremedisLogo from '../assets/Astroremedis.png';
import EduonixLogo from '../assets/eduonix.png';
import SipconLogo from '../assets/Sipcon.jpg';
import damnartLogo from '../assets/Damnart.png';
import eurocertLogo from '../assets/eurocert.webp';
import itcLogo from '../assets/itc.png';
import sustainableLogo from '../assets/Sustainable.jpg';
import grnataLogo from '../assets/Grnata.png';

const TrustedBy = () => {
  const titleRef = useScrollAnimation();
  const ref = useScrollAnimation();

  const companies = [
    { name: 'DamnArt', logo: damnartLogo, displayName: 'DamnArt' },
    { name: 'Eurocert', logo: eurocertLogo, displayName: 'Eurocert' },
    { name: 'ITC India', logo: itcLogo, displayName: 'ITC India' },
    { name: 'Sustainable Futures Trainings', logo: sustainableLogo, displayName: 'Sustainable Futures Trainings' },
    { name: 'Grnata', logo: grnataLogo, displayName: 'Grnata' },
    {name:'Sipcon', logo: SipconLogo, displayName:'Sipcon'},
    {name:'AstroRemedis', logo: AstroremedisLogo, displayName:'AstroRemedis'},
    {name:'Eduonix', logo: EduonixLogo, displayName:'Eduonix'}

  ];

  return (
    <section className="py-16 bg-[#0A0A0A] border-t border-b border-gray-900/50">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Powering  <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Businesses </span>Across Industries
          </h2>
          <p className="text-base sm:text-lg text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Trusted by visionary organizations for 24/7 intelligence
          </p>
        </div>
        <div ref={ref} className="marquee animate-on-scroll fade-in">
          <div className="marquee-content">
            
            {[...companies, ...companies, ...companies, ...companies, ...companies, ...companies].map((company, index) => (
              <div 
                key={index} 
                className="marquee-item flex flex-col items-center justify-center gap-3 group"
              >
                
                <div className="relative w-12 h-16 md:w-16 md:h-16 flex items-center justify-center transition-all duration-300 group-hover:scale-125 bg-white rounded-lg p-1.5 md:p-2 group-hover:bg-gray-100 shadow-md group-hover:shadow-lg">
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                
                <div className="text-gray-400 text-sm md:text-base font-semibold text-center whitespace-nowrap group-hover:text-gray-300 transition-colors duration-300">
                  {
                    company.displayName
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;

