"use client";

import { useEffect } from "react";
import { FaCamera, FaSearchPlus, FaInfoCircle } from "react-icons/fa";
import { toast } from "sonner";

export default function ModuloCapturas({
  capturas,
  setCapturas,
  calificacion,
  guardarCaptura,
  zoomImagen,
  setZoomImagen,
  actualizarCalificacion,
}) {
  
  useEffect(() => {
    const aprobadas = capturas.filter(c => c.Aprobado).length;
    const nota = Math.max(0, 2 - aprobadas * 0.5);
    actualizarCalificacion("capturas", nota);
  }, [capturas, actualizarCalificacion]);

  const aprobarYMostrar = (idx) => {
    const aprobadasAntes = capturas.filter(c => c.Aprobado).length;
    if (!capturas[idx].Aprobado && aprobadasAntes >= 4) {
      toast.error("Sólo puedes aprobar hasta 4 capturas");
      return;
    }

    const imagen = { ...capturas[idx], Aprobado: 1 };

    const nuevas = [...capturas];
    nuevas[idx] = imagen;

    setCapturas(nuevas);
    console.log("✅ Mostrando imagen en zoom:", imagen);

    setZoomImagen(imagen);
  };

  return (
    <div className="bg-[#1D1E33] p-6 rounded-lg mt-10 space-y-6 shadow border border-[#2B2C3F]">
      <div className="flex justify-between items-center mb-2">
  <h2 className="text-xl font-semibold flex items-center gap-2">
    <FaCamera className="text-[#3BDCF6]" /> 4. Capturas de Cámara
  </h2>
  <span className="bg-gray-200 text-black px-2 py-1 w-20 rounded text-center inline-block">
    {calificacion.toFixed(1)} / 2
  </span>
</div>

<div className="flex items-center gap-2 text-[#3BDCF6] text-sm mb-2">
  <FaInfoCircle className="text-[#3BDCF6]" />
  Máximo 4 capturas pueden ser aprobadas.
</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {capturas.length === 0 ? (
          <p className="text-yellow-400 col-span-4">No se encontraron capturas...</p>
        ) : (
          capturas.map((c, i) => (
            <div
              key={c.id_Capture}
              className="bg-[#2B2C3F] rounded-lg shadow overflow-hidden relative group"
            >
              
              <img
                src={`http://localhost:5000/uploads/${c.File}`}
                alt={`Captura ${i + 1}`}
                className="w-full h-40 object-cover transition-transform duration-300"
              />

              
              <div
                className={`absolute top-2 right-2 w-4 h-4 rounded-full shadow-md border-2 ${
                  c.Aprobado ? "bg-green-400 border-green-500" : "bg-gray-500 border-gray-600"
                }`}
                title={c.Aprobado ? "Aprobada" : "No aprobada"}
              ></div>

              
              <div
                className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => aprobarYMostrar(i)}
              >
                <span className="text-white text-sm font-medium flex items-center gap-2">
                  <FaSearchPlus /> Seleccionar imagen
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
