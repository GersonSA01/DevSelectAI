"use client";
import { useEffect } from "react";
import { FaCamera } from "react-icons/fa";

export default function ModuloCapturas({
  capturas,
  setCapturas,
  calificacion,
  confirmadas,
  setConfirmadas,
  guardarCaptura,
  setZoomImagen,
  actualizarCalificacion,
}) {
 useEffect(() => {
  const aprobadas = capturas.filter(c => c.Aprobado).length;
  const nota = Math.max(0, 2 - aprobadas * 0.5); // ✅ Resta por cada captura marcada como fraude
  actualizarCalificacion("capturas", nota);
}, [capturas]);


  const capturasAprobadas = capturas.filter(c => c.Aprobado).length;

  return (
    <div className="bg-[#1D1E33] p-6 rounded-lg mt-10 space-y-6 shadow border border-[#2B2C3F]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaCamera className="text-[#3BDCF6]" />
          4. Capturas de Cámara
        </h2>
        <div className="text-[#22C55E] text-lg font-bold">{calificacion.toFixed(1)} / 2</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {capturas.length === 0 ? (
          <p className="text-yellow-400 col-span-4">⏳ No se encontraron capturas...</p>
        ) : (
          capturas.map((c, capIdx) => {
            const aprobado = c.Aprobado;

            return (
              <div key={capIdx} className="bg-[#2B2C3F] rounded shadow p-3 space-y-2 relative group">
                <div
                  className="cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => setZoomImagen(c)}
                >
                  <img
                    src={`http://localhost:5000/uploads/${c.File}`}
                    alt={`Captura ${capIdx + 1}`}
                    className="w-full h-40 object-cover rounded hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {aprobado && (
                  <>
                    <textarea
                      value={c.Observacion || ""}
                      onChange={(e) => {
                        const nuevas = [...capturas];
                        nuevas[capIdx].Observacion = e.target.value;
                        setCapturas(nuevas);
                      }}
                      placeholder="Escribe una observación..."
                      className="w-full bg-[#1D1E33] text-white p-2 rounded text-sm resize-none"
                      rows={2}
                    />
                    <button
                      onClick={() => guardarCaptura(c)}
                      className="text-xs bg-green-500 hover:bg-green-600 text-black px-3 py-1 rounded mt-2"
                    >
                      Guardar Cambios
                    </button>
                  </>
                )}

                <div className="flex justify-between items-center pt-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={aprobado}
                      disabled={!aprobado && capturasAprobadas >= 4}
                      onChange={() => {
                        const nuevas = [...capturas];
                        const nuevoEstado = !nuevas[capIdx].Aprobado;
                        nuevas[capIdx].Aprobado = nuevoEstado;
                        if (!nuevoEstado) nuevas[capIdx].Observacion = "";
                        setCapturas(nuevas);
                      }}
                    />
                    Marcar como aprobada
                  </label>
                  {!aprobado && capturasAprobadas >= 4 && (
                    <span className="text-red-400 text-xs">Máximo 4</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
