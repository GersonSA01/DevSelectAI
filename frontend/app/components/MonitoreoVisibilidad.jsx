'use client';

import { useEffect, useRef } from 'react';
import { useStream } from '../../context/StreamContext';
import { toast } from 'sonner';

export default function MonitoreoVisibilidad({ idEvaluacion }) {
  const { tomarCapturaPantalla } = useStream();
  const timeoutRef = useRef(null);
  const alertaActivaRef = useRef(false);

  const registrarAlerta = async (motivo) => {
    if (alertaActivaRef.current) return;

    alertaActivaRef.current = true;

    toast.warning(`Atención: ${motivo}`);

    setTimeout(async () => {
      if (typeof tomarCapturaPantalla === 'function') {
        await tomarCapturaPantalla(idEvaluacion);
      }
      alertaActivaRef.current = false;
    }, 3000); // Da tiempo para que el usuario vea la alerta
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      clearTimeout(timeoutRef.current);
      if (document.hidden) {
        timeoutRef.current = setTimeout(() => {
          if (document.hidden) {
            registrarAlerta('Se detectó un cambio de pestaña o minimización del navegador.');
          }
        }, 1000);
      }
    };

    const handleWindowBlur = () => {
      timeoutRef.current = setTimeout(() => {
        if (!document.hasFocus()) {
          registrarAlerta('Se detectó pérdida de foco de la ventana.');
        }
      }, 3000);
    };

    const handleWindowFocus = () => {
      clearTimeout(timeoutRef.current);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [idEvaluacion, tomarCapturaPantalla]);

  return null;
}
