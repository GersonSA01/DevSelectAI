'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PreguntasEvaluacion from '../../components/informe/PreguntasEvaluacion';
import ResumenGeneral from '../../components/informe/ResumenGeneral';
import Grafica from '../../components/informe/Grafica';
import CapturasEvaluacion from '../../components/informe/CapturasEvaluacion';
import ResumenFinal from '../../components/informe/ResumenFinal';
import SkeletonInforme from '../../components/informe/SkeletonInforme';
import InformePDF from '../../components/informe/InformePDF';
import { fetchWithCreds } from '../../utils/fetchWithCreds';

export default function InformeEvaluacionTiempo() {
  const router = useRouter();
  const [datos, setDatos] = useState(null);
  const searchParams = useSearchParams();
  const idPostulante = searchParams.get('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchWithCreds(`http://localhost:5000/api/informe/${idPostulante}`);
        const json = await res.json();
        setDatos(json);
      } catch (error) {
        console.error('Error al obtener informe:', error);
      }
    };
    if (idPostulante) fetchData();
  }, [idPostulante]);

  if (!datos) return <SkeletonInforme />;

  const {
    nombre = '',
    itinerario = '',
    vacante = '',
    habilidades = [],
    tiempos = { entrevista: [], teorico: 0, tecnica: 0 },
    calificaciones = { entrevista: 0, teorico: 0, tecnica: 0, capturas: 0 },
    capturas = [],
    observacion = '',
    preguntasTeoricas = [],
    preguntaTecnica = null,
    puntajeEvaluacion = 0,
    puntajeFinal = 0,
  } = datos;

  const totalCapturas = Array.isArray(capturas) ? capturas.length : 0;

  return (
    <div className="min-h-screen bg-[#0A0A23] text-white px-4 sm:px-6 md:px-8 py-6 space-y-10">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => router.push('/reclutador/postuladores')}
          className="text-[#38bdf8] hover:text-[#0ea5e9] text-sm"
        >
          ← Regresar a postulantes
        </button>
        <InformePDF datos={datos} />
      </div>

      <div className="space-y-10">
        <ResumenGeneral
          nombre={nombre}
          habilidades={habilidades}
          puntaje={puntajeEvaluacion}
          itinerario={itinerario}
          vacante={vacante}
        />

        <Grafica
          tiempos={tiempos}
          itinerario={itinerario}
          habilidades={habilidades}
          preguntasTeoricas={preguntasTeoricas}
          preguntaTecnica={preguntaTecnica}
        />

        <PreguntasEvaluacion
          preguntasTeoricas={preguntasTeoricas}
          preguntaTecnica={preguntaTecnica}
        />

        <CapturasEvaluacion
          capturas={capturas}
          calificacion={calificaciones.capturas}
        />

        <ResumenFinal
          puntajeFinal={puntajeFinal}
          observacion={observacion}
          totalCapturas={totalCapturas}
          calificaciones={calificaciones}
        />
      </div>
    </div>
  );
}
