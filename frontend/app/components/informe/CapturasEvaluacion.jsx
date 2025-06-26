import { useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

const CapturasEvaluacion = ({ capturas, calificacion }) => {
  const [zoomImagen, setZoomImagen] = useState(null);

  const capturasAprobadas = capturas;

  return (
    <div className="relative bg-[#1D1E33] p-6 rounded-lg shadow border border-[#2B2C3F]">

      <div className="text-right mt-4 md:mt-0">
        <p className="text-sm text-gray-400">Puntaje:</p>
        <p className="text-2xl font-bold text-[#3BDCF6]">{calificacion.toFixed(2)} / 2</p>
      </div>

      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <FaExclamationCircle className="text-[#3BDCF6]" />
        Capturas de Fraude
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {capturas.length === 0 ? (
  <div className="col-span-3 text-yellow-400 text-sm flex items-center gap-2">
    <FaExclamationCircle className="text-yellow-400" />
    No se encontraron capturas fraude.
  </div>
) : (
  capturas.map((c) => (
    <div
      key={c.id_Capture}
      className="cursor-pointer rounded-lg overflow-hidden transition-transform duration-200 bg-[#2B2C3F] border border-[#3B3C4A]"
      onClick={() => setZoomImagen(c)}
    >
      <img
        src={`http://localhost:5000/uploads/${c.File}`}
        alt={`Captura ${c.id_Capture}`}
        className="object-cover w-full h-48 hover:opacity-90"
      />
      <div className="p-2 text-sm text-gray-300 border-t border-[#3B3C4A]">
        <strong>Penalización:</strong> -{parseFloat(c.Calificacion || 0.5).toFixed(1)} pts<br />
        {c.Observacion && (
          <>
            <strong>Observación:</strong> {c.Observacion}
          </>
        )}
      </div>
    </div>
  ))
)}

      </div>

      {/* Modal de Zoom */}
      {zoomImagen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setZoomImagen(null)}
        >
          <img
            src={`http://localhost:5000/uploads/${zoomImagen.File}`}
            alt="Zoom"
            className="max-w-[90%] max-h-[90%] rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default CapturasEvaluacion;
