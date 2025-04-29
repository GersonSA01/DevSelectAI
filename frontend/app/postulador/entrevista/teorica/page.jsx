'use client';

import { useContext, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';

export default function TeoricaPage() {
  const router = useRouter();
  const { cameraStream } = useContext(StreamContext);
  const camRef = useRef(null);

  useEffect(() => {
    if (cameraStream && camRef.current) {
      camRef.current.srcObject = cameraStream;
      camRef.current.play();
    }
  }, [cameraStream]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white p-8">
      <h2 className="text-2xl font-semibold mb-6">Entrevista Teórica</h2>
      {/* Aquí van tus preguntas teóricas */}
      <button
        onClick={() => router.push('/postulador/entrevista/practica')}
        className="px-6 py-3 bg-blue-600 rounded-md mt-8"
      >
        Continuar
      </button>

      {/* Preview de la cámara en fixed bottom-left */}
      <video
        ref={camRef}
        muted
        className="fixed bottom-4 left-4 w-32 h-24 bg-black rounded-lg object-cover z-50"
      />
    </div>
  );
}
