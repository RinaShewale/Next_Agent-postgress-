import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

export default function TopNav({ onSearch, onNotify, onMenuClick, activeTab }) {
  return (
    <header className="flex items-center justify-between px-10 h-24 border-b border-[#A35100]/10 bg-[#FDF3E4]/80 backdrop-blur-xl">
      <div className="flex items-center gap-6">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-[#A35100]">
          <Menu size={24} />
        </button>
        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#34170A]">{activeTab}</span>
      </div>
      
      <div className="flex items-center gap-8">
        <button 
          onClick={onSearch} 
          className="flex items-center gap-12 px-6 py-2 border border-[#A35100]/10 rounded-full text-[#34170A]/30 hover:border-[#A35100]/40 transition-all text-[11px] font-bold"
        >
          <span className="uppercase tracking-widest">Global Search</span>
          <kbd className="opacity-20 font-sans">⌘K</kbd>
        </button>

        <button onClick={onNotify} className="relative text-[#A35100]/40 hover:text-[#A35100] transition-colors">
          <Bell size={20} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#A35100] rounded-full shadow-[0_0_8px_#A35100]" />
        </button>
      </div>
    </header>
  );
}