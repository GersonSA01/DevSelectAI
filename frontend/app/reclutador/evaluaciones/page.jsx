'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CalificacionEditable({ tipo, valor, maximo, onChange, confirmada, setConfirmada }) {
  const [editando, setEditando] = useState(false);
  const [temp, setTemp] = useState(valor);

  const handleConfirmar = () => {
    setConfirmada(prev => ({ ...prev, [tipo]: true }));
    setEditando(false);
  };

  const handleCancelar = () => {
    setConfirmada(prev => ({ ...prev, [tipo]: false }));
    setEditando(false);
  };

  const handleEditar = () => {
    setEditando(true);
    setConfirmada(prev => ({ ...prev, [tipo]: false }));
  };

  const handleGuardar = () => {
    const nuevo = Math.min(maximo, Math.max(0, parseInt(temp)));
    if (!isNaN(nuevo)) {
      onChange(tipo, nuevo);
      setConfirmada(prev => ({ ...prev, [tipo]: true }));
      setEditando(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!editando ? (
        <>
          <span className="text-[#22C55E] font-semibold">{valor}</span>
          <span className="text-sm text-gray-400">/ {maximo}</span>
          {confirmada[tipo] ? (
            <>
              <span className="text-xs text-green-400 ml-2">✅ Confirmado</span>
              <button onClick={handleCancelar} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Cancelar</button>
            </>
          ) : (
            <>
              <button onClick={handleConfirmar} className="text-xs bg-green-500 text-black px-2 py-1 rounded">Confirmar IA</button>
              <button onClick={handleEditar} className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">Editar</button>
            </>
          )}
        </>
      ) : (
        <>
          <input
            type="number"
            min="0"
            max={maximo}
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            className="w-16 text-center bg-[#0A0A23] border border-[#3BDCF6] text-[#22C55E] px-1 py-0.5 text-sm rounded"
          />
          <button onClick={handleGuardar} className="text-xs bg-blue-500 text-black px-2 py-1 rounded">Guardar</button>
        </>
      )}
    </div>
  );
}

export default function CalificacionPage() {
  const [calificaciones, setCalificaciones] = useState({
    entrevista: 0,
    teorico: 0,
    tecnica: 0,
    capturas: 0,
  });

  const [confirmadas, setConfirmadas] = useState({
    entrevista: false,
    teorico: false,
    tecnica: false,
    capturas: false,
  });

  const [observacionCapturas, setObservacionCapturas] = useState('');
  const [observacionGeneral, setObservacionGeneral] = useState('');
  const [preguntasTeoricas, setPreguntasTeoricas] = useState([]);
  const [preguntasOrales, setPreguntasOrales] = useState([]);
  const [entrevista, setEntrevista] = useState(null);
  const [preguntaTecnica, setPreguntaTecnica] = useState(null);
  const [capturas, setCapturas] = useState([]);

  const searchParams = useSearchParams();
  const idPostulante = searchParams.get('id');
  const router = useRouter();

  useEffect(() => {
    if (!idPostulante) return;

    const cargarDatos = async () => {
      try {
        const [resTeoricas, resEntrevista, resOrales, resTecnica, resCapturas] = await Promise.all([
          fetch(`http://localhost:5000/api/postulante/preguntas-teoricas?id=${idPostulante}`),
          fetch(`http://localhost:5000/api/postulante/entrevista?id=${idPostulante}`),
          fetch(`http://localhost:5000/api/postulante/preguntas-orales?id=${idPostulante}`),
          fetch(`http://localhost:5000/api/evaluacion/pregunta-tecnica-asignada/${idPostulante}`),
          fetch(`http://localhost:5000/api/capturas/postulante/${idPostulante}`)
        ]);

        const dataTeoricas = await resTeoricas.json();
        const dataEntrevista = await resEntrevista.json();
        const dataOrales = await resOrales.json();
        const dataTecnica = await resTecnica.json();
        const dataCapturas = await resCapturas.json();

        setPreguntasTeoricas(dataTeoricas);
        setEntrevista(dataEntrevista);
        setPreguntasOrales(dataOrales.preguntas);
        setPreguntaTecnica(dataTecnica);
        setCapturas(dataCapturas);

        const teoricoCorrectas = dataTeoricas.filter(p => p.correcta).length;

        setCalificaciones(prev => ({
          ...prev,
          teorico: teoricoCorrectas,
          entrevista: 3,
          tecnica: dataTecnica?.calificacion || 0,
          capturas: dataCapturas.length, // 👈 puntuación según número de capturas
        }));
      } catch (err) {
        console.error('❌ Error cargando datos:', err);
      }
    };

    cargarDatos();
  }, [idPostulante]);

  const actualizarCalificacion = (tipo, nuevoValor) => {
    setCalificaciones(prev => ({ ...prev, [tipo]: nuevoValor }));
  };

  const maximos = {
    entrevista: 3,
    teorico: 5,
    tecnica: 2,
    capturas: 4,
  };

  const total = Object.entries(calificaciones).reduce((acc, [k, v]) => acc + Math.min(v, maximos[k]), 0);

  const handleFinalizar = () => {
    router.push('/reclutador/informes');
  };

  return (
    <div className="min-h-screen bg-[#0A0A23] text-white p-10 space-y-10">
      <div className="sticky top-20 bg-[#0A0A23] py-4 z-10 border-b border-[#3BDCF6] shadow-md rounded-md">
        <div className="flex justify-between items-center px-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Calificación</h1>
            <p className="text-sm text-gray-400">Resumen por módulo</p>
          </div>
          <div className="text-right bg-[#1D1E33] px-4 py-2 rounded-lg shadow">
            <p className="text-sm text-gray-400">Puntaje Total</p>
            <p className="text-3xl font-bold text-[#3BDCF6]">{total} / {Object.values(maximos).reduce((a, b) => a + b, 0)}</p>
          </div>
        </div>
      </div>

      {[
        { id: 'entrevista', titulo: '1. Entrevista Oral con IA', max: 3 },
        { id: 'teorico', titulo: '2. Preguntas de Opción Múltiple', max: 5 },
        { id: 'tecnica', titulo: '3. Evaluación Técnica (Código)', max: 2 },
        { id: 'capturas', titulo: '4. Capturas de Cámara', max: 4 },
      ].map(({ id, titulo, max }) => (
        <div key={id} className="bg-[#1D1E33] p-6 rounded-lg space-y-2 mt-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">{titulo}</h2>
            {id === 'teorico' ? (
              <div className="text-[#22C55E] font-semibold">{calificaciones[id]} / {max}</div>
            ) : (
              <CalificacionEditable
                tipo={id}
                valor={calificaciones[id]}
                maximo={max}
                onChange={actualizarCalificacion}
                confirmada={confirmadas}
                setConfirmada={setConfirmadas}
              />
            )}
          </div>

          {id === 'entrevista' && (
            <div className="text-sm text-gray-300 space-y-4 mt-4">
              {preguntasOrales.map((p, i) => (
                <div key={i}>
                  <p className="text-[#3BDCF6]"><strong>Pregunta {i + 1}:</strong> {p.pregunta}</p>
                  <p className="text-white ml-4"><strong>Respuesta:</strong> {p.respuesta}</p>
                </div>
              ))}
              {entrevista && (
                <>
                  <p className="text-green-400 mt-4"><strong>Retroalimentación:</strong></p>
                  <p className="italic text-gray-400 whitespace-pre-line">{entrevista.RetroalimentacionIA}</p>
                </>
              )}
            </div>
          )}

          {id === 'teorico' && (
            <div className="mt-6 space-y-4 text-sm text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preguntasTeoricas.map((p, i) => (
                  <div key={i} className="bg-[#181A2F] border border-[#2B2C3F] p-4 rounded-lg shadow">
                    <p className="text-sm text-[#3BDCF6] mb-1"><strong>Pregunta {i + 1}</strong></p>
                    <p className="text-white mb-2">❓ {p.pregunta}</p>
                    <p className="text-gray-300 mb-1"><strong>Respuesta del postulante:</strong><br /><span className="text-white">{p.respuesta}</span></p>
                    <div className={`mt-2 font-bold ${p.correcta ? 'text-green-400' : 'text-red-400'}`}>
                      {p.correcta ? '✔️ Respuesta Correcta' : '❌ Respuesta Incorrecta'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {id === 'tecnica' && preguntaTecnica && (
            <div className="text-sm text-gray-300 space-y-2 mt-4">
              <p><strong>Pregunta técnica:</strong> {preguntaTecnica.pregunta}</p>
              <pre className="bg-[#181A2F] text-white p-3 rounded whitespace-pre-wrap overflow-x-auto">
                {preguntaTecnica.respuesta}
              </pre>
              {preguntaTecnica.usoIA && (
                <p className="text-yellow-400">⚠️ El postulante solicitó ayuda de la IA</p>
              )}
            </div>
          )}

          {id === 'capturas' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {capturas.length === 0 ? (
                  <p className="text-yellow-400 col-span-4">⏳ No se encontraron capturas...</p>
                ) : (
                  capturas.map((c, i) => (
                    <div key={i} className="bg-[#2B2C3F] rounded overflow-hidden shadow p-2">
                      <img
                        src={`http://localhost:5000/uploads/${c.File}`}
                        alt={`Captura ${i + 1}`}
                        className="w-full h-32 object-cover mb-2"
                      />
                      <p className="text-sm text-gray-300">📝 {c.Observacion}</p>
                      <p className={`text-sm font-bold ${c.Aprobado ? 'text-green-400' : 'text-yellow-400'}`}>
                        {c.Aprobado ? '✔️ Aprobada' : '⏳ Pendiente'}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-1">Observación:</label>
                <textarea
                  value={observacionCapturas}
                  onChange={(e) => setObservacionCapturas(e.target.value)}
                  className="w-full bg-[#2B2C3F] text-white p-2 rounded resize-none"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
      ))}

      <div className="bg-[#1D1E33] p-6 rounded-lg mt-10">
        <h2 className="text-xl font-semibold mb-2">Observación General</h2>
        <textarea
          value={observacionGeneral}
          onChange={(e) => setObservacionGeneral(e.target.value)}
          className="w-full bg-[#2B2C3F] text-white p-2 rounded resize-none"
          rows={4}
        />
      </div>

      <div className="flex justify-center mt-12">
        <button
          onClick={handleFinalizar}
          className="bg-[#3BDCF6] hover:bg-[#2ab8ce] text-black font-semibold px-8 py-3 rounded-lg shadow-lg transition-all"
        >
          Terminar evaluación y guardar
        </button>
      </div>
    </div>
  );
}
