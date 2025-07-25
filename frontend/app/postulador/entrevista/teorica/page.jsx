'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';
import Temporizador from '../../../components/ui/Temporizador';
import ValidadorEntorno from '../../../components/ValidadorEntorno';
import { useScreen } from '../../../../context/ScreenContext';
import { Alert } from '../../../components/alerts/Alerts';

export default function TeoricaPage() {
  const router = useRouter();
  const { cameraStream, reiniciarCamara } = useContext(StreamContext);
  const camRef = useRef(null);

  const [cameraVisible, setCameraVisible] = useState(true);
  const [respuestas, setRespuestas] = useState({});
  const [preguntas, setPreguntas] = useState([]);
  const [tiemposInicio, setTiemposInicio] = useState({});
  const [todoRespondido, setTodoRespondido] = useState(false);
  const [alertShown, setAlertShown] = useState(false);

  const { extraScreenDetected } = useScreen();

  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const idEvaluacion = preguntas[0]?.Id_Evaluacion || null;

  const obtenerIdPostulante = () => {
    const id = localStorage.getItem('id_postulante');
    if (!id) {
      console.error("❌ ID de postulante no encontrado en localStorage");
    }
    return id;
  };



  useEffect(() => {
    const cargarPreguntas = async () => {
      const idPostulante = obtenerIdPostulante();
      if (!idPostulante) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/evaluacion/obtener-evaluacion/${idPostulante}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          const teoricas = data.filter(p => Array.isArray(p.opciones) && p.opciones.length > 0);
          setPreguntas(teoricas);

          const ahora = Date.now();
          const tiempos = {};
          teoricas.forEach(p => {
            tiempos[p.Id_Pregunta] = ahora;
          });
          setTiemposInicio(tiempos);
        } else {
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
    if (preguntas.length > 0 && preguntas[0]?.Id_Evaluacion) {
      localStorage.setItem('id_evaluacion', preguntas[0].Id_Evaluacion);
    }
  }, [preguntas]);

  useEffect(() => {
    if (!cameraStream) {
      reiniciarCamara();
    } else if (camRef.current) {
      camRef.current.srcObject = cameraStream;
      camRef.current.play();
    }
  }, [cameraStream]);
  

  useEffect(() => {
    setTodoRespondido(Object.keys(respuestas).length === preguntas.length);
  }, [respuestas, preguntas]);

  useEffect(() => {
    if (extraScreenDetected && !alertShown) {
      setAlertShown(true);
      Alert({
        icon: 'warning',
        title: 'Pantalla adicional detectada',
        html: `
          <p>Parece que hay otra pantalla conectada a tu sistema.</p>
          <p>Por favor, desconéctala para continuar.</p>
        `,
        showCancelButton: false,
        confirmButtonText: 'Entendido',
      }).then(() => setAlertShown(false));
    }
  }, [extraScreenDetected, alertShown]);

  const manejarSeleccion = async (idPregunta, indexOpcion) => {
    if (extraScreenDetected) {
      Alert({
        icon: 'error',
        title: 'No puedes responder',
        html: 'Por favor, desconecta la pantalla adicional antes de continuar.',
        confirmButtonText: 'Ok',
      });
      return;
    }

    const pregunta = preguntas.find(p => p.Id_Pregunta === idPregunta);
    const opcionSeleccionada = pregunta.opciones[indexOpcion];
    const tiempoInicio = tiemposInicio[idPregunta];
    const tiempoRespuesta = tiempoInicio ? Math.floor((Date.now() - tiempoInicio) / 1000) : 0;

    if (!pregunta?.Id_Evaluacion) {
      console.error('❌ Id_Evaluacion no está definido para esta pregunta');
      return;
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/evaluacion/responder/${pregunta.Id_Evaluacion}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idOpcionSeleccionada: opcionSeleccionada.Id_Opcion,
          idPregunta: idPregunta,
          tiempo: tiempoRespuesta
        })
      });

      setRespuestas(prev => ({
        ...prev,
        [idPregunta]: indexOpcion,
      }));
    } catch (error) {
      console.error('❌ Error al guardar la respuesta:', error);
    }
  };

  const handleContinuar = () => {
    if (extraScreenDetected) {
      Alert({
        icon: 'error',
        title: 'No puedes continuar',
        html: 'Por favor, desconecta la pantalla adicional antes de continuar.',
        confirmButtonText: 'Ok',
      });
      return;
    }
    router.push(`/postulador/entrevista/practica?token=${token}`);
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

      <div className="max-w-3xl mx-auto space-y-8">
        {preguntas.length > 0 && idEvaluacion && (
          <ValidadorEntorno idEvaluacion={idEvaluacion} onCamVisibilityChange={setCameraVisible} />
        )}

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
          onClick={handleContinuar}
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
