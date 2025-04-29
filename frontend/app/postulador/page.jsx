'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from "../components/alerts/alerts";

export default function Entrevistas() {
  const [itinerarioSeleccionado, setItinerarioSeleccionado] = useState('');
  const router = useRouter();

  const handleContinuar = async () => {
    const result = await Alert({
      title: 'Solicitud de Prácticas Pre-Profesionales',
      text: 'Por favor elige tu itinerario para continuar',
      icon: 'info',
      input: 'select',
      inputOptions: {
        itinerario1: 'Itinerario 1: Análisis de entorno para agropecuaria, turismo e industria',
        itinerario2: 'Itinerario 2: Diseño y desarrollo de aplicaciones',
      },
      inputPlaceholder: '-- Selecciona un itinerario --',
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage('Por favor selecciona un itinerario.');
        }
        return value;
      },
    });

    if (result.isConfirmed && result.value) {
      setItinerarioSeleccionado(result.value);
      router.push('/postulador/entrevista/vacantes');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/fondo_pantalla.png')" }}
    >
      <h1 className="text-4xl font-bold text-secondaryText mb-6">Bienvenido a DevSelectAI</h1>
      <p className="text-lg text-secondaryText text-center mb-8 mx-32">
        Bienvenido al sistema inteligente de entrevistas y asignación de prácticas preprofesionales. A continuación, deberás seleccionar el itinerario de tu carrera. Con base en tu elección, se mostrarán las vacantes técnicas disponibles para que puedas postular.
      </p>

      <button
        onClick={handleContinuar}
        className="bg-primaryButton hover:bg-primaryButtonHover text-white font-semibold py-2 px-6 rounded-full transition"
      >
        Continuar
      </button>
    </div>
  );
}
