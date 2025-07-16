import { useEffect } from 'react';
import { estaEnRangoPostulacion, estaEnRangoAprobacion } from './utils';

export default function PostulacionesHeader({
  programaciones,
  programacionSeleccionada,
  setProgramacionSeleccionada,
  programacionActual
}) {
  const getHoyLocalDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

useEffect(() => {
  if (!programacionSeleccionada) {
    const hoy = getHoyLocalDate();

    const vigente = programaciones.find(p => {
      const enRangoPostulacion = estaEnRangoPostulacion(hoy, p);
      const enRangoAprobacion = estaEnRangoAprobacion(p);

      return enRangoPostulacion || enRangoAprobacion;
    });

    if (vigente) {
      setProgramacionSeleccionada(vigente.id_Programacion);
    } else {
      console.log('⚠️ No encontró ninguna programación vigente.');
    }
  }
}, [programaciones, programacionSeleccionada, setProgramacionSeleccionada]);

  return (
    <div className="bg-[#1E293B] p-4 rounded-lg mb-4 shadow-md">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-lg font-semibold block mb-1">
            Periodo de Postulación
          </label>
          <select
            className="bg-[#0f172a] text-white px-3 py-2 rounded-md w-full"
            value={programacionSeleccionada}
            onChange={e => setProgramacionSeleccionada(e.target.value)}
          >
            {programaciones.map(p => (
              <option key={p.id_Programacion} value={p.id_Programacion}>
                {p.rangoPostulacion}
              </option>
            ))}
          </select>
        </div>

        {programacionActual && (
          <div className="flex flex-col justify-center">
            <span className="text-lg font-semibold block mb-1">
              Periodo de Aprobación
            </span>
            <span
              className={`text-sm px-2 py-1 rounded-md w-fit ${
                estaEnRangoAprobacion(programacionActual)
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {programacionActual.rangoAprobacion}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
