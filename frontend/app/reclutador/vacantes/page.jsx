'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit, FiTrash2, FiCheck } from 'react-icons/fi';

export default function VacantesPage() {
  const router = useRouter();

  const [vacantes, setVacantes] = useState([
    {
      empresa: 'Coordinador de proyecto',
      nombreVacante: 'Coordinador de proyecto',
      disponibles: 2,
      contexto: 'Encargado de prácticas y monitoreo técnico.',
      preguntas: [
        '¿Cuál ha sido tu mayor desafío técnico?',
        '¿Qué lenguaje dominas?',
      ],
    },
  ]);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-2">VACANTES ITINERARIO 1</h1>
      <p className="text-center mb-6">
        Análisis de entorno para el desarrollo aplicado a la agropecuaria, turismo y agroindustria
      </p>

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
              <th className="p-3 border border-gray-700">Nombre de vacante</th>
              <th className="p-3 border border-gray-700">Vacantes disponibles</th>
              <th className="p-3 border border-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vacantes.map((v, idx) => (
              <tr key={idx}>
                <td className="p-3 border border-gray-700">{v.empresa}</td>
                <td className="p-3 border border-gray-700">{v.nombreVacante}</td>
                <td className="p-3 border border-gray-700">{v.disponibles}</td>
                <td className="p-3 border border-gray-700 flex gap-3">
                  <FiEdit className="text-yellow-400 cursor-pointer" />
                  <FiTrash2 className="text-red-500 cursor-pointer" />
                  <FiCheck className="text-green-400 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-[#1e293b] p-4 rounded border border-gray-700">
        <p className="mb-2">
          <strong>Contexto:</strong> {vacantes[0].contexto}
        </p>
        <p className="mb-2">
          <strong>Preguntas:</strong>
        </p>
        <ul className="list-disc pl-6 mb-4">
          {vacantes[0].preguntas.map((pregunta, i) => (
            <li key={i}>{pregunta}</li>
          ))}
        </ul>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/reclutador/preguntas/registrar')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Añadir pregunta
          </button>
          <button
                onClick={() => router.push('/reclutador/preguntas')}
                className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
                >
                👁 Visualizar preguntas
            </button>

        </div>
      </div>
    </div>
  );
}
