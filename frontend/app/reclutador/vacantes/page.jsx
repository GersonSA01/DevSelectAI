'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiEdit, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Alert } from '../../components/alerts/Alerts';
import TablaGeneral from '../../components/TablaGeneral';
import SkeletonVacantes from '../../components/skeleton/SkeletonVacantes';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithCreds } from '../../utils/fetchWithCreds';

export default function VacantesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idItinerario = searchParams.get('id');
  const descripcionItinerario = searchParams.get('descripcion');
  const [isLoading, setIsLoading] = useState(true);
  const [vacantes, setVacantes] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [preguntasPorVacante, setPreguntasPorVacante] = useState({});
  const [programaciones, setProgramaciones] = useState([]);
  const [programacionSeleccionada, setProgramacionSeleccionada] = useState('');

 const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const [y, m, d] = fechaStr.split('-');
  const fecha = new Date(Number(y), Number(m) - 1, Number(d));
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};


  useEffect(() => {
    if (!idItinerario) return;
    const fetchVacantes = async () => {
      setIsLoading(true);
      try {
        const res = await fetchWithCreds(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vacantes/itinerario/${idItinerario}`);
        const data = await res.json();
        setVacantes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al obtener vacantes:', err);
        setVacantes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVacantes();
  }, [idItinerario]);

  const fetchPreguntas = async (idVacante) => {
    try {
      const res = await fetchWithCreds(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/preguntas/vacante/${idVacante}`);
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
    if (expandedRow === idVacante) {
      setExpandedRow(null);
    } else {
      if (!preguntasPorVacante[idVacante]) {
        await fetchPreguntas(idVacante);
      }
      setExpandedRow(idVacante);
    }
  };

  useEffect(() => {
    const fetchProgramaciones = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/programaciones`);
        const data = await res.json();
        setProgramaciones(data);
      } catch (err) {
        console.error('Error al obtener programaciones:', err);
      }
    };
    fetchProgramaciones();
  }, []);

  return isLoading ? (
    <SkeletonVacantes />
  ) : (
    <div className="min-h-screen bg-[#0b1120] text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-2">
        VACANTES DE ITINERARIO {idItinerario}
      </h1>
      <p className="text-center text-gray-300 mb-6">
        {descripcionItinerario || 'Sin descripción disponible para el itinerario.'}
      </p>

 <div className="flex justify-end mb-4">
  <button
    onClick={() => router.push(
      `/reclutador/vacantes/registrar?id=${idItinerario}&descripcion=${encodeURIComponent(descripcionItinerario)}`
    )}
    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow transition-colors"
  >
    + Añadir vacante
  </button>
</div>



     <div className="mb-4 flex flex-wrap items-center gap-3">
  <label htmlFor="programacion" className="text-sm">
    Filtrar por programación:
  </label>
  <select
    id="programacion"
    value={programacionSeleccionada}
    onChange={e => setProgramacionSeleccionada(e.target.value)}
    className="bg-[#1e293b] text-white px-3 py-2 rounded-md max-w-xs"
  >
    <option value="">Todas</option>
    {programaciones.map(p => (
      <option key={p.id_Programacion} value={p.id_Programacion}>
        {formatearFecha(p.FechIniPostulacion)} → {formatearFecha(p.FechFinPostulacion)}
      </option>
    ))}
  </select>
</div>


      <div className="overflow-x-auto">
        <TablaGeneral
          columnas={[
            'Empresa',
            'Nombre de vacante',
            'Vacantes disponibles',
            'Rango Postulación',
            'Rango Aprobación',
            'Habilidades',
            'Acciones'
          ]}
          filas={vacantes
            .filter(v =>
              !programacionSeleccionada ||
              (v.Programacion && v.Programacion.id_Programacion == programacionSeleccionada)
            )
            .flatMap((v, i) => {
              const isExpanded = expandedRow === v.Id_Vacante;

              const filaPrincipal = [
                v.empresa?.Descripcion || 'Sin empresa',

                <div className="flex items-center justify-between" key={i}>
                  <span>{v.Descripcion}</span>
                  <button
                    onClick={() => toggleRow(v.Id_Vacante)}
                    className="text-blue-400 hover:text-blue-300 ml-2"
                  >
                    {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                  </button>
                </div>,

                v.Cantidad,

                v.Programacion
                  ? `${formatearFecha(v.Programacion.FechIniPostulacion)} - ${formatearFecha(v.Programacion.FechFinPostulacion)}`
                  : <span className="text-gray-400 italic">Sin programación</span>,

                v.Programacion
                  ? `${formatearFecha(v.Programacion.FechIniAprobacion)} - ${formatearFecha(v.Programacion.FechFinAprobacion)}`
                  : <span className="text-gray-400 italic">Sin programación</span>,

                v.Habilidades?.length > 0
                  ? v.Habilidades.map(h => h.Descripcion).join(', ')
                  : <span className="text-gray-400 italic">Sin habilidades</span>,

             <div className="flex gap-3" key={i}>
  <div className="relative group">
    <FiEdit
      className="text-yellow-400 cursor-pointer hover:text-yellow-300"
      size={18}
      onClick={() => router.push(
        `/reclutador/vacantes/registrar?id=${idItinerario}&descripcion=${encodeURIComponent(descripcionItinerario)}&idVacante=${v.Id_Vacante}`
      )}
    />
    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
      Editar
    </span>
  </div>

  <div className="relative group">
    <FiTrash2
      className="text-red-500 cursor-pointer hover:text-red-400"
      size={18}
   onClick={async () => {
  const result = await Alert({
    title: '¿Estás seguro?',
    html: 'Esta acción eliminará la vacante (solo si no tiene preguntas).',
    icon: 'warning',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    showCancelButton: true
  });

  if (result.isConfirmed) {
    try {
      const res = await fetchWithCreds(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vacantes/${v.Id_Vacante}`,
        { method: 'DELETE' }
      );

      const data = await res.json();

      await Alert({
        title: res.ok ? 'Eliminado' : 'Error',
        html: data.mensaje || (res.ok
          ? 'La vacante fue eliminada exitosamente.'
          : 'No se pudo eliminar la vacante.'),
        icon: res.ok ? 'success' : 'error',
        confirmButtonText: 'Ok'
      });

      if (res.ok) {
        setVacantes(prev => prev.filter(vac => vac.Id_Vacante !== v.Id_Vacante));
      }

    } catch (err) {
      console.error('Error al eliminar vacante:', err);
      await Alert({
        title: 'Error',
        html: 'Ocurrió un error inesperado al intentar eliminar la vacante.',
        icon: 'error',
        confirmButtonText: 'Cerrar'
      });
    }
  }
}}

    />
    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
      Eliminar
    </span>
  </div>
</div>

              ];

              const filaDetalle = [{
                colspan: 7,
                content: (
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden bg-[#334155] mt-2 p-4 rounded border border-gray-700"
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                )
              }];

              return [filaPrincipal, ...filaDetalle];
            })}
        />
      </div>
    </div>
  );
}
