export default function PostulacionesFiltros({ itinerarios, filtroNombre, setFiltroNombre, itinerario, setItinerario }) {
  return (
    <div className="bg-[#1E293B] p-4 rounded-lg mb-4 shadow-md flex flex-col sm:flex-row sm:justify-between gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="text-sm font-medium">Postulantes:</label>
        <input
          type="text"
          placeholder="Buscar por nombre"
          className="bg-slate-800 text-white placeholder-gray-400 placeholder-opacity-70 px-3 py-1 rounded-md text-sm shadow-inner border border-slate-600 focus:border-blue-500 focus:outline-none"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="text-sm font-medium">Itinerario:</label>
        <select
          className="bg-slate-800 text-white px-3 py-1 rounded-md text-sm shadow-inner border border-slate-600 focus:border-blue-500 focus:outline-none"
          value={itinerario}
          onChange={e => setItinerario(e.target.value)}
        >
          <option value="">Todos</option>
          {itinerarios.map(it => (
            <option key={it.id_Itinerario} value={it.id_Itinerario}>{it.descripcion}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
