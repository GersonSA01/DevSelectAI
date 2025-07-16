'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';
import { useScreen } from '../../../../context/ScreenContext';
import Temporizador from '../../../components/ui/Temporizador';
import ValidadorEntorno from '../../../components/ValidadorEntorno';
import { Alert } from '../../../components/alerts/Alerts';
import { FaSpinner } from 'react-icons/fa';
import { HiOutlineLightBulb, HiOutlinePaperAirplane } from 'react-icons/hi';
import { FiBookOpen, FiAlertCircle } from 'react-icons/fi';

export default function PracticaPage() {
  const { cameraStream, reiniciarCamara } = useContext(StreamContext);
  const { extraScreenDetected } = useScreen();
  const [alertShown, setAlertShown] = useState(false);

  const camRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [cameraVisible, setCameraVisible] = useState(true);
  const [preguntaTecnica, setPreguntaTecnica] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [ayudaIA, setAyudaIA] = useState('');
  const [cargandoAyuda, setCargandoAyuda] = useState(false);
  const [usoIA, setUsoIA] = useState(false);
  const [enunciadoSinPista, setEnunciadoSinPista] = useState('');
  const [pista, setPista] = useState('');

  const idEvaluacion = preguntaTecnica?.Id_Evaluacion;
  const tiempoInicioRef = useRef(null);

  useEffect(() => {
    if (!cameraStream) {
      reiniciarCamara();
    } else if (camRef.current) {
      camRef.current.srcObject = cameraStream;
      camRef.current.play();
    }
  }, [cameraStream]);

  useEffect(() => {
    tiempoInicioRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (extraScreenDetected && !alertShown) {
      setAlertShown(true);
      Alert({
        icon: 'warning',
        title: 'Pantalla adicional detectada',
        html: `<p>Parece que hay otra pantalla conectada a tu sistema.</p>
               <p>Por favor, desconéctala para continuar.</p>`,
        confirmButtonText: 'Entendido',
      }).then(() => setAlertShown(false));
    }
  }, [extraScreenDetected, alertShown]);

  useEffect(() => {
    const cargarPreguntaTecnica = async () => {
      const idPostulante = localStorage.getItem('id_postulante');
      const res = await fetch(`http://localhost:5000/api/evaluacion/pregunta-tecnica-asignada/${idPostulante}`);
      const data = await res.json();
      setPreguntaTecnica(data);
      setUsoIA(data.usoIA === true || data.usoIA === 1);
    };
    cargarPreguntaTecnica();
  }, []);

  useEffect(() => {
    if (preguntaTecnica?.pregunta) {
      const partes = preguntaTecnica.pregunta.split('Pista:');
      setEnunciadoSinPista(partes[0].trim());
      setPista(partes[1]?.trim() || '');
    }
  }, [preguntaTecnica]);

  const handlePedirAyuda = async () => {
    if (!preguntaTecnica?.pregunta) return;
    setCargandoAyuda(true);

    try {
      const idPostulante = localStorage.getItem('id_postulante');

      const res = await fetch('http://localhost:5000/api/evaluacion/pedir-ayuda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPostulante })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.error?.includes('ayuda')) {
          await Alert({
            title: 'Ayuda ya solicitada',
            html: 'Ya utilizaste la ayuda de la IA para esta pregunta técnica.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
          });
        } else {
          await Alert({
            title: 'Error al obtener ayuda',
            html: 'No se pudo obtener la sugerencia de la IA. Intenta nuevamente más tarde.',
            icon: 'error',
            confirmButtonText: 'Cerrar'
          });
        }
        return;
      }

      setAyudaIA(data.sugerencia || '// No se pudo obtener ayuda.');
      setUsoIA(true);
    } catch (err) {
      console.error('❌ Error al pedir ayuda a la IA:', err);
      await Alert({
        title: 'Error de conexión',
        html: 'Hubo un problema al conectar con el servidor. Intenta más tarde.',
        icon: 'error',
        confirmButtonText: 'Cerrar'
      });
    } finally {
      setCargandoAyuda(false);
    }
  };

  const handleEnviar = async () => {
    if (extraScreenDetected) {
      Alert({
        icon: 'error',
        title: 'No puedes continuar',
        html: 'Por favor, desconecta la pantalla adicional para poder enviar tu respuesta.',
        confirmButtonText: 'Ok',
      });
      return;
    }

    const idPostulante = localStorage.getItem('id_postulante');

    try {
      const tiempoFinal = Date.now();
      const tiempoTranscurridoSegundos = Math.floor((tiempoFinal - tiempoInicioRef.current) / 1000);

      await fetch('http://localhost:5000/api/evaluacion/guardar-respuesta-tecnica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPostulante,
          idPregunta: preguntaTecnica.Id_Pregunta,
          respuesta: codigo,
          tiempo: tiempoTranscurridoSegundos
        })
      });

      await fetch(`http://localhost:5000/api/postulante/${idPostulante}/cambiar-estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado: 2 })
      });

      router.push(`/postulador/entrevista/finalizacion?token=${token}`);
    } catch (err) {
      console.error('❌ Error al guardar respuesta técnica o actualizar estado:', err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0A23] to-[#1A1B40] text-white px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col items-center">
      <ValidadorEntorno idEvaluacion={idEvaluacion} onCamVisibilityChange={setCameraVisible} />

      <div className="w-full max-w-7xl flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-wide flex items-center gap-2">
          <FiBookOpen className="text-cyan-400" size={28} />
          Evaluación Técnica
        </h2>
        <Temporizador duracion={900} onFinalizar={handleEnviar} />
      </div>

      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
        <div className="w-full lg:w-1/2 bg-[#1D1E33] rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-cyan-400 font-semibold">Enunciado</p>
            <p className="text-base leading-relaxed text-gray-200 whitespace-pre-wrap">
              {enunciadoSinPista || 'Cargando pregunta técnica...'}
            </p>
          </div>

          {pista && (
            <div className="bg-[#2B2C3F] border-l-4 border-yellow-400 text-yellow-200 p-4 rounded-lg shadow-md">
              <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                <FiAlertCircle className="text-yellow-300" />
                Pista:
              </p>
              <p className="text-sm whitespace-pre-wrap">{pista}</p>
            </div>
          )}

          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-gray-700">
            <video ref={camRef} autoPlay muted className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-[#1D1E33] rounded-2xl p-6 space-y-6 shadow-2xl">
          <textarea
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="// Escribe tu código aquí..."
            disabled={extraScreenDetected}
            className={`w-full min-h-[250px] bg-[#2B2C3F] text-white text-sm p-4 rounded-xl font-mono resize-y border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 
            ${extraScreenDetected ? 'opacity-50 cursor-not-allowed' : ''}`}
          />

          <p className="text-sm text-yellow-300 font-semibold">
            Uso de IA: {usoIA ? '1 / 1' : '0 / 1'}
          </p>

          <div className="flex flex-wrap gap-4 justify-start">
            <button
              onClick={handlePedirAyuda}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cargandoAyuda || usoIA || extraScreenDetected}
            >
              {cargandoAyuda ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Cargando...
                </>
              ) : usoIA ? (
                <>
                  <HiOutlineLightBulb size={18} />
                  Ayuda usada
                </>
              ) : (
                <>
                  <HiOutlineLightBulb size={18} />
                  Pedir ayuda
                </>
              )}
            </button>

            <button
              onClick={handleEnviar}
              disabled={extraScreenDetected}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiOutlinePaperAirplane size={18} />
              Enviar código
            </button>
          </div>

          {ayudaIA && (
            <div className="mt-4 p-4 bg-[#0F172A] border border-cyan-500 rounded-lg text-sm text-white shadow-inner">
              <p className="font-semibold mb-2 text-cyan-300 flex items-center gap-2">
                <HiOutlineLightBulb size={16} />
                Sugerencia IA:
              </p>
              <pre className="whitespace-pre-wrap text-sm text-gray-100">{ayudaIA}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
