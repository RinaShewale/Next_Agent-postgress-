import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SmoothScroll from '../components/SmoothScroll';
import useAuth from '../../../hooks/useAuth'; // Ensure this path is correct for your project
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const BeyondTheBrief = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartBuilding = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const assemblyImages = [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1449156001934-037101bab57f?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518005020410-1cc67379a18c?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?q=80&w=1000&auto=format&fit=crop"
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      
      // 1. HERO REVEAL
      gsap.from(".hero-title span", {
        y: 100, rotate: 10, opacity: 0, stagger: 0.1, duration: 1.5, ease: "expo.out"
      });

      // 2. DIRECTIONS ANIMATIONS (Editorial & Immersive)
      const directionCards = gsap.utils.toArray(".direction-card");
      
      directionCards.forEach((card, i) => {
        const isEven = i % 2 === 0;
        const img = card.querySelector(".card-img");
        const title = card.querySelector(".card-title");
        const subtitle = card.querySelector(".card-subtitle");
        const description = card.querySelector(".card-desc");

        // Text Reveal Timeline
        const textTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 70%",
          }
        });

        textTl
          .from(subtitle, { opacity: 0, x: -20, duration: 0.8 })
          .from(title, { yPercent: 100, duration: 1, ease: "power4.out" }, "-=0.6")
          .from(description, { opacity: 0, y: 20, duration: 0.8 }, "-=0.4");

        // Image Parallax/Scale Effect
        gsap.fromTo(img, 
          { scale: 1.2, yPercent: isEven ? -10 : 10 },
          { 
            scale: 1, 
            yPercent: isEven ? 10 : -10,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );

        // Special logic for the Circular "Immersive" card
        if (!isEven) {
          gsap.from(".immersive-circle", {
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              end: "top 20%",
              scrub: 1
            },
            borderRadius: "0%",
            rotate: -15,
            scale: 0.8
          });
        }
      });

      // 3. ASSEMBLY - THE SCATTERED DECK
      const assemblyTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".section-assembly",
          start: "top top",
          end: "+=350%",
          pin: true,
          scrub: 1,
        }
      });

      const layers = gsap.utils.toArray(".assembly-layer");
      layers.forEach((layer, i) => {
        const isLast = i === layers.length - 1;
        const isEven = i % 2 === 0;
        
        assemblyTl.fromTo(layer, 
          { y: 1000, x: isEven ? -400 : 400, rotate: isEven ? -30 : 30, opacity: 0 },
          { 
            y: 0, x: 0, 
            rotate: isLast ? 0 : (isEven ? (i * -3) - 5 : (i * 3) + 5), 
            opacity: 1, duration: 1, ease: "power2.out" 
          },
          i * 0.4
        );
      });

      // 4. CODE CANVAS ANIMATION
      gsap.from(".code-window-main", {
        scrollTrigger: {
          trigger: ".section-code",
          start: "top 70%",
          end: "top 20%",
          scrub: 1,
        },
        y: 100, opacity: 0, scale: 0.95, rotateX: 5
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      <div ref={containerRef} className="bg-[#FDF3E4] text-[#34170A] selection:bg-[#A35100] selection:text-[#FDF3E4] overflow-x-hidden">
        
        {/* HERO SECTION */}
        <section className="relative h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
          <span className="text-[10px] tracking-[0.6em] uppercase opacity-60 mb-8 block">NexAgent / Beyond the Brief</span>
          <h1 className="hero-title text-[8vw] md:text-[6vw] font-serif leading-none italic tracking-tighter">
            <span className="inline-block">What</span> <span className="inline-block">could</span> <span className="inline-block">you</span> <br />
            <span className="inline-block text-[#A35100]">build?</span>
          </h1>
        </section>

        {/* SECTION 01: THE BRIEF */}
        <section className="section-brief min-h-[70vh] flex items-center justify-center p-12 bg-[#34170A] text-[#FDF3E4]">
          <div className="max-w-4xl text-center">
            <span className="text-[10px] tracking-[0.4em] uppercase opacity-40 mb-12 block">01 / The Brief</span>
            <h2 className="text-4xl md:text-7xl font-light leading-tight">
              “Create a website for a <span className="italic font-serif text-[#A35100]">futuristic architecture studio</span> with deep shadows and minimal grids.”
            </h2>
          </div>
        </section>

        {/* SECTION 02: DIRECTIONS */}
        <section className="section-directions bg-[#F9EFE0] py-32 space-y-32">
            {/* DIRECTION 01 - EDITORIAL */}
            <div className="direction-card container mx-auto px-10 md:px-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center max-w-7xl">
                <div className="text-left overflow-hidden">
                  <span className="card-subtitle text-[10px] tracking-widest uppercase opacity-50 block">Direction 01</span>
                  <div className="overflow-hidden">
                    <h3 className="card-title text-6xl md:text-8xl font-serif italic my-4">Editorial</h3>
                  </div>
                  <p className="card-desc max-w-sm opacity-70 leading-relaxed">Large typography, magazine-inspired layouts, and graceful negative space.</p>
                </div>
                <div className="aspect-[4/5] bg-white shadow-xl relative overflow-hidden">
                   <img className="card-img absolute inset-0 w-full h-full object-cover grayscale" src="https://images.unsplash.com/photo-1449156001934-037101bab57f?q=80&w=1000&auto=format&fit=crop" alt="arch" />
                </div>
              </div>
            </div>
            
            {/* DIRECTION 02 - IMMERSIVE */}
            <div className="direction-card container mx-auto px-10 md:px-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center max-w-7xl flex-row-reverse">
                <div className="immersive-circle aspect-square relative overflow-hidden shadow-xl rounded-full border-[10px] border-white order-2 md:order-1">
                  <img className="card-img absolute inset-0 w-full h-full object-cover" src="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=1000&auto=format&fit=crop" alt="interior" />
                </div>
                <div className="text-left order-1 md:order-2 overflow-hidden">
                  <span className="card-subtitle text-[10px] tracking-widest uppercase opacity-50 block">Direction 02</span>
                  <div className="overflow-hidden">
                    <h3 className="card-title text-6xl md:text-8xl font-serif italic my-4">Immersive</h3>
                  </div>
                  <p className="card-desc max-w-sm opacity-70 leading-relaxed">Movement, depth, and transitions that pull the user into the story.</p>
                </div>
              </div>
            </div>
        </section>

        {/* SECTION 03: ASSEMBLY */}
        <section className="section-assembly h-screen flex items-center justify-center bg-[#FDF3E4] overflow-hidden">
           <div className="relative w-full max-w-6xl h-full flex items-center justify-center">
              <div className="absolute top-20 left-10 z-50">
                <h2 className="text-[10px] tracking-[0.5em] uppercase opacity-50 mb-2">The Assembly</h2>
                <p className="text-3xl font-serif italic max-w-[300px] leading-tight">Layering the <span className="text-[#A35100]">subconscious</span> of the brand.</p>
              </div>

              <div className="relative w-[320px] md:w-[550px] h-[450px]">
                {assemblyImages.map((src, i) => (
                  <div key={i} className="assembly-layer absolute inset-0 bg-white p-3 md:p-5 shadow-[0_30px_60px_-15px_rgba(52,23,10,0.2)] border border-[#34170A]/5">
                    <div className="w-full h-full overflow-hidden relative">
                      <img src={src} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="deck" />
                    </div>
                  </div>
                ))}
                
                <div className="assembly-layer absolute w-[250px] h-[350px] bg-[#34170A] text-[#FDF3E4] p-8 flex flex-col justify-end shadow-2xl z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div>
                      <span className="text-4xl font-serif italic leading-none block mb-4">Refinement</span>
                      <p className="text-[9px] uppercase tracking-[0.45em] leading-relaxed opacity-50">
                        Applying dynamic <br/> motion logic to the <br/> assembled system.
                      </p>
                   </div>
                </div>
              </div>
           </div>
        </section>

        {/* SECTION 04: OUTPUT PREVIEW & CODE CANVAS */}
        <section className="section-code min-h-screen flex items-center justify-center p-6 md:p-20">
           <div className="code-window-main grid grid-cols-1 lg:grid-cols-12 w-full max-w-7xl bg-[#34170A] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border border-[#FDF3E4]/10">
              <div className="lg:col-span-7 bg-[#F4EADA] relative min-h-[500px] overflow-hidden flex flex-col">
                 <div className="h-10 border-b border-[#34170A]/5 flex items-center px-4 gap-1.5 bg-[#EBE0CF]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#34170A]/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#34170A]/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#34170A]/10" />
                    <div className="ml-4 h-5 w-40 bg-[#34170A]/5 rounded-sm" />
                 </div>
                 <div className="flex-grow relative flex items-center justify-center p-12">
                    <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#34170A 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div className="relative z-10 w-full h-full border border-[#34170A]/10 rounded flex flex-col items-center justify-center">
                        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop" 
                             className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" alt="preview" />
                        <div className="relative flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full border border-[#34170A]/20 flex items-center justify-center mb-6">
                                <div className="w-2 h-2 bg-[#A35100] rounded-full" />
                                <div className="absolute w-24 h-24 border border-[#A35100]/20 rounded-full animate-[spin_10s_linear_infinite]" />
                            </div>
                            <h4 className="font-serif italic text-3xl text-[#34170A]/60 tracking-tight">Preview</h4>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#A35100]/50 to-transparent animate-[scan_4s_ease-in-out_infinite]" />
                 </div>
              </div>

              <div className="lg:col-span-5 p-12 md:p-16 flex flex-col justify-center border-l border-[#FDF3E4]/5">
                 <span className="text-[9px] tracking-[0.5em] uppercase text-[#A35100] mb-12 block font-bold">Production Instance</span>
                 <div className="space-y-5 font-mono text-[12px] text-[#FDF3E4]/60 leading-relaxed">
                    <p className="text-[#A35100]/50 italic">// Grid Initialization</p>
                    <p className="hover:text-[#FDF3E4] transition-colors">&lt;Hero layout="dynamic" /&gt;</p>
                    <p className="hover:text-[#FDF3E4] transition-colors">&lt;Grid columns={"{"}3{"}"} gap={"{"}20{"}"} /&gt;</p>
                    <div className="py-4" />
                    <p className="text-[#A35100]/50 italic">// Motion Logic</p>
                    <p className="hover:text-[#FDF3E4] transition-colors">&lt;Motion reveal="clip-path" duration={"{"}1.2{"}"} /&gt;</p>
                    <p className="hover:text-[#FDF3E4] transition-colors">&lt;AdaptiveSection logic="AI_V2" /&gt;</p>
                 </div>
                 <div className="mt-16 pt-8 border-t border-[#FDF3E4]/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#A35100] animate-pulse" />
                        <span className="text-[9px] uppercase tracking-[0.3em] opacity-40">System Ready</span>
                    </div>
                    <span className="text-[9px] font-mono opacity-20">v2.0.44</span>
                 </div>
              </div>
           </div>
        </section>

        {/* FINAL CTA */}
        <section className="h-screen flex flex-col items-center justify-center text-center p-6 bg-[#FDF3E4]">
           <h2 className="text-5xl md:text-9xl font-serif italic tracking-tighter mb-12">The brief is <br /> only the beginning.</h2>
           <button 
            onClick={handleStartBuilding}
            className="group relative px-16 py-8 overflow-hidden"
           >
              <div className="absolute inset-0 bg-[#34170A] group-hover:bg-[#A35100] transition-colors duration-500" />
              <span className="relative text-[#FDF3E4] text-[11px] font-bold uppercase tracking-[0.4em]">Start Building</span>
           </button>
        </section>

        <Footer />

        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[9999] mix-blend-multiply bg-[url('https://res.cloudinary.com/dvwthyt94/image/upload/v1672322316/noise_yvsk9m.png')]" />
        
        <style jsx>{`
            @keyframes scan {
                0%, 100% { top: 0%; opacity: 0; }
                50% { top: 100%; opacity: 1; }
            }
        `}</style>
      </div>
    </SmoothScroll>
  );
};

export default BeyondTheBrief;