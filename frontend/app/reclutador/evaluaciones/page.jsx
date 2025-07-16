"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ZoomCaptura from "../../components/calificacion/ZoomCaptura";
import SkeletonLoader from "../../components/skeleton/SkeletonLoader";
import ModuloEntrevista from "../../components/calificacion/ModuloEntrevista";
import ModuloTeorico from "../../components/calificacion/ModuloTeorico";
import ModuloTecnico from "../../components/calificacion/ModuloTecnico";
import ModuloCapturas from "../../components/calificacion/ModuloCapturas";
import { fetchWithCreds } from "../../utils/fetchWithCreds";

export default function CalificacionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idPostulante = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // 👈 nuevo estado para spinner

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
  const [idEvaluacion, setIdEvaluacion] = useState(null);

  const actualizarCalificacion = useCallback((tipo, valor) => {
    setCalificaciones((prev) => ({ ...prev, [tipo]: valor }));
  }, []);

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
          fetchWithCreds(
            `http://localhost:5000/api/postulante/preguntas-teoricas?id=${idPostulante}`
          ),
          fetchWithCreds(
            `http://localhost:5000/api/postulante/entrevista?id=${idPostulante}`
          ),
          fetchWithCreds(
            `http://localhost:5000/api/postulante/preguntas-orales?id=${idPostulante}`
          ),
          fetchWithCreds(
            `http://localhost:5000/api/evaluacion/pregunta-tecnica-asignada/${idPostulante}`
          ),
          fetchWithCreds(
            `http://localhost:5000/api/capturas/postulante/${idPostulante}`
          ),
        ]);

        const dataTeoricas = await resTeoricas.json();
        const dataEntrevista = await resEntrevista.json();
        const dataOrales = await resOrales.json();
        const dataTecnica = await resTecnica.json();
        const dataCapturas = await resCapturas.json();

        setIdEvaluacion(dataTecnica.Id_Evaluacion);

        setPreguntasTeoricas(Array.isArray(dataTeoricas) ? dataTeoricas : []);
        setEntrevista(dataEntrevista);
        setPreguntasOrales(dataOrales.preguntas);
        setPreguntaTecnica(dataTecnica);
        setCapturas(dataCapturas);

        const teoricoCorrectas = dataTeoricas.filter(
          (p) => p.puntaje === 1
        ).length;
        const entrevistaCalificada = Array.isArray(dataOrales.preguntas)
          ? dataOrales.preguntas.reduce(
              (sum, p) => sum + (p.calificacion || 0),
              0
            )
          : 0;

        setCalificaciones({
          entrevista: entrevistaCalificada,
          teorico: teoricoCorrectas,
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

  const guardarCaptura = async (captura) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/capturas/${captura.id_Capture}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Aprobado: captura.Aprobado,
            Observacion: captura.Observacion,
          }),
        }
      );
      if (!res.ok) throw new Error("Error actualizando captura");
    } catch (err) {
      console.error("❌ Error al guardar la captura:", err);
      alert("Hubo un error al guardar");
    }
  };

  const maximos = { entrevista: 6, teorico: 5, tecnica: 7, capturas: 2 };
  const total = Object.entries(calificaciones)
    .reduce((sum, [key, val]) => sum + Math.min(val, maximos[key]), 0)
    .toFixed(1);

const handleFinalizar = async () => {
  try {
    setLoading(true); 

    const payload = {
      idEvaluacion,
      ObservacionGeneral: observacionGeneral,
      PuntajeTotal: parseFloat(total),
    };

    const res = await fetchWithCreds(
      "http://localhost:5000/api/calificar/general",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Error guardando evaluación:", res.status, text);
      throw new Error("Error al guardar la evaluación");
    }

    router.push(`/reclutador/informes?id=${idPostulante}`);
  } catch (err) {
    console.error(err);
    alert("❌ Falló al guardar la observación y puntaje total");
    setLoading(false); 
  }
};

  return (
    <div className="min-h-screen bg-[#0A0A23] text-white p-4 md:p-10 space-y-10">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          <div className="sticky top-20 bg-[#0A0A23] py-4 z-10 border-b border-[#3BDCF6] shadow-md rounded-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Calificación</h1>
              </div>
              <div className="text-right bg-[#1D1E33] px-4 py-2 rounded-lg shadow">
                <p className="text-sm text-gray-400">Puntaje Total</p>
                <p className="text-3xl font-bold text-[#3BDCF6]">
                  {total} / 20
                </p>
              </div>
            </div>
          </div>

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
            idEvaluacion={idEvaluacion}
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

          <div className="bg-[#1D1E33] p-6 rounded-lg mt-10">
            <h2 className="text-xl font-semibold mb-2">Observación General</h2>
            <textarea
              value={observacionGeneral}
              onChange={(e) => setObservacionGeneral(e.target.value)}
              className="w-full bg-[#2B2C3F] text-white p-2 rounded resize-none text-sm md:text-base"
              rows={4}
            />
          </div>

          <div className="flex justify-center mt-12">
            <button
              onClick={handleFinalizar}
              disabled={saving}
              className={`flex justify-center items-center gap-2 bg-[#3BDCF6] hover:bg-[#2ab8ce] text-black font-semibold px-6 md:px-8 py-3 rounded-lg shadow-lg transition-all w-full sm:w-auto text-sm md:text-base ${
                saving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {saving && (
                <svg
                  className="animate-spin h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              )}
              {saving ? "Guardando..." : "Guardar Calificación"}
            </button>
          </div>

          {zoomImagen && (
            <ZoomCaptura
              captura={zoomImagen}
              setZoomImagen={setZoomImagen}
              guardarCaptura={guardarCaptura}
              capturas={capturas}
              setCapturas={setCapturas}
            />
          )}
        </>
      )}
    </div>
  );
}
