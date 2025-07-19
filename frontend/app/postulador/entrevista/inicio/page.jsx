'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useScreen } from '../../../../context/ScreenContext';
import { Alert } from '../../../components/alerts/Alerts';

export default function InicioEntrevista() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { extraScreenDetected } = useScreen();

  const [nombrePostulante, setNombrePostulante] = useState('');
  const [alertShown, setAlertShown] = useState(false);

  const fetchPostulantePorToken = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/postulante/token/${token}`);
      const data = await res.json();

      if (data?.postulante?.Id_Postulante) {
  const postulante = data.postulante;

  localStorage.setItem('id_postulante', postulante.Id_Postulante);
  setNombrePostulante(`${postulante.Nombre} ${postulante.Apellido}`);
  console.log('📄 Data completa del postulante:', postulante);
} else {
        console.warn('❌ Token inválido o sin datos.');
      }
    } catch (err) {
      console.error('❌ Error al validar token:', err);
    }
  };

  useEffect(() => {
    fetchPostulantePorToken();
  }, [token]);

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
      }).then(() => {
        setAlertShown(false);
      });
    }
  }, [extraScreenDetected, alertShown]);

  const handleStart = () => {
    if (extraScreenDetected) {
      Alert({
        icon: 'error',
        title: 'No puedes continuar',
        html: 'Por favor, desconecta la pantalla adicional para poder continuar con la entrevista.',
        confirmButtonText: 'Ok',
      });
      return;
    }
    router.push(`/postulador/entrevista/validacion-dispositivos?token=${token}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-white text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">DevSelectAI</h1>

      {nombrePostulante && (
        <p className="mb-2 text-lg text-cyan-400 font-medium">Hola, {nombrePostulante}</p>
      )}

      <p className="mb-10 text-base sm:text-lg max-w-xl">
        Bienvenido al sistema inteligente de entrevistas y asignación de prácticas preprofesionales.
        A continuación, se comenzará la entrevista.
      </p>

      <button
        onClick={handleStart}
        className={`mt-6 px-6 py-3 rounded-md font-semibold transition ${
          extraScreenDetected
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-[#3BDCF6] text-black hover:bg-[#34cbe1]'
        }`}
      >
        Comenzar
      </button>
    </div>
  );
}
