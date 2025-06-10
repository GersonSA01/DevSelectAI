'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStream } from '../../../../context/StreamContext';
import { Alert } from '../../../components/alerts/Alerts';

export default function InicioEntrevista() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { setScreenStream } = useStream();

  const [nombrePostulante, setNombrePostulante] = useState('');

  // ✅ Obtener ID y nombre del postulante al cargar
  useEffect(() => {
    const obtenerPostulante = async () => {
      if (!token) return;

      try {
        const res = await fetch(`http://localhost:5000/api/postulante/token/${token}`);
        const data = await res.json();

        if (data?.Id_Postulante) {
          localStorage.setItem('id_postulante', data.Id_Postulante);
          setNombrePostulante(`${data.Nombre} ${data.Apellido}`);
          console.log('✅ ID guardado:', data.Id_Postulante);
        } else {
          console.warn('❌ Token inválido o sin datos.');
        }
      } catch (err) {
        console.error('❌ Error al validar token:', err);
      }
    };

    obtenerPostulante();
  }, [token]);

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
      router.push(`/postulador/entrevista/validacion-dispositivos?token=${token}`);
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
        className="px-6 py-3 bg-[#3BDCF6] text-black font-semibold rounded-md hover:bg-[#34cbe1] transition"
      >
        Comenzar
      </button>
    </div>
  );
}
