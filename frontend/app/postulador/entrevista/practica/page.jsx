'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StreamContext } from '../../../../context/StreamContext';
import Temporizador from '../../../components/ui/Temporizador';
import ValidadorEntorno from '../../../components/ValidadorEntorno';
import { Alert } from '../../../components/alerts/Alerts';
import { FaSpinner } from 'react-icons/fa';

export default function PracticaPage() {
  const { cameraStream, reiniciarCamara } = useContext(StreamContext);
  const camRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [cameraVisible, setCameraVisible] = useState(true);
  const [preguntaTecnica, setPreguntaTecnica] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [ayudaIA, setAyudaIA] = useState('');
  const [cargandoAyuda, setCargandoAyuda] = useState(false);
  const idEvaluacion = preguntaTecnica?.Id_Evaluacion;

  useEffect(() => {
  if (!cameraStream) {
    reiniciarCamara(); // 🔁 si se perdió la cámara, vuelve a pedirla
  } else if (camRef.current) {
    camRef.current.srcObject = cameraStream;
    camRef.current.play();
  }
}, [cameraStream]);


  useEffect(() => {
    const cargarPreguntaTecnica = async () => {
      const idPostulante = localStorage.getItem('id_postulante');
      console.log('📦 ID POSTULANTE ENVIADO:', localStorage.getItem('id_postulante'));

      const res = await fetch(`http://localhost:5000/api/evaluacion/pregunta-tecnica-asignada/${idPostulante}`);
      const data = await res.json();
      setPreguntaTecnica(data);
    };
    cargarPreguntaTecnica();
  }, []);

const handlePedirAyuda = async () => {
  if (!preguntaTecnica?.Pregunta) return;

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
      showCancelButton: false,
      confirmButtonText: 'Entendido'
    });
  } else {
    await Alert({
      title: 'Error al obtener ayuda',
      html: 'No se pudo obtener la sugerencia de la IA. Intenta nuevamente más tarde.',
      icon: 'error',
      showCancelButton: false,
      confirmButtonText: 'Cerrar'
    });
  }

  // ❌ NO limpies la ayuda anterior
  // setAyudaIA(''); ❌ quita esta línea
  return;
}


    setAyudaIA(data.sugerencia || '// No se pudo obtener ayuda.');
  } catch (err) {
    console.error('❌ Error al pedir ayuda a la IA:', err);
    await Alert({
      title: 'Error de conexión',
      html: 'Hubo un problema al conectar con el servidor. Intenta más tarde.',
      icon: 'error',
      showCancelButton: false,
      confirmButtonText: 'Cerrar'
    });
  } finally {
    setCargandoAyuda(false);
  }
};


 const handleEnviar = async () => {
  const idPostulante = localStorage.getItem('id_postulante');

  try {
    // 1. Guardar respuesta técnica
    await fetch('http://localhost:5000/api/evaluacion/guardar-respuesta-tecnica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idPostulante,
        idPregunta: preguntaTecnica.Id_Pregunta,
        respuesta: codigo
      })
    });

    // 2. Cambiar estado a "Evaluado" (ID 3)
    await fetch(`http://localhost:5000/api/postulante/${idPostulante}/cambiar-estado`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nuevoEstado: 2 })
});


    // 3. Redirigir a pantalla de finalización
    router.push(`/postulador/entrevista/finalizacion?token=${token}`);
  } catch (err) {
    console.error('❌ Error al guardar respuesta técnica o actualizar estado:', err);
  }
};


  return (
<div className="min-h-screen w-full bg-[#0A0A23] text-white px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col items-center">
            <ValidadorEntorno idEvaluacion={idEvaluacion} onCamVisibilityChange={setCameraVisible} />
      
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
  className="w-full min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] bg-[#2B2C3F] text-white text-sm p-4 rounded-xl font-mono resize-y border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
/>


          <div className="flex flex-wrap gap-4 justify-start">
           <button
  onClick={handlePedirAyuda}
  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-lg transition flex items-center gap-2"
  disabled={cargandoAyuda}
>
  {cargandoAyuda ? (
    <>
      <FaSpinner className="animate-spin" />
      Cargando...
    </>
  ) : (
    'Pedir ayuda'
  )}
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