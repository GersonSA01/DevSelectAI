'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ScreenContext = createContext();

export const useScreen = () => useContext(ScreenContext);


//const SCREEN_DETECTION_ENABLED = true;
const SCREEN_DETECTION_ENABLED = false; 

export const ScreenProvider = ({ children }) => {
  const [extraScreenDetected, setExtraScreenDetected] = useState(false);

  const checkScreens = async () => {
    // Si está desactivado, siempre retorna false
    if (!SCREEN_DETECTION_ENABLED) {
      setExtraScreenDetected(false);
      return;
    }

    if ('getScreenDetails' in window) {
      const details = await window.getScreenDetails();
      setExtraScreenDetected(details.screens.length > 1);
    } else {
      // fallback para navegadores sin soporte
      const isExtra =
        window.screen.availWidth > window.screen.width ||
        window.screen.availHeight > window.screen.height;
      setExtraScreenDetected(isExtra);
    }
  };

  useEffect(() => {
    // Solo ejecuta si está habilitado
    if (SCREEN_DETECTION_ENABLED) {
      checkScreens();
      window.addEventListener('resize', checkScreens);
      return () => window.removeEventListener('resize', checkScreens);
    }
  }, []);

  return (
    <ScreenContext.Provider value={{ extraScreenDetected }}>
      {children}
    </ScreenContext.Provider>
  );
};