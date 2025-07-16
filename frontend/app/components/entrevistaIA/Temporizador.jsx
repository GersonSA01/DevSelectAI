'use client';

import { useEffect, useState, useRef } from 'react';

export default function Temporizador({
  onFinish,
  tiempoInicial = 15,
  detenerAlGrabar = false,
  recorder = null
}) {
  const [tiempoRestante, setTiempoRestante] = useState(tiempoInicial);
  const intervalRef = useRef(null);

  const detenerTemporizador = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    // Si hay que detener al grabar y no se está grabando, no arrancar
    if (detenerAlGrabar && (!recorder || recorder.state !== 'recording')) {
      return;
    }

    // Reset y arranca
    setTiempoRestante(tiempoInicial);

    intervalRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          detenerTemporizador();

          if (detenerAlGrabar && recorder?.state === 'recording') {
            recorder.stop();
          }

          if (onFinish) onFinish();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return detenerTemporizador;
  }, [tiempoInicial, detenerAlGrabar, recorder?.state]); 

  return (
    <p className="text-center text-sm text-yellow-400 mb-2">
      ⏳ Tiempo restante: {tiempoRestante} segundos
    </p>
  );
}
