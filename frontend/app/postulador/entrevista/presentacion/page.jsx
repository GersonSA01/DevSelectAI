'use client';

import { useContext, useRef, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';
import DetectorOscuridad from '../../../components/DetectorOscuridad';
import AnimatedCircle from '../../../components/ui/AnimatedCircle';

export default function PresentacionEntrevista() {
  const router = useRouter();
  const { cameraStream } = useContext(StreamContext);
  const camRef = useRef(null);
  const audioRef = useRef(null);
  const [presentacionIniciada, setPresentacionIniciada] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(true);
  const [step, setStep] = useState(1);
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaGPT, setRespuestaGPT] = useState('');
  const [respuestaAnimada, setRespuestaAnimada] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(15);
  const [bloqueado, setBloqueado] = useState(false);
  const [mensajeVisible, setMensajeVisible] = useState('');
  const temporizadorRef = useRef(null);
  const searchParams = useSearchParams(); // 👈 PARA LEER PARAMETROS
  const token = searchParams.get('token'); // 👈 EXTRAES EL TOKEN

  const textoInicio =
    '¡Hola! Gracias por confiar tu postulación con DevSelectAI. Comencemos, cuéntame sobre ti y tus competencias técnicas en la carrera de Ingeniería en Software.';

  useEffect(() => {
    if (cameraStream && camRef.current) {
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

  const reproducirPresentacion = () => {
    const bienvenida = new Audio('/presentacion.mp3');
    setIsPlayingAudio(true);
    setMensajeVisible('');
    setPresentacionIniciada(true);
    escribirTexto(textoInicio, setMensajeVisible, 50);

    bienvenida
      .play()
      .then(() => {
        bienvenida.onended = () => setIsPlayingAudio(false);
      })
      .catch(err => {
        console.error('Error al reproducir audio:', err);
        setIsPlayingAudio(false);
      });
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
      await procesarAudio(audioBlob);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);

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

  const procesarAudio = async blob => {

    try {
      setBloqueado(true);

      const formData = new FormData();
      formData.append('audio', blob, 'voz.webm');
      formData.append('step', step);
      formData.append('respuestas', JSON.stringify(respuestas));
      formData.append('idPostulante', localStorage.getItem('id_postulante')); // 👈 importante


      const response = await fetch(
        'http://localhost:5000/api/entrevista/procesar-audio',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Error en la respuesta del servidor');

      const gptTexto = response.headers.get('X-Respuesta-GPT');
      const textoUsuario = response.headers.get('X-Texto-Usuario');
      console.log('Texto del usuario:', textoUsuario);
    console.log('Respuestas acumuladas:', [...respuestas, textoUsuario]);

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      if (step === 1) {
        setRespuestas([textoUsuario]);
      } else {
        setRespuestas(prev => [...prev, textoUsuario]);
      }
      

      if (gptTexto) {
        setRespuestaGPT(gptTexto);
        setRespuestaAnimada('');
        escribirTexto(gptTexto, setRespuestaAnimada, 50);
      } else {
        console.warn('No se recibió X-Respuesta-GPT');
      }

      setIsPlayingAudio(true);
      audio.play()
        .then(() => {
          audio.onended = () => {
            setIsPlayingAudio(false);
            setBloqueado(false);
          };
        })
        .catch(err => {
          console.error('Error al reproducir respuesta:', err);
          setIsPlayingAudio(false);
          setBloqueado(false);
        });

      if (step < 4) setStep(prev => prev + 1);
      else setStep(5);
    } catch (error) {
      console.error('Error al procesar audio:', error);
      setBloqueado(false);
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#0A0A23] text-white overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <AnimatedCircle letter="D" isPlaying={isPlayingAudio} />
      </div>

      <div className="absolute right-10 top-1/2 -translate-y-1/2 max-w-sm">
        {recording && tiempoRestante > 0 && (
          <p className="text-center text-sm text-red-400 mb-2">
            Tiempo restante: {tiempoRestante} segundos
          </p>
        )}

        <h2 className="text-2xl font-semibold mb-4">Presentación Personal</h2>
        <DetectorOscuridad onVisibilityChange={setCameraVisible} />

        <div className="bg-[#1C1F2E] p-4 rounded-lg mb-6 border border-[#3BDCF6] shadow w-[400px] h-[150px] overflow-y-auto">
        <h3 className="text-xl text-white font-semibold mb-2">Respuesta de IA</h3>
          <p className="text-sm text-white whitespace-pre-line">
            {respuestaGPT ? (
              <>
                {respuestaAnimada}
                <span className="animate-pulse text-cyan-400">|</span>
              </>
            ) : (
              <>
                {mensajeVisible}
                <span className="animate-pulse text-cyan-400">|</span>
              </>
            )}
          </p>
        </div>

        {!presentacionIniciada && (
          <button
            onClick={reproducirPresentacion}
            disabled={!cameraVisible}
            className={`px-6 py-3 rounded-md mb-4 w-full ${
              cameraVisible
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-gray-500 cursor-not-allowed'
            }`}
          >
            Iniciar presentación
          </button>
        )}

        {presentacionIniciada && (
          <div className="flex gap-4 mb-4">
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

        <button
          onClick={() => router.push(`/postulador/entrevista/teorica?token=${token}`)}
          disabled={step < 4 || !cameraVisible}
          className={`px-6 py-3 rounded-md w-full ${
            step < 4 || !cameraVisible
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Siguiente: Entrevista Teórica
        </button>
      </div>

      <video
        ref={camRef}
        muted
        className="absolute bottom-4 left-4 w-[320px] h-[192px] bg-black rounded-lg object-cover z-50"
      />

      <audio ref={audioRef} hidden controls />
    </div>
  );
}
