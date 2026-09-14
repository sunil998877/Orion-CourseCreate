import React from 'react';
import orionImage from '../assets/orion hero sec.png';
import orionMobileImage from '../assets/Aeonmob.png';

const MeetORION = () => {
  return (
    <section id="meet-orion" className="w-full flex flex-col items-center justify-center ">
      
      <div className='w-full max-w-7xl mx-auto rounded-[38px] md:rounded-[83px] overflow-hidden mt-8 sm:mt-6 md:mt-8 relative flex items-center justify-center border-2 bg-gradient-to-b from-[#101010] to-[#0A0A0A]' style={{ borderColor: '#84cc16', boxShadow: '0 0 20px rgba(132, 204, 22, 0.3), 0 0 40px rgba(132, 204, 22, 0.5), 0 0 80px rgba(132, 204, 22, 0.15)' }} >
        
        <img
          src={orionMobileImage}
          alt="ORION"
          className="w-full h-auto object-contain md:hidden rounded-[38px]"
        />
        
        <img
          src={orionImage}
          alt="ORION"
          className="hidden md:block w-full h-auto object-contain rounded-[83px]"
        />
      </div>

      
      <div className="container mx-auto  px-6 sm:px-6 md:px-12 mt-12 sm:mt-16 md:mt-20">
        <div className="text-center max-w-6xl mx-auto my-7">
          
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight"
            style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800 }}
          >
            
            <span className="inline-block">
              Meet{" "}
              
              <span className="bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 bg-clip-text text-transparent">
                ORION —
              </span>{" "}
              your dedicated{" "}
              
              <span className="bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 bg-clip-text text-transparent font-bold">
                AI Course Creator
              </span>
            </span>
          </h2>

          
          <p
            className="mt-6 text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl text-gray-300 leading-relaxed"
            style={{ fontFamily: "'Barlow', sans-serif" }}
          >
            Orion is a world-class AI-driven course creator{" "}
            
            
            Powered by{" "}
            
            <span className="bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 bg-clip-text text-transparent font-bold">
              "EVOKE AI"
            </span>
            <br />
            Turn ideas, outlines, and notes into ready-to-teach courses in under 5 minutes—plus interactive slide decks, cinematic audiobooks, and elegant ebooks.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MeetORION;