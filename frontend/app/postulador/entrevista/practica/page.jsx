'use client';

import { useContext, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';

export default function PracticaPage() {
  const { cameraStream } = useContext(StreamContext);
  const camRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams(); // 👈 PARA LEER PARAMETROS
  const token = searchParams.get('token'); // 👈 EXTRAES EL TOKEN

  useEffect(() => {
    if (cameraStream && camRef.current) {
      camRef.current.srcObject = cameraStream;
      camRef.current.play();
    }
  }, [cameraStream]);

  return (
    <div className="min-h-screen w-full bg-[#0A0A23] text-white p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6">Ejercicio de código</h2>

      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-6">
        {/* Panel de enunciado + cámara */}
        <div className="w-full lg:w-1/2 bg-[#1D1E33] rounded-xl p-6 space-y-4">
          <p className="text-sm text-gray-300">
            Crea una API RESTful que permita gestionar una lista de estudiantes con operaciones básicas.
          </p>

          <div className="bg-[#2B2C3F] p-4 rounded">
            <p className="font-semibold mb-1">EJEMPLO 1</p>
            <p className="text-sm"><strong>Input:</strong> POST /estudiantes</p>
            <p className="text-sm mb-1">{'{ "nombre": "Ana", "edad": 22 }'}</p>
            <p className="text-sm"><strong>Output:</strong> 201 Created</p>
            <p className="text-sm">{'{ "id": 1, "nombre": "Ana", "edad": 22 }'}</p>
          </div>

          <div className="bg-[#2B2C3F] p-4 rounded">
            <p className="font-semibold mb-1">EJEMPLO 2</p>
            <p className="text-sm"><strong>Input:</strong> GET /estudiantes/1</p>
            <p className="text-sm"><strong>Output:</strong> 200 OK</p>
            <p className="text-sm">{'{ "id": 1, "nombre": "Ana", "edad": 22 }'}</p>
          </div>

          <div className="text-sm text-gray-400">
            <p><strong>Requerimientos:</strong></p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>POST /estudiantes para agregar estudiantes</li>
              <li>GET /estudiantes/:id para obtener un estudiante</li>
              <li>Usar Express.js o FastAPI</li>
              <li>Datos almacenados en memoria (lista)</li>
              <li>Formato JSON entrada/salida</li>
              <li>Manejo de errores (ej: 404)</li>
            </ul>
          </div>

          {/* Cámara corregida */}
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mt-4">
            <video
              ref={camRef}
              autoPlay
              muted
              className="w-full h-full object-cover rounded"
            />
          </div>
        </div>

        {/* Panel de código */}
        <div className="w-full lg:w-1/2 bg-[#1D1E33] rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Lenguaje:</span>
            <div className="bg-[#2B2C3F] px-3 py-1 rounded text-sm">JavaScript</div>
            <div className="ml-auto text-sm text-gray-300">⏱ 15:00</div>
          </div>

          <textarea
            placeholder="// Escribe tu código aquí..."
            className="w-full h-64 bg-[#2B2C3F] text-sm text-white p-4 rounded resize-none font-mono"
          >
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
          </textarea>

          <div className="flex gap-4 justify-start">
            <button className="px-4 py-2 text-sm bg-[#3BDCF6] text-black font-semibold rounded">Pedir ayuda</button>
            <button className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 rounded">Run</button>
            <button
              onClick={() => router.push(`/postulador/entrevista/finalizacion?token=${token}`)}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 rounded"
            >
              Enviar
            </button>
          </div>

          <div className="text-sm mt-2 text-gray-400">
            <p>// Output de tu código aparecerá aquí…</p>
            <p>{'{ "id": 1, "nombre": "Ana", "edad": 22 }'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
