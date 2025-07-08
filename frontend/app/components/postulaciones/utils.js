import { FiEye, FiCheck, FiX } from 'react-icons/fi';
import { Alert } from '../alerts/Alerts';

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
export const estaEnRango = (fecha, inicioStr, finStr) => {
  const f = new Date(fecha);
  const inicio = new Date(inicioStr);
  const fin = new Date(finStr);

  f.setHours(0, 0, 0, 0);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(23, 59, 59, 999);

  return f >= inicio && f <= fin;
};

/**
 * Verifica si está dentro del rango de postulación
 */
export const estaEnRangoPostulacion = (fechaSeleccion, programacion) => {
  if (!fechaSeleccion || !programacion) return false;
  return estaEnRango(
    fechaSeleccion,
    programacion.FechIniPostulacion,
    programacion.FechFinPostulacion
  );
};

/**
 * Verifica si hoy está dentro del rango de aprobación
 */
export const estaEnRangoAprobacion = (programacion) => {
  if (!programacion) return false;
  const hoy = getHoyLocalDate();
  return estaEnRango(
    hoy,
    programacion.FechIniAprobacion,
    programacion.FechFinAprobacion
  );
};

/**
 * Determina si el postulante puede ver su informe
 */
export const puedeVerInforme = (estado) => {
  return ['Aprobado', 'Rechazado', 'Calificado'].includes(estado);
};

/**
 * Aprobar postulante con backend + Alert
 */
export const aceptarPostulante = async (id, nombre, vacante, programacionActual, setPostulantes) => {
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

  if (confirm.isConfirmed) {
    try {
      const res = await fetch(`http://localhost:5000/api/postulante/${id}/aceptar`, { method: 'PUT' });
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
};

/**
 * Rechazar postulante con backend + Alert
 */
export const rechazarPostulante = async (id, setPostulantes) => {
  const confirm = await Alert({
    title: '¿Rechazar postulante?',
    html: 'El postulante será rechazado.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, rechazar',
    cancelButtonText: 'Cancelar'
  });

  if (confirm.isConfirmed) {
    try {
      const res = await fetch(`http://localhost:5000/api/postulante/${id}/rechazar`, { method: 'PUT' });
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
};

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
const renderHabilidades = (p) => (
  (p.habilidades || []).length > 0
    ? p.habilidades.map((h, idx) => (
        <span
          key={idx}
          className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-blue-300 mr-1"
        >
          {h.habilidad?.Descripcion}
        </span>
      ))
    : <span className="text-gray-400 text-xs">—</span>
);

/**
 * Renderiza el estado y la calificación
 */
const renderEstado = (p) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow ${estadoClase(p.estadoPostulacion?.descripcion)}`}>
      {p.estadoPostulacion?.descripcion || '—'}
    </span>
    {p.estadoPostulacion?.descripcion === 'Calificado' && p.evaluaciones?.[0]?.PuntajeTotal !== undefined && (
      <div className={`text-xs font-semibold px-2 py-1 rounded shadow-inner ${
        p.evaluaciones[0].PuntajeTotal >= 16
          ? 'bg-green-100 text-green-800'
          : p.evaluaciones[0].PuntajeTotal >= 10
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
      }`}>
        Nota: {p.evaluaciones[0].PuntajeTotal}/20
      </div>
    )}
  </div>
);

/**
 * Devuelve las clases según el estado
 */
const estadoClase = (estado) => {
  switch (estado) {
    case 'Por evaluar': return 'bg-yellow-100 text-yellow-800';
    case 'Evaluado': return 'bg-blue-100 text-blue-800';
    case 'Aprobado': return 'bg-green-100 text-green-800';
    case 'Rechazado': return 'bg-red-100 text-red-800';
    case 'Calificado': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Renderiza los botones de acciones
 */
const renderAcciones = (p, programacionActual, router, setPostulantes) => (
  <div className={`flex justify-center gap-6 text-2xl ${puedeVerInforme(p.estadoPostulacion?.descripcion) ? 'justify-around' : 'justify-evenly'}`}>
    {puedeVerInforme(p.estadoPostulacion?.descripcion) && (
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => router.push(`/reclutador/informes?id=${p.Id_Postulante}`)}
      >
        <FiEye className="text-yellow-400 hover:text-yellow-300" />
        <span className="text-xs text-gray-300 mt-1 text-center">Ver informe</span>
      </div>
    )}

    {!['Aprobado', 'Rechazado'].includes(p.estadoPostulacion?.descripcion) &&
      programacionActual &&
      estaEnRangoAprobacion(programacionActual) && (
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
