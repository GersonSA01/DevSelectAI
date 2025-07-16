'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithCreds } from '../app/utils/fetchWithCreds';

const ItinerarioContext = createContext();

export const useItinerarios = () => useContext(ItinerarioContext);

export const ItinerarioProvider = ({ children }) => {
  const [itinerarios, setItinerarios] = useState([]);

 const cargarItinerarios = async () => {
  const res = await fetchWithCreds('http://localhost:5000/api/itinerarios');
  const data = await res.json();
  if (Array.isArray(data)) {
    setItinerarios(data);
  } else {
    console.warn('Itinerarios no es un array:', data);
    setItinerarios([]);
  }
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
