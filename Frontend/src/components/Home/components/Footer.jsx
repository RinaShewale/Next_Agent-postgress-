import React, { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);
  const bigTextRef = useRef(null);
  const infoSectionRef = useRef(null);
  const phrase = "let's work together";

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Scroll-based animation for the Big Heading (Parallax + Scale)
      gsap.fromTo(bigTextRef.current, 
        { 
          y: 100, 
          scale: 0.9, 
          opacity: 0 
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom", // Starts when footer enters bottom of screen
            end: "center center", // Ends when footer is centered
            scrub: 1, // Smoothly ties animation to scroll
          }
        }
      );

      // 2. Scroll-based reveal for the bottom info grid
      gsap.from(".reveal-scroll", {
        y: 150,
        opacity: 0,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 20%", 
          end: "bottom bottom",
          scrub: 1,
        }
      });

      // 3. Horizontal slide for the line decoration on scroll
      gsap.fromTo(".footer-line", 
        { scaleX: 0 },
        { 
          scaleX: 1,
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 50%",
            end: "bottom bottom",
            scrub: 2,
          }
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  // Framer Motion Hover Variants (kept as requested)
  const containerVariants = {
    initial: {},
    hover: {
      transition: {
        staggerChildren: 0.03,
      }
    }
  };

  const letterVariants = {
    initial: { y: 0 },
    hover: { 
      y: -15,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror"
      }
    }
  };

  return (
    <footer 
      ref={footerRef} 
      className="w-full min-h-screen bg-[#FDF2E3] text-[#964B00] px-10 pb-12 pt-32 flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* Main CTA Section */}
      <div className="flex-grow flex items-center justify-center">
        <motion.a 
          ref={bigTextRef}
          href="mailto:lorenzo@lannino.com" 
          variants={containerVariants}
          initial="initial"
          whileHover="hover"
          className="group relative flex items-center gap-4 md:gap-10 cursor-pointer p-10"
        >
          <div className="flex overflow-hidden pb-[4em]">
            <h2 className="text-[10vw] font-light tracking-tighter leading-none flex lowercase">
              {phrase.split("").map((char, index) => (
                <motion.span 
                  key={index} 
                  variants={letterVariants}
                  className="inline-block whitespace-pre will-change-transform"
                >
                  {char}
                </motion.span>
              ))}
            </h2>
          </div>
          
          <div className="relative overflow-hidden pb-[1em]">
            <motion.div
              className="relative"
              whileHover={{ x: 5, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowUpRight 
                strokeWidth={0.5} 
                className="w-16 h-16 md:w-28 md:h-28" 
              />
            </motion.div>
          </div>

          {/* Underline Decoration - Now responds to Scroll via GSAP */}
          <div className="footer-line absolute bottom-6 left-12 right-12 h-[1px] bg-[#964B00] origin-left opacity-20" />
        </motion.a>
      </div>

      {/* Footer Info Section - All have .reveal-scroll class for GSAP scrub */}
      <div ref={infoSectionRef} className="grid grid-cols-1 md:grid-cols-3 w-full mt-24 items-end text-[10px] uppercase tracking-[0.3em] font-medium">
        
        {/* Left: Socials */}
        <div className="flex flex-col gap-4 reveal-scroll">
          <p className="opacity-40">Connect</p>
          <div className="flex gap-6 normal-case tracking-tight font-light text-base">
            {['LinkedIn', 'GitHub', 'Behance'].map((link) => (
              <a key={link} href="#" className="relative group overflow-hidden">
                <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">{link}</span>
                <span className="absolute top-0 left-0 inline-block translate-y-full transition-transform duration-300 group-hover:translate-y-0 text-[#964B00] italic">
                  {link}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Center: Branding */}
        <div className="flex flex-col items-center text-center gap-2 reveal-scroll py-16 md:py-0">
          <div className="h-[1px] w-12 bg-[#964B00] opacity-20 mb-4" />
          <p className="text-4xl font-light tracking-tighter normal-case">
            Lorenzo Lannino
          </p>
          <p className="opacity-30 tracking-[0.5em] text-[8px]">Curated Portfolio © 2026</p>
        </div>

        {/* Right: Contact */}
        <div className="flex flex-col items-end gap-4 reveal-scroll text-right">
          <p className="opacity-40">Inquiries</p>
          <a href="mailto:lorenzo@lannino.com" className="normal-case tracking-tight font-light text-base group">
            lorenzo@lannino.com
            <div className="h-[1px] w-0 group-hover:w-full bg-[#964B00] transition-all duration-500 ease-out opacity-50" />
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;