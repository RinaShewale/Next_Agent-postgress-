import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../layout/MainLayout'; // Import the new layout
import HomePage from '../components/Home/pages/HomePage'; // Import the HomePage component
import About from '../components/Home/pages/About';
import LoginPage from '../components/auth/LoginPage';
import Community from '../components/Home/pages/Community';
import Pricing from '../components/Home/pages/Pricing';
import AppShell from '../components/Shells/AppShell'
import LandingPage from '../components/Shells/LandingPage';
import TemplateShowcase from '../components/Home/pages/TempleteShowcase';
import HistoryPage from '../components/Shells/HistoryPage';
import BeyondTheBrief from '../components/Home/pages/BeyondTheBrief';
import ArchitecturalArchives from '../components/Home/pages/ArchitecturalArchives';
import HowItWorks from '../components/Home/pages/HowItWorks';
import LearnByBuilding from '../components/Home/pages/LearnByBuilding';





const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Use the layout component here
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/community", element: <Community /> },
      { path: "/websites", element: <TemplateShowcase /> },
      { path: "/about", element: <About /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/login", element: <LoginPage /> },
       { path: "/shell", element: <AppShell /> },
        { path: "/dashboard", element: <LandingPage /> },
        { path: "/history", element: <HistoryPage /> },
        { path: "/explore", element: <BeyondTheBrief /> },
        {path: "/templete" , element: <ArchitecturalArchives />},
         {path: "/working" , element: <HowItWorks />},
         {path :"/learning", element: <LearnByBuilding />}
    ],
  },
]);

export default function AppRoute() {
  return <RouterProvider router={router} />;
}