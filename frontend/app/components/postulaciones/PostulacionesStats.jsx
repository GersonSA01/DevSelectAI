import { FiSearch, FiCheck, FiX } from 'react-icons/fi';

export default function PostulacionesStats({ postulantes }) {
  const count = estado => postulantes.filter(p => p.estadoPostulacion?.descripcion === estado).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <StatCard icon={<FiSearch />} color="green" label="Total" value={postulantes.length} />
      <StatCard icon={<FiCheck />} color="blue" label="Aprobados" value={count('Aprobado')} />
      <StatCard icon={<FiX />} color="red" label="Rechazados" value={count('Rechazado')} />
    </div>
  );
}

function StatCard({ icon, color, label, value }) {
  return (
    <div className="flex items-center bg-slate-800 rounded-xl p-4 shadow">
      <div className={`bg-${color}-500/20 p-3 rounded-full text-${color}-400 text-xl`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-xs text-gray-400 uppercase font-semibold">{label}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
}
