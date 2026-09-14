import React from 'react';
import { MessageCircle, Phone, Mail } from 'lucide-react';

/**
 * FloatingContactButtons Component
 * Fixed floating action buttons for WhatsApp, Phone, and Email at bottom right
 */
const FloatingContactButtons = () => {
  // Contact information - Update these with your actual contact details
  const whatsappNumber = '7986175240'; // Replace with your WhatsApp number
  const phoneNumber = '7986175240'; // Replace with your phone number
  const emailAddress = 'damnart.ai.guladab@gmail.com'; // Replace with your email

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      {/* WhatsApp Button - Opens WhatsApp chat */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {/* Tooltip on hover */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          WhatsApp
        </span>
      </a>

      {/* Phone/Call Button - Initiates phone call */}
      <a
        href={`tel:${phoneNumber}`}
        className="group flex items-center justify-center w-14 h-14 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Call us"
      >
        <Phone className="w-6 h-6 text-white" />
        {/* Tooltip on hover */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Call Us
        </span>
      </a>

      {/* Email Button - Opens default email client */}
      <a
        href={`mailto:${emailAddress}`}
        className="group flex items-center justify-center w-14 h-14 bg-[#0A0A0A] border-2 border-lime-500 hover:bg-lime-500/10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Send us an email"
      >
        <Mail className="w-6 h-6 text-lime-500 group-hover:text-lime-400" />
        {/* Tooltip on hover */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Email Us
        </span>
      </a>
    </div>
  );
};

export default FloatingContactButtons;

