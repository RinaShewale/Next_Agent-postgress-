import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import Footer from '../components/Footer';

const PLANS = [
  {
    tier: "Foundation",
    monthly: 0,
    annual: 0,
    features: ["Access to Public Nodes", "Standard Geometry Library", "Community Discord", "Weekly Briefing"],
    cta: "Start Building"
  },
  {
    tier: "Architect",
    monthly: 49,
    annual: 39,
    features: ["Private Neural Channels", "Advanced Logic Modules", "Commercial Licensing", "24/7 Priority Sync"],
    cta: "Upgrade Protocol",
    popular: true
  },
  {
    tier: "Epoch",
    monthly: 199,
    annual: 159,
    features: ["Custom UI Architecture", "Dedicated Support Node", "White-label Systems", "Beta Protocol Access"],
    cta: "Contact Sales"
  }
];

const Pricing = () => {
  const containerRef = useRef(null);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lenis;
    if (!prefersReducedMotion) {
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    gsap.from(".pricing-card", {
      y: prefersReducedMotion ? 0 : 60,
      opacity: 0,
      duration: prefersReducedMotion ? 0.4 : 1,
      stagger: prefersReducedMotion ? 0.05 : 0.15,
      ease: "power3.out",
      delay: 0.3
    });

    return () => lenis && lenis.destroy();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#FDF3E4] text-[#A35100] font-sans antialiased min-h-screen">

      {/* HEADER */}
      <section className="pt-40 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[11px] uppercase tracking-[0.5em] mb-6 block font-bold opacity-60">
            Investment Structure
          </span>
          <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter mb-8">Value Logic.</h1>
          <p className="text-sm max-w-sm mx-auto opacity-70 leading-loose">
            Transparent scaling for individuals and organizations. No hidden layers, just pure architecture.
          </p>
        </motion.div>

        {/* BILLING TOGGLE */}
        <div className="mt-12 inline-flex items-center gap-4 border border-[#A35100]/20 rounded-full px-2 py-2">
          <button
            onClick={() => setAnnual(false)}
            aria-pressed={!annual}
            className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A35100] ${
              !annual ? 'bg-[#A35100] text-[#FDF3E4]' : 'opacity-60 hover:opacity-100'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            aria-pressed={annual}
            className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A35100] ${
              annual ? 'bg-[#A35100] text-[#FDF3E4]' : 'opacity-60 hover:opacity-100'
            }`}
          >
            Annual
            <span className="ml-2 opacity-70">−20%</span>
          </button>
        </div>
      </section>

      {/* PRICING GRID */}
      <section className="px-6 pb-40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-[#A35100]/10 border border-[#A35100]/10">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <div
                key={i}
                className={`pricing-card relative bg-[#FDF3E4] p-12 flex flex-col group transition-colors duration-500 hover:bg-[#A35100] hover:text-[#FDF3E4] ${
                  plan.popular ? 'md:-my-6 md:py-[4.5rem] z-10 shadow-[0_30px_60px_-15px_rgba(163,81,0,0.25)]' : ''
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-6 right-6 text-[9px] uppercase tracking-[0.3em] font-bold bg-[#A35100] text-[#FDF3E4] px-3 py-1.5 rounded-full group-hover:bg-[#FDF3E4] group-hover:text-[#A35100] transition-colors duration-500">
                    Most Chosen
                  </span>
                )}

                <div className="mb-12">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4 opacity-60">{plan.tier}</p>
                  <div className="flex items-baseline">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${plan.tier}-${annual}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="text-5xl font-serif italic"
                      >
                        ${price}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-[10px] uppercase tracking-widest ml-2 opacity-50">/ month</span>
                  </div>
                  {annual && plan.monthly > 0 && (
                    <p className="text-[10px] uppercase tracking-widest mt-2 opacity-50">
                      Billed annually
                    </p>
                  )}
                </div>

                <div className="flex-grow space-y-6 mb-12">
                  {plan.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 border-b border-[#A35100]/10 group-hover:border-[#FDF3E4]/20 pb-4 transition-colors duration-500"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A35100] group-hover:bg-[#FDF3E4] transition-colors duration-500 flex-shrink-0" />
                      <span className="text-xs uppercase tracking-wider">{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full py-6 border border-current text-[10px] uppercase tracking-[0.4em] font-bold
                             transition-all duration-300 hover:bg-[#FDF3E4] hover:text-[#A35100]
                             group-hover:hover:bg-[#FDF3E4] group-hover:hover:text-[#A35100]
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current
                             active:scale-[0.98]"
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* ENTERPRISE FOOTNOTE */}
        <div className="mt-20 text-center">
          <p className="text-xs opacity-50 uppercase tracking-widest mb-4">Need a custom deployment?</p>
          <button className="text-xs uppercase tracking-widest border-b border-[#A35100] pb-1 opacity-80 hover:opacity-100 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A35100]">
            Request Nexus Enterprise
          </button>
        </div>
      </section>

      {/* GRAIN OVERLAY */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.05] z-[100] mix-blend-multiply"
        style={{ backgroundImage: `url('https://res.cloudinary.com/dvwthyt94/image/upload/v1672322316/noise_yvsk9m.png')` }}
      />

      <Footer />
    </div>
  );
};

export default Pricing;