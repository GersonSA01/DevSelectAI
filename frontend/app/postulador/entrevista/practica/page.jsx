'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';
import Temporizador from '../../../components/ui/Temporizador';

export default function PracticaPage() {
  const { cameraStream } = useContext(StreamContext);
  const camRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [preguntaTecnica, setPreguntaTecnica] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [ayudaIA, setAyudaIA] = useState('');
  const [cargandoAyuda, setCargandoAyuda] = useState(false);

  useEffect(() => {
    if (cameraStream && camRef.current) {
      camRef.current.srcObject = cameraStream;
      camRef.current.play();
    }
  }, [cameraStream]);

  useEffect(() => {
    const cargarPreguntaTecnica = async () => {
      const idPostulante = localStorage.getItem('id_postulante');
      const res = await fetch(`http://localhost:5000/api/entrevista-teorica/pregunta-tecnica-asignada/${idPostulante}`);
      const data = await res.json();
      setPreguntaTecnica(data);
    };
    cargarPreguntaTecnica();
  }, []);

  const handlePedirAyuda = async () => {
    if (!preguntaTecnica?.Pregunta) return;
    setCargandoAyuda(true);
    setAyudaIA('// Cargando ayuda...');

    try {
      const idPostulante = localStorage.getItem('id_postulante');

      const res = await fetch('http://localhost:5000/api/entrevista-teorica/pedir-ayuda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPostulante })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.error?.includes('ayuda')) {
          setAyudaIA('// Ya utilizaste la ayuda de la IA para esta pregunta.');
        } else {
          setAyudaIA('// No se pudo obtener ayuda.');
        }
        return;
      }

      setAyudaIA(data.sugerencia || '// No se pudo obtener ayuda.');
    } catch (err) {
      console.error('❌ Error al pedir ayuda a la IA:', err);
      setAyudaIA('// Ocurrió un error al pedir ayuda.');
    } finally {
      setCargandoAyuda(false);
    }
  };

  const handleEnviar = async () => {
    const idPostulante = localStorage.getItem('id_postulante');
    try {
      await fetch('http://localhost:5000/api/entrevista-teorica/guardar-respuesta-tecnica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPostulante,
          idPregunta: preguntaTecnica.Id_Pregunta,
          respuesta: codigo
        })
      });

      router.push(`/postulador/entrevista/finalizacion?token=${token}`);
    } catch (err) {
      console.error('❌ Error al guardar respuesta técnica:', err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A23] text-white px-4 pt-24 pb-8 flex flex-col items-center">
      <div className="w-full max-w-7xl flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Evaluación Técnica</h2>
        <Temporizador duracion={900} onFinalizar={handleEnviar} />
      </div>

      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
        <div className="w-full lg:w-1/2 bg-[#1D1E33] rounded-2xl p-6 space-y-6 shadow-lg">
          <p className="text-sm text-gray-300 mb-1 font-semibold uppercase">Enunciado</p>
          <p className="text-base text-gray-200 whitespace-pre-wrap">
            {preguntaTecnica?.Pregunta || 'Cargando pregunta técnica...'}
          </p>

          {[preguntaTecnica?.ejemplo1, preguntaTecnica?.ejemplo2].map((ej, i) => (
            ej && (
              <div key={i} className="bg-[#2B2C3F] p-4 rounded-xl">
                <p className="font-semibold text-cyan-400 mb-2">EJEMPLO {i + 1}</p>
                <pre className="text-sm text-white whitespace-pre-wrap">{ej}</pre>
              </div>
            )
          ))}

          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video ref={camRef} autoPlay muted className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-[#1D1E33] rounded-2xl p-6 space-y-6 shadow-lg">
          <textarea
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="// Escribe tu código aquí..."
            className="w-full h-64 bg-[#2B2C3F] text-white text-sm p-4 rounded-xl font-mono resize-none border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <div className="flex flex-wrap gap-4 justify-start">
            <button
              onClick={handlePedirAyuda}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-lg transition"
              disabled={cargandoAyuda}
            >
              {cargandoAyuda ? 'Cargando...' : 'Pedir ayuda'}
            </button>

            <button
              onClick={handleEnviar}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              Enviar código
            </button>
          </div>

          {ayudaIA && (
            <div className="mt-4 p-4 bg-[#0F172A] border border-cyan-400 rounded-lg text-sm text-white">
              <p className="font-semibold mb-2 text-cyan-400">Sugerencia IA:</p>
              <pre className="whitespace-pre-wrap">{ayudaIA}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}