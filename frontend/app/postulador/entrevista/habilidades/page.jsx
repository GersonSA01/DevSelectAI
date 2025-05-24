'use client';

import { useState } from 'react';
import { Alert } from "../../../components/alerts/alerts";
import { useRouter } from 'next/navigation';

export default function SeleccionHabilidades() {
  const router = useRouter();
  const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = useState([]);

  const habilidades = [
    "React",
    "SQL",
    "Express",
    "MongoDB",
    "Node.js",
    "Python",
  ];

  const toggleHabilidad = (habilidad) => {
    if (habilidadesSeleccionadas.includes(habilidad)) {
      setHabilidadesSeleccionadas(habilidadesSeleccionadas.filter((h) => h !== habilidad));
    } else {
      setHabilidadesSeleccionadas([...habilidadesSeleccionadas, habilidad]);
    }
  };

  const handleContinuar = async () => {
    if (habilidadesSeleccionadas.length === 0) {
      await Alert({
        title: 'Error',
        text: 'Por favor selecciona al menos una habilidad.',
        icon: 'error',
        showCancelButton: false,
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const result = await Alert({
      title: '¿Estás seguro que quieres continuar?',
      text: 'Esta acción seleccionará tus habilidades y procederá al siguiente paso.',
      icon: 'warning',
    });

    if (result.isConfirmed) {
      console.log('Habilidades seleccionadas:', habilidadesSeleccionadas);

      const confirmacion = await Alert({
        title: 'Habilidades seleccionadas correctamente',
        text: 'Por favor revisa tu correo institucional.',
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'Continuar',
      });

      if (confirmacion.isConfirmed) {
        router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pageBackground p-8">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        Seleccione una o varias habilidades a evaluar
      </h2>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {habilidades.map((habilidad) => (
          <button
            key={habilidad}
            onClick={() => toggleHabilidad(habilidad)}
            className={`py-2 rounded font-semibold transition ${
              habilidadesSeleccionadas.includes(habilidad)
                ? 'bg-primaryButton text-white'
                : 'bg-white text-black'
            }`}
          >
            {habilidad}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinuar}
        className="mt-8 bg-primaryButton hover:bg-primaryButtonHover text-white font-semibold py-2 px-8 rounded-full transition"
      >
        Continuar
      </button>
    </div>
  );
}
