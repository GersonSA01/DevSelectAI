'use client';
import { useStream } from '../../../../context/StreamContext';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PresentacionEntrevista() {
  const { screenStream } = useStream();
  const videoRef = useRef();
  const router = useRouter();

  useEffect(() => {
    if (screenStream && videoRef.current) {
      videoRef.current.srcObject = screenStream;
      videoRef.current.play();
    }
  }, [screenStream]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h2 className="text-2xl font-semibold mb-4">Presentación</h2>
      <video ref={videoRef} muted className="w-80 h-48 bg-black rounded-lg mb-8 object-cover" />
      <button onClick={() => router.push('/postulador/entrevista/teorica')} className="px-6 py-3 bg-blue-600 rounded-md mb-4">Siguiente: Entrevista Teórica</button>
      <button onClick={() => router.back()} className="text-gray-300 underline">Volver</button>
    </div>
  );
}
