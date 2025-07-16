'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import PostulacionesHeader from '../../components/postulaciones/PostulacionesHeader';
import PostulacionesStats from '../../components/postulaciones/PostulacionesStats';
import PostulacionesFiltros from '../../components/postulaciones/PostulacionesFiltros';
import PostulacionesTabla from '../../components/postulaciones/PostulacionesTabla';
import PostulacionesSkeleton from '../../components/skeleton/SkeletonPostulaciones';
import { fetchWithCreds } from '../../utils/fetchWithCreds';

export default function PostulacionesPage() {
  const router = useRouter();

  const [postulantes, setPostulantes] = useState([]);
  const [itinerarios, setItinerarios] = useState([]);
  const [programaciones, setProgramaciones] = useState([]);
  const [programacionSeleccionada, setProgramacionSeleccionada] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [itinerario, setItinerario] = useState('');
  const [loading, setLoading] = useState(true);

  const programacionActual = programaciones.find(
    (p) => p.id_Programacion == programacionSeleccionada
  );

useEffect(() => {
  const fetchData = async () => {
    try {
      const [resPostulantes, resItinerarios, resProgramaciones] =
        await Promise.all([
          fetchWithCreds('http://localhost:5000/api/postulante'),
          fetchWithCreds('http://localhost:5000/api/itinerarios'),
          fetchWithCreds('http://localhost:5000/api/programaciones'),
        ]);

      const dataPostulantes = await resPostulantes.json();
      const dataItinerarios = await resItinerarios.json();
      const dataProgramaciones = await resProgramaciones.json();

      setPostulantes(
        Array.isArray(dataPostulantes) ? dataPostulantes : dataPostulantes.postulantes || []
      );
      setItinerarios(dataItinerarios);
      setProgramaciones(dataProgramaciones);
    } catch (err) {
      console.error('Error al cargar datos', err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  if (loading) return <PostulacionesSkeleton />;

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">Postulaciones</h1>

      <PostulacionesHeader
        programaciones={programaciones}
        programacionSeleccionada={programacionSeleccionada}
        setProgramacionSeleccionada={setProgramacionSeleccionada}
        programacionActual={programacionActual}
      />

      {/* si no hay postulantes */}
      {(!postulantes || postulantes.length === 0) && (
        <div className="text-center text-gray-400 my-8">
          No se encontraron postulantes.
        </div>
      )}

      {/* si hay postulantes, renderiza el resto */}
      {postulantes.length > 0 && (
        <>
          <PostulacionesStats
            postulantes={postulantes}
            programacionActual={programacionActual}
          />

          <PostulacionesFiltros
            itinerarios={itinerarios}
            filtroNombre={filtroNombre}
            setFiltroNombre={setFiltroNombre}
            itinerario={itinerario}
            setItinerario={setItinerario}
          />

          <PostulacionesTabla
            postulantes={postulantes}
            filtroNombre={filtroNombre}
            itinerario={itinerario}
            programacionActual={programacionActual}
            programacionSeleccionada={programacionSeleccionada}
            router={router}
            setPostulantes={setPostulantes}
          />
        </>
      )}
    </div>
  );
}
