import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';

const Testimonials = () => {
  const titleRef = useScrollAnimation();
  const marqueeRef = useScrollAnimation();

  const testimonials = [
    {
      text: "ORION helped DamnArt transform our training materials into professional slide decks and audiobooks in minutes. We launched a complete course library without any technical expertise.",
      name: 'Vishal Sood',
      role: 'DamnArt',
      initials: 'VS',
    },
    {
      text: "For Meddevices, compliance training is critical. ORION's automated course builder created detailed modules with accurate diagrams, reducing our training development time by 80%.",
      name: 'Sukhpal Singh',
      role: 'Meddevices',
      initials: 'SS',
    },
    {
      text: "ORION streamlined Eurocert's certification training end-to-end. From course scripts to narrative ebooks, the platform transformed our content into engaging learning experiences.",
      name: 'Nikhil Arora',
      role: 'Eurocert',
      initials: 'NA',
    },
    {
      text: "ORION enabled Astro Remedies to launch structured online courses with professional voiceovers. Students now receive comprehensive video and audio lessons without manual recording sessions.",
      name: 'Satyam',
      role: 'Astro Remedies',
      initials: 'S',
    },
    {
      text: "The ORION course builder helped Sipcoin create training modules at scale. We generated slides, scripts, and audiobooks simultaneously—all polished and ready for distribution.",
      name: 'Pawan Wadhawan',
      role: 'Sipcoin',
      initials: 'PW',
    },
    {
      text: "ORION's course creation platform transformed how Grnata trains agents. It built property knowledge modules with split-screen presentations and downloadable ebooks.",
      name: 'Sadeeq',
      role: 'Grnata',
      initials: 'S',
    },
    {
      text: "ORION plays a critical role in ITC India's employee training. The platform created structured courses with quizzes, audiobooks, and progress tracking.",
      name: 'Manish Vig',
      role: 'ITC',
      initials: 'MV',
    },
    {
      text: "Eduonix uses ORION to build courses instantly. The AI generates curriculum, slide decks, and narration scripts—helping us launch new courses in hours, not months.",
      name: 'Sayem',
      role: 'Eduonix',
      initials: 'S',
    },
  ];

  
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="py-20 bg-[#101010] overflow-hidden">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Don't Just Take  <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Our Word For It</span>
          </h2>
          <p className="mt-4 text-gray-400">
            See how ORION is driving real results for visionary teams.
          </p>
        </div>

        <div ref={marqueeRef} className="mt-16 animate-on-scroll fade-in testimonial-container">
          <div className="testimonial-marquee-content">
            {duplicatedTestimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card-item">
                <div className="testimonial-card">
                  <p className="text-lg text-gray-300">{testimonial.text}</p>
                  <div className="mt-6 flex items-center">
                    <img
                      src={`https://placehold.co/50x50/10B981/0A0A0A?text=${testimonial.initials}`}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 border-2 border-lime-500"
                    />
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
