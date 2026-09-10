import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const LearnByBuilding = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLaunchClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero Text Reveal
      gsap.from(".hero-title span", {
        y: 100,
        rotate: 2,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "expo.out",
      });

      // Reveal Sections on Scroll
      const revealElements = gsap.utils.toArray(".reveal-section");
      revealElements.forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#FDF3E4] text-[#34170A] selection:bg-[#A35100] selection:text-[#FDF3E4] overflow-x-hidden font-sans">
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[9999] bg-[url('https://res.cloudinary.com/dvwthyt94/image/upload/v1672322316/noise_yvsk9m.png')]" />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center py-20">
        <motion.span 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 0.6 }} 
          className="text-[10px] md:text-[12px] tracking-[0.6em] uppercase mb-8 block"
        >
          Methodology / 01
        </motion.span>
        <h1 className="hero-title text-[14vw] md:text-[8vw] font-serif leading-[0.85] tracking-tighter uppercase italic">
          <span className="inline-block">Learn</span> <br />
          <span className="inline-block text-[#A35100]">By Building</span>
        </h1>
        <div className="mt-12 overflow-hidden px-4">
          <p className="hero-subtext font-mono text-[10px] md:text-[12px] tracking-[0.3em] md:tracking-[0.5em] opacity-50 uppercase max-w-xl mx-auto leading-relaxed">
            Theoretical knowledge is static. <br className="hidden md:block" /> Experience is built through iteration.
          </p>
        </div>
      </section>

      {/* --- INTERACTIVE EXPERIMENTS --- */}
      <section className="py-20 md:py-32 bg-[#EBE0CF]/30 reveal-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 md:mb-20">
            <span className="text-[10px] tracking-widest uppercase opacity-60">Digital Playground</span>
            <h2 className="font-serif text-5xl md:text-7xl mt-2 tracking-tight">Try Something.</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <LayoutExperiment />
            <TypographyExperiment />
            <ColorExperiment />
            <MotionExperiment />
          </div>
        </div>
      </section>

      {/* --- REPLACED: DOCUMENTATION HUB (FIXED TO MATCH IMAGE) --- */}
      <section className="py-24 md:py-32 px-6 bg-[#26120A] text-[#FDF3E4] reveal-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
                <span className="text-[10px] tracking-[0.4em] uppercase opacity-40 font-bold">Resources & Standards</span>
                <h2 className="font-serif text-5xl md:text-7xl mt-4 italic leading-tight">Core Documentation</h2>
            </div>
            <p className="max-w-xs text-sm opacity-50 font-light leading-relaxed">
                Reference the building blocks of the modern web. Master the tools before you break the rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <DocCard 
                title="Tailwind CSS" 
                desc="Utility-first styling for rapid UI development without leaving your HTML."
                tags={['Framework', 'v3.4+']} 
                type="wind"
            />
            <DocCard 
                title="Motion Libs" 
                desc="Advanced GSAP and Framer Motion patterns for fluid, cinematic web experiences."
                tags={['Animation', 'GSAP']} 
                type="motion"
                isFeatured={true}
            />
            <DocCard 
                title="Color Palettes" 
                desc="Systematic color theory and accessibility-first palette documentation."
                tags={['Design', 'A11y']} 
                type="palette"
            />
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-32 md:py-48 px-6 text-center reveal-section">
        <h2 className="text-[10px] tracking-[0.5em] uppercase mb-8 opacity-60">Now make it yours</h2>
        <h3 className="font-serif text-5xl md:text-9xl tracking-tighter mb-12 leading-none">
          THE WEB IS BEST <br /> <span className="italic text-[#A35100]">WHEN YOU CHANGE IT.</span>
        </h3>
        <button 
          onClick={handleLaunchClick}
          className="group relative px-8 py-4 md:px-12 md:py-5 border border-[#34170A] overflow-hidden transition-colors duration-500"
        >
          <span className="relative z-10 uppercase tracking-widest text-[11px] font-bold group-hover:text-white transition-colors duration-500">Launch Your Project</span>
          <div className="absolute inset-0 bg-[#34170A] -z-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo" />
        </button>
      </section>

      <Footer />
    </div>
  );
};

/* --- FIXED DOC CARD COMPONENT --- */
const DocCard = ({ title, desc, tags, isFeatured = false, type }) => {

  return (
    <motion.div
      whileHover="hover"
      className={`group relative p-10 flex flex-col h-[480px] transition-all duration-700 border border-[#FDF3E4]/5 overflow-hidden
        ${isFeatured ? 'bg-[#FDF3E4] text-[#34170A]' : 'bg-[#26120A] text-[#FDF3E4]'}`}
    >
   

      <div className="flex gap-2 mb-10 relative z-10">
        {tags.map(t => (
          <span key={t} className={`text-[9px] border px-4 py-1.5 rounded-full uppercase font-bold tracking-widest
            ${isFeatured ? 'border-[#34170A]/20' : 'border-[#FDF3E4]/20'}`}>
            {t}
          </span>
        ))}
      </div>

      <div className="relative z-10">
        <motion.h4 
          variants={{ hover: { fontStyle: "italic", x: 5 } }}
          className="font-serif text-4xl md:text-5xl mb-6 transition-all duration-500 leading-none">
          {title}
        </motion.h4>
        <p className="text-sm opacity-60 leading-relaxed font-light max-w-[220px]">
          {desc}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-4 text-[11px] font-bold tracking-[0.2em] relative z-10 cursor-pointer group">
        <span className="border-b border-transparent group-hover:border-current transition-all">VIEW DOCUMENTATION</span>
        <motion.div variants={{ hover: { x: 10 } }}>
          <ArrowRight size={20} strokeWidth={1.5} />
        </motion.div>
      </div>
    </motion.div>
  );
};

/* --- EXPERIMENT COMPONENTS --- */
const LayoutExperiment = () => {
    const [layout, setLayout] = useState('grid');
    return (
      <div className="bg-white p-6 md:p-8 rounded-sm border border-[#A35100]/10 flex flex-col h-[450px] md:h-[500px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h4 className="font-bold text-[10px] tracking-[0.3em] uppercase">Layout Lab</h4>
          <div className="flex gap-2 bg-[#EBE0CF]/30 p-1 rounded-full">
            {['grid', 'stack', 'loose'].map(l => (
              <button key={l} onClick={() => setLayout(l)} className={`px-4 py-1.5 text-[9px] rounded-full transition-all font-bold ${layout === l ? 'bg-[#A35100] text-white shadow-lg' : 'text-[#34170A]/40 hover:text-[#34170A]'}`}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <motion.div layout className={`flex-1 grid gap-3 ${layout === 'grid' ? 'grid-cols-3' : layout === 'stack' ? 'grid-cols-1' : 'grid-cols-2 p-6 md:p-12'}`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <motion.div layout key={i} className="bg-[#34170A]/5 rounded-sm" style={{ height: layout === 'loose' && i % 2 === 0 ? '120%' : '100%' }} />
          ))}
        </motion.div>
      </div>
    );
};
  
const TypographyExperiment = () => {
const [font, setFont] = useState('serif');
const [weight, setWeight] = useState(400);
return (
    <div className="bg-white p-6 md:p-8 rounded-sm border border-[#A35100]/10 flex flex-col h-[450px] md:h-[500px]">
    <div className="flex justify-between items-center mb-8">
        <h4 className="font-bold text-[10px] tracking-[0.3em] uppercase">Type System</h4>
        <button onClick={() => setFont(font === 'serif' ? 'sans' : 'serif')} className="text-[10px] font-bold underline underline-offset-4 decoration-[#A35100]">SWITCH TO {font === 'serif' ? 'SANS' : 'SERIF'}</button>
    </div>
    <div className="flex-1 flex flex-col justify-center">
        <motion.p animate={{ fontWeight: weight }} className={`text-3xl md:text-5xl leading-tight transition-all duration-500 ${font === 'serif' ? 'font-serif italic' : 'font-sans'}`}>Character is not just what you say, but how it is presented.</motion.p>
    </div>
    <div className="mt-8 bg-[#EBE0CF]/20 p-4 rounded-lg">
        <input type="range" min="100" max="800" step="100" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} className="w-full accent-[#A35100] h-1" />
        <div className="flex justify-between text-[9px] mt-3 font-bold opacity-50 tracking-widest"><span>LIGHT</span><span>WT: {weight}</span><span>BOLD</span></div>
    </div>
    </div>
);
};

const ColorExperiment = () => {
    const [accent, setAccent] = useState('#A35100');
    const colors = ['#A35100', '#2D5A27', '#1E3A8A', '#7C3AED', '#BE123C'];
    return (
      <div className="bg-white p-6 md:p-8 rounded-sm border border-[#A35100]/10 flex flex-col h-[450px] md:h-[500px]">
        <h4 className="font-bold text-[10px] tracking-[0.3em] uppercase mb-8">Mood & Palette</h4>
        <div className="flex-1 rounded-sm flex flex-col p-6 transition-colors duration-700 relative overflow-hidden" style={{ backgroundColor: `${accent}08` }}>
          <div className="w-16 h-16 rounded-full mb-6 shadow-2xl" style={{ backgroundColor: accent }} />
          <div className="h-4 w-3/4 mb-3 rounded-full" style={{ backgroundColor: accent, opacity: 0.2 }} />
          <div className="h-4 w-1/2 mb-8 rounded-full" style={{ backgroundColor: accent, opacity: 0.1 }} />
          <div className="mt-auto h-14 w-full rounded-sm flex items-center justify-center text-white text-[11px] font-bold tracking-[0.3em] shadow-lg transition-all active:scale-95" style={{ backgroundColor: accent }}>PRIMARY ACTION</div>
        </div>
        <div className="flex gap-4 mt-8 justify-center">
          {colors.map(c => (
            <button key={c} onClick={() => setAccent(c)} className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-125 ${accent === c ? 'border-[#34170A] scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    );
};
  
const MotionExperiment = () => {
return (
    <div className="bg-white p-6 md:p-8 rounded-sm border border-[#A35100]/10 flex flex-col h-[450px] md:h-[500px]">
    <h4 className="font-bold text-[10px] tracking-[0.3em] uppercase mb-8">Micro-Interactions</h4>
    <div className="flex-1 flex flex-col gap-6 items-center justify-center">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-5 border-2 border-[#34170A] rounded-sm text-[10px] font-black tracking-widest uppercase hover:bg-[#34170A] hover:text-white transition-colors duration-300">HOVER FOR SCALE</motion.button>
        <div className="flex gap-4 w-full">
        <motion.div whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }} className="flex-1 py-5 bg-[#EBE0CF] rounded-sm text-center text-[10px] font-black tracking-widest cursor-pointer">FLOAT</motion.div>
        <motion.div whileHover={{ rotate: 90 }} className="flex-1 py-5 bg-[#34170A] text-[#FDF3E4] rounded-sm text-center text-[10px] font-black tracking-widest cursor-pointer">ROTATE</motion.div>
        </div>
        <motion.div animate={{ borderRadius: ["0%", "50%", "0%"], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="w-20 h-20 bg-[#A35100]/10 border border-[#A35100]/20 flex items-center justify-center"><Sparkles size={20} className="text-[#A35100]" /></motion.div>
    </div>
    </div>
);
};




export default LearnByBuilding;