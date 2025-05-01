'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStream } from '../../../../context/StreamContext';
import { Alert } from '../../../components/alerts/Alerts';

export default function InicioEntrevista() {
  const router = useRouter();
  const { setScreenStream } = useStream();

  const handleStart = async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' }, 
        audio: false
      });

      const track = screen.getVideoTracks()[0];
      const settings = track.getSettings();
      const constraints = track.getConstraints();

      const displaySurface = settings.displaySurface || constraints.displaySurface;

      if (displaySurface && displaySurface !== 'monitor') {
        track.stop();
        await Alert({
          title: 'Pantalla incorrecta',
          text: 'Debes compartir toda la pantalla, no una ventana o pestaña.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          showCancelButton: false,
        });
        return;
      }

      setScreenStream(screen);
      router.push('/postulador/entrevista/validacion-dispositivos');
    } catch (error) {
      console.error('Error al compartir pantalla:', error);
      await Alert({
        title: 'Error al compartir pantalla',
        text: 'No se pudo iniciar la compartición de pantalla. Asegúrate de otorgar los permisos y selecciona "Pantalla completa".',
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        showCancelButton: false,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h1 className="text-3xl font-bold mb-4 ">DevSelectAI</h1>
      <p className="mb-8 text-center max-w-2xl mx-auto">
  Bienvenido al sistema inteligente de entrevistas y asignación de prácticas preprofesionales. A continuación, deberás seleccionar el itinerario de tu carrera. Con base en tu elección, se mostrarán las vacantes técnicas disponibles para que puedas postular.
</p>
      <button onClick={handleStart} className="px-6 py-3 bg-[#3BDCF6] rounded-md">Comenzar</button>
    </div>
  );
}
