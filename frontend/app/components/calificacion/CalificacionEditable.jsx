"use client";
import { useState } from "react";

export default function CalificacionEditable({ tipo, valor, maximo, onChange, confirmadas, setConfirmadas, setEditandoGlobal }) {
  const [editando, setEditando] = useState(false);
  const [temp, setTemp] = useState(valor);

  const handleConfirmar = () => {
    setConfirmadas(prev => ({ ...prev, [tipo]: true }));
    setEditando(false);
    if (setEditandoGlobal) setEditandoGlobal(false);
  };

  const handleCancelar = () => {
    setConfirmadas(prev => ({ ...prev, [tipo]: false }));
    setEditando(false);
    if (setEditandoGlobal) setEditandoGlobal(false);
  };

  const handleEditar = () => {
    setEditando(true);
    setConfirmadas(prev => ({ ...prev, [tipo]: false }));
    if (setEditandoGlobal) setEditandoGlobal(true);
  };

  const handleGuardar = () => {
    const nuevo = Math.min(maximo, Math.max(0, parseInt(temp, 10)));
    if (!Number.isNaN(nuevo)) {
      onChange(tipo, nuevo);
      setConfirmadas(prev => ({ ...prev, [tipo]: true }));
      setEditando(false);
      if (setEditandoGlobal) setEditandoGlobal(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!editando ? (
        <>
          <span className="text-[#22C55E] font-semibold">{valor}</span>
          <span className="text-sm text-gray-400">/ {maximo}</span>

          {confirmadas[tipo] ? (
            <>
              <span className="text-xs text-green-400 ml-2">✅ Confirmado</span>
              <button
                onClick={handleCancelar}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleConfirmar}
                className="text-xs bg-green-500 text-black px-2 py-1 rounded"
              >
                Confirmar IA
              </button>
              <button
                onClick={handleEditar}
                className="text-xs bg-yellow-500 text-black px-2 py-1 rounded"
              >
                Editar
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <input
            type="number"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            className="bg-white text-black px-2 py-1 w-16 rounded"
          />
          <button
            onClick={handleGuardar}
            className="text-xs bg-blue-500 text-black px-2 py-1 rounded"
          >
            Guardar
          </button>
        </>
      )}
    </div>
  );
}
