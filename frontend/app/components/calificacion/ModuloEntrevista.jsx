"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchWithCreds } from "../../utils/fetchWithCreds";

export default function ModuloEntrevista({
  preguntasOrales = [],
  entrevista,
  calificacion = 0,
  confirmadas,
  setConfirmadas,
  actualizarCalificacion,
}) {
  const [editando, setEditando] = useState(false);
  const [preguntas, setPreguntas] = useState([]);
  const [subNotas, setSubNotas] = useState([]);

  // Inicializa preguntas y subNotas cuando llegan las props
  useEffect(() => {
    const inicial = preguntasOrales ?? [];
    setPreguntas(inicial);

    setSubNotas(
      inicial.map((p) => {
        const nota = p.calificacion || 0;
        return {
          respuesta: nota >= 1 ? 1 : 0,
          lenguaje: nota === 2 ? 1 : 0,
        };
      })
    );
  }, [preguntasOrales]);

  useEffect(() => {
    if (editando) {
      const suma = subNotas.reduce(
        (acc, nota) => acc + nota.respuesta + nota.lenguaje,
        0
      );
      actualizarCalificacion("entrevista", suma);
    }
  }, [subNotas, editando, actualizarCalificacion]);

  const puntajeTemporal = subNotas.reduce(
    (acc, nota) => acc + nota.respuesta + nota.lenguaje,
    0
  );

  const guardarCalificacion = async () => {
    actualizarCalificacion("entrevista", puntajeTemporal);
    setConfirmadas((prev) => ({ ...prev, entrevista: true }));
    setEditando(false);

    try {
      const calificaciones = preguntas.map((p, i) => ({
        idPregunta: p.idPregunta,
        calificacion: subNotas[i].respuesta + subNotas[i].lenguaje,
      }));

      const res = await fetchWithCreds(
        "http://localhost:5000/api/calificar/entrevista-oral",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idEntrevista: entrevista.Id_Entrevista,
            calificaciones,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Error del servidor:", res.status, text);
        throw new Error("Error al actualizar la calificación");
      }

      setPreguntas((prev) =>
        prev.map((p, i) => ({
          ...p,
          calificacion: subNotas[i].respuesta + subNotas[i].lenguaje,
        }))
      );

      toast.success("✅ Calificación de entrevista actualizada exitosamente");
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      toast.error("❌ Hubo un error al guardar la calificación");
    }
  };

  return (
    <div className="bg-[#1D1E33] p-4 md:p-6 rounded-lg space-y-4 mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold">1. Entrevista Oral con IA</h2>
        <div className="flex items-center gap-2">
          <span className="text-[#22C55E] font-semibold">
            {editando ? puntajeTemporal : calificacion} / 6
          </span>

          {!editando ? (
            confirmadas.entrevista ? (
              <button
                onClick={() =>
                  setConfirmadas((prev) => ({ ...prev, entrevista: false }))
                }
                className="text-xs bg-red-500 text-white px-2 py-1 rounded"
              >
                Cancelar
              </button>
            ) : (
              <>
                <button
                  onClick={() =>
                    setConfirmadas((prev) => ({ ...prev, entrevista: true }))
                  }
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                >
                  Confirmar IA
                </button>
                <button
                  onClick={() => {
                    setEditando(true);
                    setConfirmadas((prev) => ({
                      ...prev,
                      entrevista: false,
                    }));
                  }}
                  className="text-xs bg-yellow-400 text-black px-2 py-1 rounded"
                >
                  Editar
                </button>
              </>
            )
          ) : (
            <button
              onClick={guardarCalificacion}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
            >
              Guardar
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-300 space-y-4 mt-4">
        {Array.isArray(preguntas) && preguntas.length > 0 ? (
          preguntas.map((p, i) => (
            <div key={i}>
              <p className="text-[#3BDCF6] text-sm md:text-base">
                <strong>Pregunta {i + 1}:</strong> {p.pregunta}
              </p>
              <p className="text-white ml-4 text-sm md:text-base">
                <strong>Respuesta:</strong> {p.respuesta}
              </p>
              <p className="text-yellow-300 ml-4 text-sm md:text-base">
                <strong>Nota IA:</strong>{" "}
                {p.calificacion ?? "Sin calificación"}
              </p>

              {editando && (
                <div className="ml-6 mt-2 space-y-1">
                  <label className="flex items-center gap-2 text-sm md:text-base">
                    <input
                      type="checkbox"
                      checked={subNotas[i].respuesta === 1}
                      onChange={(e) => {
                        const nuevo = [...subNotas];
                        nuevo[i].respuesta = e.target.checked ? 1 : 0;
                        setSubNotas(nuevo);
                      }}
                    />
                    +1 Responde bien
                  </label>
                  <label className="flex items-center gap-2 text-sm md:text-base">
                    <input
                      type="checkbox"
                      checked={subNotas[i].lenguaje === 1}
                      onChange={(e) => {
                        const nuevo = [...subNotas];
                        nuevo[i].lenguaje = e.target.checked ? 1 : 0;
                        setSubNotas(nuevo);
                      }}
                    />
                    +1 Usa lenguaje técnico
                  </label>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-red-400">No hay preguntas para mostrar</p>
        )}

        {entrevista?.RetroalimentacionIA && (
          <>
            <p className="text-green-400 mt-4 text-sm md:text-base">
              <strong>Retroalimentación:</strong>
            </p>
            <p className="italic text-gray-400 whitespace-pre-line text-sm md:text-base">
              {entrevista.RetroalimentacionIA}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
