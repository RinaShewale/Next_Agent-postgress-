import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function FileTreeNode({ node, depth = 0, onFileClick }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isFolder = node.type === 'folder';

  const handleClick = (e) => {
    e.stopPropagation();
    if (isFolder) {
      setExpanded(!expanded);
    } else {
      onFileClick(node.path);
    }
  };

  return (
    <div className="select-none font-sans">
      <motion.div 
        onClick={handleClick}
        className="group flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-[#FDF3E4]/50"
        style={{ marginLeft: `${depth * 12}px` }}
      >
        {/* Chevron for Folders */}
        {isFolder ? (
          <motion.div 
            animate={{ rotate: expanded ? 90 : 0 }} 
            className="text-[#A35100]/40 group-hover:text-[#A35100]"
          >
            <ChevronRight size={12} strokeWidth={3} />
          </motion.div>
        ) : (
          <div className="w-3" /> 
        )}

        {/* Node Name */}
        <span className={`
          truncate tracking-tight transition-colors
          ${isFolder 
            ? 'text-[9px] font-black uppercase tracking-[0.1em] opacity-60' 
            : 'text-xs font-medium text-[#34170A] group-hover:text-[#A35100]'
          }
        `}>
          {node.name}
        </span>
      </motion.div>

      {/* Recursive Children with Spine */}
      <AnimatePresence>
        {isFolder && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden relative ml-[18px] border-l border-[#A35100]/10"
          >
            {node.children?.map(child => (
              <FileTreeNode 
                key={child.path} 
                node={child} 
                depth={0} // Depth is managed by the left border indentation
                onFileClick={onFileClick} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}