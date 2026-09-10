import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, Monitor, Code2, Terminal as TermIcon, Zap, Globe, X, Menu, FolderOpen } from 'lucide-react';
import useSandboxStore from '../../store/sandboxStore';
import { useFileEditor } from '../../hooks/useFileEditor';
import AIChat from '../ai/AIChat';
import FileExplorer from '../explorer/FileExplorer';
import EditorPanel from '../editor/EditorPanel';
import PreviewPanel from '../preview/PreviewPanel';
import TerminalPanel from '../terminal/TerminalPanel';
import GeneratingPage from './GeneratingPage';
import DeployButton from '../shared/DeployButton';


export default function AppShell() {
  const { sandboxID, projectId, agentUrl, previewUrl, viewState } = useSandboxStore();
  const { openFiles, activeFile, activeFileData, openFile, closeFile, updateContent, saveFile, setActiveFile, saveStatus } = useFileEditor(agentUrl);
  const [activeTab, setActiveTab] = useState('preview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileFilesOpen, setMobileFilesOpen] = useState(false); // State for mobile file explorer
  const [buildVersion, setBuildVersion] = useState(0);

  

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleBuildComplete = useCallback(() => setBuildVersion(v => v + 1), []);

  if (viewState === 'generating') return <GeneratingPage />;
  if (viewState !== 'editor') return null;

  const views = [
    { id: 'preview', label: 'Preview', icon: <Monitor size={16} /> },
    { id: 'code', label: 'Architect', icon: <Code2 size={16} /> },
    { id: 'terminal', label: 'Console', icon: <TermIcon size={16} /> }
  ];

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-[#FDF3E4] text-[#34170A] overflow-hidden z-[50]">


      {/* 2. Workspace Area: Fills remaining height */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Responsive Sidebar (AIChat) */}
        <motion.aside
          initial={false}
          animate={{
            width: sidebarOpen ? (window.innerWidth < 1024 ? '100%' : 400) : 0,
            x: sidebarOpen ? 0 : -400,
            opacity: sidebarOpen ? 1 : 0
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full border-r border-[#A35100]/10 bg-[#F7EDE0] lg:bg-[#F7EDE0]/50 backdrop-blur-xl absolute lg:relative z-[60] overflow-hidden"
        >
          <div className="w-full lg:w-[400px] h-full relative">
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 z-[70] p-2 bg-[#34170A] text-white rounded-full shadow-lg"
            >
              <X size={20} />
            </button>
            <AIChat sandboxID={sandboxID} onBuildComplete={handleBuildComplete} />
          </div>
        </motion.aside>

        {/* Main Content (Editor/Preview) */}
        <main className="flex-1 relative flex flex-col p-3 md:p-4 lg:p-5 overflow-hidden min-w-0">

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-3 px-1 shrink-0 gap-2">
            <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 bg-white border border-[#A35100]/10 rounded-xl text-[#A35100] shadow-sm hover:bg-orange-50 transition-colors"
              >
                <PanelLeft size={18} />
              </button>

              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[#F7EDE0] border border-[#A35100]/5 rounded-xl text-[11px] opacity-70">
                <Globe size={14} className="text-[#A35100] shrink-0" />
                <span className="truncate max-w-[120px] md:max-w-[250px] font-mono">
                  {previewUrl || 'nexus-instance-v1.local'}
                </span>
              </div>
            </div>


            <DeployButton projectId={projectId} />

          </div>

          {/* Canvas Viewport */}
          <div className="flex-1 relative bg-white rounded-2xl md:rounded-[2rem] border border-[#A35100]/10 overflow-hidden flex flex-col shadow-sm">
            <AnimatePresence mode="wait">
              {activeTab === 'preview' && (
                <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 h-full">
                  <PreviewPanel previewUrl={previewUrl} buildVersion={buildVersion} />
                </motion.div>
              )}

              {activeTab === 'code' && (
                <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex h-full overflow-hidden relative">

                  {/* MOBILE FILE EXPLORER OVERLAY */}
                  <AnimatePresence>
                    {mobileFilesOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => setMobileFilesOpen(false)}
                          className="absolute inset-0 bg-black/20 z-[65] md:hidden"
                        />
                        <motion.div
                          initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                          className="absolute inset-y-0 left-0 w-72 bg-[#FDF3E4] z-[70] md:hidden shadow-2xl border-r border-[#A35100]/20 flex flex-col"
                        >
                          <div className="p-4 border-b border-[#A35100]/10 flex justify-between items-center bg-[#F7EDE0]">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A35100]">File Explorer</span>
                            <button onClick={() => setMobileFilesOpen(false)} className="p-1 text-[#A35100]"><X size={18} /></button>
                          </div>
                          <div className="flex-1 overflow-y-auto">
                            <FileExplorer agentUrl={agentUrl} onFileClick={(file) => {
                              openFile(file);
                              setMobileFilesOpen(false);
                            }} />
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* DESKTOP FILE EXPLORER (Unchanged) */}
                  <div className="w-56 lg:w-64 border-r border-[#A35100]/5 hidden md:block overflow-y-auto">
                    <FileExplorer agentUrl={agentUrl} onFileClick={openFile} />
                  </div>

                  <div className="flex-1 flex flex-col min-w-0">
                    {/* MOBILE-ONLY EXPLORER TRIGGER */}
                    <div className="md:hidden flex items-center gap-2 p-2 bg-[#F7EDE0]/50 border-b border-[#A35100]/5">
                      <button
                        onClick={() => setMobileFilesOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#A35100]/10 rounded-lg text-[10px] font-bold text-[#A35100] uppercase"
                      >
                        <FolderOpen size={14} />
                        Files
                      </button>
                      <div className="h-4 w-px bg-[#A35100]/10 mx-1" />
                      <span className="text-[10px] truncate opacity-60 font-mono italic">
                        {activeFile || 'Select a file'}
                      </span>
                    </div>

                    <EditorPanel
                      openFiles={openFiles} activeFile={activeFile}
                      activeFileData={activeFileData} onSelect={setActiveFile}
                      onClose={closeFile} onContentChange={updateContent}
                      onSave={saveFile} saveStatus={saveStatus}
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'terminal' && (
                <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 h-full bg-[#1A0B05]">
                  <TerminalPanel agentUrl={agentUrl} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Switcher */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[55]">
            <div className="flex items-center gap-1 p-1.5 bg-[#34170A]/95 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
              {views.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveTab(v.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] transition-all ${activeTab === v.id ? 'bg-[#A35100] text-white' : 'text-white/40 hover:text-white/70'
                    }`}
                >
                  {v.icon}
                  <span className={activeTab === v.id ? 'block' : 'hidden md:block'}>
                    {v.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}