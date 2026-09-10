import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTransitionPath } from './Transitionpathcontext'; // adjust path as needed

const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const { setDisplayPath } = useTransitionPath();

  const [displayOutlet, setDisplayOutlet] = useState(outlet);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const topLayerRef = useRef(null);
  const midLayerRef = useRef(null);
  const contentRef = useRef(null);
  const prevPath = useRef(location.pathname);

  const paths = {
    initial: "M 0 100 L 100 100 L 100 100 Q 50 100 0 100 Z",
    curveUp: "M 0 100 L 100 100 L 100 50 Q 50 -40 0 50 Z",
    full: "M 0 100 L 100 100 L 100 0 Q 50 0 0 0 Z",
    exit: "M 0 0 L 100 0 L 100 0 Q 50 -40 0 0 Z",
  };

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      handlePageChange();
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  const handlePageChange = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        ScrollTrigger.refresh();
      }
    });

    // 1. ANIMATE LIQUID UP (Close)
    tl.set([topLayerRef.current, midLayerRef.current], {
      attr: { d: paths.initial },
      visibility: 'visible',
      opacity: 1
    })
    .to(midLayerRef.current, {
      attr: { d: paths.curveUp },
      duration: 0.6,
      ease: "power4.in"
    })
    .to(midLayerRef.current, {
        attr: { d: paths.full },
        duration: 0.3,
        ease: "power2.out"
    })
    .to(topLayerRef.current, {
      attr: { d: paths.curveUp },
      duration: 0.6,
      ease: "power4.in"
    }, "-=0.7")
    .to(topLayerRef.current, {
        attr: { d: paths.full },
        duration: 0.3,
        ease: "power2.out"
    }, "-=0.2")

    // 2. SWAP CONTENT — screen is fully covered by the liquid here.
    // This is the ONLY moment the "visible page" actually changes,
    // so this is where displayPath must update too — kept in lockstep
    // with displayOutlet so nothing else can desync from it.
    .call(() => {
      setDisplayOutlet(outlet);
      setDisplayPath(location.pathname);
      window.scrollTo(0, 0);
      gsap.set(contentRef.current, { opacity: 0, y: 40 });
    })

    // 3. ANIMATE LIQUID UP (Exit/Open)
    .to(topLayerRef.current, {
      attr: { d: paths.exit },
      duration: 1,
      ease: "power4.inOut",
    })
    .to(midLayerRef.current, {
      attr: { d: paths.exit },
      duration: 1,
      ease: "power4.inOut",
    }, "-=0.8")

    // 4. SHOW NEW CONTENT
    .to(contentRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      onComplete: () => {
        gsap.set(contentRef.current, { clearProps: "all" });
      }
    }, "-=0.6")

    .set([topLayerRef.current, midLayerRef.current], { visibility: 'hidden' });
  };

  return (
    <div className="relative w-full min-h-screen">
      <svg
        className="fixed top-0 left-0 w-full h-[110vh] z-[9999] pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path ref={midLayerRef} fill="#B55500" d={paths.initial} />
        <path ref={topLayerRef} fill="#34170A" d={paths.initial} />
      </svg>

      <div ref={contentRef} className="w-full">
        {displayOutlet}
      </div>
    </div>
  );
};

export default PageTransition;