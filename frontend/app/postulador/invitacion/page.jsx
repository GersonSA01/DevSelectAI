'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EntrevistaTokenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [postulante, setPostulante] = useState(null);
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    console.log("🔍 Token recibido:", token);
    if (!token) {
      setEstado('sin-token');
      return;
    }

    const obtenerDatos = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/postulante/token/${token}`);
        if (!res.ok) throw new Error('Token inválido o estudiante no encontrado');

        const data = await res.json();
        console.log("✅ Datos recibidos:", data);

        setPostulante(data);
        setEstado('ok');
      } catch (error) {
        console.error("❌ Error al obtener datos:", error);
        setEstado('error');
      }
    };

    obtenerDatos();
  }, [token]);

  const iniciarEntrevista = () => {
    if (token) {
      router.push(`/entrevista/virtual?token=${token}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col items-center justify-center text-center p-6">
      {estado === 'cargando' && <p className="text-gray-600">⏳ Cargando datos del postulante...</p>}
      {estado === 'sin-token' && <p className="text-red-600 font-semibold">❌ No se recibió ningún token.</p>}
      {estado === 'error' && <p className="text-red-600 font-semibold">❌ Token inválido o datos no encontrados.</p>}

      {estado === 'ok' && postulante && (
        <div className="bg-white shadow-md rounded p-8 max-w-xl w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🎤 Entrevista para {postulante.nombres} {postulante.apellidos}
          </h1>
          <p className="mb-4">¡Bienvenido/a! Haz clic en el siguiente botón para comenzar tu entrevista técnica.</p>
          <button
            onClick={iniciarEntrevista}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Iniciar entrevista
          </button>
        </div>
      )}
    </div>
  );
}
