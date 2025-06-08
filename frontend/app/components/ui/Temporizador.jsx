'use client';
import { useEffect, useState } from 'react';

export default function Temporizador({ duracion = 300, onFinalizar }) {
  const [tiempo, setTiempo] = useState(duracion);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempo((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          onFinalizar?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const minutos = String(Math.floor(tiempo / 60)).padStart(2, '0');
  const segundos = String(tiempo % 60).padStart(2, '0');

  let color = 'text-white';
  if (tiempo <= 60) color = 'text-yellow-400';
  if (tiempo <= 10) color = 'text-red-500 font-bold animate-pulse';

  return (
    <div
      className={`fixed top-20 right-4 z-50 bg-[#1E293B] px-4 py-2 rounded-xl shadow-lg border border-cyan-500 text-lg font-mono ${color}`}
    >
      ⏱️ {minutos}:{segundos}
    </div>
  );
}
