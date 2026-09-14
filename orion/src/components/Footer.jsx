import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../utils/useScrollAnimation';

/**
 * Footer Component
 * Footer section with links, company info, and copyright
 */
const Footer = () => {
  const ref = useScrollAnimation();

  return (
    <footer className="bg-[#0A0A0A] border-t border-gray-800/50 py-12 md:py-16">
      <div ref={ref} className="container mx-auto px-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-8 animate-on-scroll fade-in-up">
          {/* Company Info */}
          <div className="space-y-4">
            <h3
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}
            >
              <span className="bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 bg-clip-text text-transparent">
                ORION
              </span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your AI-powered course creator platform designed to transform knowledge into professional learning materials. Build slides, audiobooks, and ebooks at scale.
            </p>
            <div className="pt-2">
              <span className="text-gray-500 text-sm">
                Powered by{' '}
                <span className="text-lime-500 font-semibold">EVOKE AI</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="pl-8">
            <h4
              className="text-white font-semibold mb-4 text-lg"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[{ href: '#meet-orion', label: 'Meet ORION' },
              { href: '#working', label: 'How ORION Works' },
              { href: '#delightful-service', label: 'Why Choose ORION' },
              { href: '#pricingSection', label: 'Pricing' },
              { href: '#testimonials', label: 'Testimonials' },
              { href: '#faqs', label: 'FAQs' },
              { href: '#contact', label: 'Get Started' },
              ].map((link) => {
                const handleClick = (e) => {
                  e.preventDefault();
                  const element = document.querySelector(link.href);
                  if (element) {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                };
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={handleClick}
                      className="text-gray-400 hover:text-lime-500 transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Resources
          <div>
            <h4 
              className="text-white font-semibold mb-4 text-lg"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                { href: '#reality', label: 'Task Management' },
                { href: '#evoke', label: 'Why Choose ORION' },
                { href: '#contact', label: 'Contact Us' },
              ].map((link) => {
                const handleClick = (e) => {
                  e.preventDefault();
                  const element = document.querySelector(link.href);
                  if (element) {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                };
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={handleClick}
                      className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div> */}

          {/* Contact & Social */}
          <div>
            <h4
              className="text-white font-semibold mb-4 text-lg"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Connect
            </h4>
            <ul className="space-y-3 mb-6">
              <li>
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
                  className="text-gray-400 hover:text-lime-500 transition-colors duration-300 text-sm"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a
                  href="#faqs"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector('#faqs');
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
                  className="text-gray-400 hover:text-lime-500 transition-colors duration-300 text-sm"
                >
                  FAQs
                </a>
              </li>
            </ul>
            {/* Social Media Icons with Isometric Effect */}
            <div className="max-w-fit rounded-[15px] flex flex-row items-center justify-center gap-4 backdrop-blur-[15px] transition-all duration-500 hover:bg-white/5"
              style={{
                boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.192), inset 0 0 5px rgba(255, 255, 255, 0.274), 0 5px 5px rgba(0, 0, 0, 0.164)'
              }}
            >
              <ul className="p-4 flex flex-row gap-4 items-center justify-center">
                {/* LinkedIn */}
                <li className="relative cursor-pointer group iso-pro-item">
                  <span className="absolute opacity-0 group-hover:opacity-20 transition-all duration-300 rounded-full h-[60px] w-[60px] border border-lime-500"
                    style={{
                      boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5), 0 5px 5px rgba(0, 0, 0, 0.164)'
                    }}
                  />
                  <span className="absolute opacity-0 group-hover:opacity-40 group-hover:translate-x-[5px] group-hover:-translate-y-[5px] transition-all duration-300 rounded-full h-[60px] w-[60px] border border-lime-500"
                    style={{
                      boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5), 0 5px 5px rgba(0, 0, 0, 0.164)'
                    }}
                  />
                  <span className="absolute opacity-0 group-hover:opacity-60 group-hover:translate-x-[10px] group-hover:-translate-y-[10px] transition-all duration-300 rounded-full h-[60px] w-[60px] border border-lime-500"
                    style={{
                      boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5), 0 5px 5px rgba(0, 0, 0, 0.164)'
                    }}
                  />
                  <button type="button" aria-label="Visit our LinkedIn page" className="block border-none bg-transparent p-0 cursor-pointer"
                    onClick={() => window.open('https://www.linkedin.com/company/ai-evoke/?viewAsMember=true', '_blank', 'noopener,noreferrer')}
                  >
                    <svg
                      viewBox="0 0 448 512"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-all duration-300 p-4 h-[60px] w-[60px] rounded-full text-lime-500 fill-current group-hover:translate-x-[5px] group-hover:-translate-y-[5px]"
                      style={{
                        boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5), 0 5px 5px rgba(0, 0, 0, 0.164)'
                      }}
                    >
                      <path d="M100.28 448H7.4V148.9h92.88zm-46.44-340.7C24.12 107.3 0 83.16 0 53.64A53.64 53.64 0 0 1 53.84 0C83.36 0 107.5 24.12 107.5 53.64c0 29.52-24.14 53.66-53.66 53.66zM447.9 448h-92.68V302.4c0-34.7-12.4-58.4-43.44-58.4-23.7 0-37.8 15.9-44 31.3-2.3 5.6-2.8 13.5-2.8 21.4V448h-92.8s1.2-241.1 0-266.1h92.8v37.7c-0.2 0.3-0.5 0.7-0.7 1h0.7v-1c12.3-19 34.3-46.1 83.5-46.1 60.9 0 106.6 39.8 106.6 125.4V448z" />
                    </svg>
                  </button>
                  <div className="absolute left=1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 rounded-[5px] px-2 py-1 transition-all duration-300 text-lime-500 bg-white/30 z-[9999] group-hover:translate-y-[5px] group-hover:skew-x-[-5deg] whitespace-nowrap text-sm"
                    style={{
                      boxShadow: '-5px 0 1px rgba(153, 153, 153, 0.2), -10px 0 1px rgba(153, 153, 153, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5), 0 5px 5px rgba(0, 0, 0, 0.082)'
                    }}
                  >
                    LinkedIn
                  </div>
                </li>

                {/* Instagram */}
                <li className="relative cursor-pointer group iso-pro-item">
                  <span className="absolute opacity-0 group-hover:opacity-20 transition-all duration-300 rounded-full h-[60px] w-[60px] border border-lime-500"
                    style={{
                      boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5), 0 5px 5px rgba(0, 0, 0, 0.164)'
                    }}
                  />
                  <span className="absolute opacity-0 group-hover:opacity-40 group-hover:translate-x-[5px] group-hover:-translate-y-[5px] transition-all duration-300 rounded-full h-[60px] w-[60px] border border-lime-500"
                    style={{
                      boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5), 0 5px 5px rgba(0, 0, 0, 0.164)'
                    }}
                  />
                  <span className="absolute opacity-0 group-hover:opacity-60 group-hover:translate-x-[10px] group-hover:-translate-y-[10px] transition-all duration-300 rounded-full h-[60px] w-[60px] border border-lime-500"
                    style={{
                      boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5), 0 5px 5px rgba(0, 0, 0, 0.164)'
                    }}
                  />
                  <button type="button" aria-label="Visit our Instagram page" className="block border-none bg-transparent p-0 cursor-pointer"
                    onClick={() => window.open('http://www.instagram.com/ai_evoke?igsh=N2o4NXlvY2Q4emc1', '_blank', 'noopener,noreferrer')}>
                    <svg
                      className="transition-all duration-300 p-4 h-[60px] w-[60px] rounded-full text-lime-500 fill-current group-hover:translate-x-[5px] group-hover:-translate-y-[5px]"

                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      style={{
                        boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5), 0 5px 5px rgba(0, 0, 0, 0.164)'
                      }}
                    >
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 rounded-[5px] px-2 py-1 transition-all duration-300 text-lime-500 bg-white/30 z-[9999] group-hover:translate-y-[5px] group-hover:skew-x-[-5deg] whitespace-nowrap text-sm"
                    style={{
                      boxShadow: '-5px 0 1px rgba(153, 153, 153, 0.2), -10px 0 1px rgba(153, 153, 153, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.5), 0 5px 5px rgba(0, 0, 0, 0.082)'
                    }}
                  >
                    Instagram
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {' '}
              <span className="text-lime-500 font-semibold">EVOKE AI</span>. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
              <Link to="/privacy-policy" className="text-gray-500 hover:text-lime-500 transition-colors duration-300">
                Privacy Policy
              </Link>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

