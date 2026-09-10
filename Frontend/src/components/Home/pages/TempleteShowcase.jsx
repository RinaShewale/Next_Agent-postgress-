import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import Lenis from '@studio-freight/lenis';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const templates = [
  { id: "01", title: "RESEDA", tag: "Architecture", image: "/images/ai_1.webp", video: "https://v.ftcdn.net/05/18/83/43/700_F_518834311_S6T9E4X7uV5vWzW9k6jE6o9fGj1q1n2d_ST.mp4" },
  { id: "02", title: "WELLNESS", tag: "Lifestyle", image: "/images/ai_2.webp", video: "https://v.ftcdn.net/04/77/53/34/700_F_477533481_9U4rWkZkU7pYkZ7kR9mGzQ2vR6kS8o3f_ST.mp4" },
  { id: "03", title: "KLIPSAN", tag: "Editorial", image: "/images/ai_3.webp", video: "https://v.ftcdn.net/02/10/51/33/700_F_210513364_mX2rUfB6H7p3KjR6X6zO2v9S8yL3lWv7_ST.mp4" },
  { id: "04", title: "RANDI ELISE", tag: "Fashion", image: "/images/ai_4.webp", video: "https://v.ftcdn.net/02/59/82/53/700_F_259825318_KqGZ2vY5k8R9mN6L3J1zO2v9S8yL3lWv7_ST.mp4" },
];

const TemplateShowcase = () => {
  const containerRef = useRef(null);
  const revealRef = useRef(null);
  const heroContentRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const ctx = gsap.context(() => {
      // 1. Sticky Hero Zoom Reveal (Responsive Border Radius)
      const isMobile = window.innerWidth < 768;
      
      gsap.to(revealRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=100%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
        scale: isMobile ? 0.95 : 0.92,
        borderRadius: isMobile ? "30px" : "60px",
        ease: "power2.inOut",
      });

      gsap.to(imageRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: isMobile ? 50 : 100,
        scale: 1.1,
      });

      gsap.to(heroContentRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "40% top",
          scrub: true,
        },
        opacity: 0,
        y: -50,
        filter: "blur(10px)",
      });
    });

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-[var(--nexus-bg)] text-[var(--nexus-text)] overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section ref={containerRef} className="relative h-screen md:h-[120vh] w-full flex items-center justify-center">
        <div ref={revealRef} className="absolute inset-0 w-full h-full overflow-hidden bg-[#0a0a0a] z-10 origin-center shadow-2xl">
          <img 
            ref={imageRef}
            src="/images/background-desktop.webp" 
            className="w-full h-full object-cover opacity-50"
            alt="Hero"
          />
          
          <div ref={heroContentRef} className="absolute inset-0 flex flex-col items-center justify-center text-[#FDF3E4] px-6 z-20 text-center">
             <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }} 
             >
                <span className="text-[8px] md:text-xs tracking-[0.6em] md:tracking-[0.8em] uppercase mb-6 md:mb-10 block font-bold opacity-60">
                  Nexus Intelligence &copy; 2025
                </span>
                <h1 className="text-4xl sm:text-6xl md:text-[120px] font-['Playfair_Display'] italic tracking-tighter leading-[1] md:leading-[0.8] mb-10 md:mb-16">
                  Elevating <br className="hidden sm:block"/> <span className="not-italic font-medium">digital craft</span>
                </h1>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-5 md:px-14 md:py-7 bg-white text-black rounded-full font-bold text-[9px] md:text-[10px] tracking-[0.3em] overflow-hidden transition-all shadow-2xl"
                >
                  <span className="relative z-10 group-hover:text-white transition-colors duration-500 uppercase">Explore Studio</span>
                  <div className="absolute inset-0 bg-[var(--nexus-accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
                </motion.button>
             </motion.div>
          </div>
          
          <div className="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 opacity-50">
            <span className="text-[7px] md:text-[8px] tracking-[0.5em] uppercase font-bold">Scroll</span>
            <div className="w-[1px] h-8 md:h-12 bg-gradient-to-b from-[var(--nexus-accent)] to-transparent"></div>
          </div>
        </div>
      </section>

      {/* --- TEMPLATE GALLERY --- */}
      <section className="relative z-20 py-24 md:py-60 px-6 md:px-16 max-w-[1700px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 md:mb-40 gap-8 md:gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-4xl"
          >
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-['Playfair_Display'] font-medium tracking-tight leading-[1.1] md:leading-[0.95]">
              The blueprint of <br className="hidden md:block"/> <span className="italic text-[var(--nexus-accent)]">modern aesthetic.</span>
            </h2>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 md:gap-6 px-6 py-5 md:px-10 md:py-8 border border-[var(--nexus-border)] rounded-full bg-transparent hover:bg-[var(--nexus-surface)] transition-all duration-700 group"
          >
            <Sparkles size={18} className="text-[var(--nexus-accent)] group-hover:rotate-180 transition-transform duration-700" />
            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase">Start a Project</span>
          </motion.button>
        </div>

        {/* Grid: 1 col on mobile, 2 cols on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24 md:gap-y-40">
          {templates.map((item, index) => (
            <TemplateItem key={item.id} template={item} index={index} />
          ))}
        </div>
      </section>

    <Footer />
    </div>
  );
};

const TemplateItem = ({ template, index }) => {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start bottom", "end top"]
  });

  // Only apply alternating Y parallax on desktop
  const yRange = isMobile ? [0, 0] : [0, index % 2 === 0 ? -50 : -100];
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  const handleMouseEnter = () => {
    if (!isMobile) {
      setHovered(true);
      if (videoRef.current) videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHovered(false);
      if (videoRef.current) videoRef.current.pause();
    }
  };

  return (
    <motion.div 
      ref={cardRef}
      style={{ y: springY }}
      className="group cursor-pointer relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-2xl md:rounded-3xl bg-[var(--nexus-surface)] shadow-2xl">
        
        {/* Image */}
        <motion.img 
          src={template.image} 
          animate={{ 
            opacity: hovered ? 0 : 1,
            scale: hovered ? 1.05 : 1 
          }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="absolute inset-0 w-full h-full object-cover z-10"
          alt={template.title}
        />
        
        {/* Video */}
        {!isMobile && (
          <video
            ref={videoRef}
            src={template.video}
            muted loop playsInline preload="auto"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out z-0
              ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
          />
        )}

        {/* Hover Overlay Button (Desktop Only) */}
        {!isMobile && (
          <div className={`absolute inset-0 flex items-center justify-center z-20 transition-all duration-500
            ${hovered ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full shadow-2xl">
              <Play size={12} fill="black" />
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Live Preview</span>
            </div>
          </div>
        )}

        {/* Top-Right Tag */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
          <span className="px-3 py-1.5 md:px-4 md:py-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-[7px] md:text-[8px] font-bold tracking-[0.2em] text-white uppercase">
            Edition {template.id}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 md:mt-12 flex items-start justify-between px-1 md:px-2">
        <div className="space-y-2 md:space-y-3">
          <motion.p 
            animate={{ x: hovered ? 10 : 0 }}
            className="text-[8px] md:text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[var(--nexus-accent)] opacity-60"
          >
            Design / Motion
          </motion.p>
          <h3 className="text-2xl md:text-4xl font-['Playfair_Display'] tracking-tight font-medium uppercase italic">
            {template.title}
          </h3>
        </div>
        
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-[var(--nexus-border)] flex items-center justify-center group-hover:bg-[var(--nexus-accent)] group-hover:border-[var(--nexus-accent)] transition-all duration-500 overflow-hidden relative">
          <ArrowRight 
            size={18} 
            className="relative z-10 group-hover:text-white transition-transform duration-500 group-hover:translate-x-1" 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateShowcase;