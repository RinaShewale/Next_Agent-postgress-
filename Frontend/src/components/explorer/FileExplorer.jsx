import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileTree } from '../../hooks/useFileTree';
import FileTree from './FileTree';
import { RefreshCw, FolderTree, Terminal } from 'lucide-react';

export default function FileExplorer({ agentUrl, onFileClick }) {
  const { tree, loading, refresh } = useFileTree(agentUrl);

  return (
    <div className="flex flex-col h-full bg-[#EBE0CF] select-none border-r border-[#A35100]/10 shadow-inner">
      {/* Header: More compact and professional */}
      <div className="p-5 border-b border-[#A35100]/10">
        <div className="flex items-center justify-between group">
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#34170A]">
              Workspace
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A35100]/30" />
              <span className="text-[9px] font-bold text-[#A35100]/50 uppercase tracking-widest">
                v1.0.4 / stable
              </span>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={refresh} 
            disabled={loading} 
            className="p-1.5 text-[#A35100]/60 hover:text-[#A35100] hover:bg-[#A35100]/5 rounded-md transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </motion.button>
        </div>
      </div>

      {/* Progress Bar (Integrated into header bottom) */}
      <div className="h-[1px] w-full bg-transparent overflow-hidden">
        {loading && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            className="h-full w-1/2 bg-[#A35100]/40"
          />
        )}
      </div>

      {/* Explorer Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-3 h-3 bg-[#A35100]/10 rounded" />
                  <div className="h-2 bg-[#A35100]/10 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : tree?.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-2"
            >
              <FileTree tree={tree} onFileClick={onFileClick} />
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 opacity-40">
              <FolderTree size={32} strokeWidth={1} className="mb-3 text-[#A35100]" />
              <span className="text-[10px] uppercase tracking-widest font-bold">No Files</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: Refined status bar */}
      <div className="px-4 py-3 bg-[#A35100]/5 border-t border-[#A35100]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
             <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-500 animate-ping opacity-40" />
          </div>
          <span className="text-[9px] font-bold text-[#34170A]/60 uppercase tracking-tighter">Live</span>
        </div>
        <div className="flex items-center gap-1 text-[#34170A]/40">
          <Terminal size={10} />
          <span className="text-[9px] font-mono">{tree?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}