'use client';
import { StreamProvider } from '../../../context/StreamContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EntrevistaLayout({ children }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    if (!token) {
      setEstado('sin-token');
      return;
    }

    const validarToken = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/postulante/token/${token}`);
        if (!res.ok) throw new Error('Token inválido');
        setEstado('invalido');
      } catch (err) {
        console.error('❌ Token inválido:', err);
        setEstado('invalido');
        return;
      }

      setEstado('ok');
    };

    validarToken();
  }, [token]);

  if (estado === 'cargando') {
    return (
      <main className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        ⏳ Validando acceso...
      </main>
    );
  }

  if (estado === 'sin-token') {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600 bg-gray-900">
        ❌ No se recibió ningún token.
      </main>
    );
  }

  if (estado === 'invalido') {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600 bg-gray-900">
        ❌ Token inválido o acceso no autorizado.
      </main>
    );
  }

  return (
    <StreamProvider>
      <main
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/fondo_pantalla.png')" }}
      >
        {children}
      </main>
    </StreamProvider>
  );
}
