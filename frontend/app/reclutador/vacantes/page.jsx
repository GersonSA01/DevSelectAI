'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiEdit, FiTrash2, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Alert } from '../../components/alerts/Alerts';
import TablaGeneral from '../../components/TablaGeneral';

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
      setVacantes(data); // 🔥 aquí ya recibes v.habilidades si el backend las incluye
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
       <TablaGeneral
  columnas={['Empresa', 'Nombre de vacante', 'Vacantes disponibles', 'Habilidades', 'Acciones']}
  filas={vacantes.map((v, i) => [
    v.empresa?.Descripcion || 'Sin empresa',
    <div className="flex items-center justify-between" key={i}>
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
    </div>,
    v.Cantidad,
    v.habilidades?.length > 0
      ? v.habilidades.map(h => h.habilidad?.Descripcion).join(', ')
      : <span className="text-gray-400 italic">Sin habilidades</span>,
    <div className="flex gap-2" key={i}>
      <FiEdit 
        className="text-yellow-400 cursor-pointer hover:text-yellow-300" 
        size={18}
        onClick={() => router.push(
          `/reclutador/vacantes/registrar?id=${idItinerario}&descripcion=${encodeURIComponent(descripcionItinerario)}&idVacante=${v.Id_Vacante}`
        )}
      />
      <FiTrash2 
        className="text-red-500 cursor-pointer hover:text-red-400" 
        size={18}
        onClick={async () => {
          const result = await Alert({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará la vacante (solo si no tiene preguntas).',
            icon: 'warning',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
          });

          if (result.isConfirmed) {
            try {
              const res = await fetch(`http://localhost:5000/api/vacantes/${v.Id_Vacante}`, {
                method: 'DELETE'
              });

              const data = await res.json();

              if (res.ok) {
                await Alert({
                  title: 'Eliminado',
                  text: 'La vacante fue eliminada exitosamente.',
                  icon: 'success',
                  confirmButtonText: 'Ok'
                });
                setVacantes(prev => prev.filter(vac => vac.Id_Vacante !== v.Id_Vacante));
              } else {
                await Alert({
                  title: 'Error',
                  text: data.mensaje || 'No se pudo eliminar la vacante.',
                  icon: 'error',
                  confirmButtonText: 'Cerrar'
                });
              }
            } catch (err) {
              console.error('Error al eliminar vacante:', err);
              await Alert({
                title: 'Error',
                text: 'Ocurrió un error inesperado al intentar eliminar la vacante.',
                icon: 'error',
                confirmButtonText: 'Cerrar'
              });
            }
          }
        }}
      />
      <FiCheck 
        className="text-green-400 cursor-pointer hover:text-green-300" 
        size={18}
      />
    </div>
  ])}
/>
{Array.from(expandedRows).map((id) => {
  const v = vacantes.find(vac => vac.Id_Vacante === id);
  return (
    <div key={`exp-${id}`} className="bg-[#334155] mt-2 p-4 rounded border border-gray-700">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-blue-300 mb-2">Contexto:</h4>
        <p className="text-gray-300 bg-[#1e293b] p-3 rounded border-l-4 border-blue-500">
          {v?.Contexto || 'No hay contexto definido para esta vacante.'}
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-orange-300 mb-2">Preguntas:</h4>
        {preguntasPorVacante[v.Id_Vacante]?.length > 0 ? (
          <ul className="space-y-2">
            {preguntasPorVacante[v.Id_Vacante].map((pregunta, idx) => (
              <li key={idx} className="bg-[#1e293b] p-3 rounded border-l-4 border-orange-500">
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
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => router.push(`/reclutador/preguntas?idVacante=${v.Id_Vacante}`)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
        >
          👁 Visualizar preguntas
        </button>
      </div>
    </div>
  );
})}



      </div>
    </div>
  );
}