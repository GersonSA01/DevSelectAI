'use client';

import { StreamProvider } from '../../../context/StreamContext';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldX, CheckCircle } from 'lucide-react';
import { ClipLoader } from 'react-spinners';

export default function EntrevistaLayout({ children }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    if (!token) {
      setEstado('sin-token');
      return;
    }

    const validarToken = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/postulante/token/${token}`);
        if (!res.ok) throw new Error('Token inválido');
        const data = await res.json();

        if (data.id_EstadoPostulacion === 1) {
          setEstado('ok'); // Solo permite si está 'Por evaluar'
        } else {
          setEstado('ya-evaluado'); // cualquier otro estado ya no permite entrevista
        }

      } catch (err) {
        console.error('Token inválido:', err);
        setEstado('invalido');
      }
    };

    validarToken();
  }, [token]);

  const ErrorLayout = ({ icon: Icon, message }) => (
    <main className="min-h-screen flex flex-col items-center justify-center bg-pageBackground text-red-400 px-6 text-center">
      <Icon className="w-20 h-20 mb-6 drop-shadow-md" />
      <h1 className="text-2xl font-bold tracking-wide">{message}</h1>
      <p className="text-muted mt-2 max-w-md text-base">
        Si crees que esto es un error, contacta con soporte técnico o vuelve a intentarlo más tarde.
      </p>
    </main>
  );

  if (estado === 'cargando') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-pageBackground text-white">
        <ClipLoader color="#38bdf8" size={60} />
        <p className="mt-6 text-lg text-primaryButton font-semibold tracking-wide">
          Validando acceso, por favor espera...
        </p>
      </main>
    );
  }

  if (estado === 'sin-token') {
    return <ErrorLayout icon={AlertTriangle} message="No se recibió ningún token de acceso." />;
  }

  if (estado === 'invalido') {
    return <ErrorLayout icon={ShieldX} message="Token inválido o acceso no autorizado." />;
  }

  if (estado === 'ya-evaluado') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-pageBackground text-white px-6 text-center">
        <CheckCircle className="w-20 h-20 text-green-400 mb-6 drop-shadow-xl" />
        <h1 className="text-3xl font-bold text-green-400 mb-2 tracking-wide">Entrevista no disponible</h1>
        <p className="text-muted text-lg max-w-xl">
          Ya has completado o no estás autorizado para realizar la entrevista técnica. Revisa tu correo institucional para más información.
        </p>
      </main>
    );
  }

  return (
    <StreamProvider>
      <main
        className="relative min-h-screen pt-16 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/fondo_pantalla.png')" }}
      >
        <div className="absolute inset-0 bg-black/70 z-0"></div>

        <div className="relative z-10">
          {children}
        </div>
      </main>
    </StreamProvider>
  );
}
