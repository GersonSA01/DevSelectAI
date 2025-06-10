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
      console.log("🧾 ID del postulante:", idPostulante);

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
      className="min-h-screen flex flex-col items-center justify-center bg-background p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/fondo_pantalla.png')" }}
    >
      <h1 className="text-4xl font-bold text-secondaryText mb-6">Bienvenido a DevSelectAI</h1>
      
      <p className="text-lg text-secondaryText text-center mb-4 mx-32">
        Bienvenido al sistema inteligente de entrevistas y asignación de prácticas preprofesionales.
      </p>

      {itinerario && (
        <p className="text-md text-white text-center mb-6">
          Usted está por seleccionar sus habilidades y vacantes del <strong>{itinerario}</strong>
        </p>
      )}

      <button
        onClick={handleContinuar}
        className="bg-primaryButton hover:bg-primaryButtonHover text-white font-semibold py-2 px-6 rounded-full transition"
      >
        Continuar
      </button>
    </div>
  );
}
