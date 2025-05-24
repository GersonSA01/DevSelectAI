'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
              <button
                onClick={handleCancelar}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
              >
                Cancelar
              </button>
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
    entrevista: 3,
    teorico: 4,
    tecnica: 2,
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

  const actualizarCalificacion = (tipo, nuevoValor) => {
    setCalificaciones((prev) => ({ ...prev, [tipo]: nuevoValor }));
  };

  const maximos = {
    entrevista: 3,
    teorico: 5,
    tecnica: 2,
    capturas: 4,
  };

  const total = Object.entries(calificaciones).reduce((acc, [k, v]) => acc + Math.min(v, maximos[k]), 0);

  const router = useRouter();

  const handleFinalizar = () => {
    // Aquí podrías guardar los datos si lo deseas
    router.push('/reclutador/informes');
  };

  const preguntasTeoricas = [
  {
    habilidad: 'React',
    pregunta: '¿Qué hook se usa para manejar estado en React?',
    respuesta: 'useState',
    correcta: true
  },
  {
    habilidad: 'SQL',
    pregunta: '¿Qué comando se usa para eliminar una tabla?',
    respuesta: 'DROP TABLE',
    correcta: true
  },
  {
    habilidad: 'React',
    pregunta: '¿Qué hook permite ejecutar efectos secundarios?',
    respuesta: 'useEffect',
    correcta: true
  },
  {
    habilidad: 'Express',
    pregunta: '¿Cómo se define una ruta GET en Express?',
    respuesta: `app.get('/', callback)`,
    correcta: true
  },
  {
    habilidad: 'SQL',
    pregunta: '¿Qué hace el comando SELECT?',
    respuesta: 'Recupera datos de una tabla',
    correcta: true
  }
];



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

      {[{ id: 'entrevista', titulo: '1. Entrevista Oral con IA', max: 3 },
        { id: 'teorico', titulo: '2. Preguntas de Opción Múltiple', max: 5 },
        { id: 'tecnica', titulo: '3. Evaluación Técnica (Código)', max: 2 },
        { id: 'capturas', titulo: '4. Capturas de Cámara', max: 4 },
      ].map(({ id, titulo, max }) => (
        <div key={id} className="bg-[#1D1E33] p-6 rounded-lg space-y-2 mt-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">{titulo}</h2>
            <CalificacionEditable
              tipo={id}
              valor={calificaciones[id]}
              maximo={max}
              onChange={actualizarCalificacion}
              confirmada={confirmadas}
              setConfirmada={setConfirmadas}
            />
          </div>

          {id === 'entrevista' && (
            <div className="space-y-2 text-sm text-gray-300 mt-6">
              <p><strong>IA:</strong> ¿Qué es una API REST?</p>
              <p><strong>Estudiante:</strong> Es una interfaz que permite la comunicación entre sistemas usando HTTP.</p>
              <p><strong>IA:</strong> ¿Cuándo usarías una base NoSQL?</p>
              <p><strong>Estudiante:</strong> Para datos no estructurados o escalabilidad horizontal.</p>
              <p><strong>IA:</strong> ¿Qué herramienta usas para probar APIs?</p>
              <p><strong>Estudiante:</strong> Postman y fetch en frontend.</p>
              <p className="text-[#22C55E] mt-2"><strong>Retroalimentación IA:</strong> Buen manejo del concepto y claridad al expresarse.</p>
            </div>
          )}

{id === 'teorico' && (
  <div className="space-y-4 text-sm text-gray-300 mt-6">
    {preguntasTeoricas.map((p, i) => (
      <div
        key={i}
        className="border border-[#2B2C3F] p-3 rounded-lg bg-[#12132B] space-y-1"
      >
        <p><strong>Pregunta {i + 1} ({p.habilidad}):</strong> {p.pregunta}</p>
        <p><strong>Respuesta del postulante:</strong> {p.respuesta}</p>
        <p className={p.correcta ? 'text-green-400' : 'text-red-400'}>
          {p.correcta ? '✔️ Respuesta Correcta' : '❌ Respuesta Incorrecta'}
        </p>
      </div>
    ))}
  </div>
)}



          {id === 'tecnica' && (
            <div className="space-y-2 text-sm text-gray-300">
              <p className="text-[#3BDCF6] font-semibold">📌 Enunciado:</p>
              <p>Crea una API RESTful para gestionar estudiantes (POST/GET).</p>
              <p className="text-[#3BDCF6] font-semibold mt-3">💡 Respuesta:</p>
              <pre className="bg-[#2B2C3F] text-green-300 text-sm p-4 rounded overflow-x-auto whitespace-pre-wrap">
{`const express = require('express');
const app = express();
app.use(express.json());

let estudiantes = [];

app.post('/estudiantes', (req, res) => {
  const nuevo = { id: estudiantes.length + 1, ...req.body };
  estudiantes.push(nuevo);
  res.status(201).json(nuevo);
});

app.get('/estudiantes/:id', (req, res) => {
  const est = estudiantes.find(e => e.id == req.params.id);
  if (!est) return res.status(404).json({ mensaje: 'No encontrado' });
  res.json(est);
});`}
              </pre>
              <p className="text-[#3BDCF6]">✅ Usó botón de asistencia IA: <strong>Sí</strong></p>
            </div>
          )}

          {id === 'capturas' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-400 text-sm">
                <div className="bg-[#2B2C3F] h-32 flex items-center justify-center rounded">Cámara tapada</div>
                <div className="bg-[#2B2C3F] h-32 flex items-center justify-center rounded">Mirada fuera</div>
                <div className="bg-[#2B2C3F] h-32 flex items-center justify-center rounded">Cámara desactivada</div>
                <div className="bg-[#2B2C3F] h-32 flex items-center justify-center rounded">Sin incidente</div>
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

      {/* Observación General */}
      <div className="bg-[#1D1E33] p-6 rounded-lg mt-10">
        <h2 className="text-xl font-semibold mb-2">Observación General</h2>
        <textarea
          value={observacionGeneral}
          onChange={(e) => setObservacionGeneral(e.target.value)}
          className="w-full bg-[#2B2C3F] text-white p-2 rounded resize-none"
          rows={4}
        />
      </div>

      {/* Botón finalizar evaluación */}
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