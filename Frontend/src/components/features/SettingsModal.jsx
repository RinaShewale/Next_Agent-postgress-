import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Monitor, CreditCard, User } from 'lucide-react';

export default function SettingsModal({ onClose }) {
  const [tab, setTab] = useState('profile');

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#34170A]/40 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="w-full max-w-5xl h-[650px] bg-[#FDF3E4] rounded-[40px] flex overflow-hidden border border-[#A35100]/20 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Nav */}
        <div className="w-64 bg-[#EBE0CF]/40 border-r border-[#A35100]/10 p-10 hidden md:flex flex-col">
          <h3 className="text-xl font-serif italic mb-10">Studio</h3>
          <div className="space-y-4">
            <TabBtn active={tab === 'profile'} onClick={() => setTab('profile')} icon={<User size={16}/>} label="Identity" />
            <TabBtn active={tab === 'appearance'} onClick={() => setTab('appearance')} icon={<Monitor size={16}/>} label="Visuals" />
            <TabBtn active={tab === 'security'} onClick={() => setTab('security')} icon={<Shield size={16}/>} label="Security" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-12 overflow-y-auto relative bg-white/40">
          <button onClick={onClose} className="absolute top-8 right-8 text-[#A35100]/40 hover:text-[#A35100]"><X/></button>
          
          <div className="max-w-xl">
            <h4 className="text-4xl font-serif italic text-[#34170A] mb-8 capitalize">{tab}</h4>
            
            <div className="space-y-8">
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#A35100]">System Name</label>
                 <input className="w-full bg-white border border-[#A35100]/10 p-4 rounded-2xl outline-none focus:border-[#A35100]/40 font-serif italic" defaultValue="Nexus Architect" />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#A35100]">Neural Access Key</label>
                 <input className="w-full bg-white/50 border border-[#A35100]/10 p-4 rounded-2xl outline-none text-[#34170A]/40 font-mono text-xs" readOnly defaultValue="key_nx_9921_00x" />
               </div>
               <button className="px-8 py-4 bg-[#34170A] text-[#FDF3E4] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#A35100] transition-colors">
                 Save Configurations
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TabBtn({ active, label, icon, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-white text-[#A35100] shadow-sm' : 'text-[#34170A]/40 hover:text-[#34170A]'}`}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}