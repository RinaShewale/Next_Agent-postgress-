import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { useTerminal } from '../../hooks/useTerminal';
import { 
  Terminal as TermIcon, Trash2, RefreshCw, Copy, 
  Search, ArrowDown, Wifi, WifiOff, Clock, ShieldCheck
} from 'lucide-react';

import 'xterm/css/xterm.css';

const THEME = {
  background: '#FDF3E4',
  foreground: '#34170A',
  cursor: '#A35100',
  selectionBackground: 'rgba(163, 81, 0, 0.2)',
  black: '#34170A',
  red: '#A35100',
  green: '#435334',
  yellow: '#854200',
  blue: '#2C3E50',
  magenta: '#5D3891',
  cyan: '#0E8388',
  white: '#FDF3E4',
};

export default function TerminalPanel({ agentUrl }) {
  const termRef = useRef(null);
  const xterm = useRef(null);
  const containerRef = useRef(null);
  const searchAddon = useRef(new SearchAddon());
  const fitAddon = useRef(new FitAddon());
  
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [uptime, setUptime] = useState('00:00:00');

  const { connected, sendCommand, reconnect } = useTerminal(agentUrl, { 
    onOutput: (data) => xterm.current?.write(data) 
  });

  // Uptime Counter
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!termRef.current || xterm.current) return;

    // ── FIXED CONSTRUCTOR ──
    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 13,
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      theme: THEME,
      allowTransparency: true,
      scrollback: 5000,
      allowProposedApi: true, // <─── ADD THIS LINE TO FIX THE ERROR
    });

    // Load Addons
    term.loadAddon(fitAddon.current);
    term.loadAddon(new WebLinksAddon());
    term.loadAddon(searchAddon.current);
    
    // Unicode 11 handling
    const unicode11Addon = new Unicode11Addon();
    term.loadAddon(unicode11Addon);
    term.unicode.activeVersion = '11';

    term.open(termRef.current);
    xterm.current = term;

    // Initial Fit
    setTimeout(() => fitAddon.current.fit(), 100);

    // Events
    term.onScroll(() => {
      const buffer = term.buffer.active;
      setIsScrolledUp(buffer.viewportY < buffer.baseY - 2);
    });

    term.onData(data => {
      if (connected) sendCommand(data);
    });

    const resizeObserver = new ResizeObserver(() => fitAddon.current.fit());
    resizeObserver.observe(containerRef.current);

    term.writeln('\x1b[33m⚡ VISION SYSTEM CORE v2.0.4\x1b[0m');
    term.writeln('\x1b[2mConnection status: encrypted\x1b[0m\r\n');

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      xterm.current = null;
    };
  }, [connected, sendCommand]);

  const copyToClipboard = () => {
    const text = xterm.current?.getSelection();
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#FDF3E4] overflow-hidden border border-[#A35100]/20 shadow-xl rounded-lg">
      
      {/* Header */}
      <div className="h-12 px-5 flex items-center justify-between bg-[#f5eadc] border-b border-[#A35100]/10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-green-700" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#34170A]/60">Secure Shell</span>
          </div>
          <div className="flex items-center gap-2 text-[#34170A]/40">
            <Clock size={12} />
            <span className="text-[10px] font-mono">{uptime}</span>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-2 py-1 rounded border ${connected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[9px] font-bold uppercase text-[#34170A]/70">{connected ? 'Connected' : 'Offline'}</span>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-[#efe4d4] border-b border-[#A35100]/10 flex items-center gap-3">
          <Search size={14} className="text-[#A35100]" />
          <input 
            autoFocus
            placeholder="Search logs..."
            className="bg-transparent border-none outline-none text-xs w-full text-[#34170A] font-mono"
            onChange={(e) => searchAddon.current.findNext(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setShowSearch(false)}
          />
          <button onClick={() => setShowSearch(false)} className="text-[10px] uppercase font-bold text-[#A35100]/40">Close</button>
        </div>
      )}

      {/* Terminal View */}
      <div className="flex-1 relative group">
        <div ref={termRef} className="w-full h-full" />

        {isScrolledUp && (
          <button 
            onClick={() => xterm.current?.scrollToBottom()}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-[#A35100] text-white rounded-full shadow-2xl text-xs font-bold z-20 hover:scale-105 transition-transform"
          >
            <ArrowDown size={14} />
            Jump to Present
          </button>
        )}

        <div className="absolute right-3 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <SideButton onClick={() => setShowSearch(!showSearch)} icon={<Search size={14} />} />
          <SideButton onClick={copyToClipboard} icon={<Copy size={14} />} />
          <SideButton onClick={() => xterm.current?.clear()} icon={<Trash2 size={14} />} />
          <SideButton onClick={reconnect} icon={<RefreshCw size={14} />} />
        </div>
      </div>

      <style jsx global>{`
        .xterm-viewport::-webkit-scrollbar { width: 8px; }
        .xterm-viewport::-webkit-scrollbar-thumb { 
          background: rgba(163, 81, 0, 0.15); 
          border-radius: 4px;
          border: 2px solid #A35100;
        }
        .xterm-screen { padding: 12px; }
      `}</style>
    </div>
  );
}

function SideButton({ onClick, icon }) {
  return (
    <button 
      onClick={onClick}
      className="p-2 bg-[#FDF3E4] border border-[#A35100]/20 text-[#A35100] rounded-lg shadow-sm hover:bg-[#A35100] hover:text-white transition-all active:scale-90"
    >
      {icon}
    </button>
  );
}