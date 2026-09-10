import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Tablet, Smartphone, RotateCw, ExternalLink, Globe, Loader2 } from 'lucide-react';

export default function PreviewPanel({ previewUrl, buildVersion }) {
  const [device, setDevice] = useState('desktop');
  const [reloadKey, setReloadKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Adjusted widths to use max-width logic
  const widths = { 
    desktop: '100%', 
    tablet: '768px', 
    mobile: '375px' 
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setReloadKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  }, []);

  useEffect(() => {
    if (buildVersion > 0) {
      setIsRefreshing(true);
      const timer = setTimeout(() => {
        setReloadKey((k) => k + 1);
        setIsRefreshing(false);
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [buildVersion]);

  const iframeSrc = previewUrl
    ? `${previewUrl}${previewUrl.includes('?') ? '&' : '?'}_v=${reloadKey}`
    : null;

  return (
    <div className="flex flex-col h-full w-full bg-[#EBE0CF]/20 overflow-hidden">
      
      {/* 1. TOP NAVBAR: Responsive padding and layout */}
      <div className="h-14 md:h-16 px-3 md:px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-[#A35100]/10 shrink-0 z-30">
        
        {/* Device Switcher: Compact on mobile */}
        <div className="flex items-center gap-1 md:gap-2 bg-[#FDF3E4] p-1 rounded-xl border border-[#A35100]/10 shadow-sm">
          <DeviceBtn active={device === 'desktop'} onClick={() => setDevice('desktop')} icon={<Monitor size={14} />} />
          <DeviceBtn active={device === 'tablet'} onClick={() => setDevice('tablet')} icon={<Tablet size={14} />} />
          <DeviceBtn active={device === 'mobile'} onClick={() => setDevice('mobile')} icon={<Smartphone size={14} />} />
        </div>

        {/* URL Bar: Hidden on very small screens, or truncated */}
        <div className="hidden sm:flex flex-1 max-w-lg mx-3 md:mx-6 items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-white border border-[#A35100]/10 rounded-full shadow-inner overflow-hidden">
          <Globe size={12} className="text-[#A35100]/40 shrink-0" />
          <span className="flex-1 text-[10px] font-mono text-[#34170A]/40 truncate">
            {previewUrl || 'connecting...'}
          </span>
          <button onClick={() => previewUrl && window.open(previewUrl, '_blank')} className="shrink-0">
            <ExternalLink size={12} className="text-[#A35100]/30 hover:text-[#A35100]" />
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className={`p-2 md:p-2.5 rounded-xl transition-all ${isRefreshing ? 'bg-[#A35100] text-white' : 'text-[#A35100]/40 hover:bg-[#A35100]/5'}`}
        >
          <RotateCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. DEVICE AREA: Uses max-width to ensure it never overflows parent */}
      <div className="flex-1 w-full flex justify-center items-center p-4 md:p-10 overflow-hidden bg-transparent no-scrollbar">
        <motion.div 
          initial={false}
          animate={{ 
            width: widths[device],
            // Ensure width never exceeds 100% of the viewport minus padding
            maxWidth: '100%',
            height: '100%' 
          }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className={`
            bg-black relative shadow-2xl overflow-hidden no-scrollbar
            /* Larger borders and rounding on desktop, smaller on mobile */
            rounded-[2rem] md:rounded-[2.5rem] 
            border-[6px] md:border-[8px] border-[#34170A]
            shadow-[0_20px_50px_-12px_rgba(52,23,10,0.2)] md:shadow-[0_40px_100px_-20px_rgba(52,23,10,0.3)]
          `}
        >
          {iframeSrc ? (
            <iframe
              key={reloadKey}
              src={iframeSrc}
              className="w-full h-full border-none bg-white no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              title="Vision Preview"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#111]">
              <Loader2 className="animate-spin text-white/20 mb-3" size={24} />
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Connecting</p>
            </div>
          )}
          
          {/* Refresh Overlay */}
          <AnimatePresence>
            {isRefreshing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50"
              >
                 <div className="bg-white text-[#34170A] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                   <Loader2 size={12} className="animate-spin" />
                   Updating
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function DeviceBtn({ active, onClick, icon }) {
  return (
    <button 
      onClick={onClick} 
      className={`
        p-1.5 md:p-2 rounded-lg transition-all 
        ${active ? 'bg-[#A35100] text-white shadow-sm' : 'text-[#A35100]/40 hover:bg-[#A35100]/5'}
      `}
    >
      {React.cloneElement(icon, { size: 14 })}
    </button>
  );
}