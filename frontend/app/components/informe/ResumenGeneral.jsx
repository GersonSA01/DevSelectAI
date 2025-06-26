export default function ResumenGeneral({ nombre, habilidades = [], puntaje = 0, itinerario = '', vacante = '' }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">Informe</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-white">
        <div className="space-y-1">
          <p className="font-semibold">
            Nombre: <span className="text-[#3BDCF6]">{nombre}</span>
          </p>
          <p className="text-gray-400">
            Itinerario: <span className="text-white">{itinerario || 'N/A'}</span>
          </p>
          <p className="text-gray-400">
            Vacante: <span className="text-white">{vacante || 'N/A'}</span>
          </p>
          <p className="text-gray-400">
            Habilidades: {habilidades.length > 0 ? habilidades.join(', ') : 'N/A'}
          </p>
        </div>

        <div className="text-right mt-4 md:mt-0">
          <p className="text-sm text-gray-400">Puntaje:</p>
          <p className="text-2xl font-bold text-[#3BDCF6]">{puntaje} / 18</p>
        </div>
      </div>
    </div>
  );
}
