'use client';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function RegistrarVacante() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [itinerario, setItinerario] = useState('');
  const [vacantes, setVacantes] = useState('');
  const [contexto, setContexto] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí podrías hacer validación de campos vacíos si deseas

    Swal.fire({
      icon: 'success',
      title: '¡Vacante registrada!',
      text: 'La vacante ha sido añadida correctamente.',
      confirmButtonColor: '#22c55e'
    }).then(() => {
      // Opcional: redireccionar de regreso a la lista
      router.push('/reclutador/vacantes');
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">REGISTRAR VACANTE</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-[#111827] p-6 rounded shadow">
        <h2 className="text-xl mb-4">Añadir vacante</h2>

        <label className="block mb-2">Nombre de vacante:</label>
        <input
          className="w-full p-2 rounded mb-4 text-black"
          placeholder="Ej: Coordinador de proyecto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <label className="block mb-2">Itinerar:</label>
        <input
          className="w-full p-2 rounded mb-4 text-black"
          placeholder="Seleccione itinerario"
          value={itinerario}
          onChange={(e) => setItinerario(e.target.value)}
        />

        <label className="block mb-2">Vacantes disponibles:</label>
        <input
          className="w-full p-2 rounded mb-4 text-black"
          placeholder="Ej: 3"
          value={vacantes}
          onChange={(e) => setVacantes(e.target.value)}
        />

        <label className="block mb-2">Contexto:</label>
        <textarea
          className="w-full p-2 rounded mb-4 text-black"
          placeholder="Describe el contexto de la vacante..."
          value={contexto}
          onChange={(e) => setContexto(e.target.value)}
        />

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
        >
          Guardar vacante
        </button>
      </form>
    </div>
  );
}
