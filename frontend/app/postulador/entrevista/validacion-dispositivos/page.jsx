'use client';
import { useStream } from '../../../../context/StreamContext';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ValidacionDispositivos() {
  const { setCameraStream } = useStream();
  const [camReady, setCamReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const videoRef = useRef();
  const router = useRouter();

  const testDevices = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = media;
      setCameraStream(media);
      setCamReady(true);
      setMicReady(true);
    } catch (e) {
      console.error('Error al acceder a dispositivos:', e);
      alert('No se pudo acceder a cámara o micrófono.');
    }
  };

  useEffect(() => {
    testDevices();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h2 className="text-2xl font-semibold mb-4">Validación de Dispositivos</h2>
      <div className="w-80 h-48 bg-black rounded-lg overflow-hidden mb-4">
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
      </div>
      <p className="mb-4">{camReady ? 'Cámara detectada ✔️' : 'Cámara no detectada ❌'}</p>
      <p className="mb-8">{micReady ? 'Micrófono detectado ✔️' : 'Micrófono no detectado ❌'}</p>
      <button onClick={() => router.push('/postulador/entrevista/teorica')} className="px-6 py-3 bg-green-600 rounded-md">Continuar</button>
    </div>
  );
}
