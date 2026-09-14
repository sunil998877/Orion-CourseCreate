import React, { useState, useEffect } from 'react';
import './Header.css';
import orionLogo from '../assets/Aeon_logo.png';

/**
 * Header Component
 * Fixed header with navigation menu and mobile menu functionality
 */
const Header = () => {
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Controls mobile menu visibility
  const [activeSection, setActiveSection] = useState(''); // Tracks which section is currently in view
  const [headerHeight, setHeaderHeight] = useState(80); // Stores the header's height for scroll calculations
  const [isScrolled, setIsScrolled] = useState(false); // Tracks if user has scrolled past header
  const headerRef = React.useRef(null); // Reference to header element for height calculations

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.classList.toggle('overflow-hidden');
  };

  // Close menu when clicking overlay or links
  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove('overflow-hidden');
  };

  // Calculate header height
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

  // Handle scroll effects for header visibility and active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled past the header
      setIsScrolled(window.scrollY > headerHeight);

      // Find the currently active section
      const sections = document.querySelectorAll('section[id]');
      let currentSection = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - headerHeight - 20) { // Adjusted offset for better accuracy
          currentSection = section.getAttribute('id');
        }
      });

      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    // Clean up listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerHeight, activeSection]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isMenuOpen]);

  return (
    <>
      {/* Header - Not Fixed */}
      <header
        ref={headerRef}
        id="header"
        className={`relative z-50 bg-transparent transition-transform duration-300 ${isScrolled ? '-translate-y-full' : 'translate-y-0'
          }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div

            className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-white hover:scale-105 transition-transform duration-300 group"
          >
            <img
              src={orionLogo}
              alt="EVOKE logo"
              className="h-12 w-12 md:h-20 md:w-20 rounded-full object-contain"
            />
            <span className="relative" style={{ fontFamily: "'Bahnschrift','Rajdhani', sans-serif" }}>
              EVOKE AI

              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-500 group-hover:w-full transition-all duration-300"></span>
            </span>
          </div>

          {/* Desktop Navigation - Only visible on medium screens and above */}
          <nav className="hidden md:flex items-center space-x-2 px-4 py-4">
            {/* Navigation links array - maps to sections on the page */}
            {[
              { href: '#meet-orion', label: 'Meet ORION' },
              { href: '#working', label: ' Working' },
              { href: '#capabilities', label: 'Features' },
              { href: '#delightful-service', label: 'Why Choose ORION' },
              { href: '#pricingSection', label: 'Pricing' },
              { href: '#testimonials', label: 'Testimonials' },
              { href: '#contact', label: 'Get Started' },
            ].map((item) => {
              // Extract section ID from href (remove #)
              const sectionId = item.href.replace('#', '');
              // Check if this section is currently active (in viewport)
              const isActive = activeSection === sectionId;

              // Handle smooth scroll to section with header offset
              const handleClick = (e) => {
                e.preventDefault();
                const element = document.querySelector(item.href);
                if (element) {
                  const headerOffset = 100; // Offset to account for fixed header
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth' // Smooth scroll animation
                  });
                }
              };
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleClick}
                  className={`nav-link relative px-4 py-2 text-sm font-medium transition-all duration-300 ${isActive
                      ? 'text-lime-500'
                      : 'text-gray-300 hover:text-lime-400'
                    }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {/* Active section indicator - lime underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-500 rounded-full"></span>
                  )}
                  {/* Hover effect - animated underline */}
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-500/50 rounded-full scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              );
            })}
          </nav>

          {/* CTA Button - Scrolls to contact form */}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector('#contact');
              if (element) {
                const headerOffset = 100; // Offset for fixed header
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            }}
            className="hidden md:block cta-button relative bg-gradient-to-r from-lime-500 to-lime-600 text-black font-semibold px-6 py-2 rounded-lg hover:from-lime-400 hover:to-lime-500 transition-all duration-300 shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 hover:scale-105 overflow-hidden group"
          >
            <span className="relative z-10">Connect to ORION</span>
            {/* Hover overlay effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-lime-400 to-lime-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </a>

          {/* Mobile Menu Button */}
          <div className="md:hidden relative z-[60]">
            <button
              id="menu-btn"
              type="button"
              className="text-white focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
              onClick={toggleMenu}
            >
              <svg
                id="menu-open-icon"
                className={`w-6 h-6 transition-all duration-300 ${isMenuOpen ? 'hidden opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
              <svg
                id="menu-close-icon"
                className={`w-6 h-6 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'hidden opacity-0 -rotate-90'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Blur Ribbon - Secondary navigation bar that appears when scrolling down */}
      {/* This ribbon replaces the main header when user scrolls past it */}
      <div
        className={`fixed left-0 right-0 z-40 h-12 md:h-14 transition-all duration-300 flex items-center justify-between ${isScrolled
            ? 'backdrop-blur-xl shadow-2xl shadow-black/50 border-b border-lime-500/20 top-0 opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        style={{
          backgroundColor: 'rgb(255 255 255 / 1%)', // Semi-transparent white background
        }}
      >
        <div className="container mx-auto px-6 flex items-center justify-between w-full">
          {/* Brand name in ribbon */}
          <span className="text-white text-sm md:text-base font-medium font-extrabold">
            ORION
            <span className="text-lime-500 ml-1"> Course Creator </span>
          </span>
          {/* CTA button in ribbon - scrolls to contact form */}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector('#contact');
              if (element) {
                const headerOffset = 100; // Offset for fixed header
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            }}
            className="bg-gradient-to-r from-white to-white text-black font-semibold px-4 py-1.5 md:px-6 md:py-2 rounded-lg  transition-all duration-300 shadow-lg  hover:scale-105 text-sm md:text-base flex items-center gap-2 group"
          >
            Connect to ORION
            {/* Arrow icon with hover animation */}
            <svg
              className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed top-0 right-0 w-4/5 max-w-sm h-full bg-gradient-to-b from-[#0A0A0A] to-[#101010] shadow-2xl border-l border-lime-500/20 transform transition-transform duration-300 flex flex-col p-8 z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex-grow">
          <a
            href="/"
            className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-white mb-12 hover:scale-105 transition-transform duration-300 inline-block"
            onClick={closeMenu}
          >
            <img
              src={orionLogo}
              alt="EVOKE logo"
              className="h-12 w-12 rounded-full object-contain"
            />
            <span>
              EVOKE <span className="text-lime-500">.</span>
            </span>
          </a>
          {/* Mobile Navigation Links */}
          <nav className="flex flex-col space-y-2">
            {/* Navigation items with staggered animation delay */}
            {[
              { href: '#meet-orion', label: 'Meet ORION' },
              { href: '#capabilities', label: 'Features' },
              { href: '#delightful-service', label: 'Why Choose ORION' },
              { href: '#pricing', label: 'Pricing' },
              { href: '#testimonials', label: 'Testimonials' },
              { href: '#contact', label: 'Get Started' },
            ].map((item, index) => {
              // Extract section ID from href
              const sectionId = item.href.replace('#', '');
              // Check if section is active
              const isActive = activeSection === sectionId;

              // Handle navigation click - closes menu and scrolls to section
              const handleClick = (e) => {
                e.preventDefault();
                closeMenu(); // Close mobile menu
                const element = document.querySelector(item.href);
                if (element) {
                  const headerOffset = 100; // Offset for fixed header
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              };
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleClick}
                  className={`mobile-menu-link relative px-4 py-3 text-lg rounded-lg transition-all duration-300 ${isActive
                      ? 'text-lime-500 bg-lime-500/10 border-l-2 border-lime-500'
                      : 'text-gray-300 hover:text-lime-400 hover:bg-white/5'
                    }`}
                  style={{ transitionDelay: `${index * 50}ms` }} // Staggered animation delay
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            closeMenu();
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
          className="w-full text-center cta-button bg-gradient-to-r from-lime-500 to-lime-600 text-black font-semibold px-8 py-3 rounded-lg hover:from-lime-400 hover:to-lime-500 transition-all duration-300 shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 hover:scale-105"
        >
          Connect to ORION
        </a>
      </div>

      {/* Menu Overlay */}
      <div
        id="menu-overlay"
        className={`md:hidden fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeMenu}
      />
    </>
  );
};

export default Header;
