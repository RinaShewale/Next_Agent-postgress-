import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const ArchitecturalArchives = () => {
  const containerRef = useRef(null);
  const horizontalSectionRef = useRef(null);
  const horizontalTrackRef = useRef(null);

  const templates = [
    { title: "Minimalist Grid", type: "Portfolio Blueprint", img: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=800" },
    { title: "Editorial Flow", type: "Magazine Layout", img: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800" },
    { title: "Brutalist Mono", type: "Studio Foundation", img: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?q=80&w=800" },
    { title: "The Obsidian", type: "Luxury Framework", img: "https://images.unsplash.com/photo-1449156001934-037101bab57f?q=80&w=800" },
  ];

  const designAssets = [
    {
      name: 'Typography Pack',
      detail: 'SERIF DISPLAY & MONO SANS',
      previewImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400'
    },
    {
      name: 'Earth Palette',
      detail: 'OCHRE, CREAM, BURNT UMBER',
      previewImage: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=400'
    },
    {
      name: 'Motion System',
      detail: 'REVEALS, TRANSITIONS & MICRO-INTERACTIONS',
      previewImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400'
    },
    {
      name: 'Component Library',
      detail: 'BUTTONS, CARDS & INTERACTIVE UI',
      previewImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=400'
    },
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Hero Reveal
      gsap.from(".hero-line", {
        yPercent: 110,
        stagger: 0.1,
        duration: 1.5,
        ease: "power4.out"
      });

      // 2. Horizontal Scroll
      const horizontalWidth = horizontalTrackRef.current.scrollWidth;
      gsap.to(horizontalTrackRef.current, {
        x: () => -(horizontalWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: horizontalSectionRef.current,
          start: "top top",
          end: () => `+=${horizontalWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        }
      });

      // 3. Interactive List Items
      const items = gsap.utils.toArray(".asset-item");
      items.forEach((item) => {
        const preview = item.querySelector(".floating-preview");
        const xTo = gsap.quickTo(preview, "x", { duration: 0.4, ease: "power3" });
        const yTo = gsap.quickTo(preview, "y", { duration: 0.4, ease: "power3" });
        const rotateTo = gsap.quickTo(preview, "rotation", { duration: 0.4, ease: "power3" });

        item.addEventListener("mousemove", (e) => {
          const rect = item.getBoundingClientRect();
          xTo(e.clientX - rect.left);
          yTo(e.clientY - rect.top);
          rotateTo(e.movementX * 0.4);
        });

        item.addEventListener("mouseenter", (e) => {
          const rect = item.getBoundingClientRect();
          gsap.set(preview, { x: e.clientX - rect.left, y: e.clientY - rect.top, xPercent: -50, yPercent: -50 });
          gsap.to(preview, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
        });

        item.addEventListener("mouseleave", () => {
          gsap.to(preview, { opacity: 0, scale: 0.8, rotation: 0, duration: 0.3 });
        });
      });

      // 4. Featured Image Reveals
      gsap.utils.toArray(".reveal-img-container").forEach((container) => {
        const image = container.querySelector("img");
        gsap.to(container, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease: "power4.inOut",
          scrollTrigger: { trigger: container, start: "top 90%" }
        });
        gsap.fromTo(image, { yPercent: -15 }, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: { trigger: container, scrub: true, start: "top bottom", end: "bottom top" }
        });
      });

      // 5. Info Section Animations
      const infoTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".info-details-section",
          start: "top 70%",
        }
      });

      infoTl.from(".info-title-line", {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out"
      })
        .from(".info-fade-in", {
          opacity: 0,
          y: 20,
          duration: 1,
          ease: "power2.out"
        }, "-=0.6");

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-[var(--nexus-bg)] text-[var(--nexus-text)] selection:bg-[var(--nexus-accent)] selection:text-[var(--nexus-bg)] overflow-x-hidden min-h-screen font-sans"
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100;0,14..32,400;0,14..32,700&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=JetBrains+Mono:wght@300;400&display=swap');
          
          :root {
            --nexus-bg:        #FDF3E4;
            --nexus-surface:   #EBE0CF;
            --nexus-accent:    #A35100;
            --nexus-accent-2:  #B55500;
            --nexus-text:      #34170A;
            --nexus-border:    rgba(163, 81, 0, 0.10);
          }

          .font-serif { font-family: 'Playfair Display', serif; }
          .font-mono { font-family: 'JetBrains Mono', monospace; }
          .font-sans { font-family: 'Inter', sans-serif; }

          .grain-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 9999; opacity: 0.04;
            background-image: url('https://res.cloudinary.com/dvwthyt94/image/upload/v1672322316/noise_yvsk9m.png');
          }

          .clip-reveal { clip-path: inset(100% 0% 0% 0%); }
        `}
      </style>

      <div className="grain-overlay" />

      {/* HERO SECTION */}
      <section className="h-[100vh] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="font-serif text-[12vw] md:text-[8vw] leading-[0.9] italic tracking-tighter">
          <div className="overflow-hidden h-[1.15em] px-4"><span className="hero-line inline-block">The Template</span></div>
          <div className="overflow-hidden h-[1.15em] px-4"><span className="hero-line inline-block text-[var(--nexus-accent)]">Archives</span></div>
        </h1>
        <p className="mt-8 font-mono text-[10px] tracking-widest opacity-40 uppercase max-w-sm mx-auto">
          Curation of high-fidelity digital foundations.
        </p>
      </section>

      {/* HORIZONTAL SECTION (TEMPLATES) */}
      <section ref={horizontalSectionRef} className="h-screen bg-[var(--nexus-text)] text-[var(--nexus-bg)] flex relative overflow-hidden">
        <div className="w-[30%] h-full flex flex-col justify-center px-12 z-20 bg-[var(--nexus-text)] border-r border-[var(--nexus-bg)]/10">
          <div className="mb-10">
            <h2 className="font-serif text-3xl italic mb-4">The Blueprints</h2>
            <p className="font-mono text-[8px] tracking-[0.4em] uppercase opacity-40 max-w-[200px] leading-relaxed">
              A selection of structural frameworks for professional deployment.
            </p>
          </div>
        </div>
        <div ref={horizontalTrackRef} className="flex h-full items-center px-[10vw] gap-[15vw] w-fit will-change-transform">
          {templates.map((item, i) => (
            <div key={i} className="relative w-[300px] md:w-[450px] flex-shrink-0 group">
              <div className="aspect-[4/3] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:-translate-y-4">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
              </div>
              <div className="mt-8 flex justify-between font-mono text-[9px] uppercase tracking-[0.3em] opacity-30">
                <span>{item.type}</span>
                <span>/ REF_{i + 1}</span>
              </div>
              <h3 className="font-serif text-4xl italic mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE ASSET LIST */}
      <section className="asset-list-container py-40 px-6 md:px-24">
        <div className="mb-24 flex justify-between items-end border-b border-[var(--nexus-text)]/5 pb-12">
          <h2 className="font-serif text-6xl italic font-light tracking-tight">Design Foundations</h2>
          <span className="font-mono text-[9px] tracking-[0.5em] opacity-30 uppercase pb-2">Technical Index / v1.0</span>
        </div>
        <div className="flex flex-col">
          {designAssets.map((asset, i) => (
            <div key={i} className="asset-item group relative py-12 md:py-16 border-b border-[var(--nexus-text)]/5 flex items-center justify-between cursor-none">
              <div className="flex items-center relative z-10">
                <span className="font-mono text-[9px] mr-12 md:mr-24 opacity-20 mt-2 leading-none">ARC_0{i + 1}</span>
                <h4 className="font-serif text-5xl md:text-7xl italic group-hover:text-[var(--nexus-accent)] transition-colors duration-700 leading-none">
                  {asset.name}
                </h4>
              </div>
              <div className="floating-preview pointer-events-none absolute top-0 left-0 w-64 h-64 opacity-0 scale-75 z-0 flex items-center justify-center bg-white shadow-xl rounded-sm overflow-hidden border border-[var(--nexus-text)]/5">
                <img src={asset.previewImage} alt="preview" className="w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED COLLECTIONS */}
      <section className="py-40 px-6 md:px-24 bg-[var(--nexus-bg)] text-[var(--nexus-text)]">
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 md:col-span-5 mb-20 md:mb-0">
            <span className="font-mono text-[9px] tracking-[0.5em] opacity-40 uppercase block mb-6">Archive / Series 01</span>
            <h2 className="font-serif text-6xl italic leading-tight mb-8">Digital<br />Preservation</h2>
            <p className="font-light text-xl opacity-60 leading-relaxed max-w-sm mb-12">
              These templates are designed to survive the rapid shifts in digital trends by adhering to timeless architectural principles.
            </p>
            <div className="reveal-img-container clip-reveal relative w-full aspect-[3/4] overflow-hidden grayscale">
              <img
                src="https://images.unsplash.com/photo-1518005020251-6fb101cc9a3d?q=80&w=1000"
                className="w-full h-[120%] object-cover absolute top-[-10%]"
                alt="architecture"
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 md:offset-1 mt-0 md:mt-40">
            <div className="reveal-img-container clip-reveal relative w-full aspect-video overflow-hidden grayscale mb-12">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000"
                className="w-full h-[120%] object-cover absolute top-[-10%]"
                alt="studio space"
              />
            </div>
            <div className="max-w-md">
              <h3 className="font-serif text-3xl italic mb-6">Standardized Craft</h3>
              <p className="font-mono text-[10px] tracking-[0.2em] opacity-40 uppercase leading-loose">
                Each archive entry undergoes rigorous testing for performance, accessibility, and modular responsiveness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INFO TYPE CONTENT */}
      <section className="info-details-section py-60 px-6 bg-[var(--nexus-bg)] text-[var(--nexus-text)] border-t border-[var(--nexus-text)]/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-7">
              <h2 className="font-serif text-[8vw] lg:text-[6vw] italic tracking-tighter mb-16">
                <div className="overflow-hidden h-[1.3em] px-2"><span className="info-title-line inline-block pb-4">Standardizing the</span></div>
                <div className="overflow-hidden h-[1.3em] px-2"><span className="info-title-line inline-block text-[var(--nexus-accent)] pb-4">Creative Process</span></div>
              </h2>

              <div className="info-fade-in">
                <p className="font-light text-2xl md:text-3xl opacity-60 leading-relaxed max-w-3xl border-l-2 border-[var(--nexus-accent)] pl-10">
                  The Archives serve as a starting point for those who value precision. We provide the bones; you provide the soul.
                </p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 flex flex-col justify-end">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 info-fade-in">
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--nexus-accent)] mb-4">01 / The Logic</h4>
                  <p className="font-sans text-sm opacity-50 leading-relaxed">Clean code structures built for high-performance indexing and SEO efficiency.</p>
                </div>
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--nexus-accent)] mb-4">02 / The Form</h4>
                  <p className="font-sans text-sm opacity-50 leading-relaxed">Layouts that balance white space with aggressive typography and motion.</p>
                </div>
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--nexus-accent)] mb-4">03 / The Motion</h4>
                  <p className="font-sans text-sm opacity-50 leading-relaxed">Pre-configured GSAP timelines that ensure smooth user transitions.</p>
                </div>
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--nexus-accent)] mb-4">04 / The Scalability</h4>
                  <p className="font-sans text-sm opacity-50 leading-relaxed">Modular components that grow from simple landing pages to complex platforms.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArchitecturalArchives;