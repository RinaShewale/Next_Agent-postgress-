import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Image as ImageIcon, Plus, ArrowRight, Zap } from 'lucide-react';

export default function HeroSection({ prompt, setPrompt, onGenerate, error }) {
  // Theme Colors
  const theme = {
    bg: "#FDF3E4",
    accent: "#A35100",
    text: "#34170A",
    inputBg: "#EBE0CF"
  };

  return (
    <div className="flex flex-col items-center max-w-4xl w-full px-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A35100]/5 border border-[#A35100]/10 text-[#A35100] text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
          <Zap size={12} className="fill-[#A35100]" />
          <span>Nexx Engine v4.0 Active</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-serif italic tracking-tight text-[#34170A] mb-4">
          Vision into <span className="opacity-40">Interface.</span>
        </h1>
        <p className="text-[#34170A]/60 font-medium tracking-wide uppercase text-[11px]">
          Describe your idea. Nexus handles the architecture.
        </p>
      </motion.div>

      <div className="w-full max-w-3xl relative">
        <div 
          className="rounded-[32px] p-2 shadow-2xl transition-all border"
          style={{ backgroundColor: theme.inputBg, borderColor: 'rgba(163, 81, 0, 0.1)' }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe an interface (e.g., 'A minimalist crypto wallet with glassmorphism'...)"
            className="w-full bg-transparent border-none outline-none p-6 text-xl text-[#34170A] placeholder-[#34170A]/30 resize-none h-40 custom-scrollbar font-light italic"
          />
          
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <IconButton icon={<Mic size={18}/>} />
              <IconButton icon={<ImageIcon size={18}/>} />
              <IconButton icon={<Plus size={18}/>} />
            </div>

            <button 
              onClick={onGenerate}
              className="flex items-center gap-4 text-[#FDF3E4] pl-8 pr-3 py-3 rounded-full font-black uppercase tracking-[0.2em] transition-all active:scale-95 group shadow-lg"
              style={{ backgroundColor: theme.accent }}
            >
              <span className="text-[10px]">Initialize Studio</span>
              <div className="bg-[#FDF3E4]/20 p-2 rounded-full group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </div>
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-max text-[#A35100] text-[10px] font-bold uppercase tracking-widest bg-[#A35100]/5 px-6 py-2 rounded-full border border-[#A35100]/20 shadow-sm"
            >
              Error: {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-16 flex gap-4 flex-wrap justify-center">
        {['E-commerce App', 'Portfolio', 'AI Dashboard'].map((hint) => (
          <button 
            key={hint} 
            onClick={() => setPrompt(hint)}
            className="px-6 py-2 rounded-full border border-[#A35100]/10 text-[#A35100]/40 text-[10px] font-black uppercase tracking-widest hover:border-[#A35100]/40 hover:text-[#A35100] transition-all"
          >
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
}

const IconButton = ({ icon }) => (
  <button className="p-3 text-[#A35100]/30 hover:text-[#A35100] hover:bg-[#A35100]/5 rounded-full transition-all">
    {icon}
  </button>
);