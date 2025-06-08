'use client';

import { useContext, useRef, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';
import AnimatedCircle from '../../../components/ui/AnimatedCircle';
import DetectorOscuridad from '../../../components/DetectorOscuridad';

export default function PresentacionEntrevista() {
  const router = useRouter();
  const { cameraStream } = useContext(StreamContext);
  const camRef = useRef(null);
  const [cameraVisible, setCameraVisible] = useState(true); // 🆕 Estado para visibilidad
  const searchParams = useSearchParams(); // 👈 PARA LEER PARAMETROS
  const token = searchParams.get('token'); // 👈 EXTRAES EL TOKEN
  useEffect(() => {
    if (cameraStream && camRef.current) {
      camRef.current.srcObject = cameraStream;
      camRef.current.play();
    }
  }, [cameraStream]);

  return (
    <div className="relative h-screen w-full bg-[#0A0A23] text-white overflow-hidden">
      {/* Detector de oscuridad 🧠 */}
      <DetectorOscuridad onVisibilityChange={setCameraVisible} />

      {/* Círculo centrado */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <AnimatedCircle letter="D" />
      </div>

      {/* Instrucciones */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 max-w-sm">
        <h2 className="font-semibold mb-2 text-white">Antes de iniciar la entrevista:</h2>
        <ul className="list-decimal list-inside text-sm text-secondaryText mb-6">
          <li>Quédate en el entorno de entrevista.</li>
          <li>No abandones ni cambies de pestaña.</li>
          <li>Mantén contacto visual general con la pantalla.</li>
          <li>Si tienes dudas, puedes expresarlas en voz alta durante la entrevista.</li>
        </ul>
        <button
          onClick={() => router.push(`/postulador/entrevista/presentacion?token=${token}`)}
          disabled={!cameraVisible}
          className={`px-6 py-2 rounded-full font-semibold text-black ${cameraVisible ? '' : 'cursor-not-allowed bg-gray-500'}`}
          style={{ backgroundColor: cameraVisible ? '#3BDCF6' : '#6B7280' }}
        >
          Listo, iniciar entrevista
        </button>
      </div>

      {/* Video abajo */}
      <video
        ref={camRef}
        muted
        className="absolute bottom-4 left-4 w-[320px] h-[192px] bg-gray-700 rounded-lg object-cover z-0"
      >
        Video Cámara Activa
      </video>
    </div>
  );
}
