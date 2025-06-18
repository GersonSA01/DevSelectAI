'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';
import Temporizador from '../../../components/ui/Temporizador'; // Asegúrate de que esta ruta sea la correcta
import ValidadorEntorno from '../../../components/ValidadorEntorno';

export default function TeoricaPage() {
  const router = useRouter();
  const { cameraStream } = useContext(StreamContext);
  const camRef = useRef(null);
  const [cameraVisible, setCameraVisible] = useState(true);
  const [respuestas, setRespuestas] = useState({});
  const [todoRespondido, setTodoRespondido] = useState(false);
  const [preguntas, setPreguntas] = useState([]);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const idEvaluacion = preguntas[0]?.Id_Evaluacion || null;

useEffect(() => {
  const cargarPreguntas = async () => {
    const idPostulante = localStorage.getItem('id_postulante');
    if (!idPostulante) {
      console.error("ID de postulante no encontrado en localStorage");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/entrevista-teorica/generar-evaluacion/${idPostulante}`);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
  const teoricas = data.filter(p => Array.isArray(p.opciones) && p.opciones.length > 0);
  setPreguntas(teoricas);
}
else {
        console.warn("⚠️ Error al recibir preguntas:", data?.error || data);
        setPreguntas([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar preguntas teóricas:', error);
    }
  };

  cargarPreguntas();
}, []);



  useEffect(() => {
    if (cameraStream && camRef.current) {
      camRef.current.srcObject = cameraStream;
      camRef.current.play();
    }
  }, [cameraStream]);

  useEffect(() => {
    setTodoRespondido(Object.keys(respuestas).length === preguntas.length);
  }, [respuestas, preguntas]);

  const manejarSeleccion = async (idPregunta, indexOpcion) => {
    const pregunta = preguntas.find(p => p.Id_Pregunta === idPregunta);
    const opcionSeleccionada = pregunta.opciones[indexOpcion];

    try {
      await fetch(`http://localhost:5000/api/entrevista-teorica/responder/${pregunta.Id_Evaluacion}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idOpcionSeleccionada: opcionSeleccionada.Id_Opcion })
      });

      setRespuestas(prev => ({
        ...prev,
        [idPregunta]: indexOpcion,
      }));
    } catch (error) {
      console.error('❌ Error al guardar la respuesta:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A23] text-white p-8">
      <h2 className="text-2xl font-bold mb-2 text-center">Entrevista Teórica</h2>
<Temporizador
  duracion={300}
  onFinalizar={() => {
    router.push(`/postulador/entrevista/practica?token=${token}`);
  }}
/>


      <div className="max-w-4xl mx-auto space-y-8">
              <ValidadorEntorno idEvaluacion={idEvaluacion} onCamVisibilityChange={setCameraVisible} />
        
        {preguntas.map((pregunta, index) => (
          <div key={pregunta.Id_Pregunta} className="bg-[#1D1E33] p-6 rounded-lg shadow">
            <p className="text-sm text-[#3BDCF6] font-medium mb-1">
              Pregunta {index + 1}
            </p>
            <h3 className="mb-4 text-base font-semibold">
              {pregunta.Pregunta}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {pregunta.opciones.map((opcion, i) => (
                <button
                  key={opcion.Id_Opcion}
                  onClick={() => manejarSeleccion(pregunta.Id_Pregunta, i)}
                  className={`text-left px-4 py-2 rounded-lg border transition-all duration-150 ${
                    respuestas[pregunta.Id_Pregunta] === i
                      ? 'bg-[#3BDCF6] text-black border-[#3BDCF6]'
                      : 'bg-[#2B2C3F] border-[#444] hover:bg-[#374151]'
                  }`}
                >
                  {opcion.Opcion}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={() => router.push(`/postulador/entrevista/practica?token=${token}`)}
          disabled={!todoRespondido}
          className={`px-6 py-3 rounded-full font-semibold text-sm w-64 ${
            todoRespondido
              ? 'bg-green-500 hover:bg-green-600 text-black'
              : 'bg-gray-500 cursor-not-allowed text-gray-300'
          }`}
        >
          Continuar
        </button>
      </div>

      <video
        ref={camRef}
        muted
        className="fixed bottom-4 left-4 w-[320px] aspect-video bg-black rounded-lg object-cover z-50"
      />
    </div>
  );
}
