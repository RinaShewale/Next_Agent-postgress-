import { useState, useCallback } from 'react';
import { readFile, updateFiles } from '../api/agentFiles';

export function useFileEditor(agentUrl) {
  const [openFiles, setOpenFiles] = useState([]); // [{ path, content, isDirty }]
  const [activeFile, setActiveFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  const openFile = useCallback(async (path) => {
    // If already open, just switch to it
    const existing = openFiles.find((f) => f.path === path);
    if (existing) {
      setActiveFile(path);
      return;
    }

    setLoading(true);
    try {
      const content = await readFile(agentUrl, path);
      setOpenFiles((prev) => [...prev, { path, content, isDirty: false }]);
      setActiveFile(path);
    } catch (err) {
      console.error('Failed to read file:', err);
    } finally {
      setLoading(false);
    }
  }, [agentUrl, openFiles]);

  const updateContent = useCallback((path, newContent) => {
    setOpenFiles((prev) =>
      prev.map((f) => f.path === path ? { ...f, content: newContent, isDirty: true } : f)
    );
  }, []);

  const closeFile = useCallback((path) => {
    setOpenFiles((prev) => {
      const next = prev.filter((f) => f.path !== path);
      if (activeFile === path) {
        setActiveFile(next[next.length - 1]?.path ?? null);
      }
      return next;
    });
  }, [activeFile]);

  const saveFile = useCallback(async (path) => {
    const file = openFiles.find((f) => f.path === path);
    if (!file) return;

    setSaveStatus('saving');
    try {
      // The API expects /workspace/... prefix
      const fullPath = path.startsWith('/workspace') ? path : `/workspace/${path}`;
      await updateFiles(agentUrl, [{ file: fullPath, content: file.content }]);
      setOpenFiles((prev) =>
        prev.map((f) => f.path === path ? { ...f, isDirty: false } : f)
      );
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      console.error('Save failed:', err);
    }
  }, [agentUrl, openFiles]);

  const activeFileData = openFiles.find((f) => f.path === activeFile) ?? null;

  return {
    openFiles,
    activeFile,
    activeFileData,
    loading,
    saveStatus,
    openFile,
    closeFile,
    updateContent,
    saveFile,
    setActiveFile,
  };
}
