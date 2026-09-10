import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useSandboxStore from '../../store/sandboxStore';
import { useSandbox } from '../../hooks/useSandbox';
import { ArrowRight, Terminal, Sparkles } from 'lucide-react';

// Enhanced Animation Settings
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 80, damping: 20 } 
  }
};

export default function LandingPage() {
  const { error, setError, setInitialPrompt } = useSandboxStore();
  const { triggerStartSandbox } = useSandbox();
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent scrolling on the landing page
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleStartGenerate = () => {
    if (!prompt.trim()) return;
    setError(null);
    setInitialPrompt(prompt);
    triggerStartSandbox(prompt);
    navigate('/shell');
  };

  const suggestions = ["SaaS Dashboard", "AI Portfolio", "Crypto Tracker"];

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#FDF3E4] text-[#34170A] flex flex-col items-center justify-center overflow-hidden z-50">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dvwthyt94/image/upload/v1672322316/noise_yvsk9m.png')` }}
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] right-[-5%] w-[100vw] md:w-[70vw] h-[100vw] md:h-[70vw] bg-[#A35100] rounded-full blur-[80px] md:blur-[120px]" 
        />
      </div>

      <main className="relative z-10 w-full max-w-5xl px-5 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A35100]/5 border border-[#A35100]/10 mb-6 md:mb-8">
            <Sparkles size={10} className="text-[#A35100]" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-[#A35100]">Neural Engine V2</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-[100px] font-light tracking-tighter mb-4 md:mb-6 leading-[1.1] md:leading-[0.9] text-[#34170A]"
          >
            Build your vision <br />
            <span className="italic font-serif text-[#A35100]">in seconds.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="max-w-md md:max-w-lg mx-auto text-[#34170A]/50 text-base md:text-xl font-light mb-8 md:mb-12"
          >
            Deploy high-performance applications and autonomous workflows 
            using only natural language.
          </motion.p>

          <motion.div variants={itemVariants} className="relative max-w-3xl mx-auto w-full group">
            <div className="relative flex items-center p-1 md:p-1.5 bg-white/40 backdrop-blur-2xl border border-[#A35100]/10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(163,81,0,0.1)] transition-all duration-500 focus-within:bg-white/70 focus-within:shadow-[0_30px_60px_-15px_rgba(163,81,0,0.15)]">
              
              <div className="hidden sm:block pl-6 pr-2 text-[#A35100]/40 group-focus-within:text-[#A35100] transition-colors">
                <Terminal size={20} strokeWidth={1.5} />
              </div>

              {/* INPUT BOX */}
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartGenerate()}
                placeholder="Describe your app..."
                className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none px-4 md:px-2 py-4 md:py-6 text-[#34170A] placeholder:text-[#34170A]/30 text-base md:text-xl font-light"
                style={{ outline: 'none', boxShadow: 'none' }}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartGenerate}
                className="group/btn flex items-center gap-2 px-5 md:px-8 py-3 md:py-4 bg-[#34170A] hover:bg-[#A35100] text-white rounded-[1.5rem] md:rounded-[1.8rem] transition-all duration-300 font-medium whitespace-nowrap shadow-lg text-sm md:text-base mr-1"
              >
                <span className="hidden xs:inline">Generate</span>
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </motion.button>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 md:mt-10">
              {suggestions.map((item) => (
                <motion.button
                  key={item}
                  variants={itemVariants}
                  whileHover={{ y: -2, backgroundColor: 'rgba(163, 81, 0, 1)', color: '#fff' }}
                  onClick={() => setPrompt(item)}
                  className="px-4 md:px-6 py-2 rounded-full border border-[#34170A]/5 bg-[#34170A]/5 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-[#34170A]/40 transition-all duration-300"
                >
                  + {item}
                </motion.button>
              ))}
            </div>
            
            <div className="h-4 mt-6">
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="text-[#A35100] text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}