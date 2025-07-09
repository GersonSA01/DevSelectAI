import { FiSearch, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { estaEnRangoPostulacion } from './utils';

export default function PostulacionesStats({ postulantes, programacionActual }) {
  const enProgramacion = postulantes.filter(p => {
    const fechaSeleccion = p.selecciones?.[0]?.FechaSeleccion;
    return estaEnRangoPostulacion(fechaSeleccion, programacionActual);
  });

  const count = estado =>
    enProgramacion.filter(p => p.estadoPostulacion?.descripcion === estado).length;

  const pendientes = enProgramacion.filter(
    p => !['Aprobado', 'Rechazado'].includes(p.estadoPostulacion?.descripcion)
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
      <StatCard
        icon={<FiSearch />}
        color="green"
        label="Total"
        value={enProgramacion.length}
      />
      <StatCard
        icon={<FiClock />}
        color="yellow"
        label="Pendientes"
        value={pendientes}
        customBg="rgba(250, 204, 21, 0.3)" // fondo amarillo más visible
      />
      <StatCard
        icon={<FiCheck />}
        color="blue"
        label="Aprobados"
        value={count('Aprobado')}
      />
      <StatCard
        icon={<FiX />}
        color="red"
        label="Rechazados"
        value={count('Rechazado')}
      />
    </div>
  );
}

function StatCard({ icon, color, label, value, customBg }) {
  const bgClass = `bg-${color}-500/20`;
  const bgStyle = customBg ? { backgroundColor: customBg } : undefined;

  return (
    <div className="flex items-center bg-slate-800 rounded-xl p-4 shadow">
      <div
        className={`p-3 rounded-full text-${color}-400 text-xl ${!customBg ? bgClass : ''}`}
        style={bgStyle}
      >
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-xs text-gray-400 uppercase font-semibold">{label}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
}
