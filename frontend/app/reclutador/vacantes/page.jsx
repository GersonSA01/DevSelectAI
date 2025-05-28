'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiEdit, FiTrash2, FiCheck } from 'react-icons/fi';

export default function VacantesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idItinerario = searchParams.get('id');

  const [vacantes, setVacantes] = useState([]);

  useEffect(() => {
    const fetchVacantes = async () => {
      if (!idItinerario) return;
      try {
        const res = await fetch(`http://localhost:5000/api/configuracion/vacantes/${idItinerario}`);
        const data = await res.json();
        setVacantes(data);
      } catch (err) {
        console.error('Error al obtener vacantes:', err);
      }
    };
    fetchVacantes();
  }, [idItinerario]);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-2">Vacantes por Itinerario</h1>

      <button
        onClick={() => router.push('/reclutador/vacantes/registrar')}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600"
      >
        + Añadir vacante
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#1e293b] text-left border border-gray-600">
          <thead>
            <tr className="bg-[#1e3a8a] text-white">
              <th className="p-3 border border-gray-700">Empresa</th>
              <th className="p-3 border border-gray-700">Descripción</th>
              <th className="p-3 border border-gray-700">Disponibles</th>
              <th className="p-3 border border-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vacantes.map((v, i) => (
              <tr key={i}>
                <td className="p-3 border border-gray-700">{v.Empresa?.descripcion || 'Sin empresa'}</td>
                <td className="p-3 border border-gray-700">{v.Descripcion}</td>
                <td className="p-3 border border-gray-700">{v.Cantidad}</td>
                <td className="p-3 border border-gray-700 flex gap-2">
                  <FiEdit className="text-yellow-400 cursor-pointer" />
                  <FiTrash2 className="text-red-500 cursor-pointer" />
                  <FiCheck className="text-green-400 cursor-pointer" />
                </td>
              </tr>
            ))}
{Array.isArray(vacantes) && vacantes.length > 0 ? (
  vacantes.map((v, i) => (
    <tr key={i}>
      <td className="p-3 border border-gray-700">{v.Empresa?.descripcion || 'Sin empresa'}</td>
      <td className="p-3 border border-gray-700">{v.Descripcion}</td>
      <td className="p-3 border border-gray-700">{v.Cantidad}</td>
      <td className="p-3 border border-gray-700 flex gap-2">
        <FiEdit className="text-yellow-400 cursor-pointer" />
        <FiTrash2 className="text-red-500 cursor-pointer" />
        <FiCheck className="text-green-400 cursor-pointer" />
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="4" className="text-center text-gray-400 py-4">
      No hay vacantes registradas
    </td>
  </tr>
)}

          </tbody>
        </table>
      </div>
    </div>
  );
}
