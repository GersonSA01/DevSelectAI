'use client';
import { useState } from 'react';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import { ItinerarioProvider } from '../../context/ItinerarioContext';

export default function ReclutadorLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ItinerarioProvider>
      <div className="hs-overlay-body-open hs-overlay-body-open:overflow-hidden">
        <Navbar />

        <div className="flex">
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <main className={`mt-[64px] ${isCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 bg[#0b1120] min-h-screen w-full`}>
            {children}
          </main>
        </div>
      </div>
    </ItinerarioProvider>
  );
}
