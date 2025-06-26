"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import SkeletonLoader from "../../components/SkeletonLoader";
import ModuloEntrevista from "../../components/calificacion/ModuloEntrevista";
import ModuloTeorico from "../../components/calificacion/ModuloTeorico";
import ModuloTecnico from "../../components/calificacion/ModuloTecnico";
import ModuloCapturas from "../../components/calificacion/ModuloCapturas";

export default function CalificacionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idPostulante = searchParams.get("id");
  const [loading, setLoading] = useState(true);


  const [calificaciones, setCalificaciones] = useState({
    entrevista: 0,
    teorico: 0,
    tecnica: 0,
    capturas: 0,
  });

  const [confirmadas, setConfirmadas] = useState({
    entrevista: false,
    teorico: false,
    tecnica: false,
    capturas: false,
  });

  const [observacionGeneral, setObservacionGeneral] = useState("");
  const [preguntasTeoricas, setPreguntasTeoricas] = useState([]);
  const [preguntasOrales, setPreguntasOrales] = useState([]);
  const [entrevista, setEntrevista] = useState(null);
  const [preguntaTecnica, setPreguntaTecnica] = useState(null);
  const [capturas, setCapturas] = useState([]);
  const [zoomImagen, setZoomImagen] = useState(null);

  const cerrarZoom = () => setZoomImagen(null);



  useEffect(() => {
  if (!idPostulante) return;

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [
        resTeoricas,
        resEntrevista,
        resOrales,
        resTecnica,
        resCapturas,
      ] = await Promise.all([
        fetch(`http://localhost:5000/api/postulante/preguntas-teoricas?id=${idPostulante}`),
        fetch(`http://localhost:5000/api/postulante/entrevista?id=${idPostulante}`),
        fetch(`http://localhost:5000/api/postulante/preguntas-orales?id=${idPostulante}`),
        fetch(`http://localhost:5000/api/evaluacion/pregunta-tecnica-asignada/${idPostulante}`),
        fetch(`http://localhost:5000/api/capturas/postulante/${idPostulante}`),
      ]);

      const dataTeoricas = await resTeoricas.json();
      const dataEntrevista = await resEntrevista.json();
      const dataOrales = await resOrales.json();
      const dataTecnica = await resTecnica.json();
      const dataCapturas = await resCapturas.json();

      setPreguntasTeoricas(Array.isArray(dataTeoricas) ? dataTeoricas : []);
      setEntrevista(dataEntrevista);
      setPreguntasOrales(dataOrales.preguntas);
      setPreguntaTecnica(dataTecnica);
      setCapturas(dataCapturas);

      const teoricoCorrectas = dataTeoricas.filter(p => p.Puntaje === 1).length;

      const entrevistaCalificada = Array.isArray(dataOrales.preguntas)
  ? dataOrales.preguntas.reduce((acc, p) => acc + (p.calificacion || 0), 0)
  : 0;

setCalificaciones({
  teorico: teoricoCorrectas,
  entrevista: entrevistaCalificada,
  tecnica: dataTecnica?.calificacion || 0,
  capturas: dataCapturas.length,
});

    } catch (err) {
      console.error("❌ Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  cargarDatos();
}, [idPostulante]);

  const actualizarCalificacion = (tipo, nuevoValor) => {
    setCalificaciones(prev => ({ ...prev, [tipo]: nuevoValor }));
  };

  const guardarCaptura = async (captura) => {
    try {
      const res = await fetch(`http://localhost:5000/api/capturas/${captura.id_Capture}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Aprobado: captura.Aprobado,
          Observacion: captura.Observacion,
        }),
      });

      if (!res.ok) throw new Error("Error actualizando captura");
      alert("✅ Cambios guardados");
    } catch (error) {
      console.error("❌ Error al guardar la captura:", error);
      alert("❌ Hubo un error al guardar");
    }
  };

const maximos = { entrevista: 6, teorico: 5, tecnica: 7, capturas: 2 };
 const total = Object.entries(calificaciones).reduce(
  (acc, [key, valor]) => acc + Math.min(valor, maximos[key]),
  0
).toFixed(1);


  const handleFinalizar = () => {
    router.push(`/reclutador/informes?id=${idPostulante}`);
  };

return (
  <div className="min-h-screen bg-[#0A0A23] text-white p-10 space-y-10">
    {loading ? (
      <SkeletonLoader />
    ) : (
      <>
        {/* Encabezado fijo superior */}
        <div className="sticky top-20 bg-[#0A0A23] py-4 z-10 border-b border-[#3BDCF6] shadow-md rounded-md">
          <div className="flex justify-between items-center px-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Calificación</h1>
              <p className="text-sm text-gray-400">Resumen por módulo</p>
            </div>
            <div className="text-right bg-[#1D1E33] px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-400">Puntaje Total</p>
              <p className="text-3xl font-bold text-[#3BDCF6]">{total} / 20</p>
            </div>
          </div>
        </div>

        {/* Módulos */}
        <ModuloEntrevista
          preguntasOrales={preguntasOrales}
          entrevista={entrevista}
          calificacion={calificaciones.entrevista}
          confirmadas={confirmadas}
          setConfirmadas={setConfirmadas}
          actualizarCalificacion={actualizarCalificacion}
        />

        <ModuloTeorico
          preguntasTeoricas={preguntasTeoricas}
          calificacion={calificaciones.teorico}
          maximo={maximos.teorico}
        />

        <ModuloTecnico
          preguntaTecnica={preguntaTecnica}
          calificacion={calificaciones.tecnica}
          confirmadas={confirmadas}
          setConfirmadas={setConfirmadas}
          actualizarCalificacion={actualizarCalificacion}
        />

        <ModuloCapturas
          capturas={capturas}
          setCapturas={setCapturas}
          calificacion={calificaciones.capturas}
          confirmadas={confirmadas}
          setConfirmadas={setConfirmadas}
          guardarCaptura={guardarCaptura}
          setZoomImagen={setZoomImagen}
          actualizarCalificacion={actualizarCalificacion}
        />

        {/* Observación general */}
        <div className="bg-[#1D1E33] p-6 rounded-lg mt-10">
          <h2 className="text-xl font-semibold mb-2">Observación General</h2>
          <textarea
            value={observacionGeneral}
            onChange={(e) => setObservacionGeneral(e.target.value)}
            className="w-full bg-[#2B2C3F] text-white p-2 rounded resize-none"
            rows={4}
          />
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={handleFinalizar}
            className="bg-[#3BDCF6] hover:bg-[#2ab8ce] text-black font-semibold px-8 py-3 rounded-lg shadow-lg transition-all"
          >
            Terminar evaluación y guardar
          </button>
        </div>

        {/* Zoom de imagen */}
        {zoomImagen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={cerrarZoom}
          >
            <img
              src={`http://localhost:5000/uploads/${zoomImagen.File}`}
              alt="Zoom Captura"
              className="max-w-4xl max-h-[90vh] object-contain rounded shadow-lg"
            />
          </div>
        )}
      </>
    )}
  </div>
);

}