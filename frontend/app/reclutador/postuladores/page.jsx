'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiCheck, FiX, FiSearch } from 'react-icons/fi';
import Swal from 'sweetalert2';
import TablaGeneral from '../../components/TablaGeneral';

export default function PostulacionesPage() {
  const router = useRouter();
  const [filtroNombre, setFiltroNombre] = useState('');
  const [itinerario, setItinerario] = useState('');
  const [postulantes, setPostulantes] = useState([]);
  const [itinerarios, setItinerarios] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPostulantes, resItinerarios] = await Promise.all([
          fetch('http://localhost:5000/api/postulante'),
          fetch('http://localhost:5000/api/itinerarios'),
        ]);

        const postulantesData = await resPostulantes.json();
        const itinerariosData = await resItinerarios.json();

        setPostulantes(Array.isArray(postulantesData) ? postulantesData : postulantesData.postulantes || []);
        setItinerarios(itinerariosData || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  const aceptarPostulante = async (id, nombre, vacante) => {
    const confirmacion = await Swal.fire({
      title: `¿Aceptar a ${nombre}?`,
      text: `El postulante será aprobado para la vacante "${vacante}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      confirmButtonText: 'Aprobar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await fetch(`http://localhost:5000/api/postulantes/${id}/aceptar`, { method: 'PUT' });
        Swal.fire('✅ Aprobado', `${nombre} fue aprobado para "${vacante}"`, 'success');
        setPostulantes(prev =>
          prev.map(p =>
            p.Id_Postulante === id ? { ...p, Estado: 'Aprobado' } : p
          )
        );
      } catch (error) {
        console.error('Error al aprobar:', error);
        Swal.fire('Error', 'No se pudo aprobar al postulante.', 'error');
      }
    }
  };

  const rechazarPostulante = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'El postulante será rechazado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await fetch(`http://localhost:5000/api/postulantes/${id}/rechazar`, { method: 'PUT' });
        Swal.fire('❌ Rechazado', 'El postulante ha sido rechazado.', 'success');
        setPostulantes(prev =>
          prev.map(p =>
            p.Id_Postulante === id ? { ...p, Estado: 'Rechazado' } : p
          )
        );
      } catch (error) {
        console.error('Error al rechazar:', error);
        Swal.fire('Error', 'No se pudo rechazar al postulante.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-6">Postulaciones</h1>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-sm font-medium">Postulantes:</label>
          <div className="flex items-center gap-2 bg-[#1E293B] text-white px-3 py-1 rounded-md shadow-inner">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre"
              className="bg-transparent focus:outline-none text-sm w-48 placeholder:text-gray-400"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-sm font-medium">Itinerario:</label>
          <select
            className="bg-[#1E293B] text-white px-3 py-1 rounded-md text-sm shadow-inner focus:outline-none"
            value={itinerario}
            onChange={(e) => setItinerario(e.target.value)}
          >
            <option value="">Todos</option>
            {itinerarios.map(it => (
              <option key={it.id_Itinerario} value={it.id_Itinerario}>
                {it.descripcion}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla con scroll horizontal */}
      <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-md">
        <TablaGeneral
          columnas={['Nombre', 'Vacante Escogida', 'Habilidades', 'Estado / Calificación', 'Acciones']}
          filas={postulantes
            .filter(p => `${p.Nombre} ${p.Apellido}`.toLowerCase().includes(filtroNombre.toLowerCase()))
            .filter(p =>
              !itinerario ||
              (p.selecciones?.[0]?.vacante?.id_Itinerario?.toString() === itinerario)
            )
            .map(p => [
              `${p.Nombre} ${p.Apellido}`,
              p.selecciones?.[0]?.vacante?.Descripcion || '—',
              (p.habilidades || []).length > 0
                ? p.habilidades.map((h, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-blue-300 mr-1"
                    >
                      {h.habilidad?.Descripcion}
                    </span>
                  ))
                : <span className="text-gray-400 text-xs">—</span>,
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-md ${
                  p.estadoPostulacion?.descripcion === 'Por evaluar' ? 'bg-yellow-600' :
                  p.estadoPostulacion?.descripcion === 'Evaluado' ? 'bg-blue-600' :
                  p.estadoPostulacion?.descripcion === 'Aprobado' ? 'bg-green-600' :
                  p.estadoPostulacion?.descripcion === 'Rechazado' ? 'bg-red-600' :
                  p.estadoPostulacion?.descripcion === 'Calificado' ? 'bg-indigo-600' :
                  'bg-gray-600'
                }`}>
                  {p.estadoPostulacion?.descripcion || '—'}
                </span>
                {p.estadoPostulacion?.descripcion === 'Calificado' && p.evaluaciones?.[0]?.PuntajeTotal !== undefined && (
  <div className={`text-xs font-semibold px-2 py-1 rounded-md shadow-inner
    ${p.evaluaciones[0].PuntajeTotal >= 16
      ? 'bg-green-700 text-green-100'
      : p.evaluaciones[0].PuntajeTotal >= 10
      ? 'bg-yellow-700 text-yellow-100'
      : 'bg-red-700 text-red-100'
    }`}>
    Nota: {p.evaluaciones[0].PuntajeTotal}/20
  </div>
)}

              </div>,
              <div className="flex justify-center gap-2 text-lg">
                <FiEye
                  className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
                  onClick={() => router.push(`/reclutador/informes?id=${p.Id_Postulante}`)}
                />
                <FiCheck
                  className="text-green-500 hover:text-green-400 cursor-pointer"
                  title="Aprobar"
                  onClick={() => aceptarPostulante(p.Id_Postulante, `${p.Nombre} ${p.Apellido}`, p.vacante?.Descripcion || 'vacante')}
                />
                <FiX
                  className="text-red-500 hover:text-red-400 cursor-pointer"
                  title="Rechazar"
                  onClick={() => rechazarPostulante(p.Id_Postulante)}
                />
              </div>
            ])}
        />
      </div>
    </div>
  );
}





