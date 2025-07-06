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
  const [programaciones, setProgramaciones] = useState([]);
const [programacionSeleccionada, setProgramacionSeleccionada] = useState('');

const getHoyLocal = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const estaEnRangoAprobacion = (programacion) => {
  if (!programacion) return false;  // 👈 comprobamos que no sea undefined
  const hoy = getHoyLocal();
  const ini = programacion.FechIniAprobacion;
  const fin = programacion.FechFinAprobacion;

  console.log({ hoy, ini, fin });

  return hoy >= ini && hoy <= fin;
};




const estaEnRangoPostulacion = (fechaSeleccion, programacion) => {
  if (!fechaSeleccion || !programacion) return false;
  const fecha = new Date(fechaSeleccion);
  const inicio = new Date(programacion.FechIniPostulacion);
  const fin = new Date(programacion.FechFinPostulacion);
  return fecha >= inicio && fecha <= fin;
};

const formatearFecha = (f) => new Date(f).toLocaleDateString();



const puedeVerInforme = (estado) =>
  ['Aprobado', 'Rechazado', 'Calificado'].includes(estado);

useEffect(() => {
  const fetchData = async () => {
  try {
    const [resPostulantes, resItinerarios, resProgramaciones] = await Promise.all([
      fetch('http://localhost:5000/api/postulante'),
      fetch('http://localhost:5000/api/itinerarios'),
      fetch('http://localhost:5000/api/programaciones')
    ]);

    const postulantesData = await resPostulantes.json();
    const itinerariosData = await resItinerarios.json();
    const programacionesData = await resProgramaciones.json();

    setPostulantes(Array.isArray(postulantesData) ? postulantesData : postulantesData.postulantes || []);
    setItinerarios(itinerariosData || []);

    setProgramaciones(programacionesData || []);


  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
};


  fetchData();
}, []);


useEffect(() => {
  if (programaciones.length > 0) {
    const hoy = new Date();
    const activa = programaciones.find(p => {
      const ini = new Date(p.FechIniPostulacion);
      const fin = new Date(p.FechFinPostulacion);
      return hoy >= ini && hoy <= fin;
    });

    if (activa) {
      setProgramacionSeleccionada(activa.id_Programacion);
    } else {
      setProgramacionSeleccionada(programaciones[0].id_Programacion);
    }
  }
}, [programaciones]);




 const aceptarPostulante = async (id, nombre, vacante) => {
  if (!programacionActual || !estaEnRangoAprobacion(programacionActual)) {
    Swal.fire({
      title: 'Fuera de rango',
      text: 'No es posible aprobar fuera del periodo de aprobación.',
      icon: 'warning'
    });
    return;
  }

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

  const programacionActual = programaciones.find(p => p.id_Programacion == programacionSeleccionada);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-2">Postulaciones</h1>

      <div className="bg-[#1E293B] p-4 rounded-lg mb-4 shadow-md">
<div className="bg-[#1E293B] p-4 rounded-lg mb-4 shadow-md grid sm:grid-cols-2 gap-4">
<div>
  <label className="text-lg font-semibold block mb-1">Periodo de Postulación</label>
  <select
    className="bg-[#0f172a] text-white px-3 py-2 rounded-md w-full"
    value={programacionSeleccionada}
    onChange={(e) => setProgramacionSeleccionada(e.target.value)}
  >
    <option value="">Selecciona una programación</option>
    {programaciones.map(p => (
      <option key={p.id_Programacion} value={p.id_Programacion}>
        {p.rangoPostulacion}
      </option>
    ))}
  </select>
</div>

{programacionActual && (
  <div className="flex flex-col justify-center">
    <span className="text-lg font-semibold block mb-1">Periodo de Aprobación</span>
    <span
      className={`text-sm px-2 py-1 rounded-md w-fit
      ${estaEnRangoAprobacion(programacionActual) ? 'text-green-400' : 'text-red-400'}`}
    >
      {programacionActual.rangoAprobacion}
    </span>
  </div>
)}




</div>

</div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
  {/* Total postulantes */}
  <div className="flex items-center bg-green-100/10 border border-green-500 rounded-xl p-4 shadow-md">
    <div className="bg-green-600 p-3 rounded-full text-white text-2xl">
      <FiSearch />
    </div>
    <div className="ml-4">
      <p className="text-sm text-gray-300 uppercase">Total Postulantes</p>
      <h3 className="text-2xl font-bold text-white">{postulantes.length}</h3>
    </div>
  </div>

  {/* Aprobados */}
  <div className="flex items-center bg-blue-100/10 border border-blue-500 rounded-xl p-4 shadow-md">
    <div className="bg-blue-600 p-3 rounded-full text-white text-2xl">
      <FiCheck />
    </div>
    <div className="ml-4">
      <p className="text-sm text-gray-300 uppercase">Aprobados</p>
      <h3 className="text-2xl font-bold text-white">
        {postulantes.filter(p => p.estadoPostulacion?.descripcion === 'Aprobado').length}
      </h3>
    </div>
  </div>

  {/* Rechazados */}
  <div className="flex items-center bg-red-100/10 border border-red-500 rounded-xl p-4 shadow-md">
    <div className="bg-red-600 p-3 rounded-full text-white text-2xl">
      <FiX />
    </div>
    <div className="ml-4">
      <p className="text-sm text-gray-300 uppercase">Rechazados</p>
      <h3 className="text-2xl font-bold text-white">
        {postulantes.filter(p => p.estadoPostulacion?.descripcion === 'Rechazado').length}
      </h3>
    </div>
  </div>
</div>


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
            <div className="flex flex-col gap-1">


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
          columnas={['Fecha de Postulación', 'Nombre', 'Vacante Escogida', 'Habilidades', 'Estado / Calificación', 'Acciones']}
          filas={postulantes
            .filter(p => `${p.Nombre} ${p.Apellido}`.toLowerCase().includes(filtroNombre.toLowerCase()))
            .filter(p =>
              !itinerario ||
              (p.selecciones?.[0]?.vacante?.id_Itinerario?.toString() === itinerario)
            )
            .filter(p => {
              if (!programacionSeleccionada) return true;
              const fechaSeleccion = p.selecciones?.[0]?.FechaSeleccion;
              return estaEnRangoPostulacion(fechaSeleccion, programacionActual);
            })
            .map(p => [
             p.selecciones?.[0]?.FechaSeleccion
  ? new Date(p.selecciones[0].FechaSeleccion).toLocaleDateString()
  : '—'

              ,
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

               {p.estadoPostulacion?.descripcion === 'Evaluado' && (
    <button
      onClick={() => router.push(`/reclutador/evaluaciones?id=${p.Id_Postulante}`)}
      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded shadow"
      title="Calificar"
    >
      Calificar
    </button>
  )}

              </div>,


<div
  className={`flex justify-center gap-6 text-2xl ${
    puedeVerInforme(p.estadoPostulacion?.descripcion) ? 'justify-around' : 'justify-evenly'
  }`}
>
  {puedeVerInforme(p.estadoPostulacion?.descripcion) && (
    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={() => router.push(`/reclutador/informes?id=${p.Id_Postulante}`)}
    >
      <FiEye className="text-yellow-400 hover:text-yellow-300" />
      <span className="text-xs text-gray-300 mt-1 text-center">Ver informe</span>
    </div>
  )}

  {/* Botones solo si NO está rechazado y está dentro del rango de aprobación */}
{p.estadoPostulacion?.descripcion !== 'Rechazado' &&
 programacionActual &&   // 👈 aquí
 estaEnRangoAprobacion(programacionActual) && (
  <>
    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={() =>
        aceptarPostulante(
          p.Id_Postulante,
          `${p.Nombre} ${p.Apellido}`,
          p.vacante?.Descripcion || 'vacante'
        )
      }
    >
      <FiCheck className="text-green-500 hover:text-green-400" />
      <span className="text-xs text-gray-300 mt-1 text-center">Aprobar</span>
    </div>

    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={() => rechazarPostulante(p.Id_Postulante)}
    >
      <FiX className="text-red-500 hover:text-red-400" />
      <span className="text-xs text-gray-300 mt-1 text-center">Rechazar</span>
    </div>
  </>
)}

</div>





            ])}
        />
      </div>
    </div>
  );
}





