'use client';

import { createContext, useContext, useState } from 'react';

// 1) Contexto
export const StreamContext = createContext(null);

// 2) Provider
export function StreamProvider({ children }) {
  const [screenStream, setScreenStream] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

  return (
    <StreamContext.Provider
      value={{ screenStream, setScreenStream, cameraStream, setCameraStream }}
    >
      {children}
    </StreamContext.Provider>
  );
}

// 3) Custom hook
export function useStream() {
  const ctx = useContext(StreamContext);
  if (!ctx) {
    throw new Error('useStream debe usarse dentro de un StreamProvider');
  }
  return ctx;
}
