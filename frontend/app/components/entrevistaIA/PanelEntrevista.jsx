'use client';

import { useState, useRef } from 'react';
import AnimatedCircle from '../ui/AnimatedCircle';
import TemporizadorGrabacion from './Temporizador';

export default function PanelEntrevista({
  token,
  router,
  cameraStream,
  reiniciarCamara,
  cameraVisible,
  screenStream
}) {
  const [tiempoPensar, setTiempoPensar] = useState(60);
  const [mostrarPensar, setMostrarPensar] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [step, setStep] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaGPT, setRespuestaGPT] = useState('');
  const [respuestaAnimada, setRespuestaAnimada] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [inicioGrabacion, setInicioGrabacion] = useState(null);
  const [audioTimeout, setAudioTimeout] = useState(null);
  const [respuestaTimeout, setRespuestaTimeout] = useState(null);
  const [tiempoRespuesta, setTiempoRespuesta] = useState(null);

  const pensarRef = useRef(null);

  const iniciarPresentacion = () => {
    console.log(`[step 0] 🚀 Iniciar Presentación`);
    setStep(0);
    procesarAudio(null, 0, 0);
  };

  const iniciarCuentaAtrasPensar = (currentStep) => {
    if (pensarRef.current) clearInterval(pensarRef.current);

    setTiempoPensar(60);
    setMostrarPensar(true);

    pensarRef.current = setInterval(() => {
      setTiempoPensar(prev => {
        if (prev <= 1) {
          clearInterval(pensarRef.current);
          pensarRef.current = null;
          setMostrarPensar(false);
          startRecording(currentStep);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const limpiarAudioTimeout = () => {
    if (audioTimeout) {
      clearTimeout(audioTimeout);
      setAudioTimeout(null);
    }
  };

  const desbloquearInterfaz = (currentStep) => {
    setIsPlayingAudio(false);
    setBloqueado(false);
    limpiarAudioTimeout();

    if (currentStep >= 0 && currentStep < 3) {
      iniciarCuentaAtrasPensar(currentStep + 1);
    }
  };

  const escribirTexto = (texto, setter, delay = 50) => {
    const chars = Array.from(texto);
    let index = 0;
    let acumulado = '';

    const escribir = () => {
      if (index < chars.length) {
        acumulado += chars[index];
        setter(acumulado);
        index++;
        setTimeout(escribir, delay);
      }
    };

    escribir();
  };

  const startRecording = async (currentStep) => {
  if (respuestaTimeout) {
  clearTimeout(respuestaTimeout);
  setRespuestaTimeout(null);
  }
  setTiempoRespuesta(null);


  if (pensarRef.current) {
    clearInterval(pensarRef.current);
    pensarRef.current = null;
    setMostrarPensar(false);
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = async () => {
    setRecording(false);
    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
    const duracion = Math.round((Date.now() - inicioGrabacion) / 1000);
    await procesarAudio(audioBlob, duracion, currentStep);
  };

  recorder.start();
  setMediaRecorder(recorder);
  setRecording(true);
  setInicioGrabacion(Date.now());
};


  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const procesarAudio = async (blob, tiempoRespuesta = 0, currentStep) => {
    try {
      setRespuestaGPT('');
      setRespuestaAnimada('');
      setBloqueado(true);
      limpiarAudioTimeout();

      const formData = new FormData();

      if (blob) {
        formData.append('audio', blob, 'voz.webm');
      } else {
        const emptyBlob = new Blob([], { type: 'audio/webm' });
        formData.append('audio', emptyBlob, 'vacio.webm');
      }

      formData.append('step', String(currentStep));
      formData.append('respuestas', JSON.stringify(respuestas));
      formData.append('idPostulante', localStorage.getItem('id_postulante'));
      formData.append('tiempoRespuesta', tiempoRespuesta);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entrevista/procesar-audio`
, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');

      const json = await response.json();

      const { respuestaGPT, textoUsuario, audio } = json;

      if (currentStep >= 1 && currentStep <= 3 && textoUsuario) {
        setRespuestas(prev => [...prev, textoUsuario]);
      }

      if (respuestaGPT) {
        setRespuestaGPT(respuestaGPT);
        escribirTexto(respuestaGPT, setRespuestaAnimada, 50);
      }

      if (audio) {
        const audioEl = new Audio(`data:audio/webm;base64,${audio}`);
        setIsPlayingAudio(true);

        audioEl.play()
          .then(() => {
            audioEl.onended = () => {
              desbloquearInterfaz(currentStep);
              setInicioGrabacion(Date.now());

              // iniciar temporizador de 10s
              if (respuestaTimeout) clearTimeout(respuestaTimeout);

          setTiempoRespuesta(10); // iniciar contador visual

          const cuentaRegresiva = setInterval(() => {
            setTiempoRespuesta(prev => {
              if (prev <= 1) {
                clearInterval(cuentaRegresiva);
                return null;
              }
              return prev - 1;
            });
          }, 1000);

          const timeout = setTimeout(() => {
            console.log('⛔ Tiempo agotado sin respuesta');
            setBloqueado(true);
            setRespuestaAnimada(
              'No se detectó respuesta en el tiempo establecido. La entrevista ha finalizado.'
            );
            setStep(999); // step especial para indicar finalización
            setTiempoRespuesta(null); // ocultar contador
            clearInterval(cuentaRegresiva);
          }, 10_000);

          setRespuestaTimeout(timeout);
        }

          })
          .catch(err => {
            console.error('Error al iniciar audio:', err);
            desbloquearInterfaz(currentStep);
          });
      } else {
        desbloquearInterfaz(currentStep);
      }

      if (currentStep < 3) {
        setStep(currentStep + 1);
      } else {
        setStep(4);
      }
    } catch (error) {
      console.error('❌ Error al procesar audio:', error);
      desbloquearInterfaz(currentStep);
    }
  };

  const continuarManualmente = () => {
    desbloquearInterfaz(step);
  };

  return (
    <>
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <AnimatedCircle letter="D" isPlaying={isPlayingAudio} />
      </div>

      <div className="w-full px-4 md:absolute md:right-10 md:top-1/2 md:-translate-y-1/2 max-w-sm">
        <h2 className="text-2xl font-semibold mb-4">Entrevista con IA</h2>

        <div className="bg-[#1C1F2E] p-4 rounded-lg mb-6 border border-[#3BDCF6] shadow w-full max-w-sm min-h-[140px] overflow-y-auto">
          <h3 className="text-xl font-semibold mb-2">Respuesta de IA</h3>
          <p className="text-sm whitespace-pre-line min-h-[40px]">
            {respuestaAnimada ? (
              <>
                {respuestaAnimada}
                <span className="animate-pulse text-cyan-400">|</span>
              </>
            ) : bloqueado ? (
              <span className="flex gap-1 text-cyan-400 animate-pulse">
                Procesando<span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </span>
            ) : (
              <span className="text-gray-400 italic">Esperando a iniciar la entrevista...</span>
            )}
          </p>

          {/* aquí mostramos el temporizador */}
          {tiempoRespuesta !== null && (
            <div className="text-center text-red-500 font-bold text-lg mt-2">
              Tiempo para responder: {tiempoRespuesta}s
            </div>
          )}
        </div>


        {step === 0 && (
          <button
            onClick={iniciarPresentacion}
            disabled={bloqueado || isPlayingAudio}
            className="px-6 py-3 rounded-md w-full bg-green-600 hover:bg-green-700"
          >
            Iniciar Entrevista
          </button>
        )}

        {bloqueado && isPlayingAudio && (
          <button
            onClick={continuarManualmente}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md mb-4 w-full text-sm"
          >
            Continuar sin audio
          </button>
        )}

        {step > 0 && step < 4 && !recording && !bloqueado && (
          <button
            onClick={() => startRecording(step)}
            disabled={bloqueado}
            className={`px-6 py-3 rounded-md w-full mt-4 ${
              bloqueado
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Iniciar grabación
          </button>

        )}

        {recording && (
          <>
            <TemporizadorGrabacion
              recorder={mediaRecorder}
              onFinish={() => stopRecording()}
            />
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md w-full mt-2"
            >
              Detener grabación
            </button>
          </>
        )}

        {step >= 4 && (
          <button
            onClick={() => router.push(`/postulador/entrevista/teorica?token=${token}`)}
            disabled={!cameraVisible || !screenStream}
            className="px-6 py-3 rounded-md w-full bg-blue-600 hover:bg-blue-700"
          >
            Siguiente: Entrevista Teórica
          </button>
        )}
      </div>
    </>
  );
}
