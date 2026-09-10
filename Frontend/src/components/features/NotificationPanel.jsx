import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function NotificationPanel({ onClose }) {
  const notes = [
    { id: 1, title: 'Synthesis Complete', body: 'The neural engine has rendered your spatial deck.', time: 'Just now', icon: <Sparkles /> },
    { id: 2, title: 'Node Verified', body: 'Security protocol 4.0 successfully applied.', time: '12m ago', icon: <CheckCircle2 /> },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#34170A]/10 z-[90] backdrop-blur-sm" />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#FDF3E4] border-l border-[#A35100]/10 z-[100] shadow-2xl p-8"
      >
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-serif italic text-[#34170A]">Dialogue</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#A35100]/10 rounded-full"><X size={20}/></button>
        </div>

        <div className="space-y-4">
          {notes.map(n => (
            <div key={n.id} className="p-6 bg-white border border-[#A35100]/5 rounded-[24px] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2 text-[#A35100]">
                {n.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{n.title}</span>
              </div>
              <p className="text-sm font-serif italic text-[#34170A]/60">{n.body}</p>
              <p className="mt-4 text-[9px] font-bold text-[#34170A]/20 uppercase">{n.time}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}