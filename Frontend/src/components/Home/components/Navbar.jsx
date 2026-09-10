import React, { useMemo, useRef, useEffect, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence, usePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { gsap } from 'gsap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const SideMenuContent = ({ onClose }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const pathRef = useRef(null);
  const orangePathRef = useRef(null);
  const containerRef = useRef(null);
  const [isPresent, safeToRemove] = usePresence();
  const [avatarError, setAvatarError] = useState(false);

  // FIX 1: Freeze Auth State & Pathname
  // This prevents the menu from "flickering" or changing items while it is animating closed
  const [menuPathname] = useState(location.pathname);
  const [wasAuthenticated] = useState(isAuthenticated);
  const [frozenUser] = useState(user);

  const menuConfig = useMemo(() => {
    const playgroundItems = [
      { label: 'New Chat', path: '/dashboard' },
      { label: 'History', path: '/history' },
      { label: 'Community', path: '/community' },
      { label: 'Settings', path: '/settings' },
    ];

    const standardItems = [
      { label: 'Home', path: '/' },
      { label: 'About', path: '/about' },
      { label: 'Community', path: '/community' },
       { label: 'Websites', path: '/websites' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Pricing', path: '/pricing' },
    ];

    const standardPaths = ['/', '/about', '/community', '/websites', '/pricing', '/login'];
    const isStandardPage = standardPaths.includes(menuPathname);

    return {
      isStandard: isStandardPage,
      items: isStandardPage ? standardItems : playgroundItems
    };
  }, [menuPathname]);

  const initialPath = "M 100 0 L 100 100 L 100 100 Q 100 50 100 0 Z";
  const targetPath = "M 100 0 L 100 100 L 20 100 Q 0 50 20 0 Z";

  useLayoutEffect(() => {
    if (isPresent) {
      const tl = gsap.timeline();
      tl.set([pathRef.current, orangePathRef.current], { opacity: 1 });
      tl.to(orangePathRef.current, { attr: { d: targetPath }, duration: 1, ease: "expo.out" });
      tl.to(pathRef.current, { attr: { d: targetPath }, duration: 1, ease: "expo.out" }, "-=0.9");
    }
  }, [isPresent]);

  useEffect(() => {
    if (!isPresent) {
      gsap.to([pathRef.current, orangePathRef.current], {
        attr: { d: initialPath },
        duration: 0.8,
        ease: "power4.inOut",
        stagger: 0.1,
        onComplete: safeToRemove
      });
    }
  }, [isPresent, safeToRemove]);

  const containerVariants = {
    initial: { x: 20, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2, ease: "easeOut" }
    },
    exit: {
      x: 40,
      opacity: 0,
      transition: { staggerChildren: 0.02, staggerDirection: -1, duration: 0.6 }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.4 } }
  };

  // Helper to handle logout and close simultaneously
  const handleLogout = async () => {
    onClose(); // Trigger the exit animation immediately
    setTimeout(() => {
      logout(); // Execute logout logic
    }, 300); // Small delay to let the animation start
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200] flex justify-end overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px] cursor-pointer"
      />

      <div className="relative h-full w-full max-w-[550px] pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path ref={orangePathRef} fill="#B55500" d={initialPath} style={{ opacity: 0 }} />
          <path ref={pathRef} fill="#34170A" d={initialPath} className="translate-x-[1px]" style={{ opacity: 0 }} />
        </svg>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative z-10 h-full w-full flex flex-col justify-center items-center pointer-events-auto text-[#FFF2E0] px-6"
        >
          <button onClick={onClose} className="absolute top-10 right-10 p-2 text-[#FFF2E0] opacity-40 hover:opacity-100 hover:rotate-90 transition-all duration-500">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full flex flex-col items-center justify-center">
            {/* Use frozenUser and wasAuthenticated to keep UI stable during close */}
            {wasAuthenticated && frozenUser && (
              <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
                <div className="p-1 rounded-full border border-[#B55500] mb-3">
                  {frozenUser.avatar && !avatarError ? (
                    <img
                      src={frozenUser.avatar}
                      alt={frozenUser.name}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#34170A] text-[#FFF2E0] font-serif font-medium flex items-center justify-center text-lg md:text-xl select-none">
                      {frozenUser.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <p className="text-[11px] tracking-widest font-bold text-[#B55500] uppercase">{frozenUser.name}</p>
                {!menuConfig.isStandard && <p className="text-[8px] opacity-30 tracking-widest uppercase mt-1">Active Session</p>}
              </motion.div>
            )}

            <motion.p variants={itemVariants} className="text-[9px] tracking-[0.5em] uppercase opacity-20 text-center mb-8">
              {menuConfig.isStandard ? 'Menu' : 'Playground'}
            </motion.p>

            <div className="flex flex-col items-center space-y-5 text-center">
              {menuConfig.items.map((item) => (
                <motion.div key={item.label} variants={itemVariants} className="group">
                  <Link to={item.path} onClick={onClose}>
                    <h2 className="font-light tracking-tight group-hover:italic group-hover:text-[#B55500] transition-all duration-300 text-xl md:text-2xl">
                      {item.label}
                    </h2>
                  </Link>
                </motion.div>
              ))}

              <motion.div variants={itemVariants} className="pt-4 group">
                {wasAuthenticated ? (
                  <button 
                    onClick={handleLogout} 
                    className="text-xs opacity-40 font-light tracking-[0.2em] uppercase hover:text-[#B55500] transition-all duration-300"
                  >
                    Logout
                  </button>
                ) : (
                  <Link to="/login" onClick={onClose}>
                    <h2 className="text-xs opacity-40 font-light tracking-[0.2em] uppercase hover:text-[#B55500] transition-all duration-300">Sign in</h2>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SideMenu = ({ isOpen, onClose }) => (
  <AnimatePresence mode="wait">
    {isOpen && <SideMenuContent onClose={onClose} key="side-menu-content" />}
  </AnimatePresence>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [navAvatarError, setNavAvatarError] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  useEffect(() => {
    setIsHidden(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-full p-8 md:p-12 flex justify-between items-center z-[100] pointer-events-none"
      >
        <div className="overflow-hidden pointer-events-auto">
          <Link to="/">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="whitespace-nowrap"
            >
              <span className="text-xl md:text-2xl font-medium tracking-tighter text-[#B55500]">
                NexAgent
              </span>
            </motion.div>
          </Link>
        </div>

        <div className="flex items-center gap-6 pointer-events-auto">
          {isAuthenticated && user && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden md:block">
              {user.avatar && !navAvatarError ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  onError={() => setNavAvatarError(true)}
                  className="w-10 h-10 rounded-full border border-[#B55500]/30 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border border-[#B55500]/30 bg-[#34170A] text-[#FFF2E0] font-serif font-medium flex items-center justify-center text-sm select-none">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-1.5 cursor-pointer h-8 group">
              <motion.div className="w-[1px] bg-[#B55500]" animate={{ height: isMenuOpen ? 0 : 20 }} />
              <motion.div className="w-[1px] bg-[#B55500]" animate={{ height: isMenuOpen ? 0 : 28 }} />
            </button>
          </motion.div>
        </div>
      </motion.nav>
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Navbar;