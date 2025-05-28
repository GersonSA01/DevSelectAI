'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ItinerarioContext = createContext();

export const useItinerarios = () => useContext(ItinerarioContext);

export const ItinerarioProvider = ({ children }) => {
  const [itinerarios, setItinerarios] = useState([]);

  const cargarItinerarios = async () => {
    const res = await fetch('http://localhost:5000/api/itinerarios');
    const data = await res.json();
    setItinerarios(data);
  };

  useEffect(() => {
    cargarItinerarios();
  }, []);

  return (
    <ItinerarioContext.Provider value={{ itinerarios, cargarItinerarios }}>
      {children}
    </ItinerarioContext.Provider>
  );
};
