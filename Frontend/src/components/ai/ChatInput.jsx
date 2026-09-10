import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div className="w-full">
      <div className={`
        relative bg-[#fdf9f3] border rounded-[1.5rem] shadow-2xl shadow-[#34170A]/5 transition-all duration-300 overflow-hidden
        ${disabled ? 'border-[#A35100]/10 opacity-80' : 'border-[#A35100]/15 hover:border-[#A35100]/25 focus-within:border-[#A35100]/40'}
      `}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Describe your vision..."
          className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 text-base p-6 pb-2 text-[#34170A] placeholder-[#A35100]/25 resize-none min-h-[70px]"
          rows={1}
        />
        
        <div className="flex items-center justify-between px-6 pb-5">
          <div className="flex items-center gap-2">
            {/* Seamless Status Pulse */}
            <motion.div 
              animate={disabled ? { opacity: [0.3, 1, 0.3] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`w-1.5 h-1.5 rounded-full ${disabled ? 'bg-[#A35100]' : 'bg-[#A35100]/20'}`} 
            />
            <span className="text-[10px] font-black text-[#A35100]/40 uppercase tracking-[0.2em]">
              {disabled ? 'Synthesizing...' : 'System Ready'}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className={`relative flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all overflow-hidden ${
              value.trim() && !disabled 
                ? 'bg-[#34170A] text-[#FDF3E4] shadow-lg' 
                : 'bg-[#34170A]/5 text-[#34170A]/20 cursor-not-allowed'
            }`}
          >
            {disabled ? (
              // Minimalist bar loader inside button
              <div className="flex gap-1 h-3 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [2, 10, 2] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                    className="w-0.5 bg-[#FDF3E4]"
                  />
                ))}
              </div>
            ) : (
              <Send size={12} />
            )}
            <span>{disabled ? 'Processing' : 'Process'}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}