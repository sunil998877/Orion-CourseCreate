import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';

export default function PricingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "AWeroNVwYG4aGzG1D");
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    setSubmitStatus({ type: '', message: '' });
    setIsSubmitting(false);
  };

  const cards = [
    {
      title: "Free Trial",
      tag: "Try For Free",
      desc: "Experience ORION with one free course sample — no credit card required",
      price: null,
      freeLabel: "Free Forever",
      features: ["1 Sample Course Generation", "Basic Slide Deck Preview", "Standard Audiobook Sample", "PDF Export (Watermarked)"],
      pain: ["Not sure if ORION fits you", "Want to try before buying"],
      solution: ["Generate 1 complete sample", "Preview all core features", "No commitment required"],
      button: "Try Free",
      isFree: true
    },
    {
      title: "Starter Course",
      desc: "Perfect for individual creators and small teams",
      originalPrice: "₹5,999",
      price: "₹2,999",
      features: ["5 Course Modules", "Basic Slide Decks", "Standard Audiobooks", "PDF Ebook Export"],
      pain: ["Limited module creation", "Basic templates only"],
      solution: ["Create up to 5 modules", "Professional slide decks", "Generate audiobooks"],
      button: "Get Started"
    },
    {
      title: "Advanced Course",
      desc: "For growing businesses needing more features",
      originalPrice: "₹9,999",
      price: "₹5,999",
      features: ["Unlimited Modules", "Pro Slide Decks (Split-Screen)", "High-Fidelity Audiobooks", "PDF + EPUB Export", "Priority Support"],
      pain: ["Need more modules", "Want professional features"],
      solution: ["Unlimited module creation", "Pro split-screen slides", "Premium audiobook quality", "Multiple export formats"],
      button: "Get Started"
    },
    {
      title: "Enterprise",
      desc: "Full-scale course creation for organizations",
      features: ["Everything in Advanced", "Custom Development", "API Access", "Dedicated Account Manager", "On-Premise Deployment"],
      pain: ["Need custom solutions", "Large organization requirements"],
      solution: ["Full customization", "API integrations", "Dedicated support team", "Enterprise-grade security"],
      button: "Contact Sales"
    },
  ];

  return (
    <section id="pricingSection" className="min-h-screen bg-[#0A0A0A] py-20 px-4">
      <div className="max-w-7xl mx-auto text-center mb-14">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Find the <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Perfect Plan</span>
        </h2>
        <p className="mt-4 text-gray-400 text-base sm:text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Select the perfect ORION plan for your course creation journey - designed to match your content, audience level, and production goals.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto flex flex-row flex-nowrap justify-center gap-5 overflow-x-auto pb-4"
      >
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03, borderColor: '#84cc16' }}
            transition={{ type: "spring", stiffness: 200 }}
            className="min-w-[260px] flex-1 max-w-[300px] shadow-xl rounded-2xl p-6 border bg-[#121212] border-[#2A2A2A] flex flex-col"
          >
            
            <div>
              {card.isFree && (
                <span className="inline-block mb-2 px-3 py-0.5 text-xs font-bold rounded-full bg-lime-500/20 text-lime-400 border border-lime-500/40">
                  {card.tag}
                </span>
              )}
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="text-gray-400 mt-1 text-sm">{card.desc}</p>
            </div>

            <ul className="mt-5 space-y-2 text-gray-300 text-sm">
              {card.features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-lime-400 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <h4 className="text-xs font-semibold text-red-400 mb-1">Why You Need This</h4>
              <ul className="space-y-1 text-gray-400 text-xs">
                {card.pain?.map((p, idx) => (
                  <li key={idx}>- {p}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-semibold text-lime-400 mb-1">What You Get</h4>
              <ul className="space-y-1 text-gray-400 text-xs">
                {card.solution?.map((s, idx) => (
                  <li key={idx}>- {s}</li>
                ))}
              </ul>
            </div>

            
            <div className="mt-auto pt-5 flex flex-col gap-2">
              {card.price ? (
                <div className="py-2 bg-[#0A0A0A] rounded-lg text-center">
                  <span className="text-xl font-bold text-lime-400">{card.price}</span>
                  <span className="text-gray-400 text-sm">/mo</span>
                  <p className="text-xs text-gray-500 line-through">{card.originalPrice}</p>
                </div>
              ) : null}
              <button
                onClick={() => {
                  setSelectedPlan(card);
                  setIsModalOpen(true);
                }}
                className="w-full py-3 rounded-xl font-semibold transition text-sm bg-lime-500 text-black hover:bg-lime-600"
              >
                {card.button}
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1A1A] rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar"
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {selectedPlan?.button}
                  </h3>
                  <p className="text-gray-400">Selected Plan: <span className="text-lime-500 font-semibold">{selectedPlan?.title}</span></p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors text-2xl font-bold"
                >
                  x
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitStatus({ type: '', message: '' });

                  const templateParams = {
                    fullName: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company || 'Not provided',
                    message: formData.message || 'No additional message',
                    subject: selectedPlan?.button || 'N/A',
                  };

                  try {
                    await emailjs.send(
                      import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_1wzzo5z",
                      import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_pw54fxy",
                      templateParams
                    );

                    setSubmitStatus({ type: 'success', message: 'Thank you! We will contact you soon.' });

                    setTimeout(() => {
                      closeModal();
                      setSubmitStatus({ type: '', message: '' });
                    }, 2000);
                  } catch (err) {
                    if (import.meta.env.DEV) {
                      console.error('EmailJS Error:', err);
                    }

                    setSubmitStatus({ type: 'error', message: 'Failed to send request. Please try again.' });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-500"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-500"
                    placeholder="Enter your company name (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-500 resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>

                <div className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Selected Plan:</p>
                  <p className="text-white font-semibold">{selectedPlan?.title}</p>
                  <div className="mt-2">
                    {selectedPlan?.price ? (
                      <p className="text-lime-500 text-lg font-bold">{selectedPlan?.price}<span className="text-sm text-gray-400">/month</span></p>
                    ) : (
                      <p className="text-lime-500 font-semibold">Contact Us</p>
                    )}
                  </div>
                </div>

                {submitStatus.message && (
                  <div className={`p-3 rounded-lg ${submitStatus.type === 'success'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-red-500/20 text-red-400 border border-red-500/50'
                    }`}>
                    {submitStatus.message}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-3 rounded-xl font-semibold ${isSubmitting
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-lime-500 text-black hover:bg-lime-600'
                      }`}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 rounded-xl bg-transparent border-2 border-gray-600 text-gray-300 font-semibold hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
