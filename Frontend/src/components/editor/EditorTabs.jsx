import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function EditorTabs({ openFiles, activeFile, onSelect, onClose }) {
  return (
    <div className="flex items-center bg-[#FDF3E4]/80 backdrop-blur-md border-b border-[#A35100]/20 overflow-x-auto h-11 md:h-12 no-scrollbar scroll-smooth">
      <AnimatePresence mode="popLayout">
        {openFiles.map((file) => {
          const name = file.path.split('/').pop();
          const isActive = file.path === activeFile;

          return (
            <motion.div
              key={file.path}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => onSelect(file.path)}
              className={`
                group relative flex items-center gap-2 md:gap-3 px-3 md:px-6 h-full cursor-pointer 
                transition-all border-r border-[#A35100]/10 min-w-fit select-none
                ${isActive ? 'bg-white' : 'hover:bg-white/50'}
              `}
            >
              <span className={`
                text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] transition-colors whitespace-nowrap
                ${isActive ? 'text-[#A35100]' : 'text-[#A35100]/50'}
              `}>
                {name}
              </span>

              {file.isDirty && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#A35100] shrink-0" />
              )}

              <button 
                onClick={(e) => { e.stopPropagation(); onClose(file.path); }} 
                className={`p-1 rounded-full transition-opacity shrink-0 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <X size={12} className="text-[#A35100]/40 hover:text-red-500" />
              </button>

              {isActive && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] md:h-[3px] bg-[#A35100]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}