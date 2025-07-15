'use client';

import { useState } from 'react';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { ItinerarioProvider } from '../../context/ItinerarioContext';

export default function ReclutadorLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ItinerarioProvider>
      <div className="hs-overlay-body-open hs-overlay-body-open:overflow-hidden flex flex-col min-h-screen">
        <Navbar />

        <div className="flex flex-1">
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <main
            className={`mt-[64px] ${isCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 bg-[#0b1120] w-full flex flex-col`}
          >
            <div className="flex-1">{children}</div>
            <Footer />
          </main>
        </div>
      </div>
    </ItinerarioProvider>
  );
}
