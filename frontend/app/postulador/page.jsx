'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from "../components/alerts/alerts";

export default function Entrevistas() {
  const [itinerario, setItinerario] = useState('');
  const [nombrePostulante, setNombrePostulante] = useState('');
  const [cargando, setCargando] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [mensajeFinal, setMensajeFinal] = useState('');
  const router = useRouter();

  useEffect(() => {
    const verificarEstadoPostulante = async () => {
      const idPostulante = localStorage.getItem('id_postulante');
      if (!idPostulante) {
        await Alert({
          title: 'Error',
          text: 'No se encontró el ID del postulante. Inicia sesión de nuevo.',
          icon: 'error'
        });
        router.push('/');
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/postulante/${idPostulante}`);
        const data = await res.json();

        if (!data || !data.Itinerario) {
          throw new Error("No se pudo obtener el itinerario");
        }

        setItinerario(data.Itinerario);
        setNombrePostulante(`${data.Nombre} ${data.Apellido}`);

        const estadoRes = await fetch(`http://localhost:5000/api/postulante/estado/${idPostulante}`);
        const estadoData = await estadoRes.json();

        if (!estadoData || !estadoData.estado) {
          throw new Error("No se pudo obtener el estado");
        }

        if (estadoData.estado !== 'proceso') {
          setBloqueado(true);

          let mensaje = estadoData.mensaje || 'Tu proceso está en un estado distinto.';

          if (estadoData.estado === 'calificado') {
            if (estadoData.fechas) {
              const inicio = formatearFecha(estadoData.fechas.inicio);
              const fin = formatearFecha(estadoData.fechas.fin);
              mensaje += `\n\n📅 Rango para aceptar: ${inicio} - ${fin}`;
            }
          }

          setMensajeFinal(mensaje);
        } else {
          setBloqueado(false);
        }

      } catch (err) {
        console.error('Error al verificar estado:', err);
        await Alert({
          title: 'Error',
          text: 'Ocurrió un error. Intente más tarde.',
          icon: 'error'
        });
      } finally {
        setCargando(false);
      }
    };

    const formatearFecha = (fecha) => {
      if (!fecha) return '';
      const [y, m, d] = fecha.split('-');
      return `${d}/${m}/${y}`;
    };

    verificarEstadoPostulante();
  }, []);

  const handleContinuar = () => {
    if (!bloqueado) {
      router.push('/postulador/habilidades');
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Cargando...
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center p-4 md:p-8"
      style={{ backgroundImage: "url('/fondo_pantalla.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <div className="relative z-10 flex flex-col items-center text-white text-center max-w-xl px-4">
        {!bloqueado ? (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Bienvenido/a {nombrePostulante} a <span className="text-cyan-400">DevSelectAI</span>
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed mb-3">
              Sistema inteligente de entrevistas y asignación de prácticas preprofesionales.
            </p>

            {itinerario && (
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Está por seleccionar sus habilidades y vacantes del <span className="text-cyan-300 font-semibold">{itinerario}</span>.
              </p>
            )}

            <button
              onClick={handleContinuar}
              className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-2 px-6 rounded-full transition duration-200"
            >
              Continuar
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Estimado Estudiante {nombrePostulante}
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-line">
              {mensajeFinal}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
