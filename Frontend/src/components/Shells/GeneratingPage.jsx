import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSandboxStore from '../../store/sandboxStore';
import { Loader2, Zap } from 'lucide-react';

export default function GeneratingPage() {
  const [progress, setProgress] = useState(0);
  const { status, initialPrompt } = useSandboxStore();

  // --- ADDED TO FIX THE SCROLLBAR ---
  useEffect(() => {
    // Force the body and html to hide scrollbars immediately on mount
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      // Clean up/Allow scrolling again when leaving this page
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);
  // ----------------------------------
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (status === 'ready') return 100;
        const increment = p < 50 ? 0.8 : p < 85 ? 0.2 : 0.05;
        return Math.min(p + increment, 98);
      });
    }, 60);
    return () => clearInterval(interval);
  }, [status]);

  const steps = ["Architecting Workspace", "Calibrating Neural Nodes", "Synthesizing Interface", "Finalizing Environment"];
  const currentStepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
  const currentStep = steps[currentStepIndex];

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#FDF3E4] text-[#34170A] flex flex-col items-center justify-center overflow-hidden z-[100]">
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dvwthyt94/image/upload/v1672322316/noise_yvsk9m.png')` }}
        />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex flex-col items-center w-full max-w-3xl px-6">
        <div className="flex items-center gap-3 mb-16">
          <Loader2 className="w-5 h-5 text-[#A35100] animate-spin" />
          <span className="text-[11px] uppercase tracking-[0.6em] font-black text-[#A35100]">System Synthesis</span>
        </div>

        <div className="h-40 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.h2 
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-4xl md:text-7xl font-serif italic"
            >
              {currentStep}
            </motion.h2>
          </AnimatePresence>
        </div>

        <div className="w-full max-w-md mt-20">
          <div className="relative h-[2px] w-full bg-[#A35100]/10 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-[#A35100]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#A35100]/40 uppercase">Phase {currentStepIndex + 1}/4</span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#A35100] uppercase">{Math.floor(progress)}%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}