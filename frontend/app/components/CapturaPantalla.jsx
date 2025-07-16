'use client';

import { useRef } from 'react';
import { useStream } from '../../context/StreamContext';

export default function CapturaPantalla({ idEvaluacion }) {
  const { screenStream } = useStream();
  const canvasRef = useRef(null);

  const tomarCaptura = async () => {
    if (!screenStream) {
      alert("⚠️ No hay stream de pantalla activo.");
      return;
    }

    const videoTrack = screenStream.getVideoTracks()[0];

    try {
      const imageCapture = new ImageCapture(videoTrack);
      const bitmap = await imageCapture.grabFrame();

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);

      const base64Image = canvas.toDataURL('image/png');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/captures`
, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_Evaluacion: idEvaluacion,
          File: base64Image,
          Aprobado: false,
          Observacion: '',
        }),
      });

      if (response.ok) {
        console.log('✅ Captura guardada correctamente');
      } else {
        console.error('❌ Error al guardar la captura');
      }

    } catch (error) {
      console.error('❌ Error al capturar pantalla:', error);
      alert('Error al capturar la pantalla.');
    }
  };

  return (
    <div className="hidden">
      <button onClick={tomarCaptura}>Tomar captura</button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
