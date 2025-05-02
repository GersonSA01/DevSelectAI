'use client';

import { useContext, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';
import DetectorOscuridad from '../../../components/DetectorOscuridad';
import AnimatedCircle from '../../../components/ui/AnimatedCircle';
import axios from 'axios';

export default function PresentacionEntrevista() {
  const router = useRouter();
  const { cameraStream } = useContext(StreamContext);
  const camRef = useRef(null);
  const audioRef = useRef(null);
  const [presentacionIniciada, setPresentacionIniciada] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(true);
  const [step, setStep] = useState(1); // 1: presentación, 2-4: respuestas, 5: cierre
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaGPT, setRespuestaGPT] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(15);
  const temporizadorRef = useRef(null);
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    if (cameraStream && camRef.current) {
      camRef.current.srcObject = cameraStream;
      camRef.current.play();
    }
  }, [cameraStream]);

  const reproducirPresentacion = () => {
    const bienvenida = new Audio('/presentacion.mp3');
    setIsPlayingAudio(true);

    bienvenida.play()
      .then(() => {
        setPresentacionIniciada(true);
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
      setAudioChunks([]);
      clearInterval(temporizadorRef.current); // Detener el temporizador
      setTiempoRestante(15); // Reiniciar el contador para el próximo intento
      await procesarAudio(audioBlob);
    };
  
    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  
    // ⏳ Iniciar temporizador regresivo
    setTiempoRestante(15);
    temporizadorRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          recorder.stop(); // ⏹ Auto detener
          setRecording(false); 
          return 0;
        }
        return prev - 1;
      });
    }, 1500);
  };
  

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const procesarAudio = async (blob) => {
    try {

      setBloqueado(true);

      // Transcripción
      const formData = new FormData();
      formData.append('file', blob, 'voz.webm');
      formData.append('model', 'whisper-1');

      const whisperRes = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const textoUsuario = whisperRes.data.text;
      setRespuestas(prev => [...prev, textoUsuario]);

      // Generación de pregunta o retroalimentación
      let prompt = '';
      if (step === 1) {
        prompt = `Con base en esta presentación previa del postulante: "${textoUsuario}", formula una primera pregunta técnica clara y breve que pueda responderse oralmente. Se breve solo haz la pregunta`;
      } else if (step === 2) {
        prompt = `El postulante respondió: "${textoUsuario}". Formula una segunda pregunta técnica relacionada, también breve y clara para respuesta oral.`;
      } else if (step === 3) {
        prompt = `Estas fueron las respuestas del postulante:\n1) ${respuestas[0]}\n2) ${respuestas[1]}\n3) ${textoUsuario}.\nBrinda una retroalimentación profesional al postulante y muy breve sobre su desempeño. Luego, agradécele aal postulante por su participación e indícale que va a la siguiente fase a dar la prueba teórica. Se breve tambien`;
      }

      const gptRes = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Eres un reclutador técnico de la Universidad Estatal de Milagro (UNEMI). Estás utilizando la plataforma DevSelectAI para evaluar a estudiantes que postulan a prácticas preprofesionales internas. Responde de forma breve, clara y profesional, enfocándote en las competencias técnicas, la actitud y la forma de expresarse del postulante. Sé empático, objetivo y directo en tus respuestas.'
            },
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'application/json',
          },
        }
      );

      const textoRespuesta = gptRes.data.choices[0].message.content;
      setRespuestaGPT(textoRespuesta);

      // Reproducir voz
      const elevenRes = await axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB',
        {
          text: textoRespuesta,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.9,
            style: 0.3,
          },
        },
        {
          headers: {
            'xi-api-key': 'sk_39a5a2ca5968221e63e39f8e7760edd18311aec642869a70',
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );

      const audioURL = URL.createObjectURL(elevenRes.data);
      const respuestaAudio = new Audio(audioURL);

      setIsPlayingAudio(true);
      respuestaAudio.play().finally(() => {
        respuestaAudio.onended = () => {
          setIsPlayingAudio(false);
          setBloqueado(false); // ⬅️ desbloquea cuando ya terminó
        };
              });

      // Avanzar pasos
      if (step < 4) {
        setStep(prev => prev + 1);
      } else {
        setStep(5);
      }
    } catch (error) {
      console.error('Error en el flujo:', error.message);
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

        {respuestaGPT && isPlayingAudio && (
          <div className="text-sm text-white bg-[#1C1F2E] p-4 rounded-lg mb-6 border border-[#3BDCF6] shadow">
            {respuestaGPT}
          </div>
        )}



        {!presentacionIniciada && (
          <button
            onClick={reproducirPresentacion}
            disabled={!cameraVisible}
            className={`px-6 py-3 rounded-md mb-4 w-full ${
              cameraVisible ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-500 cursor-not-allowed'
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
                  step >= 4 ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
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
          onClick={() => router.push('/postulador/entrevista/teorica')}
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
