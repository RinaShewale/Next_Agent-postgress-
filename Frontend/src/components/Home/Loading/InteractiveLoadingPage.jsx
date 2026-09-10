import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const greetings = [
  "Hello", "नमस्ते", "Hola", "Bonjour", "你好", 
  "こんにちは", "안녕하세요", "Guten Tag", "Ciao", 
  "Olá", "Привет", "నమస్కారం", "வணக்கம்", "السلام عليكم", 
  "Merhaba", "Szia", "Hej", "Chào bạn", "नमस्कार", "Habari",
  "Shalom", "Sawubona", "Ahoj", "Dia dhuit", "Halo", "Sveiki",
  "Cześć", "Kamusta", "Aloha", "Hei", "Terve", "Moikka"
];

const InteractiveLoadingPage = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const topLayerRef = useRef(null);
  const midLayerRef = useRef(null);
  const contentRef = useRef(null);

  // 1. Language Cycling
  useEffect(() => {
    const languageInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % greetings.length);
    }, 110);
    return () => clearInterval(languageInterval);
  }, []);

  // 2. Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20); 
    return () => clearInterval(interval);
  }, []);

  // 3. Trigger Exit Animation
  useEffect(() => {
    if (progress === 100) {
      triggerLayeredExit();
    }
  }, [progress]);

  const triggerLayeredExit = () => {
    const tl = gsap.timeline({
      onComplete: () => onComplete && onComplete(),
    });

    // Fade out text slightly before layers move
    tl.to(contentRef.current, {
      y: -40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.inOut"
    });

    /**
     * PATH EXPLANATION:
     * Start: M 0 0 (Top L) -> L 100 0 (Top R) -> L 100 100 (Bottom R) -> Q 50 100 0 100 (Flat Bottom)
     * End:   M 0 0 (Top L) -> L 100 0 (Top R) -> L 100 0 (Collapsed R) -> Q 50 -40 0 0 (High Arch)
     * The "Q 50 -40" creates the deep concave curve upward.
     */
    tl.to(topLayerRef.current, {
      attr: { d: 'M 0 0 L 100 0 L 100 0 Q 50 -40 0 0 Z' },
      duration: 1.5,
      ease: 'power4.inOut',
    }, "-=0.6"); 

    tl.to(midLayerRef.current, {
      attr: { d: 'M 0 0 L 100 0 L 100 0 Q 50 -40 0 0 Z' },
      duration: 1.5,
      ease: 'power4.inOut',
    }, "-=1.3");
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#FFF2E0] overflow-hidden">
      {/* 
          SVG layers set to 120vh to ensure the curve clears the bottom 
          completely when the animation starts.
      */}
      <svg 
        className="absolute top-0 left-0 w-full h-[120vh] z-10 pointer-events-none" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <path 
          ref={midLayerRef} 
          fill="#B55500" 
          d="M 0 0 L 100 0 L 100 100 Q 50 100 0 100 Z" 
        />
      </svg>
      
      <svg 
        className="absolute top-0 left-0 w-full h-[120vh] z-20 pointer-events-none" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <path 
          ref={topLayerRef} 
          fill="#34170A" 
          d="M 0 0 L 100 0 L 100 100 Q 50 100 0 100 Z" 
        />
      </svg>

      {/* Main Content */}
      <div ref={contentRef} className="relative z-30 flex flex-col items-center justify-center h-full">
        <div className="h-20 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.h2
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="text-3xl md:text-5xl font-serif italic text-[#FFF2E0] tracking-wide select-none"
            >
              {greetings[index]}
            </motion.h2>
          </AnimatePresence>
        </div>
        
        {/* Optional: Visual Progress Indicator */}
        <div className="absolute bottom-12 w-32 h-[1px] bg-[#FFF2E0]/20">
          <motion.div 
            className="h-full bg-[#FFF2E0]" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default InteractiveLoadingPage;