"use client";

import { useState, useEffect } from "react";
import { FaBrain, FaCode, FaCheckCircle, FaTools, FaRobot } from "react-icons/fa";

export default function ModuloTecnico({
  preguntaTecnica,
  calificacion,
  confirmadas,
  setConfirmadas,
  actualizarCalificacion,
}) {
  const [subCalificaciones, setSubCalificaciones] = useState({
    calidad: 0,
    compila: 0,
    resolucion: 0,
  });
  const [errorMaximo, setErrorMaximo] = useState(false);

  const usoIA = preguntaTecnica?.usoIA || false;

  useEffect(() => {
    const total = subCalificaciones.calidad + subCalificaciones.compila + subCalificaciones.resolucion;
    const totalFinal = total - (usoIA ? 1 : 0);

    if (total > 7) {
      setErrorMaximo(true);
    } else {
      setErrorMaximo(false);
      actualizarCalificacion("tecnica", Math.max(0, totalFinal));
    }
  }, [subCalificaciones, usoIA]);

  if (!preguntaTecnica) return null;

  const handleChange = (campo, valor) => {
    const nuevoValor = parseInt(valor) || 0;
    const nuevoEstado = { ...subCalificaciones, [campo]: nuevoValor };
    const sumaTemporal = nuevoEstado.calidad + nuevoEstado.compila + nuevoEstado.resolucion;
    if (sumaTemporal <= 7) {
      setSubCalificaciones(nuevoEstado);
    } else {
      setErrorMaximo(true);
    }
  };

  return (
    <div className="bg-[#1D1E33] p-6 rounded-lg mt-10 shadow border border-[#2B2C3F] space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">3. Evaluación Técnica (Código)</h2>
        <div className="text-[#22C55E] text-lg font-bold">{calificacion} / 7</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LADO IZQUIERDO */}
        <div className="space-y-4 text-sm text-gray-300">
          <p><strong>Pregunta técnica:</strong> {preguntaTecnica.pregunta}</p>
          <pre className="bg-[#181A2F] text-white p-4 rounded-md overflow-x-auto text-sm leading-relaxed border border-[#2B2C3F]">
{preguntaTecnica.respuesta}
          </pre>
        </div>

        {/* LADO DERECHO */}
        <div className="bg-[#181A2F] rounded-md p-5 text-white border border-[#2B2C3F] space-y-4">
          <h3 className="text-[#3BDCF6] font-semibold text-base flex items-center gap-2 mb-3">
            <FaCheckCircle className="text-[#3BDCF6]" /> Criterios de Evaluación
          </h3>

         {[
  { label: "Calidad del Código (hasta 3 puntos)", icon: <FaBrain className="text-pink-400" />, key: "calidad", max: 3 },
  { label: "Compila Correctamente (hasta 1 punto)", icon: <FaCode className="text-blue-400" />, key: "compila", max: 1 },
  { label: "Resolución del Problema (hasta 3 puntos)", icon: <FaTools className="text-green-400" />, key: "resolucion", max: 3 },
].map(({ label, icon, key, max }) => (
  <div className="flex items-center justify-between gap-3" key={key}>
    <label className="flex items-center gap-2 text-sm">
      {icon}
      {label}
    </label>
    <input
      type="number"
      min={0}
      max={max}
      value={subCalificaciones[key]}
      onChange={(e) => handleChange(key, e.target.value)}
      className="w-16 text-black rounded px-2 py-1"
    />
  </div>
))}


          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" checked={usoIA} disabled />
            <label className="text-yellow-400 text-sm flex items-center gap-2">
              <FaRobot className="text-yellow-400" />
              Usó ayuda de IA (se resta 1 punto)
            </label>
          </div>

          {errorMaximo && (
            <p className="text-red-500 text-xs pt-2">
              ⚠️ La suma de los subcriterios no puede superar 7 puntos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
