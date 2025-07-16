"use client";

import { FaSave, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function ZoomCaptura({ captura, setZoomImagen, guardarCaptura, capturas, setCapturas }) {
  const [observacion, setObservacion] = useState(captura.Observacion || "");

  const handleGuardar = async () => {
    const nuevas = capturas.map(c =>
      c.id_Capture === captura.id_Capture
        ? { ...c, Observacion: observacion, Aprobado: 1 }
        : c
    );
    setCapturas(nuevas);
    try {
      await guardarCaptura({ ...captura, Observacion: observacion, Aprobado: 1 });
      toast.success("Observación guardada");
      setZoomImagen(null);
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleCancelar = async () => {
    
    if (captura.Aprobado) {
      const nuevas = capturas.map(c =>
        c.id_Capture === captura.id_Capture
          ? { ...c, Observacion: "", Aprobado: 0 }
          : c
      );
      setCapturas(nuevas);
      try {
        await guardarCaptura({ ...captura, Observacion: "", Aprobado: 0 });
        toast("Captura desmarcada", { icon: "↩️" });
      } catch {
        toast.error("Error al desmarcar");
      }
    }
    setZoomImagen(null);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setZoomImagen(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
      <div className="bg-[#1D1E33] rounded-lg p-4 flex flex-col md:flex-row gap-4 max-w-5xl w-full">
        <img
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${captura.File}`}
          alt="Captura ampliada"
          className="max-h-[70vh] rounded-lg object-contain w-full md:w-2/3"
        />

        <div className="flex flex-col w-full md:w-1/3 gap-2">
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Insertar observación..."
            rows={5}
            className="bg-[#2B2C3F] text-white p-3 rounded resize-none text-sm"
          />
          <button
            onClick={handleGuardar}
            disabled={!observacion.trim()}
            className="flex items-center justify-center gap-2 py-2 bg-green-500 hover:bg-green-600 text-sm rounded disabled:opacity-50"
          >
            <FaSave /> Guardar
          </button>
          <button
            onClick={handleCancelar}
            className={`flex items-center justify-center gap-2 py-2 ${
              captura.Aprobado ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-600 hover:bg-gray-700"
            } text-sm rounded`}
          >
            <FaTimes /> {captura.Aprobado ? "Desenmarcar" : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}
