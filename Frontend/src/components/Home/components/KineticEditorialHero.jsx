import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const KineticEditorialHero = () => {
  const containerRef = useRef(null);
  const card1 = useRef(null);
  const card2 = useRef(null);
  const card3 = useRef(null);

  const neverRef = useRef(null);
  const thingRef = useRef(null);
  const neverInterval = useRef(null);
  const thingInterval = useRef(null);

  // Optimized font list (Removed some problematic ones that cause extreme width jumps)
  const fonts = [
    'serif', 'monospace', 'sans-serif', 'Impact', 'Georgia', 
    'Courier New', 'Verdana', 'Times New Roman', 'Arial Black',
    'Arial', 'Tahoma', 'Palatino', 'Garamond', 'Bookman', 
    'Helvetica', 'Futura', 'Baskerville', 'Rockwell'
  ];

  const startCycling = (ref, intervalRef) => {
    let i = 0;
    // Clear existing to prevent "double speed" glitch
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (ref.current) {
        ref.current.style.fontFamily = fonts[i % fonts.length];
        i++;
      }
    }, 70); 
  };

  const stopCycling = (intervalRef) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating Animation
      [card1.current, card2.current, card3.current].forEach((card, i) => {
        gsap.to(card, {
          y: "+=15",
          rotation: i % 2 === 0 ? 1 : -1,
          duration: 3 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });

      // Scroll Animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        }
      });

      tl.to(card1.current, { y: -150, x: -20, rotation: -5 }, 0);
      tl.to(card2.current, { y: -200, x: 40, rotation: 8 }, 0);
      tl.to(card3.current, { y: -100, x: -30, rotation: -4 }, 0);
      
    }, containerRef);

    return () => {
      ctx.revert();
      if (neverInterval.current) clearInterval(neverInterval.current);
      if (thingInterval.current) clearInterval(thingInterval.current);
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-screen min-h-[700px] bg-[#FDF3E4] text-[#934B1C] overflow-hidden select-none flex flex-col justify-between p-10 md:p-20 antialiased"
    >
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-multiply" 
           style={{ backgroundImage: `url('https://res.cloudinary.com/dvwthyt94/image/upload/v1672322316/noise_yvsk9m.png')` }} />

      {/* --- TYPOGRAPHY --- */}
      {/* Added flex-col and fixed widths to prevent the "jump" */}
      <div className="w-full flex justify-start z-10">
        <h1 
          ref={neverRef}
          onMouseEnter={() => startCycling(neverRef, neverInterval)}
          onMouseLeave={() => stopCycling(neverInterval)}
          className="inline-block text-[22vw] md:text-[130px] font-serif font-medium leading-[0.8] uppercase tracking-tighter mix-blend-multiply cursor-pointer transition-none text-left"
          style={{ 
            willChange: 'font-family',
            minWidth: '1.2em' // Prevents container collapse
          }}
        >
          Never
        </h1>
      </div>

      <div className="w-full flex justify-center z-10 translate-y-[-10%]">
        <h1 className="text-[5vw] md:text-[32px] font-sans font-[200] leading-none uppercase tracking-[0.4em] md:tracking-[1.2em] opacity-40 italic mix-blend-multiply whitespace-nowrap">
          The Same
        </h1>
      </div>

      <div className="w-full flex justify-end z-10">
        <h1 
          ref={thingRef}
          onMouseEnter={() => startCycling(thingRef, thingInterval)}
          onMouseLeave={() => stopCycling(thingInterval)}
          className="inline-block text-[26vw] md:text-[130px] font-serif font-medium leading-[0.8] uppercase tracking-tighter mix-blend-multiply cursor-pointer transition-none text-right"
          style={{ 
            willChange: 'font-family',
            minWidth: '1.2em'
          }}
        >
          Thing
        </h1>
      </div>

      {/* --- CARDS --- */}
      <div 
        ref={card1}
        className="absolute top-[20%] left-[6%] md:top-[3%] md:left-[48%] w-[150px] md:w-[220px] rounded-2xl border border-white/10 bg-[#42210B] shadow-[0_30px_60px_rgba(66,33,11,0.4)] z-20 overflow-hidden"
      >
        <WindowHeader title="SYSTEM" dark />
        <div className="py-6 md:py-10 px-4 md:px-8 flex flex-col items-center text-center text-[#F8EDDB]">
          <div className="text-[14px] md:text-[16px] mb-2 font-serif italic">Performance</div>
          <p className="text-[7px] md:text-[8px] leading-relaxed opacity-50 font-sans uppercase tracking-[0.2em]">Optimized React Engines.</p>
        </div>
      </div>

      <div 
        ref={card2}
        className="absolute top-[52%] right-[5%] md:top-[36%] md:right-[10.3%] w-[190px] md:w-[280px] rounded-2xl border border-[#934B1C]/10 bg-[#fdf8f0]/90 backdrop-blur-md shadow-[0_25px_50px_rgba(147,75,28,0.15)] z-30 overflow-hidden"
      >
        <WindowHeader title="CAPABILITIES" />
        <div className="p-4 md:p-8 flex items-center relative h-24 md:h-32">
          <div className="absolute -left-10 md:-left-12 w-20 md:w-24 h-20 md:h-24 bg-[#42210B] rounded-full" />
          <div className="ml-12 md:ml-16 flex flex-col">
            <div className="text-[10px] md:text-[11px] font-sans font-black uppercase tracking-tight">Modern Web</div>
            <div className="text-[7px] md:text-[8px] opacity-60 mt-1 line-clamp-2 md:line-clamp-none">Scalable interfaces built with precision and speed.</div>
          </div>
        </div>
      </div>

      <div 
        ref={card3}
        className="absolute bottom-[16%] left-[8%] md:bottom-[12%] md:left-[30%] w-[170px] md:w-[240px] rounded-2xl border border-[#934B1C]/10 bg-[#fdf8f0] shadow-[0_20px_50px_rgba(147,75,28,0.1)] z-20 overflow-hidden"
      >
        <WindowHeader title="IDENTITY" />
        <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4 md:px-6">
          <p className="text-[9px] md:text-[10px] font-sans uppercase tracking-[0.2em]">
            We are <span className="font-bold border-b-2 border-[#934B1C]/20 pb-0.5">NexAgent</span>
          </p>
          <p className="text-[7px] opacity-50 mt-2 font-medium tracking-tighter">Engineering the future of web</p>
        </div>
      </div>
    </section>
  );
};

const WindowHeader = ({ title, dark }) => (
  <div className={`flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b ${dark ? 'border-white/5 bg-white/5' : 'border-[#934B1C]/5 bg-[#934B1C]/5'}`}>
    <div className="flex gap-1">
      <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${dark ? 'bg-white/20' : 'bg-[#934B1C]/20'}`} />
      <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${dark ? 'bg-white/10' : 'bg-[#934B1C]/10'}`} />
    </div>
    <span className={`text-[6px] md:text-[7px] font-sans font-bold tracking-[0.4em] uppercase ${dark ? 'text-white/40' : 'text-[#934B1C]/40'}`}>
      {title}
    </span>
    <div className="w-4 md:w-8" />
  </div>
);

export default KineticEditorialHero;