'use client';
import { createContext, useContext, useState, useRef } from 'react';

export const StreamContext = createContext(null);

export function StreamProvider({ children }) {
  const [screenStream, setScreenStream] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  // ✅ Nueva función: reinicia cámara si está vacía o se pierde
  const reiniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      console.log('📷 Cámara reiniciada correctamente');
    } catch (error) {
      console.error('❌ Error al reiniciar la cámara:', error);
    }
  };

  const tomarCapturaPantalla = async (idEvaluacion) => {
    if (!screenStream) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    if (!videoRef.current) {
      videoRef.current = document.createElement('video');
      videoRef.current.muted = true;
      videoRef.current.autoplay = true;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    video.srcObject = screenStream;
    await video.play();

    canvas.width = video.videoWidth / 2;
    canvas.height = video.videoHeight / 2;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.7);

    try {
      const response = await fetch('http://localhost:5000/api/captures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_Evaluacion: idEvaluacion,
          File: base64Image,
          Aprobado: false,
          Observacion: 'Captura automática por validación',
        }),
      });

      if (response.ok) {
        console.log('✅ Captura de pantalla enviada');
      } else {
        console.error('❌ Error al enviar la captura (res.status):', response.status);
      }
    } catch (error) {
      console.error('❌ Error al guardar la captura:', error);
    }
  };

  return (
    <StreamContext.Provider
      value={{
        screenStream,
        setScreenStream,
        cameraStream,
        setCameraStream,
        tomarCapturaPantalla,
        reiniciarCamara, // ✅ Exportamos esta función
      }}
    >
      {children}
    </StreamContext.Provider>
  );
}

export function useStream() {
  const ctx = useContext(StreamContext);
  if (!ctx) {
    throw new Error('useStream debe usarse dentro de un StreamProvider');
  }
  return ctx;
}
