'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiEdit, FiTrash2, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function VacantesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idItinerario = searchParams.get('id');
  const descripcionItinerario = searchParams.get('descripcion');

  const [vacantes, setVacantes] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [preguntasPorVacante, setPreguntasPorVacante] = useState({});

  useEffect(() => {
    if (!idItinerario) return;

    const fetchVacantes = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/vacantes/itinerario/${idItinerario}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setVacantes(data);
        } else {
          console.error('Respuesta inesperada:', data);
          setVacantes([]);
        }
      } catch (err) {
        console.error('Error al obtener vacantes:', err);
        setVacantes([]);
      }
    };

    fetchVacantes();
  }, [idItinerario]);

  const fetchPreguntas = async (idVacante) => {
    try {
      const res = await fetch(`http://localhost:5000/api/preguntas/vacante/${idVacante}`);
      const data = await res.json();
      
      setPreguntasPorVacante(prev => ({
        ...prev,
        [idVacante]: Array.isArray(data) ? data : []
      }));
    } catch (err) {
      console.error('Error al obtener preguntas:', err);
      setPreguntasPorVacante(prev => ({
        ...prev,
        [idVacante]: []
      }));
    }
  };

  const toggleRow = async (idVacante) => {
    const newExpandedRows = new Set(expandedRows);
    
    if (expandedRows.has(idVacante)) {
      newExpandedRows.delete(idVacante);
    } else {
      newExpandedRows.add(idVacante);
      // Cargar preguntas si no están cargadas
      if (!preguntasPorVacante[idVacante]) {
        await fetchPreguntas(idVacante);
      }
    }
    
    setExpandedRows(newExpandedRows);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-2">
        VACANTES ITINERARIO {idItinerario}
      </h1>
      <p className="text-center text-gray-300 mb-6">
        Análisis de entorno para el desarrollo aplicado a la agropecuaria, turismo y agroindustria
      </p>

      <button
        onClick={() =>
          router.push(
            `/reclutador/vacantes/registrar?id=${idItinerario}&descripcion=${encodeURIComponent(descripcionItinerario)}`
          )
        }
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
            {Array.isArray(vacantes) && vacantes.length > 0 ? (
              vacantes.map((v, i) => (
                <React.Fragment key={v.Id_Vacante || i}>
                  <tr className="hover:bg-[#2d3748]">
                    <td className="p-3 border border-gray-700">
                      {v.empresa?.Descripcion || 'Sin empresa'}
                    </td>
                    <td className="p-3 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <span>{v.Descripcion}</span>
                        <button
                          onClick={() => toggleRow(v.Id_Vacante)}
                          className="text-blue-400 hover:text-blue-300 ml-2"
                        >
                          {expandedRows.has(v.Id_Vacante) ? (
                            <FiChevronUp size={20} />
                          ) : (
                            <FiChevronDown size={20} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-3 border border-gray-700">{v.Cantidad}</td>
                    <td className="p-3 border border-gray-700">
                      <div className="flex gap-2">
                        <FiEdit 
                          className="text-yellow-400 cursor-pointer hover:text-yellow-300" 
                          size={18}
                        />
                        <FiTrash2 
                          className="text-red-500 cursor-pointer hover:text-red-400" 
                          size={18}
                        />
                        <FiCheck 
                          className="text-green-400 cursor-pointer hover:text-green-300" 
                          size={18}
                        />
                      </div>
                    </td>
                  </tr>
                  
                  {/* Fila expandible */}
                  {expandedRows.has(v.Id_Vacante) && (
                    <tr>
                      <td colSpan="4" className="p-0 border border-gray-700">
                        <div className="bg-[#334155] p-4">
                          {/* Contexto */}
                          <div className="mb-4">
                            <h4 className="text-lg font-semibold text-blue-300 mb-2">
                              Contexto:
                            </h4>
                            <p className="text-gray-300 bg-[#1e293b] p-3 rounded border-l-4 border-blue-500">
                              {v.Contexto || 'No hay contexto definido para esta vacante.'}
                            </p>
                          </div>

                          {/* Preguntas */}
                          <div>
                            <h4 className="text-lg font-semibold text-orange-300 mb-2">
                              Preguntas:
                            </h4>
                            {preguntasPorVacante[v.Id_Vacante] ? (
                              preguntasPorVacante[v.Id_Vacante].length > 0 ? (
                                <ul className="space-y-2">
                                  {preguntasPorVacante[v.Id_Vacante].map((pregunta, idx) => (
                                    <li key={pregunta.Id_Pregunta || idx} className="bg-[#1e293b] p-3 rounded border-l-4 border-orange-500">
                                      <div className="flex items-start">
                                        <span className="text-orange-400 font-bold mr-2">•</span>
                                        <span className="text-gray-300">{pregunta.Pregunta}</span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-400 italic bg-[#1e293b] p-3 rounded">
                                  No hay preguntas registradas para esta vacante.
                                </p>
                              )
                            ) : (
                              <div className="bg-[#1e293b] p-3 rounded">
                                <p className="text-gray-400">Cargando preguntas...</p>
                              </div>
                            )}
                          </div>

                          {/* Botones de acción adicionales - CORREGIDOS */}
<div className="mt-4 flex gap-2">
  <button 
    onClick={() => router.push(`/reclutador/preguntas/registrar?idVacante=${v.Id_Vacante}`)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
  >
    + Añadir pregunta
  </button>
  <button 
    onClick={() => router.push(`/reclutador/preguntas?idVacante=${v.Id_Vacante}`)}
    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
  >
    👁 Visualizar preguntas
  </button>
</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-gray-400 py-8">
                  No hay vacantes registradas para este itinerario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}