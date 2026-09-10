import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { motion, useInView, useAnimation } from 'framer-motion';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

// --- ANIMATION COMPONENT FOR PARAGRAPHS ---
const RevealText = ({ children, className }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  const words = children.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: 0.1 },
    },
  };

  const child = {
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
    },
    hidden: { y: 20, opacity: 0 },
  };

  return (
    <motion.p
      ref={ref}
      variants={container}
      initial="hidden"
      animate={controls}
      className={`flex flex-wrap gap-x-[0.3em] gap-y-0 ${className}`}
    >
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span variants={child} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </motion.p>
  );
};

const STATS = [
  { label: "Active Members", value: "12k+" },
  { label: "Global Events", value: "140" },
  { label: "Shared Resources", value: "2.4TB" }
];

const MEMBERS = [
  { id: 1, role: "Creative Strategy", tag: "Node 01", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" },
  { id: 2, role: "Spatial & Experience", tag: "Node 02", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800" },
  { id: 3, role: "Digital Architecture", tag: "Node 03", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800" },
  { id: 4, role: "Interactive Design", tag: "Node 04", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800" },
  { id: 5, role: "Collective Mentorship", tag: "Node 05", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800" },
  { id: 6, role: "Research & Development", tag: "Node 06", image: "https://plus.unsplash.com/premium_photo-1681966466665-f36d765db213?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d29ya2luJTIwcGVvcGxlc3xlbnwwfHwwfHx8MA%3D%3D?auto=format&fit=crop&q=80&w=800" }
];

const Community = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const items = gsap.utils.toArray(".grid-item");
    items.forEach((item) => {
      gsap.fromTo(item,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: item,
            start: "top bottom-=50",
            end: "top center",
            scrub: 1
          }
        }
      );
    });

    return () => lenis.destroy();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#FDF3E4] text-[#A35100] font-sans selection:bg-[#A35100] selection:text-[#FDF3E4] antialiased">

      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 md:px-20 pt-40 text-center">
        <div className="max-w-7xl mx-auto w-full">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1 }}
            className="text-[11px] uppercase tracking-[0.5em] mb-12 block font-bold"
          >
            The Collective Consciousness
          </motion.span>

          {/* Heading on one line */}
          <h1 className="text-[12vw] md:text-9xl font-serif italic tracking-tighter mb-8 leading-none overflow-hidden whitespace-nowrap">
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              Nexus Circle.
            </motion.span>
          </h1>

          <div className="flex flex-col items-center gap-12 border-t border-[#A35100]/10 pt-12 mt-12">
            <div className="max-w-xl">
              <RevealText className="text-2xl font-light leading-snug justify-center">
                A curated ecosystem of thinkers, builders, and digital architects shaping the next epoch of interaction.
              </RevealText>
            </div>
            <div className="flex gap-8 md:gap-16">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-serif italic">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING GRID */}
      <section className="py-40 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {MEMBERS.map((member, index) => (
            <div
              key={member.id}
              className={`grid-item bg-[#EBE0CF] aspect-[3/4] relative overflow-hidden group cursor-pointer ${index % 2 === 1 ? 'md:mt-24' : ''}`}
            >
              <img
                src={member.image}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                alt={member.role}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#A35100]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-8 left-8 text-[#FDF3E4] translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-70 mb-2">{member.tag}</p>
                <p className="font-serif italic text-3xl leading-none">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="py-60 bg-[#A35100] text-[#FDF3E4] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <span className="text-[23vw] font-serif italic whitespace-nowrap">Collective</span>
        </div>

        <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
          <RevealText className="text-5xl md:text-7xl font-serif italic mb-16 justify-center text-center leading-[1.1]">
            "Individual intelligence is a spark; collective intelligence is the sun."
          </RevealText>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#FDF3E4", color: "#A35100" }}
              whileTap={{ scale: 0.98 }}
              className="px-16 py-6 border border-[#FDF3E4]/40 text-[11px] tracking-[0.5em] uppercase transition-colors duration-500 font-bold"
            >
              Apply for Membership
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Community;