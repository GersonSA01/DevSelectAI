'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ValidadorEntorno from '../../../components/ValidadorEntorno';
import { useStream } from '../../../../context/StreamContext';
import InstruccionesPrevias from '../../../components/entrevistaIA/InstruccionesPrevias';
import PanelEntrevista from '../../../components/entrevistaIA/PanelEntrevista';
import VideoCamara from '../../../components/entrevistaIA/VideoCamara';
import { useScreen } from '../../../../context/ScreenContext';
import { Alert } from '../../../components/alerts/Alerts';

export default function PresentacionEntrevista() {
  const router = useRouter();
  const { cameraStream, screenStream, reiniciarCamara } = useStream();

  const [presentacionIniciada, setPresentacionIniciada] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(true);

  const idEvaluacion = localStorage.getItem('id_evaluacion') || 1;
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { extraScreenDetected } = useScreen();
  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    if (extraScreenDetected && !alertShown) {
      setAlertShown(true);
      Alert({
        icon: 'warning',
        title: 'Pantalla adicional detectada',
        html: `
          <p>Parece que hay otra pantalla conectada a tu sistema.</p>
          <p>Por favor, desconéctala para continuar.</p>
        `,
        showCancelButton: false,
        confirmButtonText: 'Entendido',
      }).then(() => setAlertShown(false));
    }
  }, [extraScreenDetected, alertShown]);

  const iniciarPresentacion = () => {
    if (extraScreenDetected) {
      Alert({
        icon: 'error',
        title: 'No puedes continuar',
        html: 'Por favor, desconecta la pantalla adicional para poder comenzar la entrevista.',
        confirmButtonText: 'Ok',
      });
      return;
    }
    setPresentacionIniciada(true);
  };

  return (
    <div className="relative h-screen w-full bg-[#0A0A23] text-white overflow-hidden">
      <ValidadorEntorno idEvaluacion={idEvaluacion} onCamVisibilityChange={setCameraVisible} />

      {!presentacionIniciada ? (
        <InstruccionesPrevias
          token={token}
          cameraVisible={cameraVisible}
          screenStream={screenStream}
          setPresentacionIniciada={iniciarPresentacion}
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
