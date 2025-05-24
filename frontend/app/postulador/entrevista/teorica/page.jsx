'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';

const preguntas = [
  {
    id: 1,
    habilidad: 'Bases de Datos',
    texto: '¿Qué es un dato según el documento?',
    opciones: [
      'Un número aleatorio sin interpretación.',
      'Un conjunto de archivos binarios.',
      'Una dirección de memoria.',
      'Caracteres con algún significado.',
    ],
    correcta: 3,
  },
  {
    id: 2,
    habilidad: 'SQL',
    texto: '¿Cuál es el objetivo principal de un DBMS?',
    opciones: [
      'Reducir el tamaño de la base de datos.',
      'Almacenar archivos multimedia.',
      'Convertir datos en imágenes.',
      'Proporcionar un entorno eficiente para manejar datos.',
    ],
    correcta: 3,
  },
  {
    id: 3,
    habilidad: 'SQL',
    texto: '¿Qué es un campo en un archivo computacional?',
    opciones: [
      'Una tabla completa.',
      'Una colección de registros.',
      'Un dato específico dentro de un registro.',
      'Una base de datos relacional.',
    ],
    correcta: 2,
  },
  {
    id: 4,
    habilidad: 'SQL',
    texto: '¿Cuál de los siguientes es un lenguaje de manipulación de datos?',
    opciones: ['HTML', 'CSS', 'SQL', 'XML'],
    correcta: 2,
  },
  {
    id: 5,
    habilidad: 'SQL',
    texto: '¿Qué representa una clave primaria en una tabla?',
    opciones: [
      'Un atributo duplicado.',
      'Un valor que puede ser NULL.',
      'Un identificador único de cada fila.',
      'Un índice externo a la base de datos.',
    ],
    correcta: 2,
  },
];


export default function TeoricaPage() {
  const router = useRouter();
  const { cameraStream } = useContext(StreamContext);
  const camRef = useRef(null);
  const [respuestas, setRespuestas] = useState({});
  const [todoRespondido, setTodoRespondido] = useState(false);

  useEffect(() => {
    if (cameraStream && camRef.current) {
      camRef.current.srcObject = cameraStream;
      camRef.current.play();
    }
  }, [cameraStream]);

  useEffect(() => {
    setTodoRespondido(Object.keys(respuestas).length === preguntas.length);
  }, [respuestas]);

  const manejarSeleccion = (idPregunta, indexOpcion) => {
    setRespuestas(prev => ({
      ...prev,
      [idPregunta]: indexOpcion,
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A23] text-white p-8">
      <h2 className="text-2xl font-bold mb-8 text-center">Entrevista Teórica</h2>

      <div className="max-w-4xl mx-auto space-y-8">
{preguntas.map((pregunta, index) => (
  <div key={pregunta.id} className="bg-[#1D1E33] p-6 rounded-lg shadow">
    <p className="text-sm text-[#3BDCF6] font-medium mb-1">
      Habilidad evaluada: {pregunta.habilidad}
    </p>
    <h3 className="mb-4 text-base font-semibold">
      {index + 1}. {pregunta.texto}
    </h3>
    <div className="grid grid-cols-1 gap-3">
      {pregunta.opciones.map((opcion, i) => (
        <button
          key={i}
          onClick={() => manejarSeleccion(pregunta.id, i)}
          className={`text-left px-4 py-2 rounded-lg border transition-all duration-150
            ${
              respuestas[pregunta.id] === i
                ? 'bg-[#3BDCF6] text-black border-[#3BDCF6]'
                : 'bg-[#2B2C3F] border-[#444] hover:bg-[#374151]'
            }`}
        >
          {opcion}
        </button>
      ))}
    </div>
  </div>
))}

      </div>

      {/* Botón continuar */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => router.push('/postulador/entrevista/practica')}
          disabled={!todoRespondido}
          className={`px-6 py-3 rounded-full font-semibold text-sm w-64
            ${
              todoRespondido
                ? 'bg-green-500 hover:bg-green-600 text-black'
                : 'bg-gray-500 cursor-not-allowed text-gray-300'
            }`}
        >
          Continuar
        </button>
      </div>

      {/* Cámara en la esquina inferior izquierda */}
      <video
        ref={camRef}
        muted
        className="fixed bottom-4 left-4 w-[320px] aspect-video bg-black rounded-lg object-cover z-50"
      />
    </div>
  );
}
