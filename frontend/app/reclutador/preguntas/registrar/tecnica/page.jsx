'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '../../../../components/alerts/Alerts';
import { fetchWithCreds } from '../../../../utils/fetchWithCreds';

export default function RegistrarPreguntaTecnica() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idVacante = searchParams.get('idVacante');
const idPregunta = searchParams.get('idPregunta'); 
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [usoIA, setUsoIA] = useState(false);
  const [habilidades, setHabilidades] = useState([]);

useEffect(() => {
  const fetchDatosPregunta = async () => {
    try {
      
      if (idVacante) {
        const resHabs = await fetch(`http://localhost:5000/api/vacantes/${idVacante}/habilidades`);
        const dataHabs = await resHabs.json();
        setHabilidades(dataHabs);
      }

      if (!idPregunta) return;

      const resPregunta = await fetchWithCreds(`http://localhost:5000/api/preguntas/${idPregunta}`);
      const dataPregunta = await resPregunta.json();
      setPregunta(dataPregunta.Pregunta || '');

      
      const resTecnica = await fetchWithCreds(`http://localhost:5000/api/preguntas/tecnica/${idPregunta}`);
      if (resTecnica.ok) {
        const dataTecnica = await resTecnica.json();
        setRespuesta(dataTecnica.Respuesta || '');
        setUsoIA(dataTecnica.UsoIA || false);
      }
    } catch (err) {
      console.error('Error al cargar datos de pregunta técnica o habilidades:', err);
    }
  };

  fetchDatosPregunta();
}, [idPregunta, idVacante]);


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!pregunta.trim() || !respuesta.trim()) {
    await Alert({
      title: 'Campos incompletos',
      html: 'Debes llenar tanto la pregunta como la respuesta esperada.',
      icon: 'warning'
    });
    return;
  }

  try {
    let preguntaId = idPregunta;

    if (!idPregunta) {
      const resPregunta = await fetchWithCreds('http://localhost:5000/api/preguntas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Pregunta: pregunta,
          Id_vacante: parseInt(idVacante),
          Id_TipoPregunta: 2
        })
      });

      const nuevaPregunta = await resPregunta.json();
      preguntaId = nuevaPregunta.Id_Pregunta;
    } else {
      await fetchWithCreds(`http://localhost:5000/api/preguntas/${idPregunta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Pregunta: pregunta,
          Id_TipoPregunta: 2
        })
      });
    }

    const resTecnica = await fetchWithCreds(`http://localhost:5000/api/preguntas/tecnica/${preguntaId}`);
    if (resTecnica.ok) {
      await fetchWithCreds(`http://localhost:5000/api/preguntas/tecnica/${preguntaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Respuesta: respuesta,
          UsoIA: usoIA
        })
      });
    } else {
      await fetchWithCreds('http://localhost:5000/api/preguntas/tecnica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Respuesta: respuesta,
          UsoIA: usoIA,
          Id_Pregunta: preguntaId
        })
      });
    }

    await Alert({
      icon: 'success',
      title: idPregunta ? 'Pregunta técnica actualizada' : 'Pregunta técnica registrada',
      confirmButtonText: 'Aceptar'
    });

    router.push(`/reclutador/preguntas?idVacante=${idVacante}`);
  } catch (err) {
    console.error('Error al guardar pregunta técnica:', err);
    await Alert({
      title: 'Error',
      html: 'No se pudo guardar la pregunta técnica.',
      icon: 'error'
    });
  }
};

  return (
    <div className="min-h-screen bg-[#0b1120] text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-6 text-sm">
          Esta es una <strong>pregunta técnica</strong> basada en las habilidades requeridas por esta vacante. Asegúrate de incluir un enunciado claro y una respuesta esperada (código o solución).
        </div>

        {habilidades.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-2">Habilidades requeridas:</h3>
            <div className="flex flex-wrap gap-2">
              {habilidades.map((h) => (
                <span key={h.Id_Habilidad} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  {h.Descripcion}
                </span>
              ))}
            </div>
          </div>
        )}

       <form onSubmit={handleSubmit} className="bg-[#111827] p-6 rounded-lg shadow space-y-6">
  <div>
    <label className="block text-sm text-gray-300 mb-1">
      Enunciado de la pregunta técnica:
    </label>
    <textarea
      className="w-full p-2 rounded-md text-sm bg-[#1f2937] text-white placeholder-gray-400 border border-gray-600"
      placeholder="Ej. Escribe una función en JavaScript que determine si un número es primo..."
      value={pregunta}
      onChange={(e) => setPregunta(e.target.value)}
      required
    />
  </div>

  <div>
    <label className="block text-sm text-gray-300 mb-1">
      Respuesta esperada (código):
    </label>
    <textarea
      className="w-full p-2 rounded-md text-sm bg-[#1f2937] text-white placeholder-gray-400 font-mono border border-gray-600"
      placeholder="// Escribe la solución aquí..."
      value={respuesta}
      onChange={(e) => setRespuesta(e.target.value)}
      required
      rows={6}
    />
  </div>

  <button
    type="submit"
    className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-white font-medium"
  >
    Guardar pregunta técnica
  </button>
</form>

      </div>
    </div>
  );
}
