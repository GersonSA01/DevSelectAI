import { FiEye, FiCheck, FiX, FiEdit } from 'react-icons/fi';
import { Alert } from '../alerts/Alerts';
import { fetchWithCreds } from '../../utils/fetchWithCreds';

/**
 * Devuelve la fecha local YYYY-MM-DD
 */
export const getHoyLocal = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Devuelve un Date local sin horas
 */
export const getHoyLocalDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Verifica si una fecha está dentro del rango [inicio, fin] inclusive
 */
export function estaEnRango(fecha, inicioStr, finStr) {
  const f = new Date(fecha);
  const inicio = new Date(inicioStr);
  const fin = new Date(finStr);

  f.setHours(0, 0, 0, 0);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(23, 59, 59, 999);

  return f >= inicio && f <= fin;
}

/**
 * Verifica si está dentro del rango de postulación
 */
export function estaEnRangoPostulacion(fechaSeleccion, programacion) {
  if (!fechaSeleccion || !programacion) return false;
  return estaEnRango(
    fechaSeleccion,
    programacion.FechIniPostulacion,
    programacion.FechFinPostulacion
  );
}

/**
 * Verifica si hoy está dentro del rango de aprobación
 */
export function estaEnRangoAprobacion(programacion) {
  if (!programacion) return false;
  const hoy = getHoyLocalDate();
  return estaEnRango(
    hoy,
    programacion.FechIniAprobacion,
    programacion.FechFinAprobacion
  );
}

/**
 * Determina si el postulante puede ver su informe
 */
export const puedeVerInforme = (estado) =>
  ['Aprobado', 'Rechazado', 'Calificado'].includes(estado);

/**
 * Aprobar postulante con backend + Alert
 */
export async function aceptarPostulante(id, nombre, vacante, programacionActual, setPostulantes) {
  if (!programacionActual || !estaEnRangoAprobacion(programacionActual)) {
    await Alert({
      title: 'Fuera de rango',
      html: 'No es posible aprobar fuera del periodo de aprobación.',
      icon: 'warning'
    });
    return;
  }

  const confirm = await Alert({
    title: `¿Aceptar a ${nombre}?`,
    html: `El postulante será aprobado para "<b>${vacante}</b>"`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Aprobar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetchWithCreds(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/postulante/${id}/aceptar`, { method: 'PUT' });
    if (!res.ok) throw new Error();

    await Alert({
      title: 'Aprobado',
      html: `${nombre} fue aprobado correctamente.`,
      icon: 'success'
    });

    window.location.reload();

    setPostulantes(prev =>
      prev.map(p => p.Id_Postulante === id ? { ...p, Estado: 'Aprobado' } : p)
    );
  } catch {
    await Alert({ title: 'Error', html: 'No se pudo aprobar.', icon: 'error' });
  }
}

/**
 * Rechazar postulante con backend + Alert
 */
export async function rechazarPostulante(id, setPostulantes) {
  const confirm = await Alert({
    title: '¿Rechazar postulante?',
    html: 'El postulante será rechazado.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, rechazar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetchWithCreds(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/postulante/${id}/rechazar`, { method: 'PUT' });
    if (!res.ok) throw new Error();

    await Alert({
      title: 'Rechazado',
      html: 'El postulante ha sido rechazado.',
      icon: 'success'
    });

    window.location.reload();

    setPostulantes(prev =>
      prev.map(p => p.Id_Postulante === id ? { ...p, Estado: 'Rechazado' } : p)
    );
  } catch {
    await Alert({ title: 'Error', html: 'No se pudo rechazar.', icon: 'error' });
  }
}

/**
 * Renderiza las filas de la tabla general
 */
export const renderFilasPostulantes = ({
  postulantes,
  filtroNombre,
  itinerario,
  programacionActual,
  programacionSeleccionada,
  router,
  setPostulantes
}) => {
  return postulantes
    .filter(p => `${p.Nombre} ${p.Apellido}`.toLowerCase().includes(filtroNombre.toLowerCase()))
    .filter(p => !itinerario || (p.selecciones?.[0]?.vacante?.id_Itinerario?.toString() === itinerario))
    .filter(p => {
      if (!programacionSeleccionada) return true;
      const fechaSeleccion = p.selecciones?.[0]?.FechaSeleccion;
      return estaEnRangoPostulacion(fechaSeleccion, programacionActual);
    })
    .map(p => [
      p.selecciones?.[0]?.FechaSeleccion
        ? new Date(p.selecciones[0].FechaSeleccion).toLocaleDateString()
        : '—',
      `${p.Nombre} ${p.Apellido}`,
      p.selecciones?.[0]?.vacante?.Descripcion || '—',
      renderHabilidades(p),
      renderEstado(p),
      renderAcciones(p, programacionActual, router, setPostulantes)
    ]);
};

/**
 * Renderiza las habilidades como chips
 */
function renderHabilidades(p) {
  if ((p.habilidades || []).length === 0) {
    return <span className="text-gray-400 text-xs">—</span>;
  }

  return p.habilidades.map((h, idx) => (
    <span
      key={idx}
      className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-blue-300 mr-1"
    >
      {h.habilidad?.Descripcion}
    </span>
  ));
}

/**
 * Renderiza el estado y la calificación
 */
function renderEstado(p) {
  const estado = p.estadoPostulacion?.descripcion;
  const puntaje = p.evaluaciones?.[0]?.PuntajeTotal;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow ${estadoClase(estado)}`}>
        {estado || '—'}
      </span>

      {['Calificado', 'Aprobado', 'Rechazado'].includes(estado) && puntaje !== undefined && (
        <div className={`text-xs font-semibold px-2 py-1 rounded shadow-inner ${
          puntaje >= 16
            ? 'bg-green-100 text-green-800'
            : puntaje >= 10
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          Nota: {puntaje}/20
        </div>
      )}
    </div>
  );
}

/**
 * Devuelve las clases según el estado
 */
function estadoClase(estado) {
  switch (estado) {
    case 'Por evaluar': return 'bg-yellow-100 text-yellow-800';
    case 'Evaluado': return 'bg-blue-100 text-blue-800';
    case 'Aprobado': return 'bg-green-100 text-green-800';
    case 'Rechazado': return 'bg-red-100 text-red-800';
    case 'Calificado': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Renderiza los botones de acciones
 */
function renderAcciones(p, programacionActual, router, setPostulantes) {
  const estado = p.estadoPostulacion?.descripcion;

  // Por Evaluar o Por Elegir Vacante → solo texto gris
  if (estado === 'Por Evaluar' || estado === 'Por Elegir Vacante') {
    return (
      <div className="flex justify-center text-sm text-gray-400">
        {estado}
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-6 text-2xl">
      {/* Ver informe cuando está Aprobado o Rechazado */}
     {['Aprobado', 'Rechazado', 'Calificado'].includes(estado) && (
  <div
    className="flex flex-col items-center cursor-pointer"
    onClick={() => router.push(`/reclutador/informes?id=${p.Id_Postulante}`)}
  >
    <FiEye className="text-yellow-400 hover:text-yellow-300" />
    <span className="text-xs text-gray-300 mt-1 text-center">Ver informe</span>
  </div>
)}


      {/* Calificar cuando está Evaluado */}
      {estado === 'Evaluado' && (
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => router.push(`/reclutador/evaluaciones?id=${p.Id_Postulante}`)}
        >
          <FiEdit className="text-indigo-400 hover:text-indigo-300" />
          <span className="text-xs text-gray-300 mt-1 text-center">Calificar</span>
        </div>
      )}

      {/* Aprobar / Rechazar SOLO cuando está Calificado */}
      {estado === 'Calificado' && programacionActual && estaEnRangoAprobacion(programacionActual) && (
        <>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() =>
              aceptarPostulante(
                p.Id_Postulante,
                `${p.Nombre} ${p.Apellido}`,
                p.vacante?.Descripcion || 'vacante',
                programacionActual,
                setPostulantes
              )
            }
          >
            <FiCheck className="text-green-500 hover:text-green-400" />
            <span className="text-xs text-gray-300 mt-1 text-center">Aprobar</span>
          </div>

          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => rechazarPostulante(p.Id_Postulante, setPostulantes)}
          >
            <FiX className="text-red-500 hover:text-red-400" />
            <span className="text-xs text-gray-300 mt-1 text-center">Rechazar</span>
          </div>
        </>
      )}
    </div>
  );
}