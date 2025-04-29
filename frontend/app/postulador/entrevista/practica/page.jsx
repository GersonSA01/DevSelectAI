'use client';

import { useContext, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';

export default function PracticaPage() {
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
      <h2 className="text-2xl font-semibold mb-6">Ejercicio Técnico</h2>
      {/* Aquí va tu componente de práctica técnica */}
      <button
        onClick={() => router.push('/postulador/entrevista/finalizacion')}
        className="px-6 py-3 bg-green-600 rounded-md mt-8"
      >
        Finalizar
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
