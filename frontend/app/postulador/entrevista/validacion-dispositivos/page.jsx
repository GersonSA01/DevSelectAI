'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStream } from '../../../../context/StreamContext';
import DetectorOscuridad from '../../../components/DetectorOscuridad';
import CapturaPantalla from '../../../components/CapturaPantalla'; // ✅ IMPORTADO

export default function ValidacionDispositivos() {
  const router = useRouter();
  const { setCameraStream, setScreenStream } = useStream(); // incluye screenStream
  const videoRef = useRef(null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [cameraVisible, setCameraVisible] = useState(true);
  const [micReady, setMicReady] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Capturar pantalla al cargar
  useEffect(() => {
    const pedirPantalla = async () => {
      try {
        const streamPantalla = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(streamPantalla);
        console.log('🖥️ Pantalla compartida correctamente');
      } catch (error) {
        console.error('❌ Error al compartir pantalla:', error);
        alert('Debes permitir compartir pantalla para continuar.');
      }
    };
    pedirPantalla();
  }, [setScreenStream]);

  // Validar cámara y micrófono
  useEffect(() => {
    const initDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setCamReady(true);

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const micSource = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        micSource.connect(analyser);
        analyser.fftSize = 64;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detectVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setMicVolume(volume);
          setMicReady(true);
          requestAnimationFrame(detectVolume);
        };

        detectVolume();
      } catch (error) {
        console.error('Error al acceder a dispositivos:', error);
        alert('No se pudo acceder a cámara o micrófono.');
      }
    };

    initDevices();
  }, [setCameraStream]);

  const handleStart = () => {
    router.push(`/postulador/entrevista/preparacion?token=${token}`);
  };

  // ID evaluación simulado (ajústalo según tu flujo real)
  const idEvaluacion = localStorage.getItem('id_evaluacion') || 1;

  return (
    <div className="min-h-screen bg-[#0A0A23] text-white px-6 py-10 flex flex-col items-center">
      <DetectorOscuridad onVisibilityChange={setCameraVisible} />

      {/* Captura automática cada 30s */}
      <CapturaPantalla idEvaluacion={idEvaluacion} auto={true} /> {/* ✅ INTEGRADO */}

      <h2 className="text-2xl font-bold mb-8">Verifica tu cámara, micrófono y comparte pantalla</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-6">
        {/* Cámara */}
        <div className="bg-[#1D1E33] p-6 rounded-lg shadow-md">
          <label className="block mb-2 text-sm text-gray-300">Selecciona tu cámara</label>
          <div className="bg-[#2B2C3F] p-2 rounded text-sm mb-4">HP Wide Vision HD Camera (0408:5425)</div>
          <div className="w-full h-48 bg-black rounded overflow-hidden">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          </div>
          <p className="mt-2 text-sm">{camReady ? 'Cámara detectada ✔️' : 'Cámara no detectada ❌'}</p>
        </div>

        {/* Micrófono */}
        <div className="bg-[#1D1E33] p-6 rounded-lg shadow-md">
          <label className="block mb-2 text-sm text-gray-300">Selecciona tu micrófono</label>
          <div className="bg-[#2B2C3F] p-2 rounded text-sm mb-4">Predeterminado - Headset Microphone</div>
          <label className="text-sm mb-1 block">Habla para probar tu micrófono.</label>
          <div className="bg-gray-700 h-5 rounded overflow-hidden mt-2 mb-4">
            <div
              className="h-full bg-[#3BDCF6] transition-all duration-300"
              style={{ width: `${Math.min(100, micVolume * 2)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm">{micReady ? 'Micrófono detectado ✔️' : 'Micrófono no detectado ❌'}</p>
        </div>
      </div>

      {/* Términos */}
      <label className="flex items-center mb-6 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={() => setTermsAccepted(!termsAccepted)}
          className="mr-2"
        />
        Acepto los <a href="#" className="text-[#3BDCF6] underline mx-1">términos y condiciones</a>.
      </label>

      <button
        onClick={handleStart}
        disabled={!termsAccepted || !cameraVisible}
        className={`px-6 py-3 text-sm rounded-full font-semibold ${
          termsAccepted && cameraVisible
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
