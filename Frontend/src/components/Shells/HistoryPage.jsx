import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Clock, Loader2, RefreshCw, 
  LayoutGrid, List, ChevronRight, 
  Calendar, MoreVertical 
} from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';

// --- Helpers ---
function timeAgo(dateStr) {
  if (!dateStr) return 'Unknown';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HistoryPage() {
  const { projects, loading, error, fetchProjects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-30 min-h-screen">
      {/* --- Search & View Toggle Bar --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A35100]/30" size={18} />
          <input 
            type="text"
            placeholder="Search your history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 border border-[#A35100]/10 rounded-[22px] py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-[#A35100]/5 focus:bg-white transition-all placeholder:text-[#A35100]/30 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProjects}
            className="p-3.5 rounded-2xl border border-[#A35100]/10 hover:bg-white transition-all text-[#A35100]/60 active:scale-95 bg-white/20"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <div className="flex items-center gap-1 bg-white/40 p-1.5 rounded-[22px] border border-[#A35100]/5">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#A35100]' : 'text-[#A35100]/30 hover:text-[#A35100]'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#A35100]' : 'text-[#A35100]/30 hover:text-[#A35100]'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* --- Content States --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-[#A35100]/5 border-t-[#A35100] animate-spin" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#A35100]/20" size={20} />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#A35100]/40">Loading Archive</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50/50 rounded-[40px] border border-red-100">
           <p className="text-red-800 font-serif italic mb-4">Could not retrieve history</p>
           <button onClick={fetchProjects} className="text-xs font-bold uppercase tracking-widest text-red-500 underline">Try Again</button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
          : "flex flex-col gap-4"
        }>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <ProjectCard 
                key={project._id || idx} 
                project={project} 
                index={idx} 
                viewMode={viewMode} 
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* --- Empty State --- */}
      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-40 border-2 border-dashed border-[#A35100]/10 rounded-[60px] bg-white/10">
          <h3 className="text-2xl font-serif italic text-[#34170A]/40">No projects found</h3>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#A35100]/30 mt-2">Try a different search term</p>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, index, viewMode }) {
  const title = project.title || "Untitled Project";
  const initial = title.charAt(0).toUpperCase();
  
  // Logic: Define what constitutes a "long" prompt
  const isLongPrompt = title.length > 60;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex items-center gap-6 p-5 bg-white/60 hover:bg-white rounded-[24px] border border-[#A35100]/5 transition-all group cursor-pointer"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#C18C28] flex items-center justify-center text-white text-lg font-bold shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-serif italic text-[#34170A] truncate ${isLongPrompt ? 'text-sm' : 'text-lg'}`}>
            {title}
          </h3>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#A35100]/40">
            Edited {timeAgo(project.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-6">
            <span className="hidden sm:block text-[11px] font-mono text-[#34170A]/30">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <ChevronRight size={18} className="text-[#34170A]/20 group-hover:text-[#34170A] transition-colors" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-[40px] p-8 transition-all hover:shadow-2xl hover:shadow-[#A35100]/8 border border-[#A35100]/5 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[320px]"
    >
      {/* Visual Decoration */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FDF3E4]/50 rounded-full group-hover:scale-110 transition-transform duration-700" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#C18C28] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#C18C28]/20 group-hover:scale-110 transition-transform">
            {initial}
          </div>
          <button className="p-2 text-[#34170A]/20 hover:text-[#34170A] transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="mb-6">
          {/* FONT SIZE LOGIC: If long prompt, use text-sm and more lines */}
          <h3 className={`font-serif italic text-[#34170A] mb-3 leading-snug group-hover:text-[#A35100] transition-colors 
            ${isLongPrompt 
              ? 'text-sm line-clamp-4' 
              : 'text-xl line-clamp-2'
            }`}
          >
            {title}
          </h3>
          
          <div className="flex items-center gap-2 text-[#A35100]/60">
            <Clock size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {timeAgo(project.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-6 border-t border-[#A35100]/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#34170A]/30">
          <Calendar size={14} />
          <span className="text-[11px] font-medium opacity-60">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#34170A]/30 group-hover:bg-[#34170A] group-hover:text-white transition-all shadow-sm">
          <ChevronRight size={18} />
        </div>
      </div>
    </motion.div>
  );
}