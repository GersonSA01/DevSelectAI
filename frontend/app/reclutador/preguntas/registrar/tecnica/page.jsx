'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';

export default function RegistrarPreguntaTecnica() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idVacante = searchParams.get('idVacante');
const idPregunta = searchParams.get('idPregunta'); // ✅ Nuevo
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [usoIA, setUsoIA] = useState(false);
  const [habilidades, setHabilidades] = useState([]);

useEffect(() => {
  const fetchDatosPregunta = async () => {
    try {
      // Cargar habilidades aunque no exista pregunta aún
      if (idVacante) {
        const resHabs = await fetch(`http://localhost:5000/api/vacantes/${idVacante}/habilidades`);
        const dataHabs = await resHabs.json();
        setHabilidades(dataHabs);
      }

      if (!idPregunta) return;

      const resPregunta = await fetch(`http://localhost:5000/api/preguntas/${idPregunta}`);
      const dataPregunta = await resPregunta.json();
      setPregunta(dataPregunta.Pregunta || '');

      // Ahora la parte técnica
      const resTecnica = await fetch(`http://localhost:5000/api/preguntas/tecnica/${idPregunta}`);
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
    return Swal.fire('Campos incompletos', 'Debes llenar tanto la pregunta como la respuesta esperada.', 'warning');
  }

  try {
    let preguntaId = idPregunta;

    // Crear o actualizar la pregunta
    if (!idPregunta) {
      const resPregunta = await fetch('http://localhost:5000/api/preguntas', {
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
      await fetch(`http://localhost:5000/api/preguntas/${idPregunta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Pregunta: pregunta,
          Id_TipoPregunta: 2
        })
      });
    }

    // Guardar o actualizar la parte técnica
    const resTecnica = await fetch(`http://localhost:5000/api/preguntas/tecnica/${preguntaId}`);
    if (resTecnica.ok) {
      // Ya existe → actualizar
      await fetch(`http://localhost:5000/api/preguntas/tecnica/${preguntaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Respuesta: respuesta,
          UsoIA: usoIA
        })
      });
    } else {
      // No existe → crear
      await fetch('http://localhost:5000/api/preguntas/tecnica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Respuesta: respuesta,
          UsoIA: usoIA,
          Id_Pregunta: preguntaId
        })
      });
    }

    Swal.fire({
      icon: 'success',
      title: idPregunta ? 'Pregunta técnica actualizada' : 'Pregunta técnica registrada',
      confirmButtonColor: '#22c55e'
    }).then(() => {
      router.push(`/reclutador/preguntas?idVacante=${idVacante}`);
    });
  } catch (err) {
    console.error('Error al guardar pregunta técnica:', err);
    Swal.fire('Error', 'No se pudo guardar la pregunta técnica.', 'error');
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

        <form onSubmit={handleSubmit} className="bg-[#111827] p-6 rounded shadow space-y-6">
          <div>
            <label className="block text-sm mb-1">Enunciado de la pregunta técnica:</label>
            <textarea
              className="w-full p-2 rounded text-black"
              placeholder="Ej. Escribe una función en JavaScript que determine si un número es primo..."
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Respuesta esperada (código):</label>
            <textarea
              className="w-full p-2 rounded text-black font-mono"
              placeholder="// Escribe la solución aquí..."
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              required
              rows={6}
            />
          </div>


          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
          >
            Guardar pregunta técnica
          </button>
        </form>
      </div>
    </div>
  );
}
