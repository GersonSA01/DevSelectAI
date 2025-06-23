'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AnimatedCircle from '../../../components/ui/AnimatedCircle';
import ValidadorEntorno from '../../../components/ValidadorEntorno';
import { useStream } from '../../../../context/StreamContext';

export default function PresentacionEntrevista() {
  const router = useRouter();
  const { cameraStream, screenStream, reiniciarCamara } = useStream();


  const camRef = useRef(null);
  const audioRef = useRef(null);

  const [presentacionIniciada, setPresentacionIniciada] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaGPT, setRespuestaGPT] = useState('');
  const [respuestaAnimada, setRespuestaAnimada] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(15);
  const [bloqueado, setBloqueado] = useState(false);
  const [mensajeVisible, setMensajeVisible] = useState('');
  const [inicioGrabacion, setInicioGrabacion] = useState(null);
  const [audioTimeout, setAudioTimeout] = useState(null);

  const [nombrePostulante, setNombrePostulante] = useState('');

  const temporizadorRef = useRef(null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const idEvaluacion = localStorage.getItem('id_evaluacion') || 1;

  useEffect(() => {
    const obtenerPostulante = async () => {
      if (!token || localStorage.getItem('id_postulante')) return;

      try {
        const res = await fetch(`http://localhost:5000/api/postulante/token/${token}`);
        const data = await res.json();

        if (data?.Id_Postulante) {
          localStorage.setItem('id_postulante', data.Id_Postulante);
          setNombrePostulante(`${data.Nombre} ${data.Apellido}`);
        }
      } catch (error) {
        console.error('❌ Error al cargar el postulante:', error);
      }
    };

    obtenerPostulante();
  }, [token]);

useEffect(() => {
  if (!cameraStream) {
    reiniciarCamara(); // intenta recuperar el stream perdido
  } else if (camRef.current) {
    camRef.current.srcObject = cameraStream;
    camRef.current.play();
  }

  return () => {
    if (camRef.current) {
      camRef.current.pause();
      camRef.current.srcObject = null;
    }
  };
}, [cameraStream]);



  const limpiarAudioTimeout = () => {
    if (audioTimeout) {
      clearTimeout(audioTimeout);
      setAudioTimeout(null);
    }
  };

  const desbloquearInterfaz = () => {
    setIsPlayingAudio(false);
    setBloqueado(false);
    limpiarAudioTimeout();
  };

  const escribirTexto = (texto, setter, delay = 60) => {
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

  const reproducirPresentacion = async () => {
    setMensajeVisible('');
    setRespuestaAnimada('');
    setRespuestaGPT('');
    setPresentacionIniciada(true);
    await procesarAudio(null); // Paso 0 sin audio
  };

 const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  let chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = async () => {
    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
    clearInterval(temporizadorRef.current);
    setTiempoRestante(15);

    // 🟥 Calcular tiempo exacto entre IA y fin de grabación
    const duracion = Math.round((Date.now() - inicioGrabacion) / 1000);
    await procesarAudio(audioBlob, duracion);
  };

  recorder.start();
  setMediaRecorder(recorder);
  setRecording(true);

  // Temporizador visual de 15s
  setTiempoRestante(15);
  temporizadorRef.current = setInterval(() => {
    setTiempoRestante(prev => {
      if (prev <= 1) {
        if (recorder.state === 'recording') recorder.stop();
        setRecording(false);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};


  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const procesarAudio = async (blob, tiempoRespuesta = 0) => {
    try {
      setRespuestaGPT('');
      setRespuestaAnimada('');
      setBloqueado(true);
      limpiarAudioTimeout();


      const formData = new FormData();
      if (blob) formData.append('audio', blob, 'voz.webm');

      formData.append('step', step);
      formData.append('respuestas', JSON.stringify(respuestas));
      formData.append('idPostulante', localStorage.getItem('id_postulante'));
      formData.append('tiempoRespuesta', tiempoRespuesta);

      const response = await fetch('http://localhost:5000/api/entrevista/procesar-audio', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');

      const json = await response.json();
      const gptTexto = json.respuestaGPT;
      const textoUsuario = json.textoUsuario;

      if (step === 1) setRespuestas([textoUsuario]);
      else if (step > 1 && step <= 3) setRespuestas(prev => [...prev, textoUsuario]);

      if (gptTexto) {
        setRespuestaGPT(gptTexto);
        setRespuestaAnimada('');
        escribirTexto(gptTexto, setRespuestaAnimada, 50);
      }

      if (json.audio) {
        try {
          const audio = new Audio(`data:audio/webm;base64,${json.audio}`);
          setIsPlayingAudio(true);

          const timeout = setTimeout(() => {
            console.warn('⚠️ Timeout de audio alcanzado, continuando...');
            desbloquearInterfaz();
          }, 30000);
          setAudioTimeout(timeout);

          audio.play().then(() => {
            audio.onended = () => {
              desbloquearInterfaz();
              setInicioGrabacion(Date.now()); // ✅ Aquí sí se activa justo cuando termina la IA
            };

            audio.onerror = err => {
              console.error('❌ Error al reproducir audio:', err);
              desbloquearInterfaz();
              setInicioGrabacion(Date.now()); // (fallback por si falla el audio)
            };
          }).catch(err => {
            console.error('❌ Error al iniciar audio:', err);
            desbloquearInterfaz();
          });
        } catch (err) {
          console.error('❌ Error al crear audio:', err);
          desbloquearInterfaz();
        }
      } else {
        console.warn('⚠️ No se recibió audio, continuando...');
        desbloquearInterfaz();
      }

      setStep(prev => (prev < 4 ? prev + 1 : 5));
    } catch (error) {
      console.error('❌ Error al procesar audio:', error);
      desbloquearInterfaz();
    }
  };

  const continuarManualmente = () => {
    desbloquearInterfaz();
  };

return (
  <div className="relative h-screen w-full bg-[#0A0A23] text-white overflow-hidden">
    <ValidadorEntorno idEvaluacion={idEvaluacion} onCamVisibilityChange={setCameraVisible} />

    {!presentacionIniciada ? (
      // 🔹 Pantalla de bienvenida antes de iniciar
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Antes de iniciar la entrevista</h1>

          {nombrePostulante && (
            <p className="text-cyan-400 text-base font-semibold mb-4">
              Postulante: {nombrePostulante}
            </p>
          )}

          <ul className="list-decimal list-inside text-sm text-secondaryText text-left mb-6 space-y-2">
            <li>Quédate en el entorno de entrevista.</li>
            <li>No abandones ni cambies de pestaña.</li>
            <li>Mantén contacto visual general con la pantalla.</li>
          </ul>

          <button
            onClick={reproducirPresentacion}
            disabled={!cameraVisible || !screenStream}
            className={`px-6 py-3 rounded-md w-full ${
              cameraVisible && screenStream
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-gray-500 cursor-not-allowed'
            }`}
          >
            Iniciar Entrevista
          </button>
        </div>
      </div>
    ) : (
      // 🔸 Pantalla completa de la entrevista una vez iniciada
      <>
        <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
  <AnimatedCircle letter="D" isPlaying={isPlayingAudio} />
</div>
        <div className="w-full px-4 md:absolute md:right-10 md:top-1/2 md:-translate-y-1/2 max-w-sm">

          {nombrePostulante && (
            <p className="text-cyan-400 text-sm font-medium mb-2">
              Postulante: {nombrePostulante}
            </p>
          )}

          {recording && tiempoRestante > 0 && (
            <p className="text-center text-sm text-red-400 mb-2">
              Tiempo restante: {tiempoRestante} segundos
            </p>
          )}

          <h2 className="text-2xl font-semibold mb-4">Entrevista con IA</h2>

<div className="bg-[#1C1F2E] p-4 rounded-lg mb-6 border border-[#3BDCF6] shadow w-full max-w-sm min-h-[140px] overflow-y-auto">
            <h3 className="text-xl text-white font-semibold mb-2">Respuesta de IA</h3>
            <p className="text-sm text-white whitespace-pre-line break-words min-h-[40px]">
              {respuestaAnimada ? (
                <>
                  {respuestaAnimada}
                  <span className="animate-pulse text-cyan-400">|</span>
                </>
              ) : bloqueado ? (
                <span className="flex items-center gap-1 text-cyan-400 font-medium animate-pulse">
                  Procesando<span className="animate-bounce delay-0">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </span>
              ) : (
                <span className="text-gray-400 italic">Esperando acción del postulante...</span>
              )}
            </p>


          </div>

          {step > 0 && step < 4 && (
            <div className="flex flex-col md:flex-row gap-4 mb-4 px-2">
              {!recording ? (
                <button
                  onClick={startRecording}
                  disabled={step >= 4 || bloqueado}
                  className={`px-6 py-3 rounded-md w-full ${
                    step >= 4 || bloqueado
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Iniciar Grabación
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  disabled={bloqueado}
                  className="px-6 py-3 bg-red-600 rounded-md w-full"
                >
                  Detener y Enviar
                </button>
              )}
            </div>
          )}

          {bloqueado && isPlayingAudio && (
            <button
              onClick={continuarManualmente}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md mb-4 w-full text-sm"
            >
              Continuar sin audio
            </button>
          )}

          <button
            onClick={() => router.push(`/postulador/entrevista/teorica?token=${token}`)}
            disabled={step < 4 || !cameraVisible || !screenStream}
            className={`px-6 py-3 rounded-md w-full ${
              step < 4 || !cameraVisible || !screenStream
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Siguiente: Entrevista Teórica
          </button>
        </div>
      </>
    )}

    {/* ✅ Cámara visible SIEMPRE */}
    <video
      ref={camRef}
      muted
className="absolute bottom-4 left-4 w-32 md:w-[320px] aspect-video bg-black rounded-lg object-cover z-50"
    />

    <audio ref={audioRef} hidden controls />
  </div>
);

}
