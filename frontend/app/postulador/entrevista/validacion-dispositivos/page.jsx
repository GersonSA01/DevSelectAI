'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStream } from '../../../../context/StreamContext';
import { mostrarTerminosYCondiciones } from '../../../components/modals/TerminosEntrevista';

export default function ValidacionDispositivos() {
  const router = useRouter();
  const { setCameraStream } = useStream();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const currentCamStream = useRef(null);
  const currentMicStream = useRef(null);

  const [camReady, setCamReady] = useState(false);
  const [micReady, setMicReady] = useState(false);

  const [camaras, setCamaras] = useState([]);
  const [microfonos, setMicrofonos] = useState([]);
  const [selectedCam, setSelectedCam] = useState('');
  const [selectedMic, setSelectedMic] = useState('');

  // 🔍 Detectar dispositivos disponibles
  useEffect(() => {
    const listarDispositivos = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      const audioInputs = devices.filter((d) => d.kind === 'audioinput');

      setCamaras(videoInputs);
      setMicrofonos(audioInputs);

      if (videoInputs[0]) setSelectedCam(videoInputs[0].deviceId);
      if (audioInputs[0]) setSelectedMic(audioInputs[0].deviceId);
    };

    listarDispositivos();
  }, []);

  // 🎥 Cámara
  useEffect(() => {
    const accederCamara = async () => {
      if (!selectedCam) return;

      if (currentCamStream.current) {
        currentCamStream.current.getTracks().forEach((track) => track.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedCam },
        });

        currentCamStream.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setCamReady(true);
      } catch (err) {
        console.warn('No se pudo acceder a la cámara:', err);
        setCamReady(false);
      }
    };

    accederCamara();
  }, [selectedCam, setCameraStream]);

  // 🎙️ Micrófono
  useEffect(() => {
    const accederMicrofono = async () => {
      if (!selectedMic) return;

      if (currentMicStream.current) {
        currentMicStream.current.getTracks().forEach((track) => track.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: selectedMic },
        });

        currentMicStream.current = stream;

        // 🔊 Loopback
        const audioElement = new Audio();
        audioElement.srcObject = stream;
        audioElement.play();

        setMicReady(true);

        // 🎛️ Visualización en canvas
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
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
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }

          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
        };

        draw();
      } catch (err) {
        console.warn('No se pudo acceder al micrófono:', err);
        setMicReady(false);
      }
    };

    accederMicrofono();
  }, [selectedMic]);

  // 🧼 Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (currentCamStream.current) {
        currentCamStream.current.getTracks().forEach((track) => track.stop());
      }
      if (currentMicStream.current) {
        currentMicStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
            onChange={(e) => setSelectedCam(e.target.value)}
          >
            {camaras.map((cam) => (
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
            onChange={(e) => setSelectedMic(e.target.value)}
          >
            {microfonos.map((mic) => (
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
        onClick={() => mostrarTerminosYCondiciones(router, token)}
        disabled={!camReady || !micReady}
        className={`px-6 py-3 text-sm rounded-full font-semibold ${
          camReady && micReady
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
