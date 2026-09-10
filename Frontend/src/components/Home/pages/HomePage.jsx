import React, { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Hero from '../components/Hero';
import ImageSplitSection from '../components/ImageSplitSection';
import DescriptionSection from '../components/DescriptionSection';
import Footer from '../components/Footer';
import KineticEditorialHero from '../components/KineticEditorialHero';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  useEffect(() => {
    // 1. Initialize Smooth Scroll (Lenis)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', ScrollTrigger.update);

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative w-full overflow-x-hidden">
   

      <Hero />

      <div className="relative z-10 bg-[#FDF3E4]">
        <ImageSplitSection />
        <DescriptionSection />
        <KineticEditorialHero />
        <Footer />
      </div>
    </main>
  );
};

export default HomePage;