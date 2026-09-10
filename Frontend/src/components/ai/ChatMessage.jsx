import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, User, Copy, Check, ChevronDown, ChevronRight, FileJson, FileCode, CheckCircle2, Wrench } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ProcessingIndicator = () => (
  <div className="flex items-center gap-1.5 py-4 ml-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        className="w-1.5 h-1.5 rounded-full bg-[#A35100]"
      />
    ))}
    <span className="ml-2 text-[11px] font-serif italic text-[#A35100]/60">Drafting architecture...</span>
  </div>
);

const ActionHistory = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const files = content.split(/[\n,]+/).filter(f => f.includes('.') || f.includes('/')).map(f => f.trim());
  if (files.length === 0) return null;

  return (
    <div className="w-full my-6 rounded-2xl border border-[#A35100]/10 bg-[#FDF3E4]/30 overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#34170A]/5 hover:bg-[#34170A]/10 transition-colors"
      >
        <div className="flex items-center gap-3 text-[#34170A]">
          <Wrench size={14} className="opacity-40" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Manifest & Build History</span>
        </div>
        {isExpanded ? <ChevronDown size={16} className="opacity-40"/> : <ChevronRight size={16} className="opacity-40"/>}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between group py-1.5">
                    <div className="flex items-center gap-3">
                      {file.endsWith('.json') ? <FileJson size={14} className="text-[#A35100]/40" /> : <FileCode size={14} className="text-[#A35100]/40" />}
                      <span className="text-[13px] font-mono text-[#34170A]/70">{file}</span>
                    </div>
                    <CheckCircle2 size={14} className="text-green-600/60" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-[#A35100]/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A35100]/40">
                <CheckCircle2 size={12} /> Sequence Complete
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ChatMessage({ message, user }) { // Added user prop
  const isUser = message.role === 'user';
  const isSystemAction = !isUser && (message.content.includes('/') || message.content.includes('listing files'));
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-10`}
    >
      <div className={`flex gap-6 w-full ${isUser ? 'flex-row-reverse max-w-[90%]' : 'flex-row max-w-full'}`}>
        
        {/* AVATAR SECTION */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            /* User Avatar Style matching Navbar */
            <div className="p-[2px] rounded-full border border-[#B55500]">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#34170A] flex items-center justify-center">
                   <User size={18} className="text-[#FDF3E4]" />
                </div>
              )}
            </div>
          ) : (
            /* AI Icon Style */
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-[#A35100]/10 bg-[#FDF3E4] shadow-sm">
              <Command size={18} className="text-[#A35100]" />
            </div>
          )}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
          <div className={`w-full ${isUser ? 'bg-[#FDF3E4] border border-[#A35100]/10 px-6 py-4 rounded-3xl rounded-tr-none shadow-sm text-[#34170A]' : 'text-[#34170A]'}`}>
            {isSystemAction ? (
               <ActionHistory content={message.content} />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className={`mb-6 last:mb-0 leading-relaxed ${!isUser ? 'text-[19px] font-serif italic' : 'text-base font-medium'}`}>
                      {children}
                    </p>
                  ),
                  strong: ({children}) => <span className="font-bold text-[#A35100]">{children}</span>,
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    return !inline && match ? (
                      <div className="relative my-6 rounded-2xl overflow-hidden border border-[#A35100]/10 bg-[#1A0B05] shadow-xl">
                        <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#FDF3E4]/30">{match[1]}</span>
                          <button onClick={() => copyToClipboard(codeString)} className="text-[#FDF3E4]/30 hover:text-white transition-colors">
                            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <SyntaxHighlighter style={vscDarkPlus} language={match[1]} customStyle={{ margin: 0, padding: '1.5rem', fontSize: '14px', backgroundColor: 'transparent' }}>
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-[#A35100]/10 text-[#A35100] px-2 py-0.5 rounded font-mono text-[12px] font-bold" {...props}>{children}</code>
                    );
                  },
                  ul: ({children}) => <ul className="list-disc ml-6 mb-6 space-y-3 text-[16px] font-medium opacity-80">{children}</ul>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
            {message.streaming && <ProcessingIndicator />}
          </div>
          
       
        </div>
      </div>
    </motion.div>
  );
}