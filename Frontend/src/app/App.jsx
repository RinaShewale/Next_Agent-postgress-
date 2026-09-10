import React, { useState } from 'react';
import AppRoute from './AppRouter'; // Import the router we just created
import InteractiveLoadingPage from '../components/Home/Loading/InteractiveLoadingPage';


export default function App() {
 const [isLoading, setIsLoading] = useState(true);

return (
  <div className="bg-[#FFF2E0] min-h-screen">
    {isLoading ? (
      <InteractiveLoadingPage onComplete={() => setIsLoading(false)} />
    ) : (
      <AppRoute />
    )}
  </div>
);
  
}