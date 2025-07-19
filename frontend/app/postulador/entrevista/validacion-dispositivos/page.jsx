'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStream } from '../../../../context/StreamContext';
import { mostrarTerminosYCondiciones } from '../../../components/modals/TerminosEntrevista';
import { useScreen } from '../../../../context/ScreenContext';
import { Alert } from '../../../components/alerts/Alerts';

export default function ValidacionDispositivos() {
  const router = useRouter();
  const { setCameraStream } = useStream();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const micAudioElement = useRef(null);
  const currentMicStream = useRef(null);
  const yaGenerado = useRef(false);

  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { extraScreenDetected } = useScreen();
  const [alertShown, setAlertShown] = useState(false);

  const [camReady, setCamReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [camaras, setCamaras] = useState([]);
  const [microfonos, setMicrofonos] = useState([]);
  const [selectedCam, setSelectedCam] = useState('');
  const [selectedMic, setSelectedMic] = useState('');

const generarEvaluacion = async () => {
  if (yaGenerado.current || !token) return;

  yaGenerado.current = true;

  try {
    const resId = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/postulante/token/${token}`);
    const dataId = await resId.json();

    const idPostulante = dataId?.postulante?.Id_Postulante;

    if (!resId.ok || !idPostulante) {
      console.warn("⛔ Postulante no encontrado correctamente:", dataId?.error || dataId);
      return;
    }

    const resEval = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/evaluacion/inicial/${idPostulante}`, {
      method: 'POST'
    });

    const dataEval = await resEval.json();

    if (!resEval.ok) throw new Error(dataEval?.error || 'Error inesperado al crear evaluación');

    localStorage.setItem('id_postulante', idPostulante);
    localStorage.setItem('id_evaluacion', dataEval.evaluacionId);
    console.log('✅ Evaluación generada exitosamente:', dataEval);

  } catch (error) {
    console.error('❌ Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }
};


  useEffect(() => {
    generarEvaluacion();
  }, [token]);

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

  useEffect(() => {
    const listarDispositivos = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      const audioInputs = devices.filter(d => d.kind === 'audioinput');

      setCamaras(videoInputs);
      setMicrofonos(audioInputs);
      if (videoInputs[0]) setSelectedCam(videoInputs[0].deviceId);
      if (audioInputs[0]) setSelectedMic(audioInputs[0].deviceId);
    };

    listarDispositivos();
  }, []);

  useEffect(() => {
    const accederCamara = async () => {
      if (!selectedCam) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedCam } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraStream(stream);
        window.copiaCamara = stream;
        setCamReady(true);
      } catch (err) {
        console.warn('❌ No se pudo acceder a la cámara:', err);
        setCamReady(false);
      }
    };

    accederCamara();
  }, [selectedCam]);

  useEffect(() => {
    const accederMicrofono = async () => {
      if (!selectedMic) return;

      if (micAudioElement.current) {
        micAudioElement.current.pause();
        micAudioElement.current.srcObject = null;
      }
      if (currentMicStream.current) {
        currentMicStream.current.getTracks().forEach(track => track.stop());
        currentMicStream.current = null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedMic } });

        currentMicStream.current = stream;

        micAudioElement.current = new Audio();
        micAudioElement.current.srcObject = stream;
        micAudioElement.current.play().catch(() => {});
        setMicReady(true);

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 256;

        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const draw = () => {
          requestAnimationFrame(draw);
          analyser.getByteTimeDomainData(dataArray);

          ctx.fillStyle = '#2B2C3F';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#3BDCF6';
          ctx.beginPath();

          const sliceWidth = canvas.width / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }

          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
        };

        draw();
      } catch (err) {
        console.warn('❌ No se pudo acceder al micrófono:', err);
        setMicReady(false);
      }
    };

    accederMicrofono();
  }, [selectedMic]);

  useEffect(() => {
    return () => {
      if (currentMicStream.current) {
        currentMicStream.current.getTracks().forEach(t => t.stop());
        currentMicStream.current = null;
      }
      if (micAudioElement.current) {
        micAudioElement.current.pause();
        micAudioElement.current.srcObject = null;
      }
    };
  }, []);

  const iniciarEntrevista = () => {
    if (extraScreenDetected) {
      Alert({
        icon: 'error',
        title: 'No puedes continuar',
        html: 'Por favor, desconecta la pantalla adicional para poder continuar con la entrevista.',
        confirmButtonText: 'Ok',
      });
      return;
    }

    mostrarTerminosYCondiciones(router, token);
  };

  return (
    <div className="min-h-screen bg-[#0A0A23] text-white px-6 py-10 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-8">Verifica tu cámara, micrófono y comparte pantalla</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-6">
        {/* Cámara */}
        <div className="bg-[#1D1E33] p-6 rounded-lg shadow-md">
          <label className="block mb-2 text-sm text-gray-300">Selecciona tu cámara</label>
          <select
            className="w-full mb-4 text-sm p-2 bg-[#2B2C3F] rounded text-white"
            value={selectedCam}
            onChange={e => setSelectedCam(e.target.value)}
          >
            {camaras.map(cam => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || 'Cámara sin nombre'}
              </option>
            ))}
          </select>
          <div className="bg-black rounded overflow-hidden flex justify-center">
            <video ref={videoRef} autoPlay muted className="rounded max-w-full h-auto" />
          </div>
          <p className="mt-2 text-sm">{camReady ? 'Cámara detectada ✔️' : 'Cámara no detectada ❌'}</p>
        </div>

        {/* Micrófono */}
        <div className="bg-[#1D1E33] p-6 rounded-lg shadow-md">
          <label className="block mb-2 text-sm text-gray-300">Selecciona tu micrófono</label>
          <select
            className="w-full mb-2 text-sm p-2 bg-[#2B2C3F] rounded text-white"
            value={selectedMic}
            onChange={e => setSelectedMic(e.target.value)}
          >
            {microfonos.map(mic => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || 'Micrófono sin nombre'}
              </option>
            ))}
          </select>

          <label className="text-sm mb-1 block">Habla para probar tu micrófono.</label>
          <div className="mt-2 mb-4 rounded overflow-hidden">
            <canvas ref={canvasRef} width={400} height={80} className="w-full rounded bg-[#2B2C3F]" />
          </div>

          <p className="mt-2 text-sm">{micReady ? 'Micrófono detectado ✔️' : 'Micrófono no detectado ❌'}</p>
        </div>
      </div>

      <button
        onClick={iniciarEntrevista}
        disabled={!camReady || !micReady || extraScreenDetected}
        className={`px-6 py-3 text-sm rounded-full font-semibold ${
          camReady && micReady && !extraScreenDetected
            ? 'bg-white text-black hover:bg-gray-200'
            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
        }`}
      >
        Iniciar entrevista
      </button>

      <p className="text-xs text-gray-400 text-center mt-6 max-w-3xl">
        Al continuar, acepta que los resultados de esta entrevista asistida por IA pueden incluir grabaciones y capturas automáticas.
      </p>
    </div>
  );
}
