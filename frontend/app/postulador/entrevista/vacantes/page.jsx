'use client';

import { useState } from 'react';
import { Alert } from "../../../components/alerts/alerts";
import { useRouter } from 'next/navigation';

export default function Datos() {
  const router = useRouter();
  const [vacantesSeleccionadas, setVacantesSeleccionadas] = useState([]);

  const vacantes = [
    "Analista de Datos",
    "Administrador de Base de Datos SQL",
    "Desarrollador de IA",
    "Desarrollador Backend"
  ];

  const toggleVacante = (vacante) => {
    if (vacantesSeleccionadas.includes(vacante)) {
      setVacantesSeleccionadas(vacantesSeleccionadas.filter((v) => v !== vacante));
    } else {
      setVacantesSeleccionadas([...vacantesSeleccionadas, vacante]);
    }
  };

  const handleContinuar = async () => {
    if (vacantesSeleccionadas.length === 0) {
      await Alert({
        title: 'Error',
        text: 'Por favor selecciona al menos una vacante.',
        icon: 'error',
        showCancelButton: false,
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    const result = await Alert({
      title: '¿Estás seguro que quieres continuar?',
      text: 'Esta acción seleccionará tus vacantes y procederá al siguiente paso.',
      icon: 'warning',
    });
  
    if (result.isConfirmed) {
      console.log('Vacantes seleccionadas:', vacantesSeleccionadas);
  
      const confirmacion = await Alert({
        title: 'Mensaje de aceptación de Vacante y realización de entrevista',
        text: 'Por favor revisar tu correo institucional',
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
        Seleccione una o varias vacantes
      </h2>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {vacantes.map((vacante) => (
          <button
            key={vacante}
            onClick={() => toggleVacante(vacante)}
            className={`py-2 rounded font-semibold transition ${
              vacantesSeleccionadas.includes(vacante)
                ? 'bg-primaryButton text-white'
                : 'bg-white text-black'
            }`}
          >
            {vacante}
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
