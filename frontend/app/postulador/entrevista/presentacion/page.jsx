'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ValidadorEntorno from '../../../components/ValidadorEntorno';
import { useStream } from '../../../../context/StreamContext';
import InstruccionesPrevias from '../../../components/entrevistaIA/InstruccionesPrevias';
import PanelEntrevista from '../../../components/entrevistaIA/PanelEntrevista';
import VideoCamara from '../../../components/entrevistaIA/VideoCamara';

export default function PresentacionEntrevista() {
  const router = useRouter();
  const { cameraStream, screenStream, reiniciarCamara } = useStream();

  const [presentacionIniciada, setPresentacionIniciada] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(true);

  const [segundaPantalla, setSegundaPantalla] = useState(false);

  const idEvaluacion = localStorage.getItem('id_evaluacion') || 1;
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const verificarPantallas = () => {
    // Algunos navegadores soportan screen.width y screen.availWidth como indicativo
    const totalWidth = window.screen.width;
    const availWidth = window.screen.availWidth;

    // Si el ancho disponible es mayor que la pantalla principal, probablemente hay otra pantalla
    if (availWidth > totalWidth) {
      setSegundaPantalla(true);
    } else {
      setSegundaPantalla(false);
    }
  };

  useEffect(() => {
    verificarPantallas();

    const handleResize = () => {
      verificarPantallas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (segundaPantalla && !presentacionIniciada) {
      alert('No puedes iniciar la entrevista mientras haya una segunda pantalla conectada.');
    }
  }, [segundaPantalla, presentacionIniciada]);

  return (
    <div className="relative h-screen w-full bg-[#0A0A23] text-white overflow-hidden">
      <ValidadorEntorno idEvaluacion={idEvaluacion} onCamVisibilityChange={setCameraVisible} />

      {!presentacionIniciada ? (
        <InstruccionesPrevias
          token={token}
          cameraVisible={cameraVisible}
          screenStream={screenStream}
          setPresentacionIniciada={() => {
            if (segundaPantalla) {
              alert('Desconecta la segunda pantalla para continuar con la entrevista.');
              return;
            }
            setPresentacionIniciada(true);
          }}
        />
      ) : (
        <PanelEntrevista
          token={token}
          cameraStream={cameraStream}
          reiniciarCamara={reiniciarCamara}
          cameraVisible={cameraVisible}
          screenStream={screenStream}
          router={router}
        />
      )}

      <VideoCamara cameraStream={cameraStream} />
    </div>
  );
}
