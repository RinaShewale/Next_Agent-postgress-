import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Zap } from 'lucide-react';

export default function SearchOverlay({ onClose }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#34170A]/30 backdrop-blur-xl flex items-start justify-center pt-[15vh] px-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }}
        className="w-full max-w-2xl bg-[#FDF3E4] rounded-[32px] shadow-2xl overflow-hidden border border-[#A35100]/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center p-8 border-b border-[#A35100]/5">
          <Search className="text-[#A35100]" size={24} />
          <input 
            autoFocus 
            placeholder="Search nodes, projects, or assets..." 
            className="flex-1 bg-transparent border-none outline-none px-6 text-2xl font-serif italic text-[#34170A]"
          />
          <kbd className="px-3 py-1 bg-[#A35100]/5 rounded text-[10px] font-black text-[#A35100]/40">ESC</kbd>
        </div>
        
        <div className="p-4 bg-[#EBE0CF]/20">
          <p className="px-6 py-3 text-[9px] font-black text-[#A35100]/40 uppercase tracking-widest">Recent Architectures</p>
          {['Brutalist Dashboard', 'Cyberpunk Gallery', 'Zen Workspace'].map(item => (
            <button key={item} className="w-full flex items-center justify-between px-6 py-4 hover:bg-white rounded-2xl transition-all group">
              <div className="flex items-center gap-4">
                <Zap size={14} className="text-[#A35100]/40" />
                <span className="text-sm font-bold uppercase tracking-tight">{item}</span>
              </div>
              <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-[#A35100]" />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}