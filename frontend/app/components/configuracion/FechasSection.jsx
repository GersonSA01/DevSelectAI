// FechasSection.jsx
import React from 'react';

export default function FechasSection({
  diasPostulacion,
  diasAprobacion,
  renderCampoFecha,
  fechaPostIni,
  fechaPostFin
}) {
  return (
    <>
      <h3 className="text-cyan-400 font-semibold mb-2 mt-4">Fechas de Postulación</h3>
      <div className="grid gap-4 md:grid-cols-2 mb-2">
        {renderCampoFecha('FechIniPostulacion')}
        {renderCampoFecha('FechFinPostulacion', fechaPostIni)}
      </div>
      {diasPostulacion !== null && (
        <p className="text-sm text-gray-300 mb-4">
          Duración Postulación: <span className="font-semibold">{diasPostulacion} días</span>
        </p>
      )}

      <h3 className="text-cyan-400 font-semibold mb-2 mt-4">Fechas de Aprobación</h3>
      <div className="grid gap-4 md:grid-cols-2 mb-2">
        {renderCampoFecha('FechIniAprobacion', fechaPostFin)}
        {renderCampoFecha('FechFinAprobacion', fechaPostFin)}
      </div>
      {diasAprobacion !== null && (
        <p className="text-sm text-gray-300 mb-4">
          Duración Aprobación: <span className="font-semibold">{diasAprobacion} días</span>
        </p>
      )}
    </>
  );
}
