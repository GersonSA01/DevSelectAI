'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStream } from '../../../../context/StreamContext';

export default function InicioEntrevista() {
  const [duration] = useState('30 minutos');
  const router = useRouter();
  const { setScreenStream } = useStream();

  const handleStart = async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setScreenStream(screen);
      router.push('/postulador/entrevista/validacion-dispositivos');
    } catch (error) {
      console.error('Error al compartir pantalla:', error);
      alert('No se pudo compartir la pantalla. Por favor, vuelve a intentarlo.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h1 className="text-3xl font-bold mb-4">¡Bienvenido a DevSelectAI!</h1>
      <p className="mb-8">La entrevista tiene una duración aproximada de {duration}.</p>
      <button onClick={handleStart} className="px-6 py-3 bg-blue-600 rounded-md">Comenzar</button>
    </div>
  );
}