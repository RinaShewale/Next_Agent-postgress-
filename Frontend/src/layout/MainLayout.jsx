import React from 'react';
import PageTransition from "../components/Home/Loading/PageTransition";
import Navbar from "../components/Home/components/Navbar";
import { TransitionPathProvider, useTransitionPath } from "../components/Home/Loading/Transitionpathcontext"; // adjust path as needed

const hiddenNavbarPaths = [
  '/login',
  '/shell', // Add your editor/app path here
];

const MainLayoutInner = () => {
  // Use the DISPLAYED path (synced to what PageTransition is actually showing),
  // not the raw router location, so the navbar doesn't flip visibility until
  // the content it's guarding has actually swapped.
  const { displayPath } = useTransitionPath();

  const shouldHideNavbar = hiddenNavbarPaths.some(path =>
    displayPath.startsWith(path)
  );

  return (
    <div className="bg-[#FFF2E0] min-h-screen flex flex-col">
      {!shouldHideNavbar && <Navbar />}
      <div className="flex-1">
        <PageTransition />
      </div>
    </div>
  );
};

const MainLayout = () => (
  <TransitionPathProvider>
    <MainLayoutInner />
  </TransitionPathProvider>
);

export default MainLayout;