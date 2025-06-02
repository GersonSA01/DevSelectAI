'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EntrevistaTokenPage() {
  const searchParams = useSearchParams();
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

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center text-center p-6 border border-red-500">
      {estado === 'cargando' && <p>⏳ Cargando datos del postulante...</p>}
      {estado === 'sin-token' && <p style={{ color: 'red' }}>❌ No se recibió ningún token.</p>}
      {estado === 'error' && <p style={{ color: 'red' }}>❌ Error: Token inválido o datos no encontrados.</p>}
      {estado === 'ok' && postulante && (
        <>
          <h1 className="text-2xl font-bold mb-4">🎤 Entrevista para {postulante.nombres} {postulante.apellidos}</h1>
          <p>¡Bienvenido/a! Haz clic en el botón para comenzar tu entrevista técnica.</p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Iniciar entrevista
          </button>
        </>
      )}
    </div>
  );
}
