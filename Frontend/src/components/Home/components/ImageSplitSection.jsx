import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Updated image sources to point to your public/images folder
const images = [
  { src: "/images/ai_1.webp", alt: "AI Image 1" },
  { src: "/images/ai_2.webp", alt: "AI Image 2" },
  { src: "/images/ai_3.webp", alt: "AI Image 3" },
  { src: "/images/ai_4.webp", alt: "AI Image 4" }
];

const ImageSplitSection = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1024px)",
      isMobile: "(max-width: 1023px)"
    }, (context) => {
      let { isDesktop } = context.conditions;
      const cards = containerRef.current.querySelectorAll('.image-card-wrapper');

      if (isDesktop) {
        // --- IMPROVED DESKTOP LOGIC ---
        
        // 1. The Center Line
        gsap.fromTo(
          ".split-center-line",
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "top center",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%", 
              end: "bottom center",
              scrub: 1.5,
            }
          }
        );

        // 2. The Cards (Scattering Effect)
        cards.forEach((card, i) => {
          const isLeft = i < 2;
          const isOuter = i === 0 || i === 3;
          
          const xMove = isLeft ? (isOuter ? -350 : -100) : (isOuter ? 350 : 100);
          const yMove = isOuter ? -450 : -180;
          const rotation = isLeft ? (isOuter ? -15 : -5) : (isOuter ? 15 : 5);
          const scale = isOuter ? 1.1 : 1.05;

          gsap.fromTo(
            card,
            { 
                y: 100, 
                x: 0, 
                rotation: 0, 
                scale: 1, 
                filter: "blur(0px)",
                opacity: 1 
            },
            {
              y: yMove,
              x: xMove,
              rotation: rotation,
              scale: scale,
              filter: "blur(4px)",
              opacity: 0.4, 
              ease: "power1.out",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 60%", 
                end: "bottom top",
                scrub: 1.5,
              }
            }
          );
        });
      } else {
        // --- BETTER MOBILE ANIMATION ---
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { y: 100, opacity: 0, scale: 0.9 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 90%",
                end: "top 20%",
                scrub: 1,
              }
            }
          );
        });
      }

      // Parallax effect
      cards.forEach((card) => {
        const img = card.querySelector('img');
        gsap.fromTo(img, { scale: 1.2 }, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-[10vh] py-24 bg-[#FDF3E4] flex items-center justify-center overflow-hidden lg:overflow-visible"
    >
      <div 
        className="split-center-line hidden lg:block absolute left-1/2 -translate-x-1/2 -top-[31.5vh] w-[4px] bg-[#A35100] z-10 origin-top" 
        style={{ height: 'calc(100% + 31.5vh)' }}
      />

      <div className="relative w-full max-w-[1300px] px-6 z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
          {images.map((item, i) => (
            <div 
              key={i} 
              className="image-card-wrapper relative w-full aspect-[4/5] sm:aspect-square overflow-hidden shadow-2xl bg-black/10 mx-auto" 
              style={{ willChange: "transform, opacity" }}
            >
              <img 
                src={item.src} 
                className="h-full w-full object-cover grayscale brightness-90 transition-all duration-500 hover:grayscale-0" 
                alt={item.alt} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
  
export default ImageSplitSection;