import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { motion, useInView } from 'framer-motion';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
  { id: "01", title: "Neural Geometry", desc: "Adaptive spatial structures", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1000" },
  { id: "02", title: "Onyx Protocol", desc: "Automated interface logic", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000" },
  { id: "03", title: "Sylvan Core", desc: "Organic computing modules", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000" },
  { id: "04", title: "Ether Flow", desc: "Fluid dynamic systems", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000" }
];

const RevealText = ({ text, className, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div ref={ref} className={`${className} overflow-hidden flex flex-wrap justify-center`}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="mr-[0.25em] overflow-hidden py-1">
          <motion.span
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 0.8, delay: delay + (i * 0.05), ease: [0.215, 0.61, 0.355, 1] }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
};

const About = () => {
  const containerRef = useRef(null);
  const horizontalSectionRef = useRef(null);
  const horizontalContentRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const scrollWidth = horizontalContentRef.current.offsetWidth;
      const amountToScroll = scrollWidth - window.innerWidth;

      const horizontalTween = gsap.to(horizontalContentRef.current, {
        x: -amountToScroll,
        ease: "none",
        scrollTrigger: {
          trigger: horizontalSectionRef.current,
          start: "top top",
          end: () => `+=${amountToScroll}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

      const cards = gsap.utils.toArray(".project-card");
      cards.forEach((card) => {
        const img = card.querySelector("img");

        gsap.fromTo(card.querySelector(".img-mask"),
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontalTween,
              start: "left 95%",
              end: "left 70%",
              scrub: true,
            }
          }
        );

        gsap.fromTo(img,
          { x: -40, scale: 1.1 },
          {
            x: 40,
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontalTween,
              start: "left 100%",
              end: "right 0%",
              scrub: true,
            }
          }
        );
      });

      gsap.fromTo(".outro-fill",
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: ".outro-wrapper",
            containerAnimation: horizontalTween,
            start: "left 80%",
            end: "left 30%",
            scrub: true,
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#FDF3E4] text-[#A35100] font-sans selection:bg-[#A35100] selection:text-[#FDF3E4] antialiased">

    {/* HERO SECTION - UPDATED TO MATCH NEXUS CIRCLE STYLE */}
      <section className="h-[120vh] flex flex-col justify-center items-center relative px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1 }}
            className="text-[11px] uppercase tracking-[0.5em] mb-12 block font-bold"
          >
            Est. 2025 — Digital Architecture
          </motion.span>

          {/* Changed structure to H1 > motion.span and removed "rotate" */}
          <h1 className="text-[12vw] md:text-9xl font-serif italic tracking-tighter mb-8 leading-none overflow-hidden whitespace-nowrap">
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              About.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-8 text-sm max-w-xs mx-auto leading-relaxed font-medium"
          >
            A studio dedicated to the intersection of geometry and digital emotion.
          </motion.p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 text-[10px] tracking-widest uppercase"
        >
          Scroll to explore
        </motion.div>
      </section>

      {/* HORIZONTAL GALLERY */}
      <div ref={horizontalSectionRef} className="h-screen overflow-hidden bg-[#F9EFE0]/50">
        <div ref={horizontalContentRef} className="flex items-center h-full px-[15vw] gap-[10vw] w-max">

          <div className="w-[350px] flex-shrink-0">
            <span className="text-[10px] uppercase tracking-[0.3em] mb-4 block opacity-50 font-bold">Philosophy</span>
            <h2 className="text-6xl font-serif italic mb-8 leading-[1.1]">The art of <br />omission.</h2>
            <p className="text-sm opacity-70 leading-loose max-w-xs">We believe that what is left out is just as important as what is kept in.</p>
          </div>

          {PROJECTS.map((proj, i) => (
            <div key={i} className="project-card w-[350px] flex-shrink-0 group cursor-crosshair">
              {/* Changed aspect-square and simplified width */}
              <div className="img-mask relative aspect-square overflow-hidden bg-[#EBE0CF]">
                <img
                  src={proj.img}
                  alt={proj.title}
                  className="w-[140%] h-full max-w-none object-cover grayscale-[0.8] group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute top-6 left-6 text-white mix-blend-difference font-serif italic text-xl">
                  {proj.id}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-3xl font-serif italic tracking-tight">{proj.title}</h3>
                <div className="h-[1px] w-12 bg-[#A35100] my-4 opacity-30 group-hover:w-full transition-all duration-700" />
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-bold">{proj.desc}</p>
              </div>
            </div>
          ))}

          {/* COLOR FILL OUTRO - Fixed descender clipping */}
          <div className="outro-wrapper relative flex-shrink-0 pr-[20vw] flex items-center">
            {/* Background Text */}
            <h2 className="text-[12vw] font-serif italic opacity-5 leading-[1.2] py-10 select-none whitespace-nowrap tracking-tighter">
              NexAgent
            </h2>

            {/* Foreground (Filled) Text */}
            <h2 className="outro-fill absolute left-0 top-1/2 -translate-y-1/2 text-[12vw] font-serif italic text-[#A35100] leading-[1.2] py-10 select-none whitespace-nowrap tracking-tighter">
              NexAgent
            </h2>
          </div>
        </div>
      </div>

      {/* CONCLUSION SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div className="max-w-5xl z-10">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            className="text-[10px] uppercase tracking-[1em] mb-20 block italic font-serif"
          >
            Conclusion
          </motion.span>

          <div className="space-y-4">
            <RevealText text="The future of design is" className="text-5xl md:text-8xl font-light tracking-tighter" />
            <RevealText text="not visible; it is felt." className="text-5xl md:text-8xl font-serif italic tracking-tighter" delay={0.4} />
          </div>

          <div className="mt-24">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative text-[11px] font-bold uppercase tracking-[0.5em] px-12 py-6 overflow-hidden transition-all border border-[#A35100]/20"
            >
              <span className="relative z-10 group-hover:text-[#FDF3E4] transition-colors duration-500">Contact Studio</span>
              <div className="absolute inset-0 bg-[#A35100] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </motion.button>
          </div>
        </div>

        <div className="absolute bottom-[-10%] right-[-5%] text-[40vw] font-serif italic opacity-[0.02] pointer-events-none select-none">
          &
        </div>
      </section>

      {/* Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[100] mix-blend-multiply"
        style={{ backgroundImage: `url('https://res.cloudinary.com/dvwthyt94/image/upload/v1672322316/noise_yvsk9m.png')` }}
      />

      <Footer />
    </div>
  );
};

export default About;