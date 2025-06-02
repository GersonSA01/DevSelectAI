'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Alert } from '../../components/alerts/Alerts';
import Swal from 'sweetalert2';

export default function PreguntasVacante() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idVacante = searchParams.get('idVacante') || 1;

  const [preguntas, setPreguntas] = useState([]);
  const [vacante, setVacante] = useState(null);
  const [habilidades, setHabilidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVacante = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/vacantes/${idVacante}`);
      const data = await response.json();
      setVacante(data);
    } catch (err) {
      console.error('Error fetching vacante:', err);
    }
  };

  const fetchHabilidades = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/vacantes/${idVacante}/habilidades`);
      const data = await response.json();
      setHabilidades(data);
    } catch (err) {
      console.error('Error fetching habilidades:', err);
    }
  };

  const fetchPreguntas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/preguntas/vacante/${idVacante}`);
      const data = await response.json();
      setPreguntas(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching preguntas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarPregunta = async (idPregunta) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) return;
    try {
      await fetch(`http://localhost:5000/api/preguntas/${idPregunta}`, { method: 'DELETE' });
      await fetchPreguntas();
    } catch (err) {
      alert('Error al eliminar la pregunta: ' + err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchVacante(), fetchHabilidades(), fetchPreguntas()]);
    };
    loadData();
  }, [idVacante]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-6 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
          <button
            onClick={() => {
              fetchVacante();
              fetchHabilidades();
              fetchPreguntas();
            }}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white px-4 py-8">
      <div className="rounded-lg shadow-lg p-12">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Preguntas del Vacante</h1>

          {vacante && (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">{vacante.Descripcion}</h2>
              <div className="text-sm mb-3">{preguntas.length} preguntas registradas</div>

            </>
          )}

          {habilidades.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Habilidades requeridas:</h3>
              <div className="flex flex-wrap gap-2">
                {habilidades.map((habilidad) => (
                  <span
                    key={habilidad.Id_Habilidad}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    {habilidad.Descripcion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones superiores */}
        <div className="flex justify-end items-center mb-6 gap-4">
<button
  onClick={async () => {
    try {
      Swal.fire({
  title: 'Generando preguntas con IA…',
  didOpen: () => {
    Swal.showLoading();
  },
  allowOutsideClick: false,
  allowEscapeKey: false,
  allowEnterKey: false,
  showConfirmButton: false,
  backdrop: true,
  customClass: {
    popup: 'bg-pageBackground text-white rounded-xl p-6',
    title: 'text-2xl font-bold mb-2',
  },});



      const res = await fetch(`http://localhost:5000/api/generar-preguntas/${idVacante}`, {
        method: 'POST'
      });

      const data = await res.json();
      Swal.close(); // Cierra el loader

      await Alert({
        title: 'Éxito',
        text: data.mensaje,
        icon: 'success',
        showCancelButton: false
      });

      await fetchPreguntas();
    } catch (err) {
      console.error(err);
      Swal.close(); // Cierra el loader si hubo error
      await Alert({
        title: 'Error',
        text: 'No se pudieron generar preguntas con IA.',
        icon: 'error',
        showCancelButton: false
      });
    }
  }}
  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-2 text-sm rounded shadow hover:brightness-110 transition-all"
>
  ✨ Generar preguntas con IA
</button>


          <button
            onClick={() => router.push(`/reclutador/preguntas/registrar?idVacante=${idVacante}`)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded"
          >
            + Añadir pregunta
          </button>

          <button
  onClick={() => router.push(`/reclutador/preguntas/registrar/tecnica?idVacante=${idVacante}`)}
  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm rounded"
>
  + Añadir pregunta técnica
</button>

        </div>

<div className="space-y-4 mb-6">
  {preguntas.length === 0 ? (
    <div className="text-center py-8 text-gray-400">
      <p>No hay preguntas registradas para esta vacante.</p>
      <button
        onClick={() => router.push(`/reclutador/preguntas/registrar?idVacante=${idVacante}`)}
        className="mt-2 text-green-400 hover:text-green-500 underline"
      >
        Crear la primera pregunta
      </button>
    </div>
  ) : (
    preguntas.map((pregunta, index) => (
<div key={pregunta.Id_Pregunta} className="border border-gray-700 bg-[#111827] rounded-lg px-4 py-4 text-white">
  <div className="flex justify-between items-start">
    <div>
      <h3 className="font-semibold mb-1">
        {index + 1}. {pregunta.Pregunta}
{pregunta.preguntaTecnica && (
  <div className="mt-4">
    <p className="text-sm text-gray-300 font-semibold mb-1">Respuesta esperada (código):</p>
    <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap font-mono text-green-300">
      {pregunta.preguntaTecnica.Respuesta}
    </pre>
  </div>
)}


      </h3>

      {pregunta.opciones && pregunta.opciones.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-300 font-semibold mb-1">Opciones:</p>
          <ul className="space-y-1">
            {pregunta.opciones.map((op, i) => (
              <li
                key={op.Id_Opcion}
                className={`px-3 py-1 rounded text-sm ${
                  op.Correcta
                    ? 'bg-green-700 text-white font-semibold'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                {String.fromCharCode(65 + i)}. {op.Opcion}
              </li>
            ))}
          </ul>
        </div>
      )}


    </div>

    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() =>
          router.push(
            pregunta.preguntaTecnica
              ? `preguntas/registrar/tecnica?idVacante=${idVacante}&idPregunta=${pregunta.Id_Pregunta}`
              : `preguntas/registrar?idVacante=${idVacante}&idPregunta=${pregunta.Id_Pregunta}`
          )
        }
        className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
      >
        ✏️ Editar
      </button>
      <button
        onClick={() => handleEliminarPregunta(pregunta.Id_Pregunta)}
        className="text-red-400 hover:text-red-300 text-sm flex items-center"
      >
        🗑 Eliminar
      </button>
    </div>
  </div>
</div>

    ))
  )}
</div>

      </div>
    </div>
  );
}
