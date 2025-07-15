'use client';

import { useEffect, useState } from 'react';

export default function Temporizador({
  onFinish,
  tiempoInicial = 15,
  detenerAlGrabar = false,
  recorder = null
}) {
  const [tiempoRestante, setTiempoRestante] = useState(tiempoInicial);

  useEffect(() => {
    if (detenerAlGrabar && (!recorder || recorder.state !== 'recording')) return;

    setTiempoRestante(tiempoInicial);

    const interval = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(interval);

          if (detenerAlGrabar && recorder?.state === 'recording') {
            recorder.stop();
          }

          if (onFinish) onFinish();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [recorder, onFinish, tiempoInicial, detenerAlGrabar]);

  return (
    <p className="text-center text-sm text-yellow-400 mb-2">
      ⏳ Tiempo restante: {tiempoRestante} segundos
    </p>
  );
}
