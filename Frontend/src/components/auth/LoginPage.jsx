import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import useAuth from '../../hooks/useAuth';

export default function LoginPage({ onCancel }) {
  const { loginWithGoogle, loading, user, isAuthenticated, logout } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const cardRef = useRef(null);
  const glowRef1 = useRef(null);
  const glowRef2 = useRef(null);

  // Framer Motion values for Mouse Parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smoothing the mouse movement
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(glowRef1.current, { 
      x: '+=40', y: '+=20', rotation: 5, duration: 10, ease: "sine.inOut" 
    });
    tl.to(glowRef2.current, { 
      x: '-=30', y: '-=50', rotation: -5, duration: 12, ease: "sine.inOut" 
    }, 0);

    return () => tl.kill();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen w-full bg-[#FDF3E4] text-[#A35100] flex flex-col font-sans antialiased overflow-hidden selection:bg-[#A35100] selection:text-[#FDF3E4]"
    >
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div ref={glowRef1} className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#A35100]/10 rounded-full blur-[120px]" />
        <div ref={glowRef2} className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-[#A35100]/[0.08] rounded-full blur-[120px]" />
        
        {/* Subtle Floating Shapes */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-32 h-32 border border-[#A35100]/5 rounded-full" 
        />
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/3 w-48 h-48 border border-[#A35100]/5 rounded-3xl" 
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.div 
          style={{ perspective: 1200 }}
          className="w-full max-w-[420px]"
        >
          {/* Header Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <motion.span variants={itemVariants} className="text-[10px] uppercase tracking-[0.6em] mb-4 block font-bold opacity-40">
              Identity Verification
            </motion.span>
            <motion.h1 variants={itemVariants} className="text-5xl font-serif italic tracking-tighter mb-4">
              {isAuthenticated ? "Welcome back" : "The Studio"}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-[#A35100]/60 text-sm leading-relaxed max-w-[280px] mx-auto">
              {isAuthenticated ? "Your workspace is ready." : "Access your autonomous agent orchestration suite."}
            </motion.p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            ref={cardRef}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative bg-[#FDF3E4]/50 border border-[#A35100]/10 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-[0_30px_100px_-20px_rgba(163,81,0,0.12)]"
          >
            {/* Card Inner Sheen */}
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
              <div className="absolute top-[-150%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/20 via-transparent to-transparent rotate-45" />
            </div>

            <AnimatePresence mode="wait">
              {isAuthenticated && user ? (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -inset-2 border border-[#A35100]/10 rounded-full" 
                      />
                      <img
                        src={user.avatar || 'https://via.placeholder.com/64'}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-full border-2 border-[#A35100]/20 p-1 object-cover"
                        alt="User"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif italic text-xl">{user.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest opacity-40">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={onCancel}
                      className="w-full py-4 rounded-2xl bg-[#A35100] text-[#FDF3E4] font-bold text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-[#A35100]/20 hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
                    >
                      Resume Session
                    </button>
                    <button
                      onClick={logout}
                      className="w-full py-4 rounded-2xl border border-[#A35100]/10 text-[#A35100]/50 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                    >
                      Disconnect
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="non-auth"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsRedirecting(true);
                      loginWithGoogle();
                    }}
                    disabled={loading || isRedirecting}
                    className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#A35100] text-[#FDF3E4] transition-all overflow-hidden"
                  >
                    {/* Magnetic Button Shine */}
                    <motion.div 
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                    />

                    {isRedirecting ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 bg-white rounded-full p-1" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Continue with Google</span>
                      </div>
                    )}
                  </motion.button>

                  <p className="text-[9px] text-center text-[#A35100]/40 leading-loose px-4">
                    By accessing the studio, you acknowledge our <span className="underline cursor-pointer">Security Protocols</span> and <span className="underline cursor-pointer">Usage Agreement</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-10 flex flex-col items-center gap-4">
        <div className="w-12 h-[1px] bg-[#A35100]/10" />
        <div className="flex gap-8 text-[9px] uppercase tracking-[0.3em] font-bold text-[#A35100]/30">
          <a href="#" className="hover:text-[#A35100] transition-colors">Documentation</a>
          <a href="#" className="hover:text-[#A35100] transition-colors">System Status</a>
          <a href="#" className="hover:text-[#A35100] transition-colors">v2.0.4</a>
        </div>
      </footer>

      {/* Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] contrast-150"
        style={{ backgroundImage: `url('https://res.cloudinary.com/dvwthyt94/image/upload/v1672322316/noise_yvsk9m.png')` }}
      />
    </div>
  );
}