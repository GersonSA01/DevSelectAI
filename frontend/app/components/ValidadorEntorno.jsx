'use client';

import { useEffect, useRef } from 'react';
import DetectorOscuridad from './DetectorOscuridad';
import MonitoreoVisibilidad from './MonitoreoVisibilidad';
import { useStream } from '../../context/StreamContext';
import { Alert } from '../components/alerts/Alerts';

export default function ValidadorEntorno({ idEvaluacion, onCamVisibilityChange }) {
  const { screenStream, setScreenStream, tomarCapturaPantalla } = useStream();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    const iniciarPantalla = async () => {
      if (hasRequestedRef.current || screenStream) return;
      hasRequestedRef.current = true;

      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' },
        });

        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();

        if (settings.displaySurface !== 'monitor') {
          track.stop();

          await Alert({
            title: 'Pantalla incompleta',
            text: 'Debes compartir la pantalla completa, no una ventana o pestaña.',
            icon: 'warning',
            confirmButtonText: 'Intentar de nuevo',
            showCancelButton: false,
          });

          hasRequestedRef.current = false;
          iniciarPantalla(); // 🔁 vuelve a intentar
          return;
        }

        setScreenStream(stream);
        console.log('✅ Pantalla compartida correctamente');
      } catch (error) {
        console.error('❌ No se pudo capturar la pantalla:', error);

        await Alert({
          title: 'Permiso requerido',
          text: 'Debes permitir compartir pantalla para continuar.',
          icon: 'error',
          confirmButtonText: 'Volver a intentar',
          showCancelButton: false,
        });

        hasRequestedRef.current = false;
        iniciarPantalla(); // 🔁 vuelve a intentar
      }
    };

    iniciarPantalla();
  }, [screenStream, setScreenStream]);

  return (
    <>
      {screenStream && (
        <>
          <DetectorOscuridad onVisibilityChange={onCamVisibilityChange} idEvaluacion={idEvaluacion} />
          <MonitoreoVisibilidad idEvaluacion={idEvaluacion} />
        </>
      )}
    </>
  );
}
