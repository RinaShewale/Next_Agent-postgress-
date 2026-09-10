import React, { useEffect, useRef } from 'react';
import useSandboxStore from '../../store/sandboxStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Cpu, ChevronLeft } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useAIStream } from '../../hooks/useAIStream';
import { useAuth } from '../../hooks/useAuth'; // Added import

export default function AIChat({ sandboxID, onBuildComplete, onClose, isMobileView = false }) {
  const { messages, streaming, sendMessage, clearChat } = useAIStream(sandboxID);
  const { initialPrompt, setInitialPrompt } = useSandboxStore();
  const { user } = useAuth(); // Get user data
  const bottomRef = useRef(null);
  const prevStreaming = useRef(streaming);
  const autoSentRef = useRef(false);

  useEffect(() => {
    if (sandboxID && initialPrompt && !autoSentRef.current && !streaming) {
      autoSentRef.current = true;
      setInitialPrompt('');
      sendMessage(initialPrompt);
    }
  }, [sandboxID, initialPrompt, streaming, sendMessage, setInitialPrompt]);

  useEffect(() => {
    if (prevStreaming.current === true && streaming === false) {
      if (onBuildComplete) onBuildComplete();
    }
    prevStreaming.current = streaming;
  }, [streaming, onBuildComplete]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  return (
    <div className="flex flex-col h-full bg-[#EBE0CF] relative text-[#34170A] font-sans overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {!isMobileView ? (
        <header className="h-20 px-6 md:px-8 border-b border-[#A35100]/10 flex items-center justify-between bg-[#FDF3E4]/60 backdrop-blur-md z-20 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-[#A35100] shadow-[0_0_10px_rgba(163,81,0,0.5)]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none mb-1">System Agent</span>
              <span className="text-base font-serif italic leading-none">Collective Intelligence</span>
            </div>
          </div>
        </header>
      ) : (
        <header className="h-14 flex items-center justify-between px-4 border-b border-[#A35100]/10 bg-[#FDF3E4]/40 flex-shrink-0">
           <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-2 -ml-2 text-[#A35100]">
               <ChevronLeft size={24} />
             </button>
             <div className="flex items-center gap-2">
               <Cpu size={14} className="text-[#A35100]" />
               <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Vision Architect</span>
             </div>
           </div>
           <button onClick={clearChat} className="text-[10px] font-bold uppercase text-red-600/50 px-2 py-1">
             Clear
           </button>
        </header>
      )}

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 hide-scrollbar">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-20"
              >
                <Command className="mb-4 text-[#A35100]" size={32} />
                <h3 className="text-xl font-serif italic">State your architectural intent</h3>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <ChatMessage 
                     key={msg.id || i} 
                     user={user} // Pass user down
                     message={{ ...msg, streaming: streaming && i === messages.length - 1 && msg.role === 'ai' }} 
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-20 flex-shrink-0" />
        </div>
      </div>

      <div className={`
        flex-shrink-0 w-full px-4 z-30
        ${isMobileView ? 'pb-28 pt-2' : 'pb-8 pt-4'} 
        bg-gradient-to-t from-[#EBE0CF] via-[#EBE0CF] to-transparent
      `}>
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={sendMessage} disabled={streaming} isMobile={isMobileView} />
        </div>
      </div>
    </div>
  );
}