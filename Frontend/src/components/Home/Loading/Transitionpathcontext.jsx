import React, { createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';

const TransitionPathContext = createContext(null);

/**
 * Wrap MainLayout's content in this provider.
 * `displayPath` = the path whose content is ACTUALLY visible right now
 * (updated by PageTransition mid-animation), as opposed to
 * `useLocation().pathname` which updates the instant the URL changes.
 */
export const TransitionPathProvider = ({ children }) => {
  const location = useLocation();
  // Seed with the current path so the very first render is correct.
  const [displayPath, setDisplayPath] = useState(location.pathname);

  return (
    <TransitionPathContext.Provider value={{ displayPath, setDisplayPath }}>
      {children}
    </TransitionPathContext.Provider>
  );
};

export const useTransitionPath = () => {
  const ctx = useContext(TransitionPathContext);
  if (!ctx) {
    throw new Error('useTransitionPath must be used within a TransitionPathProvider');
  }
  return ctx;
};