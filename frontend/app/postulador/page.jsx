'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from "../components/alerts/alerts";

export default function Entrevistas() {
  const [itinerarios, setItinerarios] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchItinerarios = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/itinerarios');
        const data = await res.json();
        setItinerarios(data);
      } catch (err) {
        console.error('Error al cargar itinerarios:', err);
        Alert({
          title: 'Error',
          text: 'No se pudieron cargar los itinerarios.',
          icon: 'error'
        });
      }
    };

    fetchItinerarios();
  }, []);

  const handleContinuar = async () => {
    const inputOptions = {};
    itinerarios.forEach(it => {
      inputOptions[it.id_Itinerario] = it.descripcion;
    });

    const result = await Alert({
      title: 'Solicitud de Prácticas Pre-Profesionales',
      text: 'Por favor elige tu itinerario para continuar',
      icon: 'info',
      input: 'select',
      inputOptions,
      inputPlaceholder: '-- Selecciona un itinerario --',
      customClass: {
        popup: 'bg-slate-900 text-white', // fondo oscuro del modal
        input: 'text-black',               // input select con texto negro
        confirmButton: 'bg-blue-600 text-white hover:bg-blue-700',
      },
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage('Por favor selecciona un itinerario.');
        }
        return value;
      },
    });

    if (result.isConfirmed && result.value) {
      localStorage.setItem('id_itinerario', result.value); // Guardar selección
      router.push('/postulador/habilidades');
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
