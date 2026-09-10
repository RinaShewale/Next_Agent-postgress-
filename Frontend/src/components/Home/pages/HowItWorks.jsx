import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const HowItWorks = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {

      // 1. HERO ENTRANCE
      const heroTl = gsap.timeline();
      heroTl.from(".hero-title span span", {
        yPercent: 100,
        rotate: 3,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "expo.out"
      }).from(".hero-sub", {
        opacity: 0,
        y: 20,
        duration: 1
      }, "-=0.8");

      // 2. MOUSE PARALLAX
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 15;
        const yPos = (clientY / window.innerHeight - 0.5) * 15;
        gsap.to(".parallax-layer", { x: xPos, y: yPos, duration: 1.5, ease: "power2.out" });
      };
      window.addEventListener("mousemove", handleMouseMove);

      // 3. MASTER WORKFLOW TIMELINE (STICKY SECTION)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stickyRef.current,
          start: "top top",
          end: "+=600%",
          pin: true,
          scrub: 1,
        }
      });

      tl.from(".prompt-card", { scale: 0.8, opacity: 0, y: 100, duration: 1 })
        .to(".typing-text", { duration: 2, text: "Create a modern neo-brutalist dashboard for a crypto trading platform with real-time analytics.", ease: "none" })
        .to(".prompt-card", {
          top: "20px",
          scale: 0.7,
          width: "500px",
          duration: 1.5,
          ease: "expo.inOut"
        })
        .from(".main-ide", { yPercent: 100, opacity: 0, duration: 1.5, ease: "power4.out" }, "-=1")
        .from(".file-tree-item", { x: -20, opacity: 0, stagger: 0.1, duration: 0.5 })
        .from(".code-line", { opacity: 0, x: 10, stagger: 0.05, duration: 1 })
        .to(".preview-img-container", { filter: "blur(0px)", opacity: 1, stagger: 0.3, duration: 1.5 }, "-=0.5")
        .from(".terminal-overlay", { height: 0, duration: 1.2, ease: "power3.inOut" })
        .to(".terminal-log", {
          duration: 2,
          text: "> npm install lucide-react recharts<br/>> building optimized production build...<br/>> uploading to edge networks...<br/>> deployment successful: https://crypto-dash.ai",
          ease: "none"
        })
        .from(".deploy-success-card", { scale: 0, opacity: 0, rotate: 10, duration: 0.8, ease: "back.out(1.7)" });

      // 4. FIXED REVEAL ANIMATION (ORANGE COLOR FIX)
      const revealLines = gsap.utils.toArray(".scrub-line");
      revealLines.forEach((line) => {
        const words = line.querySelectorAll("span");
        gsap.fromTo(words, 
          { 
            opacity: 0.1, 
            y: 20,
            color: "rgba(163, 81, 0, 0.2)" // Initial faded orange
          },
          {
            opacity: 1,
            y: 0,
            color: "#A35100", // Final solid orange
            stagger: 0.1,
            scrollTrigger: {
              trigger: line,
              start: "top 90%",
              end: "top 40%",
              scrub: true,
            }
          }
        );
      });

      // 5. BENTO GRID REVEAL
      gsap.from(".bento-item", {
        y: 40, opacity: 0, stagger: 0.07,
        scrollTrigger: { trigger: ".bento-grid", start: "top 85%" }
      });

      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Helper to wrap words in spans for the reveal animation
  const splitText = (text) => {
    return text.split(" ").map((word, i) => (
      <span key={i} className="inline-block mr-[0.25em]">
        {word}
      </span>
    ));
  };

  return (
    <div ref={containerRef} className="bg-[#F9EFE0] text-[#34170A] selection:bg-[#A35100] selection:text-white">

      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center relative">
        <div className="hero-sub font-mono text-[10px] tracking-[0.6em] uppercase opacity-50 mb-12">
          Architecture / Workflow
        </div>
        <div className="max-w-[90vw] lg:max-w-7xl">
          <h1 className="hero-title text-[9vw] sm:text-[8vw] lg:text-[7vw] font-serif leading-[1.1] md:leading-[0.9] italic mb-8">
            <span className="inline-block overflow-hidden">
               <span className="inline-block">From</span>
            </span>{" "}
            <span className="inline-block overflow-hidden">
               <span className="text-[#A35100] inline-block">Idea</span>
            </span> 
            <br /> 
            <span className="inline-block overflow-hidden">
               <span className="inline-block">to Interface.</span>
            </span>
          </h1>
        </div>
      </section>

      {/* STICKY WORKSPACE */}
      <section ref={stickyRef} className="h-screen w-full relative flex flex-col items-center justify-center overflow-hidden">
        <div className="prompt-card absolute z-[60] w-full max-w-xl bg-white/90 backdrop-blur-xl border border-[#34170A]/10 p-6 shadow-2xl rounded-2xl">
          <div className="flex items-center gap-3 mb-3 opacity-40">
            <div className="w-2 h-2 rounded-full bg-[#A35100]" />
            <span className="font-mono text-[9px] uppercase tracking-widest font-bold">Natural Language Entry</span>
          </div>
          <p className="typing-text font-serif text-xl italic text-[#34170A] min-h-[2rem]"></p>
        </div>
        
        <div className="main-ide parallax-layer w-[94vw] max-w-7xl h-[80vh] bg-[#0A0A0A] rounded-2xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col overflow-hidden">
          <div className="h-12 bg-[#141414] border-b border-white/5 flex items-center justify-between px-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#333]" /><div className="w-3 h-3 rounded-full bg-[#333]" /><div className="w-3 h-3 rounded-full bg-[#333]" />
            </div>
            <div className="font-mono text-[9px] text-white/20 uppercase tracking-[0.3em]">AI-Editor-Core-v2.0</div>
            <div className="w-12" />
          </div>
          <div className="flex flex-1 overflow-hidden relative">
            <div className="w-56 bg-[#080808] border-r border-white/5 p-6 hidden lg:block">
               <div className="text-[10px] uppercase text-white/20 font-mono mb-8 tracking-widest">Project Files</div>
               <div className="space-y-4">
                {['app/dashboard', 'components/Chart.tsx', 'hooks/useCrypto.ts', 'theme/config.js'].map((item, i) => (
                  <div key={i} className="file-tree-item flex items-center gap-3 text-[11px] text-white/40 font-mono">
                    <span className="opacity-20 text-xs">{i === 0 ? '📁' : '📄'}</span> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-[1.5] relative flex flex-col bg-[#0D0D0D]">
              <div className="flex-1 p-10 font-mono text-xs md:text-sm leading-relaxed overflow-hidden">
                <div className="code-line text-[#A35100]">import {'{'} Framer {'}'} from "motion";</div>
                <div className="code-line text-white/20 py-2">// Building requested interface...</div>
                <div className="code-line text-blue-400">export const Dashboard = () =&gt; {'{'}</div>
                <div className="code-line text-white/80 pl-4">return (</div>
                <div className="code-line text-green-400 pl-8">&lt;Section variant="brutalist"&gt;</div>
                <div className="code-line text-white/60 pl-12">&lt;CryptoTicker pair="BTC/USD" /&gt;</div>
                <div className="code-line text-white/60 pl-12">&lt;TradeHistory items={'{'}10{'}'} /&gt;</div>
                <div className="code-line text-green-400 pl-8">&lt;/Section&gt;</div>
                <div className="code-line text-white/80 pl-4">);</div>
                <div className="code-line text-blue-400">{'}'};</div>
              </div>
              <div className="terminal-overlay absolute bottom-0 left-0 right-0 h-[35%] bg-[#050505] border-t border-white/10 z-20 flex flex-col">
                <div className="px-6 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <div className="flex gap-6">
                    <span className="font-mono text-[10px] text-white underline underline-offset-8 decoration-[#A35100]">TERMINAL</span>
                    <span className="font-mono text-[10px] text-white/30 uppercase">OUTPUT</span>
                  </div>
                </div>
                <div className="p-6 font-mono text-[12px] text-green-500/80 terminal-log leading-relaxed overflow-hidden"></div>
              </div>
            </div>
            <div className="flex-1 bg-[#111] border-l border-white/5 relative p-6 overflow-hidden">
              <div className="h-full flex flex-col gap-4">
                <div className="preview-img-container flex-1 opacity-0 filter blur-3xl transition-all duration-1000">
                  <img src="https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover rounded-xl grayscale" alt="P1" />
                </div>
              </div>
              <div className="deploy-success-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-2xl shadow-2xl text-center border-t-8 border-[#A35100] z-50">
                <h4 className="font-serif italic text-2xl text-[#34170A]">Production Live</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEXT REVEAL SECTION - Now properly stays Orange */}
       <section className="py-48 px-6 bg-[#34170A]">
        <div className="max-w-5xl mx-auto text-center space-y-4">
            <h2 className="scrub-line text-4xl md:text-7xl font-serif italic leading-tight">
              {splitText("We believe that code is poetry.")}
            </h2>
            <h2 className="scrub-line text-4xl md:text-7xl font-serif italic leading-tight">
              {splitText("Every pixel must serve a purpose.")}
            </h2>
            <h2 className="scrub-line text-4xl md:text-7xl font-serif italic leading-tight">
              {splitText("AI should empower, not replace.")}
            </h2>
            <h2 className="scrub-line text-4xl md:text-7xl font-serif italic leading-tight">
              {splitText("Human-centric by design.")}
            </h2>
        </div>
      </section>

      {/* BENTO GRID */}
      <section className="py-40 px-6 bg-[#F9EFE0] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24">
            <span className="font-mono text-[#A35100] text-xs tracking-[0.5em] uppercase font-bold">Core Power</span>
            <h2 className="text-6xl md:text-7xl font-serif italic mt-6">Built for speed.</h2>
          </div>
          <div className="bento-grid grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[300px]">
            <div className="bento-item md:col-span-2 bg-[#34170A] p-12 text-[#F9EFE0] flex flex-col justify-between rounded-sm">
              <h3 className="text-4xl md:text-5xl font-serif italic leading-tight">Direct access to <br />file architectures.</h3>
              <p className="opacity-40 font-mono text-[10px] uppercase tracking-[0.4em]">Integrated Editor / 01</p>
            </div>
            <div className="bento-item bg-[#A35100] p-12 text-white flex flex-col justify-between rounded-sm">
              <h3 className="text-4xl font-serif italic">Global <br />Edge Nodes</h3>
            </div>
            <div className="bento-item bg-white border border-[#34170A]/10 p-12 flex flex-col justify-between rounded-sm">
              <h3 className="text-3xl font-serif italic text-[#A35100]">One-click <br />Production.</h3>
            </div>
            <div className="bento-item md:col-span-2 bg-[#EBE0CF] p-12 flex items-end justify-between rounded-sm">
              <div className="max-w-md">
                <h3 className="text-4xl font-serif italic mb-6 text-[#34170A]">Interactive Terminal.</h3>
              </div>
              <div className="text-8xl font-serif italic text-[#34170A]/5 select-none tracking-tighter">CMD</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
     <Footer />

      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[9999] mix-blend-multiply bg-[url('https://res.cloudinary.com/dvwthyt94/image/upload/v1672322316/noise_yvsk9m.png')]" />
    </div>
  );
};

export default HowItWorks;