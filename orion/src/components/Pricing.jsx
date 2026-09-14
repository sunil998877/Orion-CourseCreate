import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';

/**
 * Pricing Component
 * Pricing plans section with highlighted popular plan
 */
const Pricing = () => {
  const titleRef = useScrollAnimation();
  const card1Ref = useScrollAnimation();
  const card2Ref = useScrollAnimation();
  const card3Ref = useScrollAnimation();
  const card4Ref = useScrollAnimation();
  const enterpriseRef = useScrollAnimation();

  const plans = [
    {
      name: 'Starter',
      description: 'For individuals & small projects.',
      price: '$49',
      period: '/mo',
      features: ['1 Agent', '1,000 Interactions/mo', 'Basic Knowledge Base', 'Standard Support'],
      highlighted: false,
      delay: '0ms',
    },
    {
      name: 'Pro',
      description: 'For growing businesses & startups.',
      price: '$199',
      period: '/mo',
      features: [
        '5 Agents',
        '10,000 Interactions/mo',
        'Advanced Knowledge Base',
        'API Access',
        'Priority Support',
      ],
      highlighted: true,
      badge: 'Most Popular',
      delay: '100ms',
    },
    {
      name: 'Business',
      description: 'For established teams & companies.',
      price: '$499',
      period: '/mo',
      features: [
        '20 Agents',
        '50,000 Interactions/mo',
        'CRM & Zapier Integrations',
        'Seamless Human Handoff',
        'Dedicated Support',
      ],
      highlighted: false,
      delay: '200ms',
    },
    {
      name: 'Premium',
      description: 'For scaling & large operations.',
      price: '$999',
      period: '/mo',
      features: [
        'Unlimited Agents',
        '250,000 Interactions/mo',
        'Custom Integrations',
        'Advanced Analytics',
        '24/7 Premium Support',
      ],
      highlighted: false,
      delay: '300ms',
    },
  ];

  const cardRefs = [card1Ref, card2Ref, card3Ref, card4Ref];

  return (
    <section id="pricing" className="py-20 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto animate-on-scroll fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Find the <span className="bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">Perfect Plan</span>
          </h2>
          <p className="mt-4 text-gray-400">
            Start for free and scale as you grow. No hidden fees. No long-term contracts.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              ref={cardRefs[index]}
              className={`pricing-card animate-on-scroll fade-in-up ${plan.highlighted ? 'pricing-card-highlighted relative' : ''}`}
              style={{ transitionDelay: plan.delay }}
            >
              {plan.highlighted && plan.badge && (
                <span className="absolute top-0 -translate-y-1/2 bg-lime-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2 text-gray-400">{plan.description}</p>
              <div className="my-6">
                <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <ul className="text-gray-300 space-y-3 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>{feature}</li>
                ))}
              </ul>
              <a
                href="#start"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector('#start');
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
                className={`mt-8 cta-button w-full text-center font-bold py-3 px-6 rounded-lg ${plan.highlighted
                  ? 'bg-lime-500 text-black hover:bg-lime-600 glow-effect'
                  : 'bg-transparent border-2 border-gray-600 text-gray-200 hover:bg-gray-800 hover:border-gray-700'
                  }`}
              >
                Start Free Trial
              </a>
            </div>
          ))}
        </div>

        {/* Enterprise Plan */}
        <div
          ref={enterpriseRef}
          className="mt-16 bg-gradient-to-br from-[#1A1A1A] to-[#101010] border border-[#2A2A2A] hover:border-[#4AF2A1] p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center animate-on-scroll fade-in-up transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,242,161,0.4),0_0_40px_rgba(74,242,161,0.2)] hover:-translate-y-1"
        >
          <div>
            <h3 className="text-3xl font-bold text-white">Enterprise Plan</h3>
            <p className="mt-2 text-gray-300 text-lg">
              Need custom limits, SOC 2, or bespoke AI models? Let's talk.
            </p>
          </div>
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
            className="mt-6 md:mt-0 cta-button bg-transparent border-2 border-gray-600 text-gray-200 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-800 hover:border-gray-700 flex-shrink-0"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

