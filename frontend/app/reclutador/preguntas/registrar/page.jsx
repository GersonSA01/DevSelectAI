'use client';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function RegistrarPregunta() {
  const router = useRouter();
  const [pregunta, setPregunta] = useState('');
  const [tipoRespuesta, setTipoRespuesta] = useState('');
  const [puntaje, setPuntaje] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    Swal.fire({
      icon: 'success',
      title: '¡Pregunta registrada!',
      text: 'La pregunta ha sido añadida correctamente.',
      confirmButtonColor: '#22c55e'
    }).then(() => {
      router.push('/reclutador/vacantes'); // puedes cambiar la ruta de regreso
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">REGISTRAR PREGUNTA</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-[#111827] p-6 rounded shadow">
        <h2 className="text-xl mb-4">Añadir pregunta</h2>

        <label className="block mb-2">Pregunta:</label>
        <textarea
          className="w-full p-2 rounded mb-4 text-black"
          placeholder="Escriba la pregunta..."
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
        />

        <label className="block mb-2">Tipo de respuesta:</label>
        <input
          className="w-full p-2 rounded mb-4 text-black"
          placeholder="Seleccionar tipo"
          value={tipoRespuesta}
          onChange={(e) => setTipoRespuesta(e.target.value)}
        />

        <label className="block mb-2">Puntaje:</label>
        <input
          className="w-full p-2 rounded mb-4 text-black"
          placeholder="Ej: 10"
          value={puntaje}
          onChange={(e) => setPuntaje(e.target.value)}
        />

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
        >
          Guardar pregunta
        </button>
      </form>
    </div>
  );
}
