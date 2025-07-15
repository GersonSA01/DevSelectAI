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

  const idEvaluacion = localStorage.getItem('id_evaluacion') || 1;
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="relative h-screen w-full bg-[#0A0A23] text-white overflow-hidden">
      <ValidadorEntorno idEvaluacion={idEvaluacion} onCamVisibilityChange={setCameraVisible} />

      {!presentacionIniciada ? (
        <InstruccionesPrevias
          token={token}
          cameraVisible={cameraVisible}
          screenStream={screenStream}
          setPresentacionIniciada={setPresentacionIniciada}
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
