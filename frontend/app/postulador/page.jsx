'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from "../components/alerts/alerts";
import { jwtDecode } from "jwt-decode";

export default function Entrevistas() {
  const [itinerario, setItinerario] = useState('');
  const [nombrePostulante, setNombrePostulante] = useState('');
  const [cargando, setCargando] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [mensajeFinal, setMensajeFinal] = useState('');
  const router = useRouter();

  const getIdPostulante = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch (err) {
      console.error('❌ Error al decodificar token:', err);
      return null;
    }
  };

  useEffect(() => {
    const formatearFecha = (fecha) => {
      if (!fecha) return '';
      const [y, m, d] = fecha.split('-');
      return `${d}/${m}/${y}`;
    };

    const verificarEstadoPostulante = async () => {
      const idPostulante = getIdPostulante();
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
        console.log('📌 Verificando datos del postulante...');
        const res = await fetch(`http://localhost:5000/api/postulante/${idPostulante}`);
        const data = await res.json();

        if (!res.ok || !data?.Nombre || !data?.Apellido || !data?.Itinerario) {
          throw new Error(data?.error || "No se pudo obtener los datos completos del postulante");
        }

        setNombrePostulante(`${data.Nombre} ${data.Apellido}`);
        setItinerario(data.Itinerario);

        console.log('✅ Datos obtenidos:', data);

        const estadoRes = await fetch(`http://localhost:5000/api/postulante/estado/${idPostulante}`);
        const estadoData = await estadoRes.json();

        if (!estadoRes.ok || !estadoData?.estado) {
          throw new Error(estadoData?.error || "No se pudo obtener el estado");
        }

        console.log('📌 Estado del postulante:', estadoData);

        if (estadoData.estado !== 'proceso') {
          setBloqueado(true);

          let mensaje = estadoData.mensaje || 'Tu proceso está en un estado distinto.';

          if (estadoData.estado === 'calificado' && estadoData.fechas) {
            const inicio = formatearFecha(estadoData.fechas.inicio);
            const fin = formatearFecha(estadoData.fechas.fin);
            mensaje += `\n\n📅 Rango para aceptar: ${inicio} - ${fin}`;
          }

          setMensajeFinal(mensaje);
        } else {
          setBloqueado(false);
        }

      } catch (err) {
        console.error('❌ Error al verificar estado:', err);
        await Alert({
          title: 'Error',
          text: 'Ocurrió un error al obtener los datos. Intenta más tarde.',
          icon: 'error'
        });
      } finally {
        setCargando(false);
      }
    };

    verificarEstadoPostulante();
  }, [router]);

  const handleContinuar = () => {
    if (!bloqueado) {
      router.push('/postulador/habilidades');
    }
  };

  const handleCerrarSesion = async () => {
    localStorage.removeItem('token');
    await Alert({
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión correctamente.',
      icon: 'success',
    });
    router.push('/');
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

      
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleCerrarSesion}
          className="bg-red-600 hover:bg-red-500 text-white font-semibold py-1 px-4 rounded-full shadow-lg transition duration-200"
        >
          Cerrar Sesión
        </button>
      </div>

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
              className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-2 px-6 rounded-full shadow-lg transition duration-200"
            >
              Continuar
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Estimado/a {nombrePostulante}
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
