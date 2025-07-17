"use client";

import { useState, useEffect } from "react";
import { FaBrain, FaCode, FaCheckCircle, FaTools, FaRobot } from "react-icons/fa";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { fetchWithCreds } from '../../utils/fetchWithCreds';

export default function ModuloTecnico({
  idEvaluacion,
  preguntaTecnica,
  calificacion,
  confirmadas,
  setConfirmadas,
  actualizarCalificacion,
}) {
  const [editando, setEditando] = useState(false);
  const [subCalificaciones, setSubCalificaciones] = useState({
    calidad: 0,
    compila: 0,
    resolucion: 0,
  });
  const [errorMaximo, setErrorMaximo] = useState(false);
  const usoIA = Boolean(preguntaTecnica?.usoIA);

  useEffect(() => {
    if (!preguntaTecnica) return;
    const inicial = usoIA ? 0 : 1;
    actualizarCalificacion("tecnica", inicial);
  }, [preguntaTecnica, usoIA, actualizarCalificacion]);

  useEffect(() => {
    if (!preguntaTecnica) return;
    const rawSum =
      subCalificaciones.calidad +
      subCalificaciones.compila +
      subCalificaciones.resolucion;
    const ajuste = usoIA ? 0 : +1;
    const totalConAjuste = rawSum + ajuste;
    const totalClamped = Math.max(0, Math.min(7, totalConAjuste));

    setErrorMaximo(rawSum > 6);
    actualizarCalificacion("tecnica", totalClamped);
  }, [subCalificaciones, usoIA, preguntaTecnica, actualizarCalificacion]);

  if (!preguntaTecnica) return null;

  const handleChange = (campo, valor, max) => {
    const num = Math.min(max, Math.max(0, parseInt(valor, 10) || 0));
    const nuevo = { ...subCalificaciones, [campo]: num };
    const suma = nuevo.calidad + nuevo.compila + nuevo.resolucion;
    if (suma <= 6) {
      setErrorMaximo(false);
      setSubCalificaciones(nuevo);
    } else {
      setErrorMaximo(true);
    }
  };

  const guardarCalificacion = async () => {
    setEditando(false);
    setConfirmadas((prev) => ({ ...prev, tecnica: true }));

    const payload = {
      idEvaluacion,
      idPregunta: preguntaTecnica.Id_Pregunta,
      subCalificaciones: {
        ...subCalificaciones,
        usoIA,
      },
    };

    try {
      const res = await fetchWithCreds(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/calificar/tecnica`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Error al guardar técnica:", res.status, err);
        throw new Error("Error en el servidor");
      }
      const { puntaje } = await res.json();
      actualizarCalificacion("tecnica", puntaje);
      toast.success("Evaluación técnica guardada");
    } catch (e) {
      console.error(e);
      toast.error("Falló al guardar evaluación técnica");
    }
  };

  return (
    <div className="bg-[#1D1E33] p-6 rounded-lg mt-10 shadow border border-[#2B2C3F] space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">3. Evaluación Técnica (Código)</h2>
        <div className="text-[#22C55E] text-lg font-bold">{calificacion} / 7</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        <div className="space-y-4 text-sm text-gray-300">
          <p>
            <strong>Pregunta técnica:</strong> {preguntaTecnica.pregunta}
          </p>
          <pre className="bg-[#181A2F] text-white p-4 rounded-md overflow-x-auto text-sm leading-relaxed border border-[#2B2C3F]">
            {preguntaTecnica.respuesta}
          </pre>
        </div>

        
        <div className="bg-[#181A2F] rounded-md p-5 text-white border border-[#2B2C3F] space-y-4">
          <h3 className="text-[#3BDCF6] font-semibold text-base flex items-center gap-2 mb-3">
            <FaCheckCircle /> Criterios de Evaluación
          </h3>

          {[
            { label: "Calidad (0–2)", icon: <FaBrain />, key: "calidad", max: 2 },
            { label: "Entendimiento del problema (0–2)", icon: <FaCode />, key: "compila", max: 2 },
            { label: "Resolución (0–2)", icon: <FaTools />, key: "resolucion", max: 2 },
          ].map(({ label, icon, key, max }) => (
            <div key={key} className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                {icon} {label}
              </label>
              <input
                type="number"
                min={0}
                max={max}
                value={subCalificaciones[key]}
                onChange={(e) => handleChange(key, e.target.value, max)}
                disabled={!editando}
                className="w-16 text-black rounded px-2 py-1"
              />
            </div>
          ))}

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" checked={usoIA} disabled />
            <label className="flex items-center gap-2 text-yellow-400 text-sm">
              <FaRobot /> {usoIA ? "IA usada (+0)" : "Sin IA (+1)"}
            </label>
          </div>

          {errorMaximo && (
            <p className="text-red-500 text-xs">La suma de criterios no puede superar 6.</p>
          )}

          <div className="flex gap-2 mt-4">
            {!editando ? (
              confirmadas.tecnica ? (
                <button
                  onClick={() => setConfirmadas((prev) => ({ ...prev, tecnica: false }))}
                  className="flex items-center gap-2 bg-[#3BDCF6] hover:bg-[#28c0d3] text-black font-medium text-xs px-4 py-2 rounded-full transition"
                >
                  <RefreshCw size={16} /> Desenmarcar
                </button>
              ) : (
                <button
                  onClick={() => setEditando(true)}
                  className="px-4 py-2 bg-yellow-400 text-black text-xs rounded"
                >
                  Editar
                </button>
              )
            ) : (
              <button
                onClick={guardarCalificacion}
                className="px-4 py-2 bg-blue-500 text-white text-xs rounded"
              >
                Guardar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
