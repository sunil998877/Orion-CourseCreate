import React, { useState, useEffect } from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import { 
  Mail, 
  Send,
  User,
  Building,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { API_BASE } from '../../utils/api';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const titleRef = useScrollAnimation();
  const formRef = useScrollAnimation();
  
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [status, setStatus] = useState({ type: '', message: '' }); 

  
  useEffect(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "AWeroNVwYG4aGzG1D");
  }, []);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (status.message) {
      setStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      company: formData.company,
      phone: formData.phone,
      message: formData.message || '',
    };

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || 'Failed to save message');
      }

      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_1wzzo5z",
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_pw54fxy",
          payload
        );
      } catch (emailErr) {
        if (import.meta.env.DEV) {
          console.warn('EmailJS failed after DB save:', emailErr);
        }
      }

      setStatus({
        type: 'success',
        message: 'Message sent successfully! We will get back to you soon.',
      });

      setFormData({
        fullName: '',
        company: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('❌ Contact submit error:', err);
      }

      setStatus({
        type: 'error',
        message: err.message || 'Failed to send message. Please try again or contact us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#0A0A0A] relative overflow-hidden">
      
      
      <div className="absolute top-[10%] left-[3%] w-14 h-14 text-lime-500/50 animate-revolve-1 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Mail className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      
      <div className="absolute top-[12%] right-[3%] w-12 h-12 text-lime-600/50 animate-revolve-2 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow-reverse">
          <MessageSquare className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      
      <div className="absolute bottom-[10%] left-[4%] w-16 h-16 text-lime-500/45 animate-revolve-3 hidden lg:block pointer-events-none z-0">
        <div className="w-full h-full animate-spin-slow">
          <Send className="w-full h-full drop-shadow-[0_0_8px_rgba(74,242,161,0.6)]" strokeWidth={1.5} />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Get in <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-lg text-gray-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        
        <div ref={formRef} className="max-w-3xl mx-auto animate-on-scroll fade-in-up delay-200">
          <form id="contact-form" onSubmit={handleSubmit} className="bg-gradient-to-br from-[#121212] via-[#0F0F0F] to-[#121212] border border-gray-800 rounded-2xl p-6 md:p-8 lg:p-10 space-y-6 hover:border-lime-500/50 transition-all duration-500">
            
            <div className="group">
              <label htmlFor="fullName" className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <User className="w-4 h-4 text-lime-500" />
                Full Name <span className="text-lime-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition-all duration-300"
                placeholder="Enter your full name"
              />
            </div>

            
            <div className="group">
              <label htmlFor="company" className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <Building className="w-4 h-4 text-lime-500" />
                
                Company  <span className="text-lime-500">*</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition-all duration-300"
                placeholder="Enter your company name"
              />
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="group">
                <label htmlFor="email" className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <Mail className="w-4 h-4 text-lime-500" />
                  Email <span className="text-lime-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition-all duration-300"
                  placeholder="your.email@example.com"
                />
              </div>

              
              <div className="group">
                <label htmlFor="phone" className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <Phone className="w-4 h-4 text-lime-500" />
                  Phone Number   <span className="text-lime-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition-all duration-300"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

      
            

            
            <div className="group">
              <label htmlFor="message" className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <MessageSquare className="w-4 h-4 text-lime-500" />
                Message 
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                
                rows={6}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition-all duration-300 resize-none"
                placeholder="Tell us about your inquiry..."
              />
            </div>

            
            {status.message && (
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                status.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                
                {status.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {status.message}
                </p>
              </div>
            )}

            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-black font-semibold rounded-lg hover:from-lime-400 hover:to-lime-500 transition-all duration-300 shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {isSubmitting ? (
                  <>
                    
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;

