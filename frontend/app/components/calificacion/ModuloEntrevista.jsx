"use client";
import { useState, useEffect } from "react";

export default function ModuloEntrevista({
  preguntasOrales,
  entrevista,
  calificacion,
  confirmadas,
  setConfirmadas,
  actualizarCalificacion,
}) {
  const [editando, setEditando] = useState(false);
  const [subNotas, setSubNotas] = useState([
    { respuesta: 0, lenguaje: 0 },
    { respuesta: 0, lenguaje: 0 },
    { respuesta: 0, lenguaje: 0 },
  ]);

  useEffect(() => {
    if (editando) {
      const suma = subNotas.reduce((acc, nota) => acc + nota.respuesta + nota.lenguaje, 0);
      actualizarCalificacion("entrevista", suma);
    }
  }, [subNotas]);

  const puntajeTemporal = subNotas.reduce((acc, nota) => acc + nota.respuesta + nota.lenguaje, 0);

  return (
    <div className="bg-[#1D1E33] p-6 rounded-lg space-y-2 mt-10">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">1. Entrevista Oral con IA</h2>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={editando ? puntajeTemporal : calificacion}
            readOnly
            className="bg-gray-200 text-black px-2 py-1 w-16 rounded text-center"
          />
          {!editando ? (
            <>
              <span className="text-sm text-gray-400">/ 6</span>
              {confirmadas.entrevista ? (
                <button
                  onClick={() => setConfirmadas(prev => ({ ...prev, entrevista: false }))}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                >
                  Cancelar
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setConfirmadas(prev => ({ ...prev, entrevista: true }))}
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Confirmar IA
                  </button>
                  <button
                    onClick={() => {
                      setEditando(true);
                      setConfirmadas(prev => ({ ...prev, entrevista: false }));
                    }}
                    className="text-xs bg-yellow-400 text-black px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                </>
              )}
            </>
          ) : (
            <button
              onClick={() => {
                actualizarCalificacion("entrevista", puntajeTemporal);
                setConfirmadas(prev => ({ ...prev, entrevista: true }));
                setEditando(false);
              }}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
            >
              Guardar
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-300 space-y-4 mt-4">
        {preguntasOrales.map((p, i) => (
          <div key={i}>
            <p className="text-[#3BDCF6]">
              <strong>Pregunta {i + 1}:</strong> {p.pregunta}
            </p>
            <p className="text-white ml-4">
              <strong>Respuesta:</strong> {p.respuesta}
            </p>

            {editando && (
              <div className="ml-6 mt-2 space-y-1">
                <label className="flex items-center gap-2">
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
                <label className="flex items-center gap-2">
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
        ))}

        {entrevista && (
          <>
            <p className="text-green-400 mt-4">
              <strong>Retroalimentación:</strong>
            </p>
            <p className="italic text-gray-400 whitespace-pre-line">
              {entrevista.RetroalimentacionIA}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
