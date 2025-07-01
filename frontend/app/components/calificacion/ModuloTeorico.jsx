"use client";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

export default function ModuloTeorico({ preguntasTeoricas, calificacion, maximo }) {
  const isOdd = preguntasTeoricas.length % 2 !== 0;

  return (
    <div className="bg-[#1D1E33] p-4 md:p-6 rounded-lg rounded-b-xl mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold">2. Preguntas de Opción Múltiple</h2>
        <div className="text-[#22C55E] font-semibold text-sm md:text-base">
          {calificacion} / {maximo}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(preguntasTeoricas) &&
          preguntasTeoricas.map((p, i) => {
            const isLastOdd = isOdd && i === preguntasTeoricas.length - 1;

            return (
              <div
                key={i}
                className={`bg-[#181A2F] border border-[#2B2C3F] p-4 rounded-lg shadow transition-all ${
                  isLastOdd ? "md:col-span-2" : ""
                }`}
              >
                <p className="text-sm text-[#3BDCF6] mb-1 flex items-center gap-1">
                  <HelpCircle size={16} className="text-[#3BDCF6]" />
                  <strong>Pregunta {i + 1}</strong>
                </p>
                <p className="text-white mb-2 text-sm md:text-base">{p.pregunta}</p>
                <p className="text-gray-300 mb-1 text-sm md:text-base">
                  <strong>Respuesta del postulante:</strong>
                  <br />
                  <span className="text-white">{p.respuesta}</span>
                </p>
                <div
                  className={`mt-2 font-bold flex items-center gap-2 text-sm md:text-base ${
                    p.puntaje === 1 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {p.puntaje === 1 ? (
                    <>
                      <CheckCircle size={20} /> Respuesta Correcta
                    </>
                  ) : (
                    <>
                      <XCircle size={20} /> Respuesta Incorrecta
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
