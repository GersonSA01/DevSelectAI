export default function ModuloTeorico({ preguntasTeoricas, calificacion, maximo }) {
  return (
    <div className="bg-[#1D1E33] p-6 rounded-lg space-y-4 mt-10">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">2. Preguntas de Opción Múltiple</h2>
        <div className="text-[#22C55E] font-semibold">
          {calificacion} / {maximo}
        </div>
      </div>

 {Array.isArray(preguntasTeoricas) && preguntasTeoricas.map((p, i) => (
  <div
    key={i}
    className="bg-[#181A2F] border border-[#2B2C3F] p-4 rounded-lg shadow"
  >
    <p className="text-sm text-[#3BDCF6] mb-1">
      <strong>Pregunta {i + 1}</strong>
    </p>
    <p className="text-white mb-2">❓ {p.pregunta}</p>
    <p className="text-gray-300 mb-1">
      <strong>Respuesta del postulante:</strong><br />
      <span className="text-white">{p.respuesta}</span>
    </p>
    <div className={`mt-2 font-bold ${p.Puntaje === 1 ? "text-green-400" : "text-red-400"}`}>
      {p.Puntaje === 1 ? "✔️ Respuesta Correcta" : "❌ Respuesta Incorrecta"}
    </div>
  </div>
))}

    </div>
  );
}
