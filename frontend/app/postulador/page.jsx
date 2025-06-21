'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from "../components/alerts/alerts";

export default function Entrevistas() {
  const [itinerario, setItinerario] = useState('');
  const router = useRouter();

  useEffect(() => {
    const obtenerItinerario = async () => {
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
      } catch (err) {
        console.error('Error al cargar itinerario:', err);
        await Alert({
          title: 'Error',
          text: 'No se pudo obtener su itinerario. Intente más tarde.',
          icon: 'error'
        });
      }
    };

    obtenerItinerario();
  }, []);

  const handleContinuar = () => {
    router.push('/postulador/habilidades');
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center p-4 md:p-8"
      style={{ backgroundImage: "url('/fondo_pantalla.png')" }}
    >
      {/* Overlay oscuro para mejorar contraste */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Contenido sobre el overlay */}
      <div className="relative z-10 flex flex-col items-center text-white text-center max-w-xl px-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
          Bienvenido a DevSelectAI
        </h1>

        <p className="text-base md:text-lg mb-4">
          Bienvenido al sistema inteligente de entrevistas y asignación de prácticas preprofesionales.
        </p>

        {itinerario && (
          <p className="text-sm md:text-md mb-6">
            Usted está por seleccionar sus habilidades y vacantes del <strong>{itinerario}</strong>
          </p>
        )}

        <button
          onClick={handleContinuar}
          className="bg-primaryButton hover:bg-primaryButtonHover text-white font-semibold py-2 px-6 rounded-full transition text-sm md:text-base"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
