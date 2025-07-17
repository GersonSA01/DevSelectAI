'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScreen } from '../../../../context/ScreenContext';
import { Alert } from '../../../components/alerts/Alerts';
import { CheckCircle } from 'lucide-react';

export default function Finalizacion() {
  const router = useRouter();
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

  

  const handleAccept = () => {
    if (extraScreenDetected) {
      Alert({
        icon: 'error',
        title: 'No puedes continuar',
        html: 'Por favor, desconecta la pantalla adicional para poder finalizar correctamente.',
        confirmButtonText: 'Ok',
      });
      return;
    }

    router.push('/');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#0A0A23] text-white px-4">
      <div className="bg-[#1C1F2E] p-8 md:p-12 rounded-2xl max-w-md w-full text-center shadow-xl">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-[#3BDCF6] rounded-full mb-6">
          <CheckCircle className="text-white w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold mb-4">¡Gracias por completar tu entrevista!</h2>
        <p className="text-sm text-gray-300 mb-2">
          Hemos recibido tus respuestas y ejercicios técnicos. El equipo de DevSelectAI los revisará con el apoyo de nuestro sistema de IA.
        </p>
        <p className="text-sm text-gray-300 mb-6">
          En breve recibirás un resumen de tu postulación y futuras actualizaciones al correo institucional registrado.
        </p>

        <button
          onClick={handleAccept}
          className={`bg-[#3BDCF6] hover:bg-[#31c0db] text-black font-semibold px-6 py-2 rounded-full transition-colors ${
            extraScreenDetected ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          Aceptar
        </button>

        <p className="text-xs text-gray-500 mt-6">
          DevSelectAI – UNEMI · Sistema de entrevistas asistidas por IA para prácticas preprofesionales
        </p>
      </div>
    </div>
  );
}
