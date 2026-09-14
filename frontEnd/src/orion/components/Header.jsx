import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import orionLogo from '../assets/Aeon_logo.png';

const NAV_ITEMS = [
  { href: '#meet-orion', label: 'Meet ORION' },
  { href: '#working', label: 'Working' },
  { href: '#capabilities', label: 'Features' },
  { href: '#delightful-service', label: 'Why Choose ORION' },
  { href: '#pricingSection', label: 'Pricing' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#contact', label: 'Get Started' },
  
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [headerHeight, setHeaderHeight] = useState(80);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = React.useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.classList.toggle('overflow-hidden');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove('overflow-hidden');
  };

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (!element) return;
    const headerOffset = 100;
    const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > headerHeight);

      const sections = document.querySelectorAll('section[id]');
      let currentSection = '';
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - headerHeight - 20) {
          currentSection = section.getAttribute('id') || '';
        }
      });

      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headerHeight, activeSection]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isMenuOpen]);

  return (
    <>
      
      <header
        ref={headerRef}
        id="header"
        className={`absolute top-0 left-0 right-0 z-50 bg-transparent transition-transform duration-300 ${
          isScrolled ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-6 py-0 md:py-0.5">
          <div className="flex shrink-0 items-center gap-2 text-xl md:text-2xl font-bold tracking-tighter text-white hover:scale-105 transition-transform duration-300 group">
            <img
              src={orionLogo}
              alt="EVOKE logo"
              className="h-12 w-12 md:h-[72px] md:w-[72px] rounded-full object-contain"
            />
            <span
              className="relative whitespace-nowrap"
              style={{ fontFamily: "'Bahnschrift','Rajdhani', sans-serif" }}
            >
              EVOKE AI
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-lime-500 transition-all duration-300 group-hover:w-full" />
            </span>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
            {NAV_ITEMS.map((item) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className={`nav-link relative whitespace-nowrap px-1 py-2 text-sm font-medium transition-all duration-300 xl:px-3.5 ${
                    isActive ? 'text-lime-500' : 'text-white hover:text-lime-400'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-lime-500" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-7 lg:flex">
            <Link
              to="/login"
              className="whitespace-nowrap text-sm font-medium text-white hover:text-lime-400 transition-colors duration-300"
            >
              Login
            </Link>
           <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#contact');
              }}
              className="cta-button relative overflow-hidden whitespace-nowrap rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-2.5 font-semibold text-black shadow-lg shadow-lime-500/30 transition-all duration-300 hover:scale-105 hover:from-lime-400 hover:to-lime-500 hover:shadow-lime-500/50 group"
            >
              <span className="relative z-10">Connect to ORION</span>
              <span className="absolute inset-0 bg-gradient-to-r from-lime-400 to-lime-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </a>
          </div>

          <div className="relative z-[60] lg:hidden">
            <button
              id="menu-btn"
              type="button"
              className="rounded-lg p-2 text-white transition-colors duration-300 hover:bg-white/10 focus:outline-none"
              onClick={toggleMenu}
            >
              <svg
                id="menu-open-icon"
                className={`h-6 w-6 transition-all duration-300 ${isMenuOpen ? 'hidden rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <svg
                id="menu-close-icon"
                className={`h-6 w-6 transition-all duration-300 ${isMenuOpen ? 'rotate-0 opacity-100' : 'hidden -rotate-90 opacity-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      
      <div
        className={`fixed left-0 right-0 z-40 flex h-12 items-center justify-between transition-all duration-300 md:h-14 ${
          isScrolled
            ? 'top-0 translate-y-0 border-b border-lime-500/20 opacity-100 shadow-2xl shadow-black/50 backdrop-blur-xl'
            : 'pointer-events-none -translate-y-full opacity-0'
        }`}
        style={{ backgroundColor: 'rgb(255 255 255 / 1%)' }}
      >
        <div className="container mx-auto flex w-full items-center justify-between px-6">
          <span className="text-sm font-extrabold text-white md:text-base">
            ORION
            <span className="ml-1 text-lime-500"> Course Creator </span>
          </span>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#contact');
            }}
            className="group flex items-center gap-2 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-black shadow-lg transition-all duration-300 hover:scale-105 md:px-6 md:py-2 md:text-base"
          >
            Connect to ORION
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 md:h-5 md:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>

      
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 z-50 flex h-full w-4/5 max-w-sm transform flex-col border-l border-lime-500/20 bg-gradient-to-b from-[#0A0A0A] to-[#101010] p-8 shadow-2xl transition-transform duration-300 lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex-grow">
          <a
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-2xl font-bold tracking-tighter text-white transition-transform duration-300 hover:scale-105"
            onClick={closeMenu}
          >
            <img src={orionLogo} alt="EVOKE logo" className="h-12 w-12 rounded-full object-contain" />
            <span className="whitespace-nowrap">
              EVOKE <span className="text-lime-500">.</span>
            </span>
          </a>
          <nav className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item, index) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    closeMenu();
                    scrollToSection(item.href);
                  }}
                  className={`mobile-menu-link relative rounded-lg px-4 py-3 text-lg transition-all duration-300 ${
                    isActive
                      ? 'border-l-2 border-lime-500 bg-lime-500/10 text-lime-500'
                      : 'text-gray-300 hover:bg-white/5 hover:text-lime-400'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            to="/login"
            onClick={closeMenu}
            className="w-full rounded-lg border border-white/20 px-8 py-3 text-center font-semibold text-white transition-all duration-300 hover:bg-white/5"
          >
            Login
          </Link>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              closeMenu();
              scrollToSection('#contact');
            }}
            className="cta-button w-full rounded-full bg-gradient-to-r from-lime-500 to-lime-600 px-8 py-3 text-center font-semibold text-black shadow-lg shadow-lime-500/30 transition-all duration-300 hover:scale-105 hover:from-lime-400 hover:to-lime-500"
          >
            Connect to ORION
          </a>
        </div>
      </div>

      <div
        id="menu-overlay"
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMenu}
      />
    </>
  );
};

export default Header;
